"use client";

/**
 * ⚡ FLASHBACK — Main Page
 * 
 * This is where the game lives. When someone visits your URL,
 * they see this page, which loads and runs the full game.
 * 
 * The game component (FlashBackGame) is the stitched-together
 * version of all our screens: Intro → Reveal → Play → Results → Dashboard
 * 
 * In production, copy the contents of flashback-app.jsx here
 * and replace the mock data fetches with the real API calls below.
 */

// TODO: Import the full game component
// For now this shows a placeholder that proves the backend is working

import { useState, useEffect } from "react";
import { fetchPuzzle, submitGameScore, fetchLeaderboard, fetchPlayerStats, getPlayerId } from "@/lib/api-client";

export default function Home() {
  const [puzzle, setPuzzle] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const puzzleData = await fetchPuzzle();
        const lbData = await fetchLeaderboard("today");
        const playerStats = await fetchPlayerStats();

        setPuzzle(puzzleData);
        setLeaderboard(lbData?.leaderboard || []);
        setStats(playerStats);
      } catch (err) {
        setError("Could not connect to backend");
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={centerStyle}>
        <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", background: "linear-gradient(135deg, #F59E0B, #EF4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          FLASH<span style={{ fontWeight: 300 }}>BACK</span>
        </div>
        <div style={{ marginTop: "1rem", color: "#9CA3AF", fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: "440px", margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", background: "linear-gradient(135deg, #F59E0B, #EF4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          FLASH<span style={{ fontWeight: 300 }}>BACK</span>
        </div>
        <div style={{ marginTop: "0.5rem", color: "#22C55E", fontSize: "0.85rem", fontFamily: "'JetBrains Mono', monospace" }}>
          ✅ Backend is running!
        </div>
      </div>

      {/* Puzzle status */}
      <Section title="Today's Puzzle">
        {puzzle ? (
          <div>
            <div style={{ color: "#22C55E", marginBottom: "0.5rem" }}>✅ Puzzle loaded for {puzzle.puzzle?.date}</div>
            <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
              {puzzle.puzzle?.events?.length} events ready
            </div>
            <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#9CA3AF" }}>
              {puzzle.puzzle?.events?.map(e => (
                <div key={e.id} style={{ padding: "0.2rem 0" }}>• {e.title} — {e.hint}</div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ color: "#D97706" }}>
            ⚠️ No puzzle found for today. Add one to the /puzzles folder.
          </div>
        )}
      </Section>

      {/* Leaderboard status */}
      <Section title="Leaderboard">
        {leaderboard.length > 0 ? (
          <div style={{ color: "#22C55E" }}>✅ {leaderboard.length} scores on today's board</div>
        ) : (
          <div style={{ color: "#9CA3AF" }}>No scores yet today — be the first!</div>
        )}
      </Section>

      {/* Player status */}
      <Section title="Player">
        <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
          Your ID: <code style={{ background: "#F3F4F6", padding: "0.15rem 0.4rem", borderRadius: "4px", fontSize: "0.75rem" }}>{getPlayerId()}</code>
        </div>
        {stats?.chainsCompleted > 0 && (
          <div style={{ marginTop: "0.3rem", fontSize: "0.8rem", color: "#6B7280" }}>
            Chains: {stats.chainsCompleted} | Best: {stats.bestTime}ms
          </div>
        )}
      </Section>

      {/* API test */}
      <Section title="API Endpoints">
        <div style={{ fontSize: "0.75rem", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
          <div>GET  /api/puzzle</div>
          <div>POST /api/score</div>
          <div>GET  /api/leaderboard?type=today</div>
          <div>GET  /api/leaderboard?type=alltime</div>
          <div>GET  /api/player?id=xxx</div>
        </div>
      </Section>

      <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.75rem", color: "#D1D5DB" }}>
        Replace this page with the full game component to go live
      </div>

      {error && (
        <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#FEF2F2", borderRadius: "8px", color: "#991B1B", fontSize: "0.8rem" }}>
          {error}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "1.25rem", padding: "1rem", background: "#F9FAFB", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
      <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", marginBottom: "0.5rem" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

const centerStyle = {
  display: "flex", flexDirection: "column", alignItems: "center",
  justifyContent: "center", minHeight: "100vh",
};
