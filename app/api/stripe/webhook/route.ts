import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const NEWSLETTER_GROUP_NAME = "Newsletter"
const NEWSLETTER_GROUP_DESCRIPTION =
  "Paid newsletter subscribers"

type StripeObject = Record<string, unknown>

interface StripeEvent {
  id: string
  type: string
  data: {
    object: StripeObject
  }
}

interface EmailContact {
  id: string
  full_name: string
  email: string
  department: string | null
  role: string | null
  source: string
  employee_id: string | null
}

interface EmailGroup {
  id: string
  name: string
  description: string | null
}

function getString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function getObject(value: unknown): StripeObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as StripeObject)
    : {}
}

function parseStripeSignature(signatureHeader: string) {
  return Object.fromEntries(
    signatureHeader.split(",").map(part => {
      const [key, ...valueParts] = part.split("=")
      return [key, valueParts.join("=")]
    }),
  )
}

function verifyStripeSignature(payload: string, signatureHeader: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error("Stripe webhook secret is not configured.")
  }

  const signatureParts = parseStripeSignature(signatureHeader)
  const timestamp = signatureParts.t
  const signature = signatureParts.v1

  if (!timestamp || !signature) {
    throw new Error("Stripe signature header is missing timestamp or signature.")
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex")

  const expectedBuffer = Buffer.from(expectedSignature, "hex")
  const signatureBuffer = Buffer.from(signature, "hex")

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new Error("Invalid Stripe webhook signature.")
  }
}

function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Supabase URL/key is not configured.")
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

async function fetchStripeCustomerEmail(customerId: string) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey || !customerId) return ""

  const response = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
    },
  })

  const customer = (await response.json().catch(() => null)) as StripeObject | null
  if (!response.ok || !customer) return ""

  return getString(customer.email).toLowerCase()
}

async function getEmailFromStripeObject(object: StripeObject) {
  const directEmail =
    getString(object.customer_email) ||
    getString(object.email) ||
    getString(getObject(object.customer_details).email)

  if (directEmail) return directEmail.toLowerCase()

  const customerId = getString(object.customer)
  if (customerId) return fetchStripeCustomerEmail(customerId)

  return ""
}

function getNameFromStripeObject(object: StripeObject, email: string) {
  return (
    getString(getObject(object.customer_details).name) ||
    getString(object.customer_name) ||
    email.split("@")[0] ||
    "Newsletter Subscriber"
  )
}

async function ensureNewsletterGroup() {
  const supabase = createSupabaseServerClient()

  const { data: existingGroups, error: existingError } = await supabase
    .from("email_groups")
    .select("id, name, description")
    .eq("name", NEWSLETTER_GROUP_NAME)
    .limit(1)

  if (existingError) throw existingError
  if (existingGroups?.[0]) return existingGroups[0] as EmailGroup

  const { data: createdGroup, error: createError } = await supabase
    .from("email_groups")
    .insert({
      name: NEWSLETTER_GROUP_NAME,
      description: NEWSLETTER_GROUP_DESCRIPTION,
    })
    .select("id, name, description")
    .single()

  if (createError) {
    // Another webhook event may have created the group at the same time.
    const { data: retryGroups, error: retryError } = await supabase
      .from("email_groups")
      .select("id, name, description")
      .eq("name", NEWSLETTER_GROUP_NAME)
      .limit(1)

    if (retryError) throw retryError
    if (retryGroups?.[0]) return retryGroups[0] as EmailGroup
    throw createError
  }

  return createdGroup as EmailGroup
}

async function upsertNewsletterContact({
  email,
  fullName,
}: {
  email: string
  fullName: string
}) {
  const supabase = createSupabaseServerClient()
  const cleanEmail = email.trim().toLowerCase()

  const { data: existingContacts, error: existingError } = await supabase
    .from("email_contacts")
    .select("id, full_name, email, department, role, source, employee_id")
    .eq("email", cleanEmail)
    .limit(1)

  if (existingError) throw existingError

  if (existingContacts?.[0]) {
    return existingContacts[0] as EmailContact
  }

  const { data: createdContact, error: createError } = await supabase
    .from("email_contacts")
    .insert({
      full_name: fullName,
      email: cleanEmail,
      department: "Newsletter",
      role: "Subscriber",
      source: "stripe",
    })
    .select("id, full_name, email, department, role, source, employee_id")
    .single()

  if (createError) {
    // If a parallel webhook inserted the contact first, reuse it.
    const { data: retryContacts, error: retryError } = await supabase
      .from("email_contacts")
      .select("id, full_name, email, department, role, source, employee_id")
      .eq("email", cleanEmail)
      .limit(1)

    if (retryError) throw retryError
    if (retryContacts?.[0]) return retryContacts[0] as EmailContact
    throw createError
  }

  return createdContact as EmailContact
}

