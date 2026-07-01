import { NextResponse } from "next/server"

export const runtime = "nodejs"

const NEWSLETTER_PRICE_CENTS = 999

function getBaseUrl(request: Request) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_URL

  if (configuredUrl) {
    const normalized = configuredUrl.startsWith("http")
      ? configuredUrl
      : `https://${configuredUrl}`
    return normalized.replace(/\/$/, "")
  }

  return new URL(request.url).origin
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY." },
      { status: 500 }
    )
  }

  const baseUrl = getBaseUrl(request)
  const params = new URLSearchParams({
    mode: "subscription",
    success_url: `${baseUrl}/newsletter-pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/newsletter-pricing?checkout=cancelled`,
    allow_promotion_codes: "true",
    billing_address_collection: "auto",
    "metadata[product]": "aviation_newsletter",
  })

  if (process.env.STRIPE_NEWSLETTER_PRICE_ID) {
    params.set("line_items[0][price]", process.env.STRIPE_NEWSLETTER_PRICE_ID)
    params.set("line_items[0][quantity]", "1")
  } else {
    params.set("line_items[0][price_data][currency]", "usd")
    params.set("line_items[0][price_data][unit_amount]", String(NEWSLETTER_PRICE_CENTS))
    params.set("line_items[0][price_data][recurring][interval]", "month")
    params.set(
      "line_items[0][price_data][product_data][name]",
      "Aviate Pro Intelligence Newsletter"
    )
    params.set(
      "line_items[0][price_data][product_data][description]",
      "Monthly aviation intelligence briefings, market notes, and operational insights."
    )
    params.set("line_items[0][quantity]", "1")
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })

  const checkoutSession = (await stripeResponse.json().catch(() => null)) as {
    url?: string
    error?: { message?: string }
  } | null

  if (!stripeResponse.ok || !checkoutSession?.url) {
    return NextResponse.json(
      {
        error:
          checkoutSession?.error?.message ||
          "Stripe checkout session could not be created.",
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: checkoutSession.url })
}
