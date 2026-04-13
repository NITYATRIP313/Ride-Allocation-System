import { NextRequest, NextResponse } from "next/server"

// This API route interacts with the existing DRIVER table
// to update driver availability status

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { driver_id, status } = body

    if (!driver_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: driver_id, status" },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ["available", "busy", "offline"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    // In production, this would execute:
    // UPDATE DRIVER SET status = $1, updated_at = NOW() WHERE driver_id = $2

    return NextResponse.json({
      success: true,
      driver_id,
      status,
      message: "Driver status updated successfully",
    })
  } catch (error) {
    console.error("Error updating driver status:", error)
    return NextResponse.json(
      { error: "Failed to update driver status" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driver_id = searchParams.get("driver_id")

    // In production, this would execute:
    // SELECT d.*, v.model, v.license_plate, v.color
    // FROM DRIVER d
    // LEFT JOIN VEHICLE v ON d.vehicle_id = v.vehicle_id
    // WHERE d.driver_id = $1

    // Mock response
    return NextResponse.json({
      success: true,
      driver: {
        driver_id: driver_id || 1,
        name: "Michael Chen",
        status: "available",
        rating: 4.9,
        vehicle: {
          model: "Toyota Camry",
          license_plate: "ABC 1234",
          color: "White",
        },
      },
    })
  } catch (error) {
    console.error("Error fetching driver status:", error)
    return NextResponse.json(
      { error: "Failed to fetch driver status" },
      { status: 500 }
    )
  }
}
