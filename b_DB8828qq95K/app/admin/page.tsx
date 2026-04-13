"use client"

import { useState } from "react"
import { 
  Car, 
  User, 
  MapPin, 
  Navigation, 
  Clock, 
  UserCheck, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PendingRequest {
  id: string
  user: string
  pickup: string
  drop: string
  requestedAt: string
  estimatedFare: number
  status: "searching" | "assigned"
}

interface AvailableDriver {
  id: string
  name: string
  rating: number
  vehicle: string
  licensePlate: string
  completedRides: number
  location: string
}

// Mock data
const mockPendingRequests: PendingRequest[] = [
  {
    id: "RR-101",
    user: "Alice Thompson",
    pickup: "Central Station, CST",
    drop: "Tech Park, Powai",
    requestedAt: "2 mins ago",
    estimatedFare: 225,
    status: "searching",
  },
  {
    id: "RR-102",
    user: "Bob Martinez",
    pickup: "Airport Terminal 1",
    drop: "Downtown Hotel, Colaba",
    requestedAt: "5 mins ago",
    estimatedFare: 450,
    status: "searching",
  },
  {
    id: "RR-103",
    user: "Carol White",
    pickup: "Mall Plaza, Andheri",
    drop: "Residential Area, Kandivali",
    requestedAt: "8 mins ago",
    estimatedFare: 157,
    status: "searching",
  },
]

const mockAvailableDrivers: AvailableDriver[] = [
  {
    id: "DR-001",
    name: "Rajesh Kumar",
    rating: 4.9,
    vehicle: "Toyota Camry - White",
    licensePlate: "MH 01 AB 1234",
    completedRides: 1250,
    location: "Near CST Station",
  },
  {
    id: "DR-002",
    name: "Priya Sharma",
    rating: 4.8,
    vehicle: "Honda Civic - Black",
    licensePlate: "MH 02 CD 5678",
    completedRides: 890,
    location: "Bandra Area",
  },
  {
    id: "DR-003",
    name: "Amit Patel",
    rating: 4.7,
    vehicle: "Hyundai Sonata - Silver",
    licensePlate: "MH 04 EF 9012",
    completedRides: 650,
    location: "Airport Zone",
  },
  {
    id: "DR-004",
    name: "Sneha Desai",
    rating: 4.9,
    vehicle: "Toyota Prius - Blue",
    licensePlate: "MH 03 GH 3456",
    completedRides: 1100,
    location: "Powai Area",
  },
]

export default function AdminPanel() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(mockPendingRequests)
  const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>(mockAvailableDrivers)
  const [selectedDrivers, setSelectedDrivers] = useState<Record<string, string>>({})
  const [isAssigning, setIsAssigning] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const handleAssignDriver = async (requestId: string) => {
    const driverId = selectedDrivers[requestId]
    if (!driverId) {
      toast({
        title: "Select a Driver",
        description: "Please select a driver before assigning.",
        variant: "destructive",
      })
      return
    }

    setIsAssigning(prev => ({ ...prev, [requestId]: true }))

    try {
      // Call API to assign driver
      await fetch("/api/admin/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          driver_id: driverId,
        }),
      })
    } catch {
      // Continue with demo mode
    }

    // Simulate assignment
    setTimeout(() => {
      const driver = availableDrivers.find(d => d.id === driverId)
      
      // Update request status
      setPendingRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: "assigned" as const } : req
        )
      )

      // Remove driver from available list
      setAvailableDrivers(prev => prev.filter(d => d.id !== driverId))

      setIsAssigning(prev => ({ ...prev, [requestId]: false }))

      toast({
        title: "Driver Assigned!",
        description: `${driver?.name} has been assigned to request ${requestId}.`,
      })

      // Remove from pending after a short delay
      setTimeout(() => {
        setPendingRequests(prev => prev.filter(req => req.id !== requestId))
      }, 2000)
    }, 1500)
  }

  const handleCancelRequest = (requestId: string) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId))
    toast({
      title: "Request Cancelled",
      description: `Request ${requestId} has been cancelled.`,
    })
  }

  const handleRefresh = () => {
    toast({
      title: "Refreshing Data",
      description: "Fetching latest requests and driver statuses...",
    })
    // In a real app, this would fetch fresh data from the API
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="mt-2 text-muted-foreground">Manage ride requests and driver allocation</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingRequests.filter(r => r.status === "searching").length}</p>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{availableDrivers.length}</p>
                <p className="text-xs text-muted-foreground">Available Drivers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground">Active Rides</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/30">
                <CheckCircle className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-xs text-muted-foreground">Today&apos;s Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Pending Ride Requests */}
          <Card className="border-border bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Pending Requests
              </CardTitle>
              <CardDescription>Ride requests waiting for driver assignment</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-foreground font-medium">All caught up!</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No pending ride requests at the moment
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`rounded-xl border p-4 transition-all ${
                        request.status === "assigned" 
                          ? "border-emerald-200 bg-emerald-50" 
                          : "border-border bg-muted/20"
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{request.user}</h4>
                            <p className="text-xs text-muted-foreground">{request.requestedAt}</p>
                          </div>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>

                      <div className="mb-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                          <span className="text-muted-foreground">{request.pickup}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-red-500" />
                          <span className="text-muted-foreground">{request.drop}</span>
                        </div>
                      </div>

                      <div className="mb-4 flex items-center justify-between rounded-lg bg-muted/50 p-2">
                        <span className="text-sm text-muted-foreground">Est. Fare</span>
                        <span className="font-semibold text-foreground">₹{request.estimatedFare}</span>
                      </div>

                      {request.status === "searching" && (
                        <>
                          <div className="mb-3">
                            <Select
                              value={selectedDrivers[request.id] || ""}
                              onValueChange={(value) => 
                                setSelectedDrivers(prev => ({ ...prev, [request.id]: value }))
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a driver" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableDrivers.map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id}>
                                    <div className="flex items-center gap-2">
                                      <span>{driver.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({driver.rating} ★)
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAssignDriver(request.id)}
                              disabled={isAssigning[request.id] || !selectedDrivers[request.id]}
                              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              {isAssigning[request.id] ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Assigning...
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Assign Driver
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleCancelRequest(request.id)}
                              variant="outline"
                              size="icon"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}

                      {request.status === "assigned" && (
                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Driver Assigned Successfully</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Drivers */}
          <Card className="border-border bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-emerald-500" />
                Available Drivers
              </CardTitle>
              <CardDescription>Drivers currently online and ready for assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {availableDrivers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Car className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium">No drivers available</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All drivers are currently on rides
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="rounded-xl border border-border bg-muted/20 p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">{driver.name}</h4>
                              <div className="mt-1 flex items-center gap-1">
                                <Star className="h-4 w-4 fill-secondary text-secondary" />
                                <span className="text-sm text-muted-foreground">{driver.rating}</span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-sm text-muted-foreground">{driver.completedRides} rides</span>
                              </div>
                            </div>
                            <StatusBadge status="available" />
                          </div>
                          
                          <div className="mt-3 space-y-1 text-sm">
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Vehicle:</span> {driver.vehicle}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Plate:</span> {driver.licensePlate}
                            </p>
                            <p className="text-muted-foreground">
                              <MapPin className="mr-1 inline h-3 w-3" />
                              {driver.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
