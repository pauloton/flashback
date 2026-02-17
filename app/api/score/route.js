import { NextResponse } from "next/server";
import { submitScore, getPlayerStats } from "@/lib/db";

// POST /api/score → submit a completed game score
export async function POST(request) {
  try {
    const body = await request.json();
    const { playerId, date, time, attempts, stars } = body;

    // Validate
    if (!playerId || !date || typeof time !== "number" || typeof attempts !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (time < 0 || attempts < 1 || stars < 0 || stars > 3) {
      return NextResponse.json({ error: "Invalid score data" }, { status: 400 });
    }

    // Submit
    const result = await submitScore({ playerId, date, time, attempts, stars });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }

    // Return updated player stats
    const stats = await getPlayerStats(playerId);

    return NextResponse.json({
      success: true,
      scoreId: result.id,
      stats,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
