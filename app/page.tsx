"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/buttons/Standard"
import { CircleArrowRight } from "lucide-react"

export default function Home() {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="relative bg-black text-white overflow-hidden">

      {/* Hero Section */}
      <section className="relative z-20 min-h-[78vh] flex flex-col justify-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mt-8">
           <motion.h1
            className="mb-8 leading-[1] text-balance"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
           >
           <span className="block whitespace-nowrap text-5xl md:text-7xl lg:text-8xl font-light">
            Aerospace Aviation
           </span>

           <span className="mt-3 block text-xl md:text-2xl lg:text-3xl font-light tracking-[0.35em] text-sky-400 uppercase">
            ME LTD
           </span>
          </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-zinc-400 mb-12"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            >
              AI-Powered Aviation Intelligence Platform
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Button
                size="lg"
                onClick={scrollToFeatures}
                className="group bg-sky-500 hover:bg-sky-600 text-white px-8 py-6 text-base rounded-full transition-all duration-[650ms] hover:scale-[1.02]"
              >
                Explore Features
                <CircleArrowRight className="ml-2 h-5 w-5 transition-transform duration-[650ms] group-hover:rotate-90" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative z-20">
      </div>
    </main>
  )
}
