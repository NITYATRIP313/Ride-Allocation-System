import { NextRequest, NextResponse } from "next/server"

// This API route interacts with the existing RIDE_REQUEST table
// Database connection should be configured via environment variables

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pickup_location, drop_location, user_id } = body

    // Validate required fields
    if (!pickup_location || !drop_location || !user_id) {
      return NextResponse.json(
        { error: "Missing required fields: pickup_location, drop_location, user_id" },
        { status: 400 }
      )
    }

    // In production, this would execute:
    // INSERT INTO RIDE_REQUEST (user_id, pickup_location_id, drop_location_id, status, created_at)
    // VALUES ($1, $2, $3, 'searching', NOW())
    // RETURNING request_id

    // Mock response for demo
    const request_id = `RR-${Date.now()}`

    return NextResponse.json({
      success: true,
      request_id,
      status: "searching",
      message: "Ride request created successfully",
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
    const request_id = searchParams.get("request_id")
    const user_id = searchParams.get("user_id")

    // In production, this would execute:
    // SELECT rr.*, l1.address as pickup_address, l2.address as drop_address
    // FROM RIDE_REQUEST rr
    // LEFT JOIN LOCATION l1 ON rr.pickup_location_id = l1.location_id
    // LEFT JOIN LOCATION l2 ON rr.drop_location_id = l2.location_id
    // WHERE rr.request_id = $1 OR rr.user_id = $2

    // Mock response
    return NextResponse.json({
      success: true,
      requests: [
        {
          request_id: request_id || "RR-001",
          user_id: user_id || 1,
          pickup_location: "123 Main Street",
          drop_location: "456 Oak Avenue",
          status: "searching",
          created_at: new Date().toISOString(),
        },
      ],
    })
  } catch (error) {
    console.error("Error fetching ride requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch ride requests" },
      { status: 500 }
    )
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

    // Validate status
    const validStatuses = ["searching", "assigned", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    // In production, this would execute:
    // UPDATE RIDE_REQUEST SET status = $1, updated_at = NOW() WHERE request_id = $2

    return NextResponse.json({
      success: true,
      request_id,
      status,
      message: "Ride request updated successfully",
    })
  } catch (error) {
    console.error("Error updating ride request:", error)
    return NextResponse.json(
      { error: "Failed to update ride request" },
      { status: 500 }
    )
  }
}
