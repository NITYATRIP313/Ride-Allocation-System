import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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

    const validStatuses = ["available", "busy", "offline"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("DRIVER")
      .update({ status })
      .eq("driver_id", parseInt(driver_id))

    if (error) throw error

    return NextResponse.json({
      success: true,
      driver_id,
      status,
      message: "Driver status updated successfully",
    })
  } catch (error) {
    console.error("Error updating driver status:", error)
    return NextResponse.json({ error: "Failed to update driver status" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driver_id = searchParams.get("driver_id")

    if (!driver_id) {
      return NextResponse.json({ error: "Missing driver_id" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("DRIVER")
      .select(`
        driver_id, license_number, experience_years, status, rating, user_id,
        USER:user_id(name, phone),
        VEHICLE:driver_id(model, vehicle_number, vehicle_type, color, capacity)
      `)
      .eq("driver_id", parseInt(driver_id))
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    }

    const user = data.USER as any
    const vehicle = Array.isArray(data.VEHICLE) ? data.VEHICLE[0] : data.VEHICLE as any

    return NextResponse.json({
      success: true,
      driver: {
        driver_id: data.driver_id,
        name: user?.name || "Driver",
        phone: user?.phone || "",
        status: data.status,
        rating: data.rating,
        experience_years: data.experience_years,
        license_number: data.license_number,
        vehicle: vehicle ? {
          model: vehicle.model,
          license_plate: vehicle.vehicle_number,
          color: vehicle.color,
          type: vehicle.vehicle_type,
          capacity: vehicle.capacity,
        } : null,
      },
    })
  } catch (error) {
    console.error("Error fetching driver status:", error)
    return NextResponse.json({ error: "Failed to fetch driver status" }, { status: 500 })
  }
}
