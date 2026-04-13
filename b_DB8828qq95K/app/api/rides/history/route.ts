import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing required parameter: user_id" },
        { status: 400 }
      )
    }

    // Get all completed ride requests for this user
    const { data: requests, error: reqError } = await supabase
      .from("RIDE_REQUEST")
      .select("request_id, request_time, status, pickup_location_id, drop_location_id")
      .eq("user_id", parseInt(user_id))
      .eq("status", "completed")
      .order("request_time", { ascending: false })
      .limit(20)

    if (reqError) throw reqError

    if (!requests || requests.length === 0) {
      return NextResponse.json({ success: true, rides: [] })
    }

    // Fetch full ride details for each request
    const requestIds = requests.map((r) => r.request_id)

    const { data: rides, error: rideError } = await supabase
      .from("RIDE")
      .select(`
        ride_id, start_time, end_time, ride_status, request_id, driver_id,
        DRIVER:driver_id(driver_id, rating, user_id,
          USER:user_id(name)
        )
      `)
      .in("request_id", requestIds)
      .eq("ride_status", "completed")

    if (rideError) throw rideError

    // Fetch location details
    const locationIds = [
      ...requests.map((r) => r.pickup_location_id),
      ...requests.map((r) => r.drop_location_id),
    ]

    const { data: locations } = await supabase
      .from("LOCATION")
      .select("location_id, address")
      .in("location_id", locationIds)

    const locationMap: Record<number, string> = {}
    locations?.forEach((l) => { locationMap[l.location_id] = l.address })

    // Fetch fare & payment for these rides
    const rideIds = rides?.map((r) => r.ride_id) || []

    const { data: fares } = await supabase
      .from("FARE")
      .select("ride_id, base_amount, distance_charge, time_charge, surge_multiplier")
      .in("ride_id", rideIds)

    const { data: payments } = await supabase
      .from("PAYMENT")
      .select("ride_id, amount, payment_mode, payment_status")
      .in("ride_id", rideIds)

    const { data: ratings } = await supabase
      .from("RATING")
      .select("ride_id, score, feedback")
      .in("ride_id", rideIds)

    // Build fare/payment/rating maps
    const fareMap: Record<number, { total: number; distanceKm: string; duration: string }> = {}
    fares?.forEach((f) => {
      const total = Math.round((f.base_amount + f.distance_charge + f.time_charge) * f.surge_multiplier)
      const distanceKm = (f.distance_charge / 15).toFixed(1)
      fareMap[f.ride_id] = { total, distanceKm, duration: `${Math.floor(f.time_charge / 2)} mins` }
    })

    const paymentMap: Record<number, { method: string; status: string }> = {}
    payments?.forEach((p) => { paymentMap[p.ride_id] = { method: p.payment_mode, status: p.payment_status } })

    const ratingMap: Record<number, number> = {}
    ratings?.forEach((r) => { ratingMap[r.ride_id] = r.score })

    // Assemble final ride history
    const rideHistory = rides?.map((ride) => {
      const req = requests.find((r) => r.request_id === ride.request_id)
      const date = new Date(req?.request_time || ride.start_time)
      const driver = (ride.DRIVER as any)
      const fare = fareMap[ride.ride_id]

      return {
        ride_id: `RD-${ride.ride_id.toString().padStart(3, "0")}`,
        date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
        pickup: locationMap[req?.pickup_location_id || 0] || "Unknown",
        drop: locationMap[req?.drop_location_id || 0] || "Unknown",
        driver: {
          name: driver?.USER?.name || "Driver",
          rating: driver?.rating || 4.5,
        },
        fare: fare?.total || 200,
        payment_status: paymentMap[ride.ride_id]?.status || "paid",
        payment_method: paymentMap[ride.ride_id]?.method || "UPI",
        distance: `${fare?.distanceKm || "5.0"} km`,
        duration: fare?.duration || "20 mins",
        userRating: ratingMap[ride.ride_id] || undefined,
      }
    }) || []

    return NextResponse.json({ success: true, rides: rideHistory })
  } catch (error) {
    console.error("Error fetching ride history:", error)
    return NextResponse.json({ error: "Failed to fetch ride history" }, { status: 500 })
  }
}
