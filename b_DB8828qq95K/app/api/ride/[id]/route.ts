import { NextRequest, NextResponse } from "next/server"

// This API route fetches detailed ride information for tracking

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ride_id } = await params

    if (!ride_id) {
      return NextResponse.json(
        { error: "Missing ride ID" },
        { status: 400 }
      )
    }

    // In production, this would execute:
    // SELECT r.*, 
    //        d.name as driver_name, d.phone as driver_phone, d.rating as driver_rating,
    //        v.model as vehicle_model, v.license_plate, v.color as vehicle_color,
    //        l1.address as pickup_address, l1.latitude as pickup_lat, l1.longitude as pickup_lng,
    //        l2.address as drop_address, l2.latitude as drop_lat, l2.longitude as drop_lng,
    //        f.amount as fare_amount, f.distance, f.duration
    // FROM RIDE r
    // JOIN DRIVER d ON r.driver_id = d.driver_id
    // JOIN VEHICLE v ON d.vehicle_id = v.vehicle_id
    // JOIN LOCATION l1 ON r.pickup_location_id = l1.location_id
    // JOIN LOCATION l2 ON r.drop_location_id = l2.location_id
    // LEFT JOIN FARE f ON r.ride_id = f.ride_id
    // WHERE r.ride_id = $1 OR r.request_id = $1

    // Mock response
    return NextResponse.json({
      success: true,
      ride: {
        ride_id,
        status: "assigned",
        pickup: {
          address: "123 Main Street, Downtown",
          latitude: 40.7128,
          longitude: -74.006,
        },
        drop: {
          address: "456 Oak Avenue, Uptown",
          latitude: 40.7589,
          longitude: -73.9851,
        },
        driver: {
          name: "Michael Chen",
          phone: "+1 (555) 123-4567",
          rating: 4.9,
          vehicle: {
            model: "Toyota Camry",
            color: "White",
            license_plate: "ABC 1234",
          },
        },
        fare: {
          amount: 24.50,
          distance: "8.2 km",
          duration: "15 mins",
        },
        created_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error fetching ride details:", error)
    return NextResponse.json(
      { error: "Failed to fetch ride details" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ride_id } = await params
    const body = await request.json()
    const { status } = body

    if (!ride_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ["assigned", "started", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    // In production, this would execute:
    // UPDATE RIDE SET status = $1, updated_at = NOW()
    // WHERE ride_id = $2

    // If status = 'completed':
    // UPDATE RIDE SET end_time = NOW() WHERE ride_id = $2
    // UPDATE DRIVER SET status = 'available' WHERE driver_id = (SELECT driver_id FROM RIDE WHERE ride_id = $2)

    return NextResponse.json({
      success: true,
      ride_id,
      status,
      message: "Ride status updated successfully",
    })
  } catch (error) {
    console.error("Error updating ride status:", error)
    return NextResponse.json(
      { error: "Failed to update ride status" },
      { status: 500 }
    )
  }
}
