import { NextRequest, NextResponse } from "next/server"

// This API route handles driver allocation
// It interacts with RIDE_REQUEST, RIDE, and DRIVER tables

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { request_id, driver_id } = body

    if (!request_id || !driver_id) {
      return NextResponse.json(
        { error: "Missing required fields: request_id, driver_id" },
        { status: 400 }
      )
    }

    // In production, this would be a transaction:
    // BEGIN;
    
    // 1. Verify driver is available
    // SELECT status FROM DRIVER WHERE driver_id = $1
    // (Check if status = 'available')

    // 2. Get ride request details
    // SELECT * FROM RIDE_REQUEST WHERE request_id = $2 AND status = 'searching'

    // 3. Create a new RIDE entry
    // INSERT INTO RIDE (
    //   request_id, driver_id, user_id, pickup_location_id, drop_location_id,
    //   status, start_time
    // ) VALUES ($1, $2, $3, $4, $5, 'assigned', NOW())
    // RETURNING ride_id

    // 4. Update RIDE_REQUEST status
    // UPDATE RIDE_REQUEST SET status = 'assigned', updated_at = NOW()
    // WHERE request_id = $2

    // 5. Update DRIVER status
    // UPDATE DRIVER SET status = 'busy', updated_at = NOW()
    // WHERE driver_id = $1

    // COMMIT;

    // Mock response
    const ride_id = `RD-${Date.now()}`

    return NextResponse.json({
      success: true,
      ride_id,
      request_id,
      driver_id,
      status: "assigned",
      message: "Driver assigned successfully",
    })
  } catch (error) {
    console.error("Error assigning driver:", error)
    return NextResponse.json(
      { error: "Failed to assign driver" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch pending requests and available drivers for admin panel
    
    // In production:
    // SELECT rr.*, u.name as user_name,
    //        l1.address as pickup_address, l2.address as drop_address
    // FROM RIDE_REQUEST rr
    // JOIN USER u ON rr.user_id = u.user_id
    // JOIN LOCATION l1 ON rr.pickup_location_id = l1.location_id
    // JOIN LOCATION l2 ON rr.drop_location_id = l2.location_id
    // WHERE rr.status = 'searching'
    // ORDER BY rr.created_at ASC

    // SELECT d.*, v.model, v.license_plate, v.color
    // FROM DRIVER d
    // LEFT JOIN VEHICLE v ON d.vehicle_id = v.vehicle_id
    // WHERE d.status = 'available'

    return NextResponse.json({
      success: true,
      pending_requests: [
        {
          request_id: "RR-101",
          user_name: "Alice Thompson",
          pickup: "Central Station",
          drop: "Tech Park",
          created_at: new Date(Date.now() - 120000).toISOString(),
          estimated_fare: 22.50,
        },
      ],
      available_drivers: [
        {
          driver_id: "DR-001",
          name: "Michael Chen",
          rating: 4.9,
          vehicle: "Toyota Camry - White",
          license_plate: "ABC 1234",
          completed_rides: 1250,
        },
      ],
    })
  } catch (error) {
    console.error("Error fetching allocation data:", error)
    return NextResponse.json(
      { error: "Failed to fetch allocation data" },
      { status: 500 }
    )
  }
}
