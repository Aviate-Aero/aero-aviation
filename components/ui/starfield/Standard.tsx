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
      Array.from({ length: 280 }, (_, i) => {
        const twinkleDuration = Math.random() * 3 + 1.5
        const driftDuration = Math.random() * 15 + 8
        return {
          id: i,
          x: Math.random() * 120 - 20,
          y: Math.random() * 120,
          size: Math.random() < 0.15 ? Math.random() * 2.5 + 1.5 : Math.random() * 1 + 0.4,
          twinkleDuration,
          // Negative delay = animation starts already in progress (random phase)
          twinkleDelay: -(Math.random() * twinkleDuration),
          driftDuration,
          driftDelay: -(Math.random() * driftDuration),
        }
      })
    )
  }, [])

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
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
