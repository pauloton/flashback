/**
 * ⚡ FLASHBACK — Database Layer
 * 
 * Uses Vercel Postgres (built into your Vercel account).
 * Falls back to local JSON files when testing on your computer.
 */

import { sql } from "@vercel/postgres";
import fs from "fs";
import path from "path";

const USE_DB = !!process.env.POSTGRES_URL;

// --- Local file fallback for testing ---
const DATA_DIR = path.join(process.cwd(), "data");
const SCORES_FILE = path.join(DATA_DIR, "scores.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SCORES_FILE)) fs.writeFileSync(SCORES_FILE, "[]");
}
function readLocalScores() { ensureDataDir(); return JSON.parse(fs.readFileSync(SCORES_FILE, "utf8")); }
function writeLocalScores(scores) { ensureDataDir(); fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2)); }

// --- Setup tables ---
export async function ensureTables() {
  if (!USE_DB) return;
  await sql`CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT DEFAULT 'Anonymous', country TEXT DEFAULT '🌍', created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS puzzles (id SERIAL PRIMARY KEY, date DATE UNIQUE NOT NULL, theme_label TEXT, theme_type TEXT, trivia TEXT, events JSONB NOT NULL, status TEXT DEFAULT 'approved', created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS scores (id SERIAL PRIMARY KEY, player_id TEXT NOT NULL, date DATE NOT NULL, time_ms INTEGER NOT NULL, attempts INTEGER NOT NULL, stars INTEGER NOT NULL, submitted_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(player_id, date))`;
}

// --- Get today's puzzle ---
export async function getTodaysPuzzle() {
  const today = new Date().toISOString().split("T")[0];
  if (USE_DB) {
    try { const { rows } = await sql`SELECT * FROM puzzles WHERE date = ${today} LIMIT 1`; return rows[0] || null; }
    catch (e) { return null; }
  }
  const puzzleDir = path.join(process.cwd(), "puzzles");
  const puzzleFile = path.join(puzzleDir, `puzzle-${today}.json`);
  if (fs.existsSync(puzzleFile)) return JSON.parse(fs.readFileSync(puzzleFile, "utf8"));
  if (fs.existsSync(puzzleDir)) {
    const files = fs.readdirSync(puzzleDir).filter(f => f.endsWith(".json") && f.startsWith("puzzle-"));
    if (files.length > 0) { const data = JSON.parse(fs.readFileSync(path.join(puzzleDir, files[0]), "utf8")); data.date = today; return data; }
  }
  return null;
}

// --- Submit score ---
export async function submitScore({ playerId, date, time, attempts, stars }) {
  if (USE_DB) {
    try {
      await sql`INSERT INTO players (id) VALUES (${playerId}) ON CONFLICT (id) DO NOTHING`;
      const { rows } = await sql`INSERT INTO scores (player_id, date, time_ms, attempts, stars) VALUES (${playerId}, ${date}, ${time}, ${attempts}, ${stars}) RETURNING id`;
      return { success: true, id: rows[0].id };
    } catch (e) {
      if (e.message?.includes("unique") || e.message?.includes("duplicate")) return { success: false, message: "Already played today" };
      return { success: false, message: e.message };
    }
  }
  const scores = readLocalScores();
  if (scores.find(s => s.player_id === playerId && s.date === date)) return { success: false, message: "Already played today" };
  const newScore = { id: scores.length + 1, player_id: playerId, date, time_ms: time, attempts, stars, submitted_at: new Date().toISOString() };
  scores.push(newScore); writeLocalScores(scores);
  return { success: true, id: newScore.id };
}

// --- Leaderboard today ---
export async function getLeaderboardToday(limit = 10) {
  const today = new Date().toISOString().split("T")[0];
  if (USE_DB) {
    try {
      const { rows } = await sql`SELECT s.player_id, s.time_ms, s.stars, p.name, p.country FROM scores s LEFT JOIN players p ON p.id = s.player_id WHERE s.date = ${today} ORDER BY s.stars DESC, s.time_ms ASC LIMIT ${limit}`;
      return rows.map((r, i) => ({ rank: i + 1, name: r.name || "Anonymous", country: r.country || "🌍", time: r.time_ms, stars: r.stars }));
    } catch (e) { return []; }
  }
  return readLocalScores().filter(s => s.date === today).sort((a, b) => b.stars - a.stars || a.time_ms - b.time_ms).slice(0, limit).map((s, i) => ({ rank: i + 1, name: s.player_id, country: "🌍", time: s.time_ms, stars: s.stars }));
}

