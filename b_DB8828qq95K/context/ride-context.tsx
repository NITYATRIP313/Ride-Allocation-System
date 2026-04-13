"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type RideStatus = "idle" | "searching" | "assigned" | "arriving" | "arrived" | "ongoing" | "completed"

interface DriverInfo {
  name: string
  phone: string
  rating: number
  vehicle: string
  licensePlate: string
}

export interface RideState {
  id: string
  pickupLocation: string
  dropLocation: string
  status: RideStatus
  driver?: DriverInfo
  estimatedFare?: number
  etaMinutes?: number
  bookedAt?: string
}

interface RideContextType {
  currentRide: RideState | null
  setCurrentRide: (ride: RideState | null) => void
  updateRideStatus: (status: RideStatus) => void
  updateEta: (minutes: number) => void
  clearRide: () => void
}

const RideContext = createContext<RideContextType | undefined>(undefined)

const STORAGE_KEY = "rideflow_current_ride"

export function RideProvider({ children }: { children: ReactNode }) {
  const [currentRide, setCurrentRideState] = useState<RideState | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCurrentRideState(parsed)
      } catch {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsHydrated(true)
  }, [])

  // Save to sessionStorage whenever ride changes
  useEffect(() => {
    if (isHydrated) {
      if (currentRide) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(currentRide))
      } else {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [currentRide, isHydrated])

  const setCurrentRide = (ride: RideState | null) => {
    setCurrentRideState(ride)
  }

  const updateRideStatus = (status: RideStatus) => {
    setCurrentRideState(prev => prev ? { ...prev, status } : null)
  }

  const updateEta = (minutes: number) => {
    setCurrentRideState(prev => prev ? { ...prev, etaMinutes: minutes } : null)
  }

  const clearRide = () => {
    setCurrentRideState(null)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return (
    <RideContext.Provider value={{ currentRide, setCurrentRide, updateRideStatus, updateEta, clearRide }}>
      {children}
    </RideContext.Provider>
  )
}

export function useRide() {
  const context = useContext(RideContext)
  if (context === undefined) {
    throw new Error("useRide must be used within a RideProvider")
  }
  return context
}
