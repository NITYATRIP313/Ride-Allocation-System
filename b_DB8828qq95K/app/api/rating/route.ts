import { NextRequest, NextResponse } from "next/server"

// This API route handles rating submissions to the RATING table

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ride_id, user_id, score, comment, rated_by } = body

    if (!ride_id || !user_id || !score) {
      return NextResponse.json(
        { error: "Missing required fields: ride_id, user_id, score" },
        { status: 400 }
      )
    }

    // Validate score
    if (score < 1 || score > 5) {
      return NextResponse.json(
        { error: "Score must be between 1 and 5" },
        { status: 400 }
      )
    }

    // In production, this would execute:
    // INSERT INTO RATING (ride_id, user_id, score, comment, rated_by, created_at)
    // VALUES ($1, $2, $3, $4, $5, NOW())
    // ON CONFLICT (ride_id, rated_by) DO UPDATE SET score = $3, comment = $4, updated_at = NOW()

    // Also update driver's average rating if rated_by = 'user':
    // UPDATE DRIVER SET
    //   rating = (SELECT AVG(score) FROM RATING WHERE driver_id = DRIVER.driver_id AND rated_by = 'user')
    // WHERE driver_id = (SELECT driver_id FROM RIDE WHERE ride_id = $1)

    return NextResponse.json({
      success: true,
      ride_id,
      score,
      message: "Rating submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting rating:", error)
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ride_id = searchParams.get("ride_id")

    if (!ride_id) {
      return NextResponse.json(
        { error: "Missing required parameter: ride_id" },
        { status: 400 }
      )
    }

    // In production, this would execute:
    // SELECT * FROM RATING WHERE ride_id = $1

    return NextResponse.json({
      success: true,
      ratings: [
        {
          rating_id: 1,
          ride_id,
          score: 5,
          comment: "Great ride!",
          rated_by: "user",
          created_at: new Date().toISOString(),
        },
      ],
    })
  } catch (error) {
    console.error("Error fetching rating:", error)
    return NextResponse.json(
      { error: "Failed to fetch rating" },
      { status: 500 }
    )
  }
}
