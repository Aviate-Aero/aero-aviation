"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/buttons/Standard"
import { LogOut, Users, UserCog, Mail } from "lucide-react"

export default function AdminWelcomePage() {
  const router = useRouter()

  const handleLogout = () => {
  sessionStorage.removeItem("admin_authenticated");
  router.push("/flight-intel/admin/login"); // was: "/flight-intel/admin"
  };

  const adminCards = [
    {
      title: "Flight Core Users",
      description: "Add or remove users for Flight Core APP",
      icon: Users,
      href: "/flight-intel/admin/flightIntel-manager",
      color: "sky",
    },
    {
      title: "Employee Management",
      description: "Manage Aero Aviation Staff",
      icon: UserCog,
      href: "/flight-intel/admin/employee-manager",
      color: "sky",
    },
    {
      title: "Email",
      description: "Compose and send branded emails to staff or clients",
      icon: Mail,
      href: "/aerodata/admin/email",
      color: "blue",
    },
  ]

  // Helper to get the correct Tailwind color classes (avoid dynamic string interpolation)
  const getColorClasses = (color: "sky" | "blue") => {
    if (color === "sky") {
      return {
        border: "hover:border-sky-500/50",
        shadow: "hover:shadow-sky-500/10",
        gradientFrom: "from-sky-500/0 group-hover:from-sky-500/5",
        gradientTo: "to-sky-500/0 group-hover:to-sky-500/5",
        iconBg: "bg-sky-500/10 group-hover:bg-sky-500/20",
        iconBorder: "border-sky-500/30 group-hover:border-sky-400/50",
        iconText: "text-sky-400 group-hover:text-sky-300",
        linkText: "text-sky-400",
      }
    }
    return {
      border: "hover:border-blue-500/50",
      shadow: "hover:shadow-blue-500/10",
      gradientFrom: "from-blue-500/0 group-hover:from-blue-500/5",
      gradientTo: "to-blue-500/0 group-hover:to-blue-500/5",
      iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
      iconBorder: "border-blue-500/30 group-hover:border-blue-400/50",
      iconText: "text-blue-400 group-hover:text-blue-300",
      linkText: "text-blue-400",
    }
  }

  return (
    <main className="relative bg-black text-white overflow-hidden">
      <section className="relative z-20 min-h-screen flex flex-col justify-center py-24">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <h1 className="text-5xl md:text-7xl font-light bg-gradient-to-r from-sky-300 via-sky-200 to-sky-300 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Manage users, aircraft, employees, and fleet inventory from a single dashboard.
            </p>
          </motion.div>

          {/* Cards Grid – using CSS Grid for equal height */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto place-items-stretch">
            {adminCards.map((card, index) => {
              const colors = getColorClasses(card.color as "sky" | "blue")
              return (
                <motion.div
                  key={card.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  whileHover={{ y: -4 }}
                  className="h-full"
                >
                  <Link
                    href={card.href}
                    className={`group relative flex flex-col h-full p-8 bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800/50 ${colors.border} transition-all duration-500 ${colors.shadow} overflow-hidden`}
                  >
                    {/* Gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo} transition-all duration-500`}
                    />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Icon */}
                      <div
                        className={`w-16 h-16 ${colors.iconBg} rounded-xl flex items-center justify-center mb-6 mx-auto transition-all duration-300 border ${colors.iconBorder}`}
                      >
                        <card.icon className={`w-8 h-8 ${colors.iconText} transition-colors`} />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-2xl font-light text-white mb-3 text-center">
                        {card.title}
                      </h3>
                      
                      {/* Description – flex-1 pushes the link down */}
                      <p className="text-zinc-400 text-sm leading-relaxed text-center flex-1">
                        {card.description}
                      </p>
                      
                      {/* Access link */}
                      <div
                        className={`flex items-center justify-center gap-2 mt-6 ${colors.linkText} font-medium group-hover:gap-3 transition-all duration-300`}
                      >
                        <span>Access</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center mt-12"
          >
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-zinc-700 bg-black/40 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 rounded-full px-8 py-3"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  )
}