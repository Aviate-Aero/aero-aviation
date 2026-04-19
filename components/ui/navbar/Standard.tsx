"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
// import { ResourcesDropdown } from "./resources-dropdown"
// import { ToolsDropdown } from "./tools-dropdown"
// import { MobileMenu } from "./mobile-menu"

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <nav
      className={`fixed left-1/2 -translate-x-1/2 z-50 px-6 w-full max-w-7xl transition-all duration-700 ease-in-out ${
        isVisible ? "top-8 opacity-100" : "-top-24 opacity-0"
      }`}
    >
      {/* REDUCED vertical padding: changed py-3 to py-1 */}
      <div className="bg-black/50 backdrop-blur-[120px] rounded-full px-8 py-1 flex items-center gap-8 shadow-lg border border-white/10 w-full">
        {/* Logo - dimensions unchanged */}
        <div className="flex items-center">
          <Link href="/">
          <Image 
            src="/logos/officialLogo.svg" 
            alt="Aero Aviation" 
            width={350}           
            height={76}      
            className="h-[86px] w-auto"
            priority
          />
         </Link>
        </div>

        {/* Desktop Menu Links */}
        <div className="hidden md:flex items-center justify-end gap-6 flex-1">
          <Link href="/fuel" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-300">
            Jet Fuel
          </Link>
          <Link href="/charter" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-300">
            Charter Services
          </Link>
          <Link href="/pricing" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-300">
            Pricing
          </Link>
          <Link href="/about" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-300">
            About
          </Link>
          <Link
            href="/flight-intel"
            className="px-5 py-2.5 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-400 text-sm font-medium hover:bg-sky-500/25 hover:border-sky-500/70 hover:text-sky-300 transition-all duration-300"
          >
            Flight Core Intelligence
          </Link>
          <Link
            href="/contact"
            className="px-[18px] py-[10px] rounded-full border border-sky-500 bg-sky-500 text-white font-medium hover:scale-105 transition-transform duration-500"
          >
            Contact
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center justify-end flex-1 pr-4">
          {/* <MobileMenu /> */}
        </div>
      </div>
    </nav>
  )
}