"use client"

import { useState, useEffect } from "react"
import { MapPin, Navigation, Car, Clock, User, Star, Phone, MessageSquare, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { StatusBadge } from "@/components/status-badge"
import { TaxiLoader } from "@/components/taxi-loader"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useRide } from "@/context/ride-context"
import Link from "next/link"

export default function UserDashboard() {
  const [pickupLocation, setPickupLocation] = useState("")
  const [dropLocation, setDropLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { currentRide, setCurrentRide, updateEta, clearRide } = useRide()
  const { toast } = useToast()

  // ETA countdown effect
  useEffect(() => {
    if (currentRide && currentRide.status === "assigned" && currentRide.etaMinutes && currentRide.etaMinutes > 0) {
      const timer = setInterval(() => {
        if (currentRide.etaMinutes && currentRide.etaMinutes > 1) {
          updateEta(currentRide.etaMinutes - 1)
        } else if (currentRide.etaMinutes === 1) {
          // Driver has arrived
          setCurrentRide({
            ...currentRide,
            status: "arrived",
            etaMinutes: 0
          })
          toast({
            title: "Driver Has Arrived!",
            description: "Your driver is waiting at the pickup location.",
          })
        }
      }, 60000) // Update every minute

      return () => clearInterval(timer)
    }
  }, [currentRide, updateEta, setCurrentRide, toast])

  // Restore form values from currentRide
  useEffect(() => {
    if (currentRide && currentRide.pickupLocation && currentRide.dropLocation) {
      setPickupLocation(currentRide.pickupLocation)
      setDropLocation(currentRide.dropLocation)
    }
  }, [currentRide])

  const handleRequestRide = async () => {
    if (!pickupLocation.trim() || !dropLocation.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both pickup and drop locations.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const rideId = `RR-${Date.now()}`
    const bookedAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    
    setCurrentRide({
      id: rideId,
      pickupLocation,
      dropLocation,
      status: "searching",
      bookedAt,
    })

    try {
      // Call API to create ride request
      await fetch("/api/ride-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup_location: pickupLocation,
          drop_location: dropLocation,
          user_id: 1,
        }),
      })
    } catch {
      // Continue with demo mode
    }

    // Simulate driver assignment after a delay
    setTimeout(() => {
      const estimatedFare = Math.floor(Math.random() * 200) + 150 // Random fare between 150-350
      const etaMinutes = Math.floor(Math.random() * 5) + 5 // Random ETA between 5-10 mins
      
      setCurrentRide({
        id: rideId,
        pickupLocation,
        dropLocation,
        status: "assigned",
        driver: {
          name: "Rajesh Kumar",
          phone: "+91 98765 43210",
          rating: 4.9,
          vehicle: "Toyota Camry - White",
          licensePlate: "MH 01 AB 1234",
        },
        estimatedFare,
        etaMinutes,
        bookedAt,
      })
      setIsLoading(false)
      toast({
        title: "Driver Found!",
        description: `Your driver is ${etaMinutes} mins away.`,
      })
    }, 3000)
  }

  const handleCancelRide = () => {
    clearRide()
    setIsLoading(false)
    setPickupLocation("")
    setDropLocation("")
    toast({
      title: "Ride Cancelled",
      description: "Your ride request has been cancelled.",
    })
  }

  const isRideActive = currentRide && currentRide.status !== "idle" && currentRide.status !== "completed"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold text-transparent">Book Your Ride</h1>
          <p className="mt-2 text-muted-foreground">Enter your pickup and destination to get started</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Booking Form */}
          <Card className="border-border bg-card shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Request a Ride
              </CardTitle>
              <CardDescription>Fill in your journey details below</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="pickup" className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    Pickup Location
                  </Label>
                  <Input
                    id="pickup"
                    placeholder="Enter pickup address"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    disabled={isLoading || isRideActive}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drop" className="flex items-center gap-2 text-sm font-medium">
                    <Navigation className="h-4 w-4 text-red-500" />
                    Drop Location
                  </Label>
                  <Input
                    id="drop"
                    placeholder="Enter destination address"
                    value={dropLocation}
                    onChange={(e) => setDropLocation(e.target.value)}
                    disabled={isLoading || isRideActive}
                    className="h-12"
                  />
                </div>

                {!isRideActive ? (
                  <Button
                    onClick={handleRequestRide}
                    disabled={isLoading}
                    className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    size="lg"
                  >
                    {isLoading ? "Requesting..." : "Request Ride"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleCancelRide}
                    variant="destructive"
                    className="h-12 w-full"
                    size="lg"
                  >
                    Cancel Ride
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ride Status */}
          <Card className="border-border bg-card shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Ride Status
              </CardTitle>
              <CardDescription>Track your current ride request</CardDescription>
            </CardHeader>
            <CardContent>
              {!currentRide && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Car className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No active ride request</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your locations and request a ride to get started
                  </p>
                </div>
              ) : currentRide?.status === "searching" || isLoading ? (
                <TaxiLoader message="Finding you a driver..." />
              ) : currentRide?.status === "assigned" || currentRide?.status === "arrived" ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <StatusBadge status={currentRide.status === "arrived" ? "arrived" : "assigned"} />
                  </div>

                  {/* Driver Arrived Alert */}
                  {currentRide.status === "arrived" && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white animate-pulse">
                          <Bell className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-700">Driver Has Arrived!</p>
                          <p className="text-sm text-emerald-600">Please meet your driver at the pickup location</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentRide.driver && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{currentRide.driver.name}</h4>
                          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-secondary text-secondary" />
                            <span>{currentRide.driver.rating}</span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{currentRide.driver.vehicle}</p>
                          <p className="text-sm font-medium text-foreground">{currentRide.driver.licensePlate}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Route Details */}
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="text-sm font-medium text-foreground">{currentRide.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="ml-2.5 h-4 border-l-2 border-dashed border-muted" />
                    <div className="flex items-start gap-3">
                      <Navigation className="mt-0.5 h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Drop-off</p>
                        <p className="text-sm font-medium text-foreground">{currentRide.dropLocation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/30 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Est. Fare</p>
                      <p className="text-lg font-semibold text-foreground">₹{currentRide.estimatedFare}</p>
                    </div>
                    <div className={`rounded-lg p-3 text-center ${currentRide.status === "arrived" ? "bg-emerald-100" : "bg-muted/30"}`}>
                      <p className="text-xs text-muted-foreground">ETA</p>
                      <p className={`text-lg font-semibold ${currentRide.status === "arrived" ? "text-emerald-600" : "text-foreground"}`}>
                        {currentRide.status === "arrived" ? "Arrived!" : `${currentRide.etaMinutes} mins`}
                      </p>
                    </div>
                  </div>

                  <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href={`/tracking?id=${currentRide.id}&pickup=${encodeURIComponent(currentRide.pickupLocation)}&drop=${encodeURIComponent(currentRide.dropLocation)}&fare=${currentRide.estimatedFare}&eta=${currentRide.etaMinutes}`}>
                      Track Ride
                    </Link>
                  </Button>
                </div>
              ) : currentRide?.status === "ongoing" ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <StatusBadge status="ongoing" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="text-sm font-medium text-foreground">{currentRide.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Navigation className="mt-0.5 h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">To</p>
                        <p className="text-sm font-medium text-foreground">{currentRide.dropLocation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-4 text-center">
                    <Car className="mx-auto h-8 w-8 text-amber-600" />
                    <p className="mt-2 font-medium text-amber-700">Ride in Progress</p>
                    <p className="text-sm text-amber-600">Your driver will complete the ride</p>
                  </div>
                </div>
              ) : currentRide?.status === "completed" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <Car className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Ride Completed!</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Thank you for riding with RideFlow</p>
                  <div className="mt-4">
                    <Button asChild variant="outline">
                      <Link href="/history">View Ride History</Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
