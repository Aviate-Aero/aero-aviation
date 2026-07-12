"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/buttons/Standard"
import { CircleArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-black text-white">
      {/* Hero Section */}
      <section className="relative z-20 flex min-h-[78vh] flex-col justify-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mt-8 max-w-3xl">
            <motion.h1
              className="mb-8 text-balance leading-[1]"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.75,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <span className="block whitespace-nowrap text-5xl font-light md:text-7xl lg:text-8xl">
                Aerospace Aviation
              </span>

              <span className="mt-3 block text-xl font-light uppercase tracking-[0.35em] text-sky-400 md:text-2xl lg:text-3xl">
                ME LTD
              </span>
            </motion.h1>

            <motion.p
              className="mb-12 text-lg text-zinc-400 md:text-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.75,
                delay: 0.15,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              AI-Powered Aviation Intelligence Platform
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.65,
                delay: 0.3,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <Button
                asChild
                size="lg"
                className="group rounded-full bg-sky-500 px-8 py-6 text-base text-white transition-all duration-[650ms] hover:scale-[1.02] hover:bg-sky-600"
              >
                <Link href="/features">
                  Explore Features
                  <CircleArrowRight className="ml-2 h-5 w-5 transition-transform duration-[650ms] group-hover:rotate-90" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative z-20" />
    </main>
  )
}