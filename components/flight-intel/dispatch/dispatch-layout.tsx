"use client"

import type { ReactNode } from "react"

interface DispatchLayoutProps {
  children: ReactNode
}

export function DispatchLayout({ children }: DispatchLayoutProps) {
  return (
    <div className="relative z-20 mt-40">
      <div className="container mx-auto px-6 lg:px-12 py-8">
        <div className="space-y-8">{children}</div>
      </div>
    </div>
  )
}