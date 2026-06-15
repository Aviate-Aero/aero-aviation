import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { LenisProvider } from "@/components/lenisProvider/Standard"
import "./globals.css"
import { cn } from "@/components/lib/utils"
import { Navbar } from "@/components/ui/navbar/Standard"
import { Starfield } from "@/components/ui/starfield/Standard"
import { FooterSection } from "@/components/ui/footer/Standard"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Aero Aviation",
  description: "An Aviation Intelligence Company",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <head>
      <meta name="google-site-verification" content="0fLow2lm8VtXGf88aJ2x7EfkWblkonygMdKFCRjT-NA" />
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-black text-white`}
      >
          <Starfield />

        <Navbar />
        <LenisProvider>{children}</LenisProvider>
        <FooterSection />
      </body>
      </head>
    </html>
  )
}