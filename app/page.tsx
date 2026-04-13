"use client"

import { Button } from "@/components/buttons/Standard"
import { Starfield } from "@/components/ui/starfield/Standard"
import { Navbar } from "@/components/ui/navbar/Standard"
import { FeaturesSection } from "@/components/Sections/features/Standard"
import { CircleArrowRight } from "lucide-react"

export default function Home() {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="relative bg-black text-white overflow-hidden">
      <Navbar />
      <Starfield />

      {/* Hero Section */}
      <section className="relative z-20 min-h-screen flex flex-col justify-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-light mb-8 leading-[1] text-balance">
              Aero Aviation
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-12">
              AI-Powered Aviation Intelligence Platform
            </p>
            <Button
              size="lg"
              onClick={scrollToFeatures}
              className="group bg-sky-500 hover:bg-sky-600 text-white px-8 py-6 text-base rounded-full transition-all duration-[650ms] hover:scale-[1.02]"
            >
              Explore Features
              <CircleArrowRight className="ml-2 h-5 w-5 transition-transform duration-[650ms] group-hover:rotate-90" />
            </Button>
          </div>
        </div>
      </section>

      <div className="relative z-20">
        <FeaturesSection />
      </div>
    </main>
  )
}
