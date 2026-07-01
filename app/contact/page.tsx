"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Loader2, CheckCircle, AlertCircle, Mail, User, MessageSquare, ChevronDown } from "lucide-react"
import { Button } from "@/components/buttons/Standard"
import { Input } from "@/components/input/Standard"
import { Label } from "@/components/label/Standard"
import { Textarea } from "@/components/textArea/Standard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select/Standard"

const queryTypes = [
  { value: "flight-performance", label: "Flight Performance" },
  { value: "dispatch", label: "Dispatch" },
  { value: "flight-tracker", label: "Flight Tracker" },
  { value: "aviation-intelligence", label: "Aviation Intelligence" },
  { value: "jet-fuel", label: "Jet Fuel" },
  { value: "charter-services", label: "Charter Services" },
  { value: "news-letter", label: "Newsletter" },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    queryType: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (status === "error") setStatus("idle")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      setErrorMsg("Please enter your name")
      setStatus("error")
      return
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMsg("Please enter a valid email address")
      setStatus("error")
      return
    }
    if (!formData.queryType) {
      setErrorMsg("Please select a query type")
      setStatus("error")
      return
    }
    if (!formData.message.trim()) {
      setErrorMsg("Please enter your message")
      setStatus("error")
      return
    }

    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send message")

      setStatus("success")
      setFormData({ name: "", email: "", queryType: "", message: "" })
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus("idle"), 5000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong")
      setStatus("error")
    }
  }

  return (
    <main className="relative bg-black text-white overflow-hidden mt-10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -left-20 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <section className="relative z-20 min-h-screen flex items-center justify-center py-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 md:p-10 shadow-2xl shadow-sky-500/5"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500/20 rounded-2xl mb-6 border border-sky-500/30">
                <Mail className="w-8 h-8 text-sky-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-white mb-3">
                Get in Touch
              </h1>
              <p className="text-zinc-400 max-w-lg mx-auto">
                Have questions about our aviation solutions? We're here to help.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-400" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20"
                    disabled={status === "loading" || status === "success"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-400" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20"
                    disabled={status === "loading" || status === "success"}
                  />
                </div>
              </div>

              {/* Query Type Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="queryType" className="text-zinc-300 flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-sky-400" />
                  What can we help you with?
                </Label>
                <Select
                  value={formData.queryType}
                  onValueChange={(value) => handleChange("queryType", value)}
                  disabled={status === "loading" || status === "success"}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                    <SelectValue placeholder="Select a query type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                    {queryTypes.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        className=""
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-zinc-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  Your Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500 focus:border-sky-500 focus:ring-sky-500/20 resize-none"
                  disabled={status === "loading" || status === "success"}
                />
              </div>

              {/* Status Messages */}
              {status === "error" && errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </motion.div>
              )}

              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm"
                >
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Thank you! Your message has been sent. We'll get back to you soon.
                </motion.div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="w-full group bg-sky-500 hover:bg-sky-600 text-white rounded-full py-6 text-base font-medium transition-all duration-[650ms] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2 transition-transform duration-500 group-hover:translate-x-1" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  )
}