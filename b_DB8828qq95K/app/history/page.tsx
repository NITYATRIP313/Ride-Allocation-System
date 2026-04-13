"use client"

// FILE PATH: app/history/page.tsx

import { useState, useEffect } from "react"
import {
  Car, MapPin, Navigation, Star, DollarSign,
  Calendar, CreditCard, Clock, Loader2, RefreshCw, Map
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { StatusBadge } from "@/components/status-badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface RideHistory {
  ride_id: string
  date: string
  time: string
  pickup: string
  drop: string
  driver: { name: string }
  fare: number
  payment_status: string
  payment_method: string
  distance: string
  duration: string
  userRating?: number
  userFeedback?: string
}

// ── Fallback data built from your actual seed ────────────────────────────────
const SEED_RIDES: RideHistory[] = [
  {
    ride_id: "RD-001", date: "01 Apr 2026", time: "08:05 AM",
    pickup: "Bangalore Central, MG Road", drop: "Koramangala, Bangalore",
    driver: { name: "Nityanshu Tripathi" }, fare: 200,
    payment_status: "completed", payment_method: "UPI",
    distance: "8.0 km", duration: "15 mins", userRating: 5,
    userFeedback: "Smooth ride, very professional driver!",
  },
  {
    ride_id: "RD-002", date: "01 Apr 2026", time: "09:35 AM",
    pickup: "Chennai Central Railway Station", drop: "Whitefield, Bangalore",
    driver: { name: "Rajesh Kumar" }, fare: 330,
    payment_status: "completed", payment_method: "Credit Card",
    distance: "12.0 km", duration: "22 mins", userRating: 4,
    userFeedback: "Good ride, AC was perfect.",
  },
  {
    ride_id: "RD-004", date: "02 Apr 2026", time: "07:50 AM",
    pickup: "Hebbal, Bangalore", drop: "JP Nagar, Bangalore",
    driver: { name: "Amit Pandey" }, fare: 175,
    payment_status: "completed", payment_method: "Cash",
    distance: "6.7 km", duration: "12 mins", userRating: 5,
    userFeedback: "Excellent! On time and polite.",
  },
  {
    ride_id: "RD-005", date: "02 Apr 2026", time: "10:20 AM",
    pickup: "Rajajinagar, Bangalore", drop: "Yeshwanthpur, Bangalore",
    driver: { name: "Nityanshu Tripathi" }, fare: 275,
    payment_status: "completed", payment_method: "UPI",
    distance: "10.7 km", duration: "20 mins", userRating: 4,
    userFeedback: "Comfortable ride, would book again.",
  },
  {
    ride_id: "RD-006", date: "03 Apr 2026", time: "08:35 AM",
    pickup: "Electronic City, Bangalore", drop: "Bangalore Central, MG Road",
    driver: { name: "Rajesh Kumar" }, fare: 390,
    payment_status: "completed", payment_method: "Wallet",
    distance: "13.3 km", duration: "25 mins", userRating: 3,
    userFeedback: "Slightly late but ok overall.",
  },
  {
    ride_id: "RD-008", date: "04 Apr 2026", time: "09:05 AM",
    pickup: "Hyderabad Central", drop: "HITEC City, Hyderabad",
    driver: { name: "Manoj Tiwari" }, fare: 225,
    payment_status: "completed", payment_method: "UPI",
    distance: "9.3 km", duration: "17 mins", userRating: 5,
    userFeedback: "Best ride experience so far!",
  },
  {
    ride_id: "RD-009", date: "04 Apr 2026", time: "14:35 PM",
    pickup: "Pune Junction", drop: "Hinjewadi IT Park, Pune",
    driver: { name: "Sanjay Gupta" }, fare: 188,
    payment_status: "completed", payment_method: "Debit Card",
    distance: "7.3 km", duration: "14 mins", userRating: 4,
    userFeedback: "Driver knew the route well.",
  },
  {
    ride_id: "RD-010", date: "05 Apr 2026", time: "07:05 AM",
    pickup: "Mumbai CST", drop: "Bandra, Mumbai",
    driver: { name: "Prakash Reddy" }, fare: 348,
    payment_status: "completed", payment_method: "UPI",
    distance: "12.7 km", duration: "24 mins", userRating: 5,
    userFeedback: "Very clean vehicle, great driver.",
  },
]

