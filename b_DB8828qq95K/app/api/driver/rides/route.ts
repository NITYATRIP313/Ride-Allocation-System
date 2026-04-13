import { NextRequest, NextResponse } from "next/server"

// This API route fetches assigned rides for a driver from the RIDE table

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

    // In production, this would execute:
    // SELECT r.*, u.name as passenger_name, u.phone as passenger_phone,
    //        l1.address as pickup_address, l2.address as drop_address,
    //        f.amount as fare_amount
    // FROM RIDE r
    // JOIN USER u ON r.user_id = u.user_id
    // JOIN LOCATION l1 ON r.pickup_location_id = l1.location_id
    // JOIN LOCATION l2 ON r.drop_location_id = l2.location_id
    // LEFT JOIN FARE f ON r.ride_id = f.ride_id
    // WHERE r.driver_id = $1 AND r.status IN ('assigned', 'started')

    // Mock response
    return NextResponse.json({
      success: true,
      rides: [
        {
          ride_id: "RD-001",
          passenger: {
            name: "Sarah Johnson",
            phone: "+1 (555) 987-6543",
            rating: 4.7,
          },
          pickup: "123 Main Street",
          drop: "456 Oak Avenue",
          fare: 24.50,
          status: "assigned",
          created_at: new Date().toISOString(),
        },
      ],
    })
  } catch (error) {
    console.error("Error fetching driver rides:", error)
    return NextResponse.json(
      { error: "Failed to fetch driver rides" },
      { status: 500 }
    )
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

    // Validate status
    const validStatuses = ["started", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    // In production, this would execute:
    // UPDATE RIDE SET status = $1, updated_at = NOW()
    // WHERE ride_id = $2 AND driver_id = $3

    // If completing ride, also update driver status back to available:
    // UPDATE DRIVER SET status = 'available' WHERE driver_id = $3

    return NextResponse.json({
      success: true,
      ride_id,
      status,
      message: `Ride ${status === "started" ? "started" : status === "completed" ? "completed" : "cancelled"} successfully`,
    })
  } catch (error) {
    console.error("Error updating ride:", error)
    return NextResponse.json(
      { error: "Failed to update ride" },
      { status: 500 }
    )
  }
}
