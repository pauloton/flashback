/**
 * ⚡ FLASHBACK — Client API Helper
 * 
 * These functions run in the BROWSER (not the server).
 * They call our backend API to load puzzles and save scores.
 */

// Generate a simple anonymous player ID (replaced by World ID later)
export function getPlayerId() {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("flashback_player_id");
  if (!id) {
    id = "player_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("flashback_player_id", id);
  }
  return id;
}

// Fetch today's puzzle from our backend
export async function fetchPuzzle() {
  const res = await fetch("/api/puzzle");
  if (!res.ok) return null;
  return res.json();
}

// Submit score after completing a game
export async function submitGameScore({ time, attempts, stars }) {
  const playerId = getPlayerId();
  const date = new Date().toISOString().split("T")[0];

  const res = await fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId, date, time, attempts, stars }),
  });

  return res.json();
}

// Get leaderboard
export async function fetchLeaderboard(type = "today") {
  const res = await fetch(`/api/leaderboard?type=${type}`);
  if (!res.ok) return { leaderboard: [], totalPlayers: 0 };
  return res.json();
}

// Get player stats
export async function fetchPlayerStats() {
  const playerId = getPlayerId();
  const res = await fetch(`/api/player?id=${playerId}`);
  if (!res.ok) return null;
  return res.json();
}
