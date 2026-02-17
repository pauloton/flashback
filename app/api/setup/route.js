import { NextResponse } from "next/server";
import { ensureTables } from "@/lib/db";

// GET /api/setup — creates database tables (run once after adding Postgres)
export async function GET() {
  try {
    await ensureTables();
    return NextResponse.json({ success: true, message: "Database tables created!" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
