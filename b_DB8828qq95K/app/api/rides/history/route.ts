import { NextRequest, NextResponse } from "next/server"

// This API route fetches ride history with fare, payment, and rating data

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

    // In production, this would execute:
    // SELECT r.ride_id, r.created_at, r.status,
    //        d.name as driver_name,
    //        l1.address as pickup_address, l2.address as drop_address,
    //        f.amount as fare_amount, f.distance, f.duration,
    //        p.status as payment_status, p.method as payment_method,
    //        rt.score as rating, rt.comment as rating_comment
    // FROM RIDE r
    // JOIN DRIVER d ON r.driver_id = d.driver_id
    // JOIN LOCATION l1 ON r.pickup_location_id = l1.location_id
    // JOIN LOCATION l2 ON r.drop_location_id = l2.location_id
    // LEFT JOIN FARE f ON r.ride_id = f.ride_id
    // LEFT JOIN PAYMENT p ON r.ride_id = p.ride_id
    // LEFT JOIN RATING rt ON r.ride_id = rt.ride_id AND rt.rated_by = 'user'
    // WHERE r.user_id = $1 AND r.status = 'completed'
    // ORDER BY r.created_at DESC
    // LIMIT 20

    // Mock response
    return NextResponse.json({
      success: true,
      rides: [
        {
          ride_id: "RD-001",
          date: "Apr 14, 2026",
          time: "10:30 AM",
          pickup: "123 Main Street, Downtown",
          drop: "456 Oak Avenue, Uptown",
          driver: { name: "Michael Chen", rating: 4.9 },
          fare: 24.50,
          payment_status: "paid",
          payment_method: "Credit Card",
          distance: "8.2 km",
          duration: "22 mins",
          user_rating: 5,
        },
        {
          ride_id: "RD-002",
          date: "Apr 13, 2026",
          time: "6:15 PM",
          pickup: "789 Pine Road",
          drop: "321 Elm Street",
          driver: { name: "Sarah Johnson", rating: 4.8 },
          fare: 18.75,
          payment_status: "paid",
          payment_method: "Wallet",
          distance: "5.8 km",
          duration: "15 mins",
          user_rating: 4,
        },
      ],
    })
  } catch (error) {
    console.error("Error fetching ride history:", error)
    return NextResponse.json(
      { error: "Failed to fetch ride history" },
      { status: 500 }
    )
  }
}