// --- Leaderboard all time ---
export async function getLeaderboardAllTime(limit = 10) {
  if (USE_DB) {
    try {
      const { rows } = await sql`SELECT DISTINCT ON (s.player_id) s.player_id, s.time_ms, s.stars, p.name, p.country FROM scores s LEFT JOIN players p ON p.id = s.player_id ORDER BY s.player_id, s.stars DESC, s.time_ms ASC`;
      return rows.sort((a, b) => b.stars - a.stars || a.time_ms - b.time_ms).slice(0, limit).map((r, i) => ({ rank: i + 1, name: r.name || "Anonymous", country: r.country || "🌍", time: r.time_ms, stars: r.stars }));
    } catch (e) { return []; }
  }
  const scores = readLocalScores(); const best = {};
  for (const s of scores) { if (!best[s.player_id] || s.time_ms < best[s.player_id].time_ms) best[s.player_id] = s; }
  return Object.values(best).sort((a, b) => b.stars - a.stars || a.time_ms - b.time_ms).slice(0, limit).map((s, i) => ({ rank: i + 1, name: s.player_id, country: "🌍", time: s.time_ms, stars: s.stars }));
}

// --- Player stats ---
export async function getPlayerStats(playerId) {
  const today = new Date().toISOString().split("T")[0];
  if (USE_DB) {
    try {
      const { rows: allScores } = await sql`SELECT * FROM scores WHERE player_id = ${playerId} ORDER BY time_ms ASC`;
      if (allScores.length === 0) return null;
      const todayScore = allScores.find(s => s.date === today);
      let rankToday = 0, totalToday = 0;
      if (todayScore) {
        const { rows: [{ count: rt }] } = await sql`SELECT COUNT(*) FROM scores WHERE date = ${today} AND time_ms < ${todayScore.time_ms}`;
        const { rows: [{ count: tt }] } = await sql`SELECT COUNT(*) FROM scores WHERE date = ${today}`;
        rankToday = parseInt(rt) + 1; totalToday = parseInt(tt);
      }
      const { rows: [{ count: ra }] } = await sql`SELECT COUNT(DISTINCT player_id) FROM scores WHERE time_ms < ${allScores[0].time_ms}`;
      const { rows: [{ count: ta }] } = await sql`SELECT COUNT(DISTINCT player_id) FROM scores`;
      return { chainsCompleted: allScores.length, bestTime: allScores[0].time_ms, bestStars: Math.max(...allScores.map(s => s.stars)), rankToday, totalPlayersToday: totalToday, rankAllTime: parseInt(ra) + 1, totalPlayersAllTime: parseInt(ta) };
    } catch (e) { return null; }
  }
  const scores = readLocalScores().filter(s => s.player_id === playerId);
  if (scores.length === 0) return null;
  const sorted = [...scores].sort((a, b) => a.time_ms - b.time_ms);
  return { chainsCompleted: scores.length, bestTime: sorted[0].time_ms, bestStars: Math.max(...scores.map(s => s.stars)), rankToday: 1, totalPlayersToday: 1, rankAllTime: 1, totalPlayersAllTime: 1 };
}

// --- Upload puzzle to database ---
export async function uploadPuzzle(puzzle) {
  if (USE_DB) {
    try {
      await sql`INSERT INTO puzzles (date, theme_label, theme_type, trivia, events, status) VALUES (${puzzle.date}, ${puzzle.theme_label || 'Mixed'}, ${puzzle.theme_type || 'mixed'}, ${puzzle.trivia}, ${JSON.stringify(puzzle.events)}, 'approved') ON CONFLICT (date) DO UPDATE SET theme_label = EXCLUDED.theme_label, trivia = EXCLUDED.trivia, events = EXCLUDED.events, status = 'approved'`;
      return { success: true };
    } catch (e) { return { success: false, message: e.message }; }
  }
  const puzzleDir = path.join(process.cwd(), "puzzles");
  if (!fs.existsSync(puzzleDir)) fs.mkdirSync(puzzleDir, { recursive: true });
  fs.writeFileSync(path.join(puzzleDir, `puzzle-${puzzle.date}.json`), JSON.stringify(puzzle, null, 2));
  return { success: true };
}