async function addContactToNewsletterGroup(contactId: string, groupId: string) {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase.from("email_group_members").upsert(
    {
      group_id: groupId,
      contact_id: contactId,
    },
    {
      onConflict: "group_id,contact_id",
    },
  )

  if (error) throw error
}

async function removeContactFromNewsletterGroup(contactId: string, groupId: string) {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase
    .from("email_group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("contact_id", contactId)

  if (error) throw error
}

async function saveStripeCustomerToNewsletterGroup(object: StripeObject) {
  const email = await getEmailFromStripeObject(object)

  if (!email || !email.includes("@")) {
    console.warn("[Stripe Webhook] Event did not include a usable customer email.")
    return false
  }

  const group = await ensureNewsletterGroup()
  const contact = await upsertNewsletterContact({
    email,
    fullName: getNameFromStripeObject(object, email),
  })

  await addContactToNewsletterGroup(contact.id, group.id)
  return true
}

async function removeStripeCustomerFromNewsletterGroup(object: StripeObject) {
  const email = await getEmailFromStripeObject(object)

  if (!email || !email.includes("@")) {
    console.warn(
      "[Stripe Webhook] Subscription deletion did not include a usable customer email.",
    )
    return false
  }

  const supabase = createSupabaseServerClient()
  const cleanEmail = email.trim().toLowerCase()

  const { data: groups, error: groupError } = await supabase
    .from("email_groups")
    .select("id, name, description")
    .eq("name", NEWSLETTER_GROUP_NAME)
    .limit(1)

  if (groupError) throw groupError

  const group = groups?.[0] as EmailGroup | undefined
  if (!group) {
    console.warn("[Stripe Webhook] Newsletter group was not found during removal.")
    return false
  }

  const { data: contacts, error: contactError } = await supabase
    .from("email_contacts")
    .select("id, full_name, email, department, role, source, employee_id")
    .eq("email", cleanEmail)
    .limit(1)

  if (contactError) throw contactError

  const contact = contacts?.[0] as EmailContact | undefined
  if (!contact) {
    console.warn(
      `[Stripe Webhook] No newsletter contact found for cancelled subscriber ${cleanEmail}.`,
    )
    return false
  }

  await removeContactFromNewsletterGroup(contact.id, group.id)
  return true
}

async function trySaveStripeCustomerToNewsletterGroup(
  eventType: string,
  object: StripeObject,
) {
  try {
    return await saveStripeCustomerToNewsletterGroup(object)
  } catch (error) {
    console.error(`[Stripe Webhook] Newsletter sync failed for ${eventType}:`, error)
    return false
  }
}

async function tryRemoveStripeCustomerFromNewsletterGroup(
  eventType: string,
  object: StripeObject,
) {
  try {
    return await removeStripeCustomerFromNewsletterGroup(object)
  } catch (error) {
    console.error(`[Stripe Webhook] Newsletter removal failed for ${eventType}:`, error)
    return false
  }
}

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    )
  }

  try {
    verifyStripeSignature(payload, signature)
  } catch (error) {
    console.error("[Stripe Webhook] Signature verification failed:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe signature verification failed.",
      },
      { status: 400 },
    )
  }

  let event: StripeEvent

  try {
    event = JSON.parse(payload) as StripeEvent
  } catch (error) {
    console.error("[Stripe Webhook] Invalid JSON payload:", error)

    return NextResponse.json(
      { error: "Invalid Stripe webhook payload." },
      { status: 400 },
    )
  }

  try {
    const eventObject = event.data.object

    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await trySaveStripeCustomerToNewsletterGroup(event.type, eventObject)
        break
      case "customer.subscription.deleted":
        await tryRemoveStripeCustomerFromNewsletterGroup(event.type, eventObject)
        break
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
      case "checkout.session.expired":
      case "invoice.payment_action_required":
        // These events are intentionally acknowledged here. Invoice failures
        // are not removed immediately because Stripe can still recover payment.
        break
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`[Stripe Webhook] Handler error for ${event.type}:`, error)

    return NextResponse.json(
      {
        received: true,
        warning: "Webhook acknowledged, but internal newsletter sync failed.",
      },
      { status: 200 },
    )
  }
}
