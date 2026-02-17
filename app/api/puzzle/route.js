import { NextResponse } from "next/server";
import { getTodaysPuzzle } from "@/lib/db";

// GET /api/puzzle → returns today's puzzle (without years!)
export async function GET(request) {
  try {
    // Use client's local date if provided, otherwise server date
    const { searchParams } = new URL(request.url);
    const clientDate = searchParams.get("date");
    const puzzle = await getTodaysPuzzle(clientDate);

    if (!puzzle) {
      return NextResponse.json(
        { error: "No puzzle available today" },
        { status: 404 }
      );
    }

    // IMPORTANT: strip years from events before sending to player!
    // The player shouldn't see the answers until they lock in correctly
    const safePuzzle = {
      date: puzzle.date,
      theme_label: puzzle.theme_label,
      trivia: puzzle.trivia,
      events: puzzle.events.map((e) => ({
        id: e.id,
        title: e.title,
        hint: e.hint,
        // year is intentionally NOT included
      })),
    };

    // Also send the correct order (by id) so the client can check answers
    // This is sorted by year — the "answer key"
    const sortedEvents = [...puzzle.events].sort((a, b) => a.year - b.year);
    const answerOrder = sortedEvents.map((e) => e.id);
    const yearMap = {};
    puzzle.events.forEach((e) => { yearMap[e.id] = e.year; });

    return NextResponse.json({
      puzzle: safePuzzle,
      answerOrder,  // [3, 1, 5, 2, 7, 4, 6] — correct sequence by id
      yearMap,      // { 1: 1455, 2: 1492, ... } — revealed after correct
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
