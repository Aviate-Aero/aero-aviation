"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/buttons/Standard"
import { useRouter, usePathname } from "next/navigation"
import { PlaneTakeoff, ArrowLeft } from "lucide-react"

const DashboardHeader: React.FC = () => {
  const [dateTime, setDateTime] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const updateDateTime = () => {
      setDateTime(
        new Date().toLocaleString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      )
    }
    updateDateTime()
    const intervalId = setInterval(updateDateTime, 1000)
    return () => clearInterval(intervalId)
  }, [])

  const handleLogout = () => {
    router.push("/")
  }

  const handleBackToDashboard = () => {
    router.push("/flight-intel")
  }

  const handleNavigateToDispatch = () => {
    router.push("/flight-intel/dispatch")
  }

  const handleNavigateToFlightPerformance = () => {
    router.push("/flight-intel/flightdata") // Adjust the path as needed
  }

  // Determine which navigation button to show based on current path
  const getNavigationButton = () => {
    if (pathname?.includes("/dispatch")) {
      return (
        <Button
          onClick={handleNavigateToFlightPerformance}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors duration-200"
        >
          Flight Performance
        </Button>
      )
    } else if (pathname?.includes("/flightdata")) {
      // Add more conditions for other pages as needed
      return (
        <Button
          onClick={handleNavigateToDispatch}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors duration-200"
        >
          Dispatch
        </Button>
      )
    }
    
    // Default button when no specific condition matches
    return (
      <Button
        onClick={handleNavigateToDispatch}
        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors duration-200"
      >
        Dispatch
      </Button>
    )
  }

  return (
    <header className="mt-12 bg-card text-card-foreground py-4 px-6 flex flex-col md:flex-row justify-between items-center shadow-lg mt-4 md:mt-2 rounded-lg">
      <div className="flex items-center gap-3 mb-4 md:mb-0">
        <PlaneTakeoff className="h-8 w-8 text-slate-700" />
        <div className="flex flex-col">
          <span className="text-2xl text-slate-700 font-semibold tracking-tight">Aero Data Pro</span>
          <span id="datetime" className="text-sm text-muted-foreground mt-0.5">
            {dateTime}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={handleBackToDashboard}
          variant="outline"
          className="flex items-center gap-2 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        {/* Dynamic navigation button */}
        {getNavigationButton()}
        
        <Button
          onClick={handleLogout}
          variant="default"
          className="text-white bg-red-500 hover:bg-red-600 transition-colors duration-200"
        >
          Logout
        </Button>
      </div>
    </header>
  )
}

export default DashboardHeader