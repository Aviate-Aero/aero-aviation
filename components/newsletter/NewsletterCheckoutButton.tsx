"use client"

import { useState } from "react"

export function NewsletterCheckoutButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const startCheckout = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/stripe/newsletter-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = (await response.json().catch(() => null)) as {
        url?: string
        error?: string
      } | null

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Unable to start Stripe checkout.")
      }

      window.location.href = data.url
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start Stripe checkout."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="w-full rounded-full bg-sky-500 px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Opening secure checkout..." : "Subscribe for $9.99/month"}
      </button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  )
}

