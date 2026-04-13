"use client"

// FILE PATH: app/tracking/page.tsx

import { Suspense, useState, useEffect } from "react"
import { Car, MapPin, Navigation, User, Star, Phone, MessageSquare, Clock, CheckCircle2, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { StatusBadge } from "@/components/status-badge"
import { useRide } from "@/context/ride-context"
import Link from "next/link"

type RideStage = "searching" | "assigned" | "arriving" | "arrived" | "started" | "completed"

interface RideDetails {
  id: string
  status: RideStage
  pickup: string
  drop: string
  driver: {
    name: string
    phone: string
    rating: number
    vehicle: string
    licensePlate: string
  }
  fare: number
  distance: string
  etaMinutes: number
  bookedAt: string
}

const stages: { key: RideStage; label: string }[] = [
  { key: "assigned",  label: "Driver Assigned" },
  { key: "arriving",  label: "Driver En Route" },
  { key: "arrived",   label: "Driver Arrived" },
  { key: "started",   label: "Ride Started" },
  { key: "completed", label: "Completed" },
]

function TrackingContent() {
  const { currentRide, setCurrentRide } = useRide()

  const [ride, setRide] = useState<RideDetails>({
    id: currentRide?.id || "RR-001",
    status: "assigned",
    pickup: currentRide?.pickupLocation || "Pickup location",
    drop: currentRide?.dropLocation || "Drop location",
    driver: currentRide?.driver || {
      name: "Rajesh Kumar",
      phone: "9877665544",
      rating: 4.9,
      vehicle: "Honda City - Silver",
      licensePlate: "MH02CD5678",
    },
    fare: currentRide?.estimatedFare || 245,
    distance: "8.2 km",
    etaMinutes: currentRide?.etaMinutes || 8,
    bookedAt: currentRide?.bookedAt || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  })

  const [hasArrived, setHasArrived] = useState(false)

  // ETA countdown
  useEffect(() => {
    if (ride.etaMinutes > 0 && !hasArrived) {
      const timer = setInterval(() => {
        setRide(prev => {
          if (prev.etaMinutes > 1) {
            return { ...prev, etaMinutes: prev.etaMinutes - 1, status: "arriving" }
          } else if (prev.etaMinutes === 1) {
            setHasArrived(true)
            if (currentRide) {
              setCurrentRide({ ...currentRide, status: "arrived", etaMinutes: 0 })
            }
            return { ...prev, etaMinutes: 0, status: "arrived" }
          }
          return prev
        })
      }, 60000)
      return () => clearInterval(timer)
    }
  }, [ride.etaMinutes, hasArrived, currentRide, setCurrentRide])

  // Sync with context
  useEffect(() => {
    if (currentRide) {
      setRide(prev => ({
        ...prev,
        id: currentRide.id,
        pickup: currentRide.pickupLocation,
        drop: currentRide.dropLocation,
        fare: currentRide.estimatedFare || prev.fare,
        etaMinutes: currentRide.etaMinutes ?? prev.etaMinutes,
        driver: currentRide.driver || prev.driver,
        bookedAt: currentRide.bookedAt || prev.bookedAt,
        status: currentRide.status === "arrived" ? "arrived" : prev.status,
      }))
      if (currentRide.status === "arrived") setHasArrived(true)
    }
  }, [currentRide])

  const currentStageIndex = stages.findIndex(s => s.key === ride.status)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold text-transparent">
          Track Your Ride
        </h1>
        <p className="mt-2 text-muted-foreground">Ride ID: {ride.id}</p>
      </div>

      {/* Driver arrived banner */}
      {hasArrived && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 animate-pulse dark:bg-emerald-950/30 dark:border-emerald-900">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Your Driver Has Arrived!</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-500">Please meet {ride.driver.name} at {ride.pickup}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Map ── */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-border bg-card shadow-lg">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5">
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={`h-${i}`} className="absolute h-px w-full bg-muted-foreground/30" style={{ top: `${(i + 1) * 10}%` }} />
                    ))}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={`v-${i}`} className="absolute h-full w-px bg-muted-foreground/30" style={{ left: `${(i + 1) * 10}%` }} />
                    ))}
                  </div>

                  {/* Pickup marker */}
                  <div className="absolute left-[20%] top-[30%] flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg text-white ${hasArrived ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"}`}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="mt-2 max-w-[120px] rounded-lg bg-card px-2 py-1 text-xs font-medium shadow text-center truncate">
                      {ride.pickup.length > 20 ? ride.pickup.substring(0, 20) + "…" : ride.pickup}
                    </div>
                  </div>

                  {/* Route line */}
                  <svg className="absolute inset-0 h-full w-full">
                    <path
                      d="M 20% 30% Q 40% 50% 75% 65%"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="8 4"
                      className="text-primary"
                    />
                  </svg>

                  {/* Car marker — animates toward pickup */}
                  <div className={`absolute flex flex-col items-center transition-all duration-1000 ${
                    hasArrived ? "left-[20%] top-[30%]" :
                    ride.status === "arriving" ? "left-[30%] top-[38%]" :
                    "left-[45%] top-[48%]"
                  }`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg ${!hasArrived ? "animate-pulse" : ""}`}>
                      <Car className="h-6 w-6" />
                    </div>
                    {!hasArrived && (
                      <div className="mt-1 rounded bg-secondary/90 px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        {ride.etaMinutes} min
                      </div>
                    )}
                  </div>

                  {/* Drop marker */}
                  <div className="absolute left-[75%] top-[65%] flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <div className="mt-2 max-w-[120px] rounded-lg bg-card px-2 py-1 text-xs font-medium shadow text-center truncate">
                      {ride.drop.length > 20 ? ride.drop.substring(0, 20) + "…" : ride.drop}
                    </div>
                  </div>
                </div>

                {/* Bottom overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between rounded-xl bg-card/95 p-4 shadow-lg backdrop-blur-sm">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {hasArrived ? "Status" : "Driver arriving in"}
                      </p>
                      <p className={`text-xl font-bold ${hasArrived ? "text-emerald-600" : "text-foreground"}`}>
                        {hasArrived ? "Driver Arrived!" : `${ride.etaMinutes} mins`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Estimated Fare</p>
                      <p className="text-xl font-bold text-primary">₹{ride.fare}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">
          {/* Status progress */}
          <Card className="border-border bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Ride Status</span>
                <StatusBadge status={hasArrived ? "arrived" : ride.status} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stages.map((stage, index) => {
                  const isCompleted = index < currentStageIndex
                  const isCurrent = index === currentStageIndex
                  return (
                    <div key={stage.key} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                        isCompleted ? "bg-emerald-500 text-white" :
                        isCurrent ? "bg-primary text-primary-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-sm font-medium">{index + 1}</span>}
                      </div>
                      <span className={`text-sm font-medium ${isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                        {stage.label}
                      </span>
                      {isCurrent && !hasArrived && <span className="ml-auto text-xs text-primary">{ride.etaMinutes} min</span>}
                      {stage.key === "arrived" && hasArrived && <span className="ml-auto text-xs text-emerald-600">Now</span>}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Driver info */}
          <Card className="border-border bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Your Driver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{ride.driver.name}</h4>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-secondary text-secondary" />
                    <span>{ride.driver.rating.toFixed(1)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ride.driver.vehicle}</p>
                  <p className="text-sm font-medium text-foreground">{ride.driver.licensePlate}</p>
                </div>
              </div>

              {/* Real phone on both buttons */}
              <div className="mt-4 flex gap-2">
                <a href={`tel:${ride.driver.phone}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                </a>
                <a href={`sms:${ride.driver.phone}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </a>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">{ride.driver.phone}</p>
            </CardContent>
          </Card>

          {/* Route */}
          <Card className="border-border bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Navigation className="h-5 w-5 text-primary" />
                Route Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Pickup</p>
                    <p className="text-sm font-medium text-foreground break-words">{ride.pickup}</p>
                  </div>
                </div>
                <div className="ml-2.5 h-6 border-l-2 border-dashed border-muted" />
                <div className="flex items-start gap-3">
                  <Navigation className="mt-0.5 h-5 w-5 text-red-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Drop-off</p>
                    <p className="text-sm font-medium text-foreground break-words">{ride.drop}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Booked at</span>
                </div>
                <span className="text-sm font-medium text-foreground">{ride.bookedAt}</span>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/10 p-4">
                <span className="text-sm font-medium text-foreground">Estimated Fare</span>
                <span className="text-xl font-bold text-primary">₹{ride.fare}</span>
              </div>

              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/user">Back to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default function RideTrackingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-muted-foreground">Loading ride details...</div>
          </div>
        </div>
      }>
        <TrackingContent />
      </Suspense>
    </div>
  )
}
