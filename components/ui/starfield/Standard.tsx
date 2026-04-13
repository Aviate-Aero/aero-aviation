"use client"

import { useEffect, useState } from "react"

interface Star {
  id: number
  x: number
  y: number
  size: number
  twinkleDuration: number
  twinkleDelay: number
  driftDuration: number
  driftDelay: number
}

export function Starfield() {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    setStars(
      Array.from({ length: 280 }, (_, i) => ({
        id: i,
        x: Math.random() * 120 - 20, // start some stars off-screen left so drift looks continuous
        y: Math.random() * 120,       // start some stars off-screen bottom
        size: Math.random() < 0.15 ? Math.random() * 2.5 + 1.5 : Math.random() * 1 + 0.4,
        twinkleDuration: Math.random() * 3 + 1.5,
        twinkleDelay: Math.random() * 6,
        driftDuration: Math.random() * 15 + 8, // 8–23s — fast enough to notice
        driftDelay: Math.random() * 15,
      }))
    )
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: [
              `twinkle ${star.twinkleDuration}s ease-in-out ${star.twinkleDelay}s infinite alternate`,
              `drift ${star.driftDuration}s linear ${star.driftDelay}s infinite`,
            ].join(", "),
          }}
        />
      ))}
    </div>
  )
}
