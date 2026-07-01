import type { Metadata } from "next"
import Link from "next/link"
import { Check, Mail, Radar, ShieldCheck, Sparkles } from "lucide-react"
import { NewsletterCheckoutButton } from "@/components/newsletter/NewsletterCheckoutButton"

export const metadata: Metadata = {
  title: "Newsletter Subscription | Aero Aviation",
  description:
    "Subscribe to the Aviate Pro aviation intelligence newsletter for monthly operational, market, and flight intelligence briefings.",
}

const features = [
  "Daily aviation intelligence briefings",
  "Flight operations and dispatch trend notes",
  "Market, fuel, route, and regulatory watch points",
  "Curated insights for operators, pilots, and aviation teams",
  "Subscriber-only analysis delivered by email",
]

export default async function NewsletterPricingPage({
  searchParams,
}: {
  searchParams?: Promise<{ checkout?: string }>
}) {
  const checkoutStatus = (await searchParams)?.checkout

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_32%)]" />

      <section className="relative px-6 pb-24 pt-40">
        <div className="mx-auto max-w-7xl">
          {checkoutStatus === "success" ? (
            <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              Payment received. Your newsletter subscription is active.
            </div>
          ) : null}

          {checkoutStatus === "cancelled" ? (
            <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              Checkout was cancelled. You can subscribe whenever you are ready.
            </div>
          ) : null}

          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.28em] text-sky-400">
                Aviate Pro Newsletter
              </p>
              <h1 className="max-w-4xl text-5xl font-light leading-[1] text-zinc-100 md:text-6xl lg:text-7xl">
                Aviation intelligence in your inbox.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
                Subscribe to a monthly intelligence briefing built for aviation
                professionals, operators, dispatch teams, and serious enthusiasts
                who want useful signal without the noise.
              </p>
            </div>

            <div className="rounded-[2rem] border border-sky-500/30 bg-zinc-950/80 p-6 shadow-2xl shadow-sky-950/30 backdrop-blur-xl md:p-8 mt-2">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
                Newsletter Subscription
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-light text-zinc-100">
                  Aviate Pro Intelligence Briefing
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Built for readers who want concise, aviation-focused updates
                  on operations, market movement, route intelligence, and
                  regulatory watch items.
                </p>
              </div>

              <div className="mb-8 flex items-end gap-2">
                <span className="text-6xl font-light text-white">$9.99</span>
                <span className="pb-3 text-sm text-zinc-500">/month</span>
              </div>

              <ul className="mb-8 space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
                    <span className="text-sm leading-6 text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <NewsletterCheckoutButton />

              <p className="mt-4 text-center text-xs leading-5 text-zinc-600">
                Secure checkout powered by Stripe. Cancel according to your
                subscription terms.
              </p>
            </div>
          </div>

          <div className="mt-16 rounded-3xl border border-zinc-800/70 bg-zinc-950/70 p-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="text-lg font-medium text-zinc-100">
                  Why subscribe?
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Stay close to operational themes and aviation market signals
                  without spending hours collecting fragmented updates.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-zinc-100">
                  Who is it for?
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Pilots, dispatchers, aviation businesses, training teams,
                  analysts, and frequent flyers who follow the industry closely.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-zinc-100">
                  Need enterprise access?
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  For team intelligence, reports, or platform access, contact
                  Aero Aviation for a tailored package.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex text-sm font-medium text-sky-400 hover:text-sky-300"
                >
                  Contact sales →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

