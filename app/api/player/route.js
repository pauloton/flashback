import { NextResponse } from "next/server";
import { getPlayerStats } from "@/lib/db";

// GET /api/player?id=player123
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("id");

    if (!playerId) {
      return NextResponse.json({ error: "Missing player id" }, { status: 400 });
    }

    const stats = await getPlayerStats(playerId);

    if (!stats) {
      return NextResponse.json({
        chainsCompleted: 0,
        bestTime: null,
        bestStars: 0,
        rankToday: null,
        totalPlayersToday: 0,
        rankAllTime: null,
        totalPlayersAllTime: 0,
      });
    }

    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
