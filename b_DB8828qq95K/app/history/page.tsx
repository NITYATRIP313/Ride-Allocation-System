"use client"

// FILE PATH: app/history/page.tsx

import { useState, useEffect } from "react"
import {
  Car, MapPin, Navigation, Star, DollarSign,
  Calendar, CreditCard, Clock, Loader2, RefreshCw
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
  driver: {
    name: string
  }
  fare: number
  payment_status: string
  payment_method: string
  distance: string
  duration: string
  userRating?: number
  userFeedback?: string
}

export default function RideHistoryPage() {
  const [rides, setRides] = useState<RideHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRide, setSelectedRide] = useState<RideHistory | null>(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [submittingRating, setSubmittingRating] = useState(false)
  const { toast } = useToast()

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        setIsLoading(false)
        return
      }

      const res = await fetch(`/api/rides/history?user_id=${userId}`)
      const data = await res.json()

      if (data.success) {
        setRides(data.rides)
      } else {
        toast({
          title: "Could not load rides",
          description: "There was a problem fetching your history.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Connection error",
        description: "Could not reach the server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleSubmitRating = async (rideId: string) => {
    if (ratingValue === 0) return
    setSubmittingRating(true)

    try {
      const userId = localStorage.getItem("userId")
      await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ride_id: rideId,
          user_id: userId,
          score: ratingValue,
          rated_by: "user",
        }),
      })

      // Update local state so the star immediately shows as submitted
      setRides(prev =>
        prev.map(r =>
          r.ride_id === rideId ? { ...r, userRating: ratingValue } : r
        )
      )
      if (selectedRide?.ride_id === rideId) {
        setSelectedRide(prev => prev ? { ...prev, userRating: ratingValue } : prev)
      }

      toast({
        title: "Rating Submitted ⭐",
        description: `You gave this ride ${ratingValue} star${ratingValue !== 1 ? "s" : ""}. Thanks!`,
      })
    } catch {
      toast({
        title: "Failed to submit rating",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingRating(false)
      setRatingValue(0)
    }
  }

  // Stats derived from real data
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
            <p className="mt-2 text-muted-foreground">All your past rides from the database</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating Given</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ride List */}
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
            {/* Loading state */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Fetching your rides…</p>
              </div>

            ) : rides.length === 0 ? (
              /* Empty state */
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

                    {/* Driver (desktop) */}
                    <div className="hidden sm:block sm:w-36">
                      <p className="text-sm font-medium text-foreground">{ride.driver.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{ride.time}</p>
                    </div>

                    {/* Fare + actions */}
                    <div className="flex items-center justify-between sm:w-48 sm:justify-end sm:gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">₹{ride.fare}</p>
                        <StatusBadge status={ride.payment_status as any} />
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRide(ride)
                              setRatingValue(ride.userRating || 0)
                            }}
                          >
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Ride Details — {ride.ride_id}</DialogTitle>
                            <DialogDescription>{ride.date} at {ride.time}</DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6 py-4">
                            {/* Route */}
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

                            {/* Trip stats */}
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
                                    <Star
                                      className={`h-8 w-8 ${
                                        star <= (ride.userRating || ratingValue)
                                          ? "fill-secondary text-secondary"
                                          : "text-muted"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                              {ride.userFeedback && (
                                <p className="mt-2 text-center text-xs italic text-muted-foreground">
                                  &ldquo;{ride.userFeedback}&rdquo;
                                </p>
                              )}
                              {ratingValue > 0 && !ride.userRating && (
                                <Button
                                  onClick={() => handleSubmitRating(ride.ride_id)}
                                  disabled={submittingRating}
                                  className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                  {submittingRating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : null}
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
