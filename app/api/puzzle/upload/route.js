import { NextResponse } from "next/server";
import { uploadPuzzle, ensureTables } from "@/lib/db";

// POST /api/puzzle/upload — add a puzzle to the database
export async function POST(request) {
  try {
    // Make sure tables exist
    await ensureTables();

    const body = await request.json();

    // Accept a single puzzle or an array of puzzles
    const puzzles = Array.isArray(body) ? body : [body];
    const results = [];

    for (const puzzle of puzzles) {
      if (!puzzle.date || !puzzle.events || puzzle.events.length !== 7) {
        results.push({ date: puzzle.date, success: false, message: "Invalid puzzle format" });
        continue;
      }
      const result = await uploadPuzzle(puzzle);
      results.push({ date: puzzle.date, ...result });
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      uploaded: successCount,
      total: puzzles.length,
      results,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