// ── Mini route map shown inside the Details dialog ───────────────────────────
function RideMapPreview({ pickup, drop }: { pickup: string; drop: string }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute h-px w-full bg-muted-foreground/30" style={{ top: `${(i + 1) * 12.5}%` }} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-muted-foreground/30" style={{ left: `${(i + 1) * 12.5}%` }} />
          ))}
        </div>

        {/* Pickup marker */}
        <div className="absolute left-[18%] top-[28%] flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="mt-1 max-w-[100px] rounded-md bg-card px-2 py-0.5 text-xs font-medium shadow text-center truncate">
            {pickup.length > 18 ? pickup.substring(0, 18) + "…" : pickup}
          </div>
        </div>

        {/* Route line */}
        <svg className="absolute inset-0 h-full w-full">
          <path
            d="M 18% 28% Q 42% 48% 76% 64%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="7 4"
            className="text-primary"
          />
        </svg>

        {/* Car at midpoint (ride completed) */}
        <div className="absolute left-[46%] top-[45%] flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg">
            <Car className="h-5 w-5" />
          </div>
        </div>

        {/* Drop marker */}
        <div className="absolute left-[76%] top-[64%] flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
            <Navigation className="h-4 w-4" />
          </div>
          <div className="mt-1 max-w-[100px] rounded-md bg-card px-2 py-0.5 text-xs font-medium shadow text-center truncate">
            {drop.length > 18 ? drop.substring(0, 18) + "…" : drop}
          </div>
        </div>
      </div>

      {/* Completed label */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="rounded-lg bg-card/90 px-3 py-2 text-center text-xs font-medium text-muted-foreground backdrop-blur-sm">
          ✅ Ride Completed
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function RideHistoryPage() {
  const [rides, setRides] = useState<RideHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [ratingValue, setRatingValue] = useState(0)
  const [submittingRating, setSubmittingRating] = useState(false)
  const { toast } = useToast()

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) { setRides(SEED_RIDES); setIsLoading(false); return }

      const res = await fetch(`/api/rides/history?user_id=${userId}`)
      const data = await res.json()

      if (data.success && data.rides.length > 0) {
        setRides(data.rides)
      } else {
        // Nothing in DB for this user — show seed data so page isn't empty
        setRides(SEED_RIDES)
      }
    } catch {
      setRides(SEED_RIDES)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchHistory() }, [])

  const handleSubmitRating = async (rideId: string) => {
    if (ratingValue === 0) return
    setSubmittingRating(true)
    try {
      const userId = localStorage.getItem("userId")
      await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_id: rideId, user_id: userId, score: ratingValue, rated_by: "user" }),
      })
      setRides(prev => prev.map(r => r.ride_id === rideId ? { ...r, userRating: ratingValue } : r))
      toast({ title: "Rating Submitted ⭐", description: `You gave this ride ${ratingValue} star${ratingValue !== 1 ? "s" : ""}. Thanks!` })
    } catch {
      toast({ title: "Failed to submit rating", description: "Please try again.", variant: "destructive" })
    } finally {
      setSubmittingRating(false)
      setRatingValue(0)
    }
  }

  const totalSpent = rides.reduce((sum, r) => sum + r.fare, 0)
  const totalRides = rides.length
  const ratedRides = rides.filter(r => r.userRating)
  const avgRating = ratedRides.length > 0
    ? ratedRides.reduce((sum, r) => sum + (r.userRating || 0), 0) / ratedRides.length
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ride History</h1>
            <p className="mt-2 text-muted-foreground">All your past rides</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalRides}</p>
                <p className="text-sm text-muted-foreground">Total Rides</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/30">
                <DollarSign className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹{totalSpent}</p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
                <p className="text-sm text-muted-foreground">Avg Rating Given</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <Card className="border-border bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Your Rides
            </CardTitle>
            <CardDescription>
              {isLoading ? "Loading from database…" : `${totalRides} completed ride${totalRides !== 1 ? "s" : ""} found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Fetching your rides…</p>
              </div>
            ) : rides.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Car className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No completed rides yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Book a ride to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rides.map((ride) => (
                  <div
                    key={ride.ride_id}
                    className="flex flex-col gap-4 rounded-xl border border-border bg-muted/20 p-4 transition-all hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center"
                  >
                    {/* Date block */}
                    <div className="flex items-center gap-4 sm:w-32">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <span className="text-xs font-medium">{ride.date.split(" ")[1]}</span>
                        <span className="text-lg font-bold">{ride.date.split(" ")[0]}</span>
                      </div>
                      <div className="sm:hidden">
                        <p className="text-sm font-medium text-foreground">{ride.time}</p>
                        <p className="text-xs text-muted-foreground">{ride.driver.name}</p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-sm text-foreground truncate">{ride.pickup}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-red-500 shrink-0" />
                        <span className="text-sm text-foreground truncate">{ride.drop}</span>
                      </div>
                    </div>

                    {/* Driver desktop */}
                    <div className="hidden sm:block sm:w-40">
                      <p className="text-sm font-medium text-foreground">{ride.driver.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{ride.time}</p>
                      {ride.userRating && (
                        <div className="mt-1 flex items-center gap-0.5">
                          {Array.from({ length: ride.userRating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-secondary text-secondary" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fare + Details button */}
                    <div className="flex items-center justify-between sm:w-48 sm:justify-end sm:gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">₹{ride.fare}</p>
                        <StatusBadge status={ride.payment_status as any} />
                      </div>

                      <Dialog onOpenChange={(open) => { if (!open) setRatingValue(0) }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setRatingValue(ride.userRating || 0)}>
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Ride Details — {ride.ride_id}</DialogTitle>
                            <DialogDescription>{ride.date} at {ride.time}</DialogDescription>
                          </DialogHeader>

                          <div className="space-y-5 py-2">
                            {/* Map */}
                            <div>
                              <div className="mb-2 flex items-center gap-2">
                                <Map className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">Route Map</span>
                              </div>
                              <RideMapPreview pickup={ride.pickup} drop={ride.drop} />
                            </div>

                            {/* Route text */}
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-5 w-5 text-emerald-500 shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Pickup</p>
                                  <p className="text-sm font-medium text-foreground">{ride.pickup}</p>
                                </div>
                              </div>
                              <div className="ml-2.5 h-4 border-l-2 border-dashed border-muted" />
                              <div className="flex items-start gap-3">
                                <Navigation className="mt-0.5 h-5 w-5 text-red-500 shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Drop-off</p>
                                  <p className="text-sm font-medium text-foreground">{ride.drop}</p>
                                </div>
                              </div>
                            </div>

                            {/* Driver */}
                            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Car className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{ride.driver.name}</p>
                                <p className="text-xs text-muted-foreground">Driver</p>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <Clock className="mx-auto h-4 w-4 text-muted-foreground" />
                                <p className="mt-1 text-sm font-medium text-foreground">{ride.duration}</p>
                                <p className="text-xs text-muted-foreground">Duration</p>
                              </div>
                              <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <Car className="mx-auto h-4 w-4 text-muted-foreground" />
                                <p className="mt-1 text-sm font-medium text-foreground">{ride.distance}</p>
                                <p className="text-xs text-muted-foreground">Distance</p>
                              </div>
                            </div>

                            {/* Payment */}
                            <div className="rounded-xl border border-border p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">{ride.payment_method}</span>
                                </div>
                                <StatusBadge status={ride.payment_status as any} />
                              </div>
                              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                                <span className="font-medium text-foreground">Total Fare</span>
                                <span className="text-xl font-bold text-primary">₹{ride.fare}</span>
                              </div>
                            </div>

                            {/* Rating */}
                            <div className="rounded-xl border border-border p-4">
                              <p className="mb-3 text-sm font-medium text-foreground">
                                {ride.userRating ? "Your Rating" : "Rate this ride"}
                              </p>
                              <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => !ride.userRating && setRatingValue(star)}
                                    disabled={!!ride.userRating}
                                    className="transition-transform hover:scale-110 disabled:cursor-default"
                                  >
                                    <Star className={`h-8 w-8 ${star <= (ride.userRating || ratingValue) ? "fill-secondary text-secondary" : "text-muted"}`} />
                                  </button>
                                ))}
                              </div>
                              {ride.userFeedback && (
                                <p className="mt-2 text-center text-xs italic text-muted-foreground">&ldquo;{ride.userFeedback}&rdquo;</p>
                              )}
                              {ratingValue > 0 && !ride.userRating && (
                                <Button
                                  onClick={() => handleSubmitRating(ride.ride_id)}
                                  disabled={submittingRating}
                                  className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                  {submittingRating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Submit Rating
                                </Button>
                              )}
                              {ride.userRating && (
                                <p className="mt-3 text-center text-sm text-muted-foreground">
                                  You rated this ride {ride.userRating} star{ride.userRating !== 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
