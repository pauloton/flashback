import { NextResponse } from "next/server";
import { getLeaderboardToday, getLeaderboardAllTime, getTotalPlayersToday } from "@/lib/db";

// GET /api/leaderboard?type=today|alltime
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "today";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    let leaderboard;
    if (type === "alltime") {
      leaderboard = await getLeaderboardAllTime(limit);
    } else {
      leaderboard = await getLeaderboardToday(limit);
    }

    const totalPlayers = await getTotalPlayersToday();

    return NextResponse.json({
      type,
      leaderboard,
      totalPlayers,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
