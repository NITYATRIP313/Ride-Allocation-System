import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Mock ETA and price calculator
function getMockFare(pickupId: number, dropId: number) {
  // Deterministic mock based on location IDs so it's consistent
  const base = 50
  const distanceCharge = ((pickupId * 17 + dropId * 13) % 200) + 80  // 80-280
  const timeCharge = Math.floor(distanceCharge / 4)
  const surge = [1.0, 1.0, 1.0, 1.1, 1.2, 1.3][Math.floor((pickupId + dropId) % 6)]
  const total = Math.round((base + distanceCharge + timeCharge) * surge)
  const distanceKm = ((distanceCharge / 15) + 2).toFixed(1)
  const etaMinutes = Math.floor(distanceCharge / 10) + 5  // 5-33 mins
  return { base, distanceCharge, timeCharge, surge, total, distanceKm, etaMinutes }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pickup_location, drop_location, user_id, pickup_location_id, drop_location_id } = body

    if (!pickup_location || !drop_location || !user_id) {
      return NextResponse.json(
        { error: "Missing required fields: pickup_location, drop_location, user_id" },
        { status: 400 }
      )
    }

    // Find or create location entries
    let pickupId = pickup_location_id
    let dropId = drop_location_id

    // If IDs not provided, try to match by address or use defaults
    if (!pickupId) {
      const { data: loc } = await supabase
        .from("LOCATION")
        .select("location_id")
        .ilike("address", `%${pickup_location}%`)
        .limit(1)
        .single()
      pickupId = loc?.location_id || 1
    }

    if (!dropId) {
      const { data: loc } = await supabase
        .from("LOCATION")
        .select("location_id")
        .ilike("address", `%${drop_location}%`)
        .limit(1)
        .single()
      dropId = loc?.location_id || 2
    }

    // Insert RIDE_REQUEST into Supabase
    const { data: rideReq, error } = await supabase
      .from("RIDE_REQUEST")
      .insert({
        request_time: new Date().toISOString(),
        status: "searching",
        user_id: parseInt(user_id),
        pickup_location_id: pickupId,
        drop_location_id: dropId,
      })
      .select("request_id")
      .single()

    if (error) {
      console.error("Supabase error:", error)
      // Fallback to mock if DB write fails
      const mockId = `RR-${Date.now()}`
      const fare = getMockFare(pickupId || 1, dropId || 2)
      return NextResponse.json({
        success: true,
        request_id: mockId,
        status: "searching",
        mock: true,
        ...fare,
      })
    }

    const fare = getMockFare(pickupId, dropId)

    return NextResponse.json({
      success: true,
      request_id: rideReq.request_id,
      status: "searching",
      ...fare,
    })
  } catch (error) {
    console.error("Error creating ride request:", error)
    return NextResponse.json(
      { error: "Failed to create ride request" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")
    const request_id = searchParams.get("request_id")

    let query = supabase
      .from("RIDE_REQUEST")
      .select(`
        request_id, request_time, status, user_id,
        pickup:pickup_location_id(location_id, address, latitude, longitude),
        drop:drop_location_id(location_id, address, latitude, longitude)
      `)

    if (request_id) query = query.eq("request_id", request_id)
    if (user_id) query = query.eq("user_id", parseInt(user_id))

    const { data, error } = await query.order("request_time", { ascending: false }).limit(10)

    if (error) throw error

    return NextResponse.json({ success: true, requests: data || [] })
  } catch (error) {
    console.error("Error fetching ride requests:", error)
    return NextResponse.json({ error: "Failed to fetch ride requests" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { request_id, status } = body

    if (!request_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: request_id, status" },
        { status: 400 }
      )
    }

    const validStatuses = ["searching", "assigned", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("RIDE_REQUEST")
      .update({ status })
      .eq("request_id", request_id)

    if (error) throw error

    return NextResponse.json({ success: true, request_id, status })
  } catch (error) {
    console.error("Error updating ride request:", error)
    return NextResponse.json({ error: "Failed to update ride request" }, { status: 500 })
  }
}
