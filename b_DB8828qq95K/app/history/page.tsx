"use client"

import { useState } from "react"
import { Car, MapPin, Navigation, Star, DollarSign, Calendar, CreditCard, Clock } from "lucide-react"
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
  id: string
  date: string
  time: string
  pickup: string
  drop: string
  driver: {
    name: string
    rating: number
  }
  fare: number
  paymentStatus: "paid" | "pending"
  paymentMethod: string
  distance: string
  duration: string
  userRating?: number
}

// Mock ride history data
const mockRideHistory: RideHistory[] = [
  {
    id: "RD-001",
    date: "Apr 14, 2026",
    time: "10:30 AM",
    pickup: "123 Main Street, Downtown",
    drop: "456 Oak Avenue, Uptown",
    driver: { name: "Michael Chen", rating: 4.9 },
    fare: 245,
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    distance: "8.2 km",
    duration: "22 mins",
    userRating: 5,
  },
  {
    id: "RD-002",
    date: "Apr 13, 2026",
    time: "6:15 PM",
    pickup: "789 Pine Road, Juhu",
    drop: "321 Elm Street, Worli",
    driver: { name: "Sarah Johnson", rating: 4.8 },
    fare: 187,
    paymentStatus: "paid",
    paymentMethod: "Wallet",
    distance: "5.8 km",
    duration: "15 mins",
    userRating: 4,
  },
  {
    id: "RD-003",
    date: "Apr 12, 2026",
    time: "9:00 AM",
    pickup: "555 Market Street, Andheri",
    drop: "100 Business Park, BKC",
    driver: { name: "James Wilson", rating: 4.7 },
    fare: 320,
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    distance: "12.5 km",
    duration: "28 mins",
    userRating: 5,
  },
  {
    id: "RD-004",
    date: "Apr 10, 2026",
    time: "2:45 PM",
    pickup: "Airport Terminal 2",
    drop: "Grand Hotel, Colaba",
    driver: { name: "Emily Davis", rating: 4.9 },
    fare: 450,
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    distance: "18.3 km",
    duration: "35 mins",
  },
  {
    id: "RD-005",
    date: "Apr 8, 2026",
    time: "11:20 AM",
    pickup: "Central Station, CST",
    drop: "Tech Campus, Malad",
    driver: { name: "Robert Brown", rating: 4.6 },
    fare: 155,
    paymentStatus: "pending",
    paymentMethod: "Cash",
    distance: "4.2 km",
    duration: "12 mins",
  },
]

export default function RideHistoryPage() {
  const [rides] = useState<RideHistory[]>(mockRideHistory)
  const [selectedRide, setSelectedRide] = useState<RideHistory | null>(null)
  const [ratingValue, setRatingValue] = useState(0)
  const { toast } = useToast()

  const totalSpent = rides.reduce((sum, ride) => sum + ride.fare, 0)
  const totalRides = rides.length
  const avgRating = rides.filter(r => r.userRating).reduce((sum, r) => sum + (r.userRating || 0), 0) / rides.filter(r => r.userRating).length

  const handleSubmitRating = (rideId: string) => {
    toast({
      title: "Rating Submitted",
      description: `You rated this ride ${ratingValue} stars. Thank you for your feedback!`,
    })
    setRatingValue(0)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Ride History</h1>
          <p className="mt-2 text-muted-foreground">View all your past rides and their details</p>
        </div>

        {/* Stats Cards */}
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
                <p className="text-2xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Rating Given</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ride History List */}
        <Card className="border-border bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Your Rides
            </CardTitle>
            <CardDescription>All your completed rides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-muted/20 p-4 transition-all hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center"
                >
                  {/* Date & Time */}
                  <div className="flex items-center gap-4 sm:w-32">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-xs font-medium">{ride.date.split(" ")[0]}</span>
                      <span className="text-lg font-bold">{ride.date.split(" ")[1].replace(",", "")}</span>
                    </div>
                    <div className="sm:hidden">
                      <p className="text-sm font-medium text-foreground">{ride.time}</p>
                      <p className="text-xs text-muted-foreground">{ride.driver.name}</p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-foreground">{ride.pickup}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-foreground">{ride.drop}</span>
                    </div>
                  </div>

                  {/* Driver & Rating (Desktop) */}
                  <div className="hidden sm:block sm:w-32">
                    <p className="text-sm font-medium text-foreground">{ride.driver.name}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-secondary text-secondary" />
                      <span className="text-xs text-muted-foreground">{ride.driver.rating}</span>
                    </div>
                  </div>

                  {/* Fare & Status */}
                  <div className="flex items-center justify-between sm:w-48 sm:justify-end sm:gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">₹{ride.fare}</p>
                        <StatusBadge status={ride.paymentStatus} />
                      </div>
                    </div>

                    {/* Actions */}
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
                          <DialogTitle>Ride Details</DialogTitle>
                          <DialogDescription>
                            {ride.date} at {ride.time}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                          {/* Route */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <MapPin className="mt-0.5 h-5 w-5 text-emerald-500" />
                              <div>
                                <p className="text-xs text-muted-foreground">Pickup</p>
                                <p className="text-sm font-medium text-foreground">{ride.pickup}</p>
                              </div>
                            </div>
                            <div className="ml-2.5 h-4 border-l-2 border-dashed border-muted" />
                            <div className="flex items-start gap-3">
                              <Navigation className="mt-0.5 h-5 w-5 text-red-500" />
                              <div>
                                <p className="text-xs text-muted-foreground">Drop-off</p>
                                <p className="text-sm font-medium text-foreground">{ride.drop}</p>
                              </div>
                            </div>
                          </div>

                          {/* Stats Grid */}
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

                          {/* Payment Info */}
                          <div className="rounded-xl border border-border p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{ride.paymentMethod}</span>
                              </div>
                              <StatusBadge status={ride.paymentStatus} />
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                              <span className="font-medium text-foreground">Total Fare</span>
                              <span className="text-xl font-bold text-primary">₹{ride.fare}</span>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="rounded-xl border border-border p-4">
                            <p className="mb-3 text-sm font-medium text-foreground">Rate this ride</p>
                            <div className="flex items-center justify-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setRatingValue(star)}
                                  className="transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`h-8 w-8 ${
                                      star <= ratingValue
                                        ? "fill-secondary text-secondary"
                                        : "text-muted"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            {ratingValue > 0 && !ride.userRating && (
                              <Button 
                                onClick={() => handleSubmitRating(ride.id)}
                                className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                              >
                                Submit Rating
                              </Button>
                            )}
                            {ride.userRating && (
                              <p className="mt-3 text-center text-sm text-muted-foreground">
                                You rated this ride {ride.userRating} stars
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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
