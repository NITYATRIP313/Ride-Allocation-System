"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Car, Clock, MapPin, Navigation, User, Star, Power, CheckCircle, XCircle, Calendar, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

type DriverStatus = "available" | "busy" | "offline"

interface RideRequest {
  id: string
  passenger: string
  pickup: string
  drop: string
  fare: number
  distance: string
}

interface AssignedRide {
  id: string
  passenger: {
    name: string
    phone: string
    rating: number
  }
  pickup: string
  drop: string
  fare: number
  status: "assigned" | "started" | "completed"
}

interface Shift {
  date: string
  startTime: string
  endTime: string
  hoursWorked: number
  ridesCompleted: number
  earnings: number
}

const allAvailableRequests: RideRequest[] = [
  { id: "RR-001", passenger: "Sarah Johnson",  pickup: "123 Main Street, Andheri",  drop: "456 Oak Avenue, Bandra",      fare: 185, distance: "5.2 km" },
  { id: "RR-002", passenger: "James Wilson",   pickup: "789 Pine Road, Juhu",        drop: "321 Elm Street, Worli",       fare: 240, distance: "7.8 km" },
  { id: "RR-003", passenger: "Priya Sharma",   pickup: "Tech Park, Powai",           drop: "Central Mall, Mulund",        fare: 320, distance: "10.5 km" },
  { id: "RR-004", passenger: "Rahul Patel",    pickup: "Airport Terminal 2",         drop: "Hotel Grand, Colaba",         fare: 450, distance: "18.3 km" },
  { id: "RR-005", passenger: "Anjali Gupta",   pickup: "Central Station",            drop: "IT Hub, Malad",               fare: 155, distance: "4.2 km" },
]

const mockCurrentShift: Shift = {
  date: "Today",
  startTime: "08:00 AM",
  endTime: "Ongoing",
  hoursWorked: 6.5,
  ridesCompleted: 12,
  earnings: 2855,
}

