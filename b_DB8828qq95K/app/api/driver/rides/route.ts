import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// FILE PATH: app/api/driver/rides/route.ts

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driver_id = searchParams.get("driver_id")

    if (!driver_id) {
      return NextResponse.json(
        { error: "Missing required parameter: driver_id" },
        { status: 400 }
      )
    }

    const { data: rides, error } = await supabase
      .from("RIDE")
      .select(`
        ride_id, start_time, end_time, ride_status, request_id, driver_id,
        RIDE_REQUEST:request_id(
          request_id, status, user_id, pickup_location_id, drop_location_id,
          USER:user_id(name, phone)
        )
      `)
      .eq("driver_id", parseInt(driver_id))
      .in("ride_status", ["assigned", "started"])

    if (error) throw error

    // Fetch location info
    const allLocationIds: number[] = []
    rides?.forEach((r: any) => {
      if (r.RIDE_REQUEST?.pickup_location_id) allLocationIds.push(r.RIDE_REQUEST.pickup_location_id)
      if (r.RIDE_REQUEST?.drop_location_id) allLocationIds.push(r.RIDE_REQUEST.drop_location_id)
    })

    const { data: locations } = await supabase
      .from("LOCATION")
      .select("location_id, address")
      .in("location_id", allLocationIds)

    const locationMap: Record<number, string> = {}
    locations?.forEach((l) => { locationMap[l.location_id] = l.address })

    // Fetch fares
    const rideIds = rides?.map((r) => r.ride_id) || []
    const { data: fares } = await supabase
      .from("FARE")
      .select("ride_id, base_amount, distance_charge, time_charge, surge_multiplier")
      .in("ride_id", rideIds)

    const fareMap: Record<number, number> = {}
    fares?.forEach((f) => {
      fareMap[f.ride_id] = Math.round((f.base_amount + f.distance_charge + f.time_charge) * f.surge_multiplier)
    })

    const formatted = rides?.map((ride: any) => {
      const req = ride.RIDE_REQUEST
      const user = req?.USER
      return {
        ride_id: `RD-${ride.ride_id.toString().padStart(3, "0")}`,
        passenger: {
          name: user?.name || "Passenger",
          phone: user?.phone || "",
          rating: 4.5,
        },
        pickup: locationMap[req?.pickup_location_id] || "Unknown pickup",
        drop: locationMap[req?.drop_location_id] || "Unknown drop",
        fare: fareMap[ride.ride_id] || 200,
        status: ride.ride_status,
        created_at: ride.start_time,
      }
    }) || []

    return NextResponse.json({ success: true, rides: formatted })
  } catch (error) {
    console.error("Error fetching driver rides:", error)
    return NextResponse.json({ error: "Failed to fetch driver rides" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ride_id, status, driver_id } = body

    if (!ride_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: ride_id, status" },
        { status: 400 }
      )
    }

    const validStatuses = ["started", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = { ride_status: status }
    if (status === "completed") updateData.end_time = new Date().toISOString()

    const { error: rideError } = await supabase
      .from("RIDE")
      .update(updateData)
      .eq("ride_id", parseInt(ride_id))

    if (rideError) throw rideError

    // If completed, mark driver as available again
    if (status === "completed" && driver_id) {
      await supabase
        .from("DRIVER")
        .update({ status: "available" })
        .eq("driver_id", parseInt(driver_id))
    }

    return NextResponse.json({
      success: true,
      ride_id,
      status,
      message: `Ride ${status} successfully`,
    })
  } catch (error) {
    console.error("Error updating ride:", error)
    return NextResponse.json({ error: "Failed to update ride" }, { status: 500 })
  }
}
