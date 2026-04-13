"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { GlowingEffect } from "@/components/ui/glowingEffect/Standard"
import { CircleArrowRight, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import Script from "next/script"

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      // Calculate progress from 0 to 1 over one viewport height
      const progress = Math.min(scrollY / viewportHeight, 1)
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Calculate opacity and scale based on scroll
  const linesOpacity = 1 - scrollProgress
  const linesScale = 1 - scrollProgress * 0.3 // Scale from 1 to 0.7

  const scrollToCapabilities = () => {
    const capabilitiesSection = document.getElementById("capabilities")
    if (capabilitiesSection) {
      capabilitiesSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <main className="relative min-h-[200vh] bg-black text-white overflow-hidden">
      <Script
        src="https://unpkg.com/@splinetool/viewer@1.0.17/build/spline-viewer.js"
        type="module"
        strategy="afterInteractive"
      />

      <Navbar />

      <div
        className="fixed inset-0 z-0 w-screen h-screen pointer-events-none transition-all duration-100"
        style={{
          opacity: linesOpacity,
          transform: `scale(${linesScale})`,
        }}
      >
        <div className="bg-lines-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2269"
            height="2108"
            viewBox="0 0 2269 2108"
            fill="none"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Animated Purple Lines */}
            <path
              d="M510.086 0.543457L507.556 840.047C506.058 1337.18 318.091 1803.4 1.875 2094.29"
              stroke="#4C00EC"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-1"
            />
            <path
              d="M929.828 0.543457L927.328 829.877C925.809 1334 737.028 1807.4 418.435 2106"
              stroke="#4C00EC"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-2"
            />
            <path
              d="M1341.9 0.543457L1344.4 829.876C1345.92 1334 1534.7 1807.4 1853.29 2106"
              stroke="#4C00EC"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-3"
            />
            <path
              d="M1758.96 0.543457L1761.49 840.047C1762.99 1337.18 1950.96 1803.4 2267.17 2094.29"
              stroke="#4C00EC"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-4"
            />

            {/* Static White Background Lines */}
            <path
              opacity="0.2"
              d="M929.828 0.543457L927.328 829.877C925.809 1334 737.028 1807.4 418.435 2106"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
            <path
              opacity="0.2"
              d="M510.086 0.543457L507.556 840.047C506.058 1337.18 318.091 1803.4 1.875 2094.29"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
            <path
              opacity="0.2"
              d="M1758.96 0.543457L1761.49 840.047C1762.99 1337.18 1950.96 1803.4 2267.17 2094.29"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
            <path
              opacity="0.2"
              d="M1341.9 0.543457L1344.4 829.876C1345.92 1334 1534.7 1807.4 1853.29 2106"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
          </svg>
        </div>
      </div>

      {/* 3D Spline Viewer */}
      <div
        className="fixed right-0 top-0 w-1/2 h-screen pointer-events-none z-10"
        style={{
          opacity: linesOpacity,
          transform: `scale(${linesScale})`,
        }}
      >
        <div className="track">
          <spline-viewer
            url="https://prod.spline.design/ZxKIijKh056svcM5/scene.splinecode"
            className="w-full h-full"
            style={{ position: "sticky", top: "0px", height: "100vh" }}
          />
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-6 lg:px-12 pt-24 pb-32 min-h-screen flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Status Toggle */}
          <div className="flex items-center gap-3 mb-12 animate-fade-in">
            <div className="relative w-14 h-7 bg-gradient-to-r from-green-400 to-green-500 rounded-full">
              <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300" />
            </div>
            <span className="text-sm text-zinc-300">Currently open to take on new clients.</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-light mb-8 leading-[1] animate-fade-in-up text-balance">
            Just another boring agency
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-zinc-400 mb-12 animate-fade-in-up animation-delay-200">
            We build custom applications, automations, and AI powered workflows.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in-up animation-delay-400">
            <Button
              size="lg"
              onClick={scrollToCapabilities}
              className="group bg-[#5100fd] hover:bg-[#6610ff] text-white px-8 py-6 text-base rounded-full transition-all duration-[650ms] hover:scale-[1.02]"
            >
              Explore Capabilities
              <CircleArrowRight className="ml-2 h-5 w-5 transition-transform duration-[650ms] group-hover:rotate-90" />
            </Button>
          </div>
        </div>
      </div>

      {/* Capabilities section with tabs */}
      <section id="capabilities" className="relative z-20 py-24">
        <div className="container p-12 rounded-2xl z-50 bg-(#09090b) border border-zinc-800 mx-auto px-6 lg:px-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-balance">Capabilities</h2>

          <p className="text-lg md:text-xl text-zinc-400 mb-12">
            We're built to solve complex business challenges—fast.
          </p>

          <Tabs defaultValue="development" className="w-full">
            <TabsList className="bg-zinc-950 border border-zinc-800 p-1 mb-8 rounded-full">
              <TabsTrigger
                value="development"
                className="text-zinc-500 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white px-8 py-3 rounded-full transition-all"
              >
                Development
              </TabsTrigger>
              <TabsTrigger
                value="automation"
                className="text-zinc-500 data-[state=active]:bg-[#5100fd] data-[state=active]:text-white px-8 py-3 rounded-full transition-all"
              >
                Automation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="development" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative rounded-2xl border border-zinc-800 p-3">
                  <GlowingEffect
                    blur={0}
                    borderWidth={2}
                    spread={80}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <div className="relative bg-(#0a0a0a) rounded-xl p-8">
                    <h3 className="text-2xl font-light mb-4">Custom Applications</h3>
                    <p className="text-zinc-400 leading-relaxed mb-6">
                      We build scalable, performant web and mobile applications tailored to your specific business needs
                      using modern frameworks and best practices.
                    </p>
                    <a
                      href="#"
                      className="inline-flex items-center text-white hover:text-zinc-300 transition-colors duration-300 group"
                    >
                      <span className="underline">Learn More</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
                <div className="relative rounded-2xl border border-zinc-800 p-3">
                  <GlowingEffect
                    blur={0}
                    borderWidth={2}
                    spread={80}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <div className="relative bg-(#0a0a0a) rounded-xl p-8">
                    <h3 className="text-2xl font-light mb-4">Full-Stack Solutions</h3>
                    <p className="text-zinc-400 leading-relaxed mb-6">
                      From frontend interfaces to backend infrastructure, we deliver complete solutions that integrate
                      seamlessly with your existing systems.
                    </p>
                    <a
                      href="#"
                      className="inline-flex items-center text-white hover:text-zinc-300 transition-colors duration-300 group"
                    >
                      <span className="underline">Learn More</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="automation" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative rounded-2xl border border-zinc-800 p-3">
                  <GlowingEffect
                    blur={0}
                    borderWidth={2}
                    spread={80}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <div className="relative bg-(#0a0a0a) rounded-xl p-8">
                    <h3 className="text-2xl font-light mb-4">AI-Powered Workflows</h3>
                    <p className="text-zinc-400 leading-relaxed mb-6">
                      Leverage cutting-edge AI technology to automate complex processes, reduce manual work, and unlock
                      new capabilities for your business.
                    </p>
                    <a
                      href="#"
                      className="inline-flex items-center text-white hover:text-zinc-300 transition-colors duration-300 group"
                    >
                      <span className="underline">Learn More</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
                <div className="relative rounded-2xl border border-zinc-800 p-3">
                  <GlowingEffect
                    blur={0}
                    borderWidth={2}
                    spread={80}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <div className="relative bg-(#0a0a0a) rounded-xl p-8">
                    <h3 className="text-2xl font-light mb-4">Process Optimization</h3>
                    <p className="text-zinc-400 leading-relaxed mb-6">
                      Streamline your operations with intelligent automation that learns and adapts to your business
                      patterns, saving time and resources.
                    </p>
                    <a
                      href="#"
                      className="inline-flex items-center text-white hover:text-zinc-300 transition-colors duration-300 group"
                    >
                      <span className="underline">Learn More</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  )
}