export default function DriverDashboard() {
  const router = useRouter()
  const [driverStatus, setDriverStatus] = useState<DriverStatus>("offline")
  const [availableRequests, setAvailableRequests] = useState<RideRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<RideRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [assignedRide, setAssignedRide] = useState<AssignedRide | null>(null)
  const [currentShift, setCurrentShift] = useState<Shift>(mockCurrentShift)
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  // Auth guard
  useEffect(() => {
    const role = localStorage.getItem("userRole")
    if (!role) { router.replace("/"); return }
    if (role === "rider") router.replace("/user")
  }, [router])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = availableRequests.filter(
        (req) =>
          req.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.drop.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.passenger.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRequests(filtered)
    } else {
      setFilteredRequests(availableRequests)
    }
  }, [searchQuery, availableRequests])

  const handleToggleStatus = async (checked: boolean) => {
    const newStatus: DriverStatus = checked ? "available" : "offline"
    setDriverStatus(newStatus)

    if (newStatus === "offline") {
      setAvailableRequests([])
      setFilteredRequests([])
      setSearchQuery("")
    }

    try {
      await fetch("/api/driver/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver_id: localStorage.getItem("userId") || 1, status: newStatus }),
      })
    } catch { /* continue */ }

    toast({
      title: checked ? "You're Online!" : "You're Offline",
      description: checked ? "You can now search for ride requests." : "You won't receive new ride requests.",
    })
  }

  const handleSearchRides = () => {
    if (driverStatus !== "available") {
      toast({ title: "Go Online First", description: "You need to be online to search for rides.", variant: "destructive" })
      return
    }

    setIsSearching(true)
    setTimeout(() => {
      setAvailableRequests(allAvailableRequests)
      setFilteredRequests(allAvailableRequests)
      setIsSearching(false)
      toast({ title: "Rides Found!", description: `${allAvailableRequests.length} ride requests available.` })
    }, 1500)
  }

  const handleAcceptRide = async (request: RideRequest) => {
    setDriverStatus("busy")
    setAvailableRequests([])
    setFilteredRequests([])
    setSearchQuery("")
    setAssignedRide({
      id: request.id,
      passenger: { name: request.passenger, phone: "+91 98765 43210", rating: 4.7 },
      pickup: request.pickup,
      drop: request.drop,
      fare: request.fare,
      status: "assigned",
    })
    toast({ title: "Ride Accepted!", description: `Navigate to pickup: ${request.pickup}` })
  }

  const handleRejectRide = (requestId: string) => {
    setAvailableRequests(prev => prev.filter(r => r.id !== requestId))
    toast({ title: "Ride Declined", description: "The request has been removed from your list." })
  }

  const handleStartRide = () => {
    if (assignedRide) {
      setAssignedRide({ ...assignedRide, status: "started" })
      toast({ title: "Ride Started", description: "Drive safely!" })
    }
  }

  const handleCompleteRide = () => {
    if (assignedRide) {
      setAssignedRide({ ...assignedRide, status: "completed" })
      setCurrentShift(prev => ({
        ...prev,
        ridesCompleted: prev.ridesCompleted + 1,
        earnings: prev.earnings + assignedRide.fare,
      }))
      toast({ title: "Ride Completed!", description: `Earnings: ₹${assignedRide.fare}` })
      setTimeout(() => {
        setAssignedRide(null)
        setDriverStatus("available")
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold text-transparent">Driver Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Search for rides and manage your trips</p>
          </div>

          <Card className="w-full sm:w-auto">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                driverStatus === "available" ? "bg-emerald-100" :
                driverStatus === "busy" ? "bg-amber-100" : "bg-muted"
              }`}>
                <Power className={`h-5 w-5 ${
                  driverStatus === "available" ? "text-emerald-600" :
                  driverStatus === "busy" ? "text-amber-600" : "text-muted-foreground"
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {driverStatus === "available" ? "Online" : driverStatus === "busy" ? "On a Ride" : "Offline"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {driverStatus === "available" ? "Ready to accept rides" : driverStatus === "busy" ? "Currently busy" : "Not receiving requests"}
                </p>
              </div>
              <Switch
                checked={driverStatus !== "offline"}
                onCheckedChange={handleToggleStatus}
                disabled={driverStatus === "busy"}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6">
            <Card className="border-border bg-card shadow-lg transition-shadow hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  Current Shift
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="text-sm font-medium text-foreground">{currentShift.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Started</span>
                    <span className="text-sm font-medium text-foreground">{currentShift.startTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Hours</span>
                    <span className="text-sm font-medium text-foreground">{currentShift.hoursWorked}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-lg transition-shadow hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-secondary" />
                  Today&apos;s Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-primary/10 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{currentShift.ridesCompleted}</p>
                    <p className="text-xs text-muted-foreground">Rides</p>
                  </div>
                  <div className="rounded-xl bg-secondary/30 p-4 text-center">
                    <p className="text-2xl font-bold text-secondary-foreground">₹{currentShift.earnings}</p>
                    <p className="text-xs text-muted-foreground">Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {assignedRide && (
              <Card className="mb-6 border-primary/50 bg-card shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-primary" />
                      Current Ride
                    </CardTitle>
                    <StatusBadge status={assignedRide.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{assignedRide.passenger.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-secondary text-secondary" />
                          <span>{assignedRide.passenger.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">₹{assignedRide.fare}</p>
                        <p className="text-xs text-muted-foreground">Estimated fare</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Pickup</p>
                          <p className="text-sm font-medium text-foreground">{assignedRide.pickup}</p>
                        </div>
                      </div>
                      <div className="ml-2.5 h-6 border-l-2 border-dashed border-muted" />
                      <div className="flex items-start gap-3">
                        <Navigation className="mt-0.5 h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Drop-off</p>
                          <p className="text-sm font-medium text-foreground">{assignedRide.drop}</p>
                        </div>
                      </div>
                    </div>

                    {assignedRide.status === "assigned" && (
                      <Button onClick={handleStartRide} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Arrived - Start Ride
                      </Button>
                    )}
                    {assignedRide.status === "started" && (
                      <Button onClick={handleCompleteRide} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Ride
                      </Button>
                    )}
                    {assignedRide.status === "completed" && (
                      <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
                        <CheckCircle className="mx-auto h-8 w-8 text-emerald-600" />
                        <p className="mt-2 font-medium text-emerald-700 dark:text-emerald-400">Ride Completed!</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-500">Earnings: ₹{assignedRide.fare}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Search Rides
                </CardTitle>
                <CardDescription>
                  {driverStatus === "offline"
                    ? "Go online to search for ride requests"
                    : driverStatus === "busy"
                    ? "Complete current ride to search for new ones"
                    : "Find and accept available ride requests"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {driverStatus === "offline" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Power className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">You&apos;re currently offline</p>
                    <p className="mt-1 text-sm text-muted-foreground">Toggle the switch above to start searching for rides</p>
                  </div>
                ) : driverStatus === "busy" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                      <Car className="h-8 w-8 text-amber-600" />
                    </div>
                    <p className="text-muted-foreground">You&apos;re on a ride</p>
                    <p className="mt-1 text-sm text-muted-foreground">Complete your current ride to search for new ones</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search by location or passenger..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-12 pl-10"
                        />
                      </div>
                      <Button
                        onClick={handleSearchRides}
                        disabled={isSearching}
                        className="h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {isSearching ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="mr-2 h-4 w-4" />
                        )}
                        {isSearching ? "Searching..." : "Search"}
                      </Button>
                    </div>

                    {filteredRequests.length === 0 && availableRequests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <Clock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No ride requests found</p>
                        <p className="mt-1 text-sm text-muted-foreground">Click &quot;Search&quot; to find available rides</p>
                      </div>
                    ) : filteredRequests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-muted-foreground">No rides match your search</p>
                        <p className="mt-1 text-sm text-muted-foreground">Try a different search term</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {filteredRequests.length} ride{filteredRequests.length !== 1 ? "s" : ""} available
                        </p>
                        {filteredRequests.map((request) => (
                          <div
