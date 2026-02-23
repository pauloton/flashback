"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// UTILITIES
// ============================================================
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatTime(ms) {
  const totalSeconds = ms / 1000;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const centis = Math.floor((ms % 1000) / 10);
  return { mins, secs, centis, display: `${mins}:${secs.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}` };
}

// ── Stars based on failed attempts, not time ──────────────────
// 0 wrong = 3 stars, 1 wrong = 2 stars, 2 wrong = 1 star, 3 wrong = game over
function getStars(failedAttempts) {
  if (failedAttempts === 0) return 3;
  if (failedAttempts === 1) return 2;
  return 1;
}

const MAX_ATTEMPTS = 3; // game over after this many failed lock-ins

function getStats() {
  if (typeof window === "undefined") return { played: 0, perfects: 0, best: null };
  try {
    return {
      played:   parseInt(localStorage.getItem("flashback_played")   || "0", 10),
      perfects: parseInt(localStorage.getItem("flashback_perfects") || "0", 10),
      best:     parseInt(localStorage.getItem("flashback_best")     || "0", 10) || null,
    };
  } catch { return { played: 0, perfects: 0, best: null }; }
}
function saveStats(timeMs, stars) {
  if (typeof window === "undefined") return;
  try {
    const prev = getStats();
    localStorage.setItem("flashback_played",   String(prev.played + 1));
    localStorage.setItem("flashback_perfects", String(prev.perfects + (stars === 3 ? 1 : 0)));
    if (timeMs && stars > 0 && (!prev.best || timeMs < prev.best)) localStorage.setItem("flashback_best", String(timeMs));
    if (timeMs && stars > 0) {
      const existing = JSON.parse(localStorage.getItem("flashback_times") || "[]");
      const updated = [...existing, timeMs].sort((a, b) => a - b).slice(0, 5);
      localStorage.setItem("flashback_times", JSON.stringify(updated));
    }
  } catch {}
}

function useTimer() {
  const [time, setTime] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);
  const tick = useCallback(() => { if (!runningRef.current) return; setTime(Date.now() - startRef.current); rafRef.current = requestAnimationFrame(tick); }, []);
  const start = useCallback(() => { startRef.current = Date.now(); runningRef.current = true; rafRef.current = requestAnimationFrame(tick); }, [tick]);
  const stop = useCallback(() => { runningRef.current = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);
  return { time, start, stop };
}

// ============================================================
// TAGLINES (daily rotating)
// ============================================================
const TAGLINES = [
  "Order Makes the Difference",
  "Order Is Everything",
  "Your Daily Order of Things",
  "The Order of the Day",
  "Fix the Timeline",
  "Line It Up",
  "Put Time in Its Place",
  "Order Wins",
];
const todayTagline = TAGLINES[Math.floor(Date.now() / 86400000) % TAGLINES.length];

// ============================================================
// CELEBRATORY WORDS
// ============================================================
const WORDS_3 = ["Congratulations!", "Nicely done!", "Well played!", "Good job!", "You cracked it!", "Blazing!", "Great job!", "Well done!", "Wow!", "Super!", "Woohoo!!", "Excellent!", "Not too shabby!"];
const WORDS_2 = ["Love it!", "There it is!", "You got it!", "Nice one!", "That's it!", "Boom!", "Right on!", "Sweet!", "Good stuff!", "Yes!", "Beautiful!", "On it!", "Solid!", "Bravo!", "Done!"];
const WORDS_1 = ["That felt good!", "Knew you would!", "You nailed it!", "Easy!", "All yours!"];
function getCelebWord(stars) {
  const list = stars === 3 ? WORDS_3 : stars === 2 ? WORDS_2 : WORDS_1;
  return list[Math.floor(Math.random() * list.length)];
}

// ============================================================
// PLAYER ID
// ============================================================
function getPlayerId() {
  if (typeof window === "undefined") return "server";
  try {
    const { MiniKit } = require("@worldcoin/minikit-js");
    if (MiniKit.isInstalled() && MiniKit.user?.walletAddress) return MiniKit.user.walletAddress;
  } catch {}
  let id = localStorage.getItem("flashback_player_id");
  if (!id) { id = "player_" + Math.random().toString(36).slice(2, 10); localStorage.setItem("flashback_player_id", id); }
  return id;
}

// ============================================================
// CONFETTI
// ============================================================
function Confetti({ active }) {
  const pieces = useRef(
    Array.from({ length: 56 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.4,
      duration: 1.6 + Math.random() * 1.4,
      color: ["#F2C94C", "#FF6B6B", "#F2E8FF", "#2D1B4E", "#ffffff"][i % 5],
      size: 5 + Math.random() * 7,
      drift: (Math.random() - 0.5) * 80,
      rot: Math.random() * 360,
    }))
  ).current;

  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 9999 }}>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) translateX(0) rotate(0deg); opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--cdrift)) rotate(var(--crot)); opacity: 0; }
        }
      `}</style>
      {pieces.map(pc => (
        <div key={pc.id} style={{
          position: "absolute", top: 0, left: `${pc.x}%`,
          width: `${pc.size}px`, height: `${pc.size * 0.45}px`,
          background: pc.color, borderRadius: "2px",
          "--cdrift": `${pc.drift}px`,
          "--crot": `${pc.rot + 540}deg`,
          animation: `confettiFall ${pc.duration}s ease-in ${pc.delay}s both`,
        }} />
      ))}
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function StarDisplay({ stars, size = 28, celebrate = false }) {
  const [visibleStars, setVisibleStars] = useState(celebrate ? 0 : stars);
  useEffect(() => {
    if (!celebrate) { setVisibleStars(stars); return; }
    setVisibleStars(0);
    const timers = [];
    for (let i = 1; i <= stars; i++) timers.push(setTimeout(() => setVisibleStars(i), 200 + i * 145));
    return () => timers.forEach(clearTimeout);
  }, [celebrate, stars]);

  // Only render earned stars — no empty slots
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {Array.from({ length: stars }, (_, i) => {
        const filled = i + 1 <= visibleStars;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24"
            fill={filled ? "#F2C94C" : "none"}
            stroke="#F2C94C"
            strokeWidth="2" strokeLinejoin="round"
            style={{
              opacity: filled ? 1 : 0.15,
              transform: filled ? "scale(1.15)" : "scale(0.9)",
              transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
              animation: filled && celebrate ? `starPop 0.35s ease ${0.17 + (i + 1) * 0.145}s both` : "none",
            }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
}

// ============================================================
// SCREEN: LOADING
// ============================================================
function LoadingScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "#F2E8FF" }}>FLASH<span style={{ fontWeight: 300 }}>BACK</span></div>
      <div style={{ marginTop: "1rem", color: "rgba(242,232,255,0.3)", fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace", animation: "pulse 1.5s ease infinite" }}>Loading today&apos;s chain...</div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "#F2E8FF" }}>FLASH<span style={{ fontWeight: 300 }}>BACK</span></div>
      <div style={{ marginTop: "1.5rem", color: "rgba(242,232,255,0.4)", fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif" }}>{message || "No puzzle available today"}</div>
      <div style={{ marginTop: "0.5rem", color: "rgba(242,232,255,0.25)", fontSize: "0.75rem" }}>Come back tomorrow for a fresh chain!</div>
    </div>
  );
}

// ============================================================
// SCREEN: INTRO
// ============================================================
function AnimatedLogo({ onSolved }) {
  const letters = "FLASHBACK".split("");
  const [positions, setPositions] = useState(() => {
    const indices = letters.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; }
    return indices;
  });
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    let current = [...positions]; let step = 0;
    const interval = setInterval(() => {
      for (let i = step; i < current.length; i++) {
        if (current[i] !== i) {
          const fromIdx = current.indexOf(step);
          [current[fromIdx], current[step]] = [current[step], current[fromIdx]];
          setPositions([...current]); step++; break;
        } else { step++; }
      }
      if (current.every((v, i) => v === i)) { clearInterval(interval); setSolved(true); if (onSolved) onSolved(); }
    }, 245);
    return () => clearInterval(interval);
  }, []);

  const fontSize = "clamp(2.4rem, 8vw, 4.5rem)";
  const letterWidth = "clamp(1.4rem, 4.8vw, 2.7rem)";

  return (
    <div style={{ position: "relative", height: "clamp(3.5rem, 10vw, 5.5rem)", width: `calc(${letterWidth} * 9)`, margin: "0 auto 0.2rem auto" }}>
      {letters.map((letter, correctIndex) => {
        const currentDisplayIndex = positions.indexOf(correctIndex);
        const isBold = correctIndex < 5;
        return (
          <span key={correctIndex} style={{
            position: "absolute", left: `calc(${letterWidth} * ${currentDisplayIndex})`, top: 0,
            width: letterWidth, textAlign: "center", fontSize, fontWeight: isBold ? 800 : 300,
            fontFamily: "'Space Grotesk', sans-serif",
            color: solved ? "#F2E8FF" : "rgba(242,232,255,0.2)",
            transition: "left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.4s ease",
            lineHeight: 1.1, userSelect: "none",
          }}>{letter}</span>
        );
      })}
    </div>
  );
}

function IntroScreen({ onStart, puzzle }) {
  const [show, setShow] = useState(false);
  const [logoSolved, setLogoSolved] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  useEffect(() => {
    if (!logoSolved) return;
    const timers = [
      setTimeout(() => setLineCount(1), 350),
      setTimeout(() => setLineCount(2), 750),
      setTimeout(() => setLineCount(3), 1150),
    ];
    return () => timers.forEach(clearTimeout);
  }, [logoSolved]);

  const dateLabel = new Date(puzzle.date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });

  const lines = [
    "Seven Historical Events",
    "Sort Them",
    "Beat The Clock!",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100dvh", padding: "0",
      position: "relative", opacity: show ? 1 : 0, transition: "opacity 0.8s ease" }}>

      {/* Date — very top */}
      <div style={{ width: "100%", textAlign: "center", paddingTop: "clamp(2rem, 7vh, 3.5rem)",
        fontSize: "0.72rem", color: "rgba(242,232,255,0.25)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>
        {dateLabel}
      </div>

      {/* Logo + 3 lines — vertically centered */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "clamp(1rem, 3vh, 1.8rem)", paddingBottom: "clamp(6rem, 16vh, 10rem)" }}>
        <AnimatedLogo onSolved={() => setLogoSolved(true)} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem" }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              fontSize: "1.05rem", fontWeight: 600, color: "rgba(242,232,255,0.45)",
              fontFamily: "'Space Grotesk', sans-serif",
              opacity: i < lineCount ? 1 : 0,
              transform: i < lineCount ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
            }}>{line}</div>
          ))}
        </div>
      </div>

      {/* Button — anchored near the bottom */}
      <div style={{ position: "absolute", bottom: "clamp(4rem, 11vh, 7rem)",
        display: "flex", justifyContent: "center", width: "100%" }}>
        <button onClick={onStart} style={{
          background: "#FF6B6B", color: "#ffffff", border: "none", borderRadius: "16px",
          padding: "1rem 2.5rem", fontSize: "1.05rem", fontWeight: 700, cursor: "pointer",
          fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em",
          transition: "transform 0.2s ease", boxShadow: "0 4px 24px rgba(255,107,107,0.4)",
          width: "clamp(220px, 65vw, 300px)",
        }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
        >FIX THE TIMELINE!</button>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: REVEAL
// ============================================================
function RevealScreen({ events, onRevealComplete }) {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (revealed < events.length) { const t = setTimeout(() => setRevealed(r => r + 1), 400); return () => clearTimeout(t); }
    else { const t = setTimeout(onRevealComplete, 800); return () => clearTimeout(t); }
  }, [revealed, events.length, onRevealComplete]);

  return (
    <div style={{ width: "100%", maxWidth: "440px", margin: "0 auto", padding: "1rem 0.75rem", height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: "1rem", flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(0.3rem, 1vh, 0.6rem)", flex: 1, minHeight: 0 }}>
        {events.map((event, index) => (
          <div key={event.id} style={{
            background: "rgba(242,232,255,0.07)", border: "1px solid rgba(242,232,255,0.15)", borderRadius: "12px",
            padding: "clamp(0.5rem, 1.2vh, 1rem) clamp(1rem, 3vw, 1.5rem)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", flex: 1, minHeight: 0, overflow: "hidden",
            opacity: index < revealed ? 1 : 0, transform: index < revealed ? "translateX(0)" : "translateX(-20px)",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: "clamp(0.88rem, 2.5vw, 1.05rem)", fontWeight: 600, color: "#F2E8FF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>{event.title}</div>
              <div style={{ fontSize: "clamp(0.65rem, 1.9vw, 0.8rem)", color: "rgba(242,232,255,0.4)", marginTop: "0.15rem", fontFamily: "'JetBrains Mono', monospace" }}>{event.hint}</div>
            </div>
          </div>
        ))}
      </div>
      {revealed >= events.length && (
        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "rgba(242,232,255,0.3)", fontFamily: "'JetBrains Mono', monospace", animation: "pulse 1s ease infinite" }}>Shuffling...</div>
      )}
    </div>
  );
}

// ============================================================
// SCREEN: PLAYING
// ============================================================
function reorderAroundLocks(events, fromIndex, toIndex, lockedCorrect) {
  const dragged = events[fromIndex];
  const result = new Array(events.length).fill(null);
  events.forEach((ev, i) => { if (lockedCorrect[ev.id]) result[i] = ev; });
  const unlocked = events.filter((ev, i) => !lockedCorrect[ev.id] && i !== fromIndex);
  let insertAt = 0;
  for (let i = 0; i < toIndex; i++) { if (!result[i]) insertAt++; }
  unlocked.splice(insertAt, 0, dragged);
  let ui = 0;
  for (let i = 0; i < result.length; i++) { if (!result[i]) result[i] = unlocked[ui++]; }
  return result;
}

function DraggableList({ events, lockedCorrect, wrongCards, onReorder, allCorrect }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const overIndexRef = useRef(null);
  const listRef = useRef(null);
  const touchData = useRef({ active: false, index: null, startY: 0, clone: null, itemHeight: 0 });
  const eventsRef = useRef(events);
  eventsRef.current = events;

  const handleDragStart = (e, index) => { if (lockedCorrect[events[index]?.id]) return; setDragIndex(index); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e, index) => { e.preventDefault(); setOverIndex(index); };
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== targetIndex && !lockedCorrect[events[dragIndex]?.id]) {
      onReorder(reorderAroundLocks(events, dragIndex, targetIndex, lockedCorrect));
    }
    setDragIndex(null); setOverIndex(null);
  };
  const handleDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  const handleTouchStart = useCallback((e, index) => {
    if (lockedCorrect[eventsRef.current[index]?.id]) return;
    const touch = e.touches[0]; const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const clone = target.cloneNode(true);
    Object.assign(clone.style, { position: "fixed", left: rect.left + "px", top: rect.top + "px", width: rect.width + "px", zIndex: 9999, opacity: "0.9", transform: "scale(1.04)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", pointerEvents: "none", transition: "none" });
    document.body.appendChild(clone);
    touchData.current = { active: true, index, startY: touch.clientY, clone, itemHeight: rect.height + 8, startTop: rect.top };
    overIndexRef.current = null;
    target.style.opacity = "0.2";

    const onTouchMove = (ev) => {
      ev.preventDefault();
      const t = ev.touches[0]; const dy = t.clientY - touchData.current.startY;
      touchData.current.clone.style.top = (touchData.current.startTop + dy) + "px";
      const listEl = listRef.current; if (!listEl) return;
      const items = listEl.children;
      let foundOver = null;
      for (let i = 0; i < items.length; i++) {
        const r = items[i].getBoundingClientRect();
        if (t.clientY >= r.top && t.clientY <= r.bottom && i !== touchData.current.index) { foundOver = i; break; }
      }
      overIndexRef.current = foundOver;
      setOverIndex(foundOver);
    };
    const onTouchEnd = () => {
      document.removeEventListener("touchmove", onTouchMove); document.removeEventListener("touchend", onTouchEnd);
      if (touchData.current.clone?.parentNode) touchData.current.clone.parentNode.removeChild(touchData.current.clone);
      const from = touchData.current.index; const to = overIndexRef.current;
      const currentEvents = eventsRef.current;
      if (from !== null && to !== null && from !== to && !lockedCorrect[currentEvents[from]?.id]) {
        onReorder(reorderAroundLocks(currentEvents, from, to, lockedCorrect));
      }
      if (listRef.current?.children[from]) listRef.current.children[from].style.opacity = "1";
      touchData.current = { active: false, index: null, startY: 0, clone: null, itemHeight: 0 };
      overIndexRef.current = null;
      setDragIndex(null); setOverIndex(null);
    };
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
  }, [lockedCorrect, onReorder]);

  return (
    <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: "clamp(0.25rem, 1vh, 0.6rem)", flex: 1, minHeight: 0 }}>
      {events.map((event, index) => {
        const isLocked = !!lockedCorrect[event.id]; const isWrong = !!wrongCards[event.id];
        const isDragging = dragIndex === index; const isOver = overIndex === index;
        return (
          <div key={event.id} draggable={!isLocked}
            onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)} onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, index)}
            style={{
              background: isLocked ? "#F2C94C" : isWrong ? "rgba(242,232,255,0.04)" : isOver ? "rgba(242,232,255,0.12)" : "rgba(242,232,255,0.07)",
              border: isLocked ? "none" : isWrong ? "1px solid rgba(242,232,255,0.2)" : isOver ? "1px solid rgba(242,232,255,0.25)" : "1px solid rgba(242,232,255,0.15)",
              borderRadius: "12px", padding: "clamp(0.4rem, 1.2vh, 1rem) clamp(1rem, 3vw, 1.5rem)",
              cursor: isLocked ? "default" : "grab", flex: 1, minHeight: 0,
              opacity: isDragging ? 0.3 : 1, transform: isOver && !isLocked ? "scale(1.02)" : "scale(1)",
              transition: isDragging ? "none" : "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", userSelect: "none", touchAction: "none",
              animation: allCorrect ? `celebrate 0.5s ease ${index * 0.07}s both` : isWrong ? "shake 0.4s ease" : "none", overflow: "hidden",
            }}>
            <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
              <div style={{ fontSize: "clamp(0.88rem, 2.5vw, 1.05rem)", fontWeight: 600, color: isLocked ? "#2D1B4E" : "#F2E8FF", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{event.title}</div>
              <div style={{ fontSize: "clamp(0.65rem, 1.9vw, 0.8rem)", color: isLocked ? "rgba(45,27,78,0.55)" : "rgba(242,232,255,0.4)", marginTop: "0.15rem", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {event.hint}{isLocked && <span style={{ color: "#2D1B4E", marginLeft: "0.5rem", fontWeight: 700 }}>{event.year}</span>}
              </div>
            </div>
            {!isLocked && null}
          </div>
        );
      })}
    </div>
  );
}

// ── Live stars shown during gameplay (burn one per wrong attempt) ──
function LiveStars({ failedAttempts }) {
  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
      {Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
        const active = i < (MAX_ATTEMPTS - failedAttempts);
        return (
          <svg key={i} width="18" height="18" viewBox="0 0 24 24"
            fill={active ? "#F2C94C" : "none"}
            stroke={active ? "#F2C94C" : "rgba(242,232,255,0.2)"}
            strokeWidth="2" strokeLinejoin="round"
            style={{ transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)", transform: active ? "scale(1)" : "scale(0.8)", opacity: active ? 1 : 0.3 }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        );
      })}
    </div>
  );
}

// ── Game Over screen ──
function GameOverScreen({ events, onViewChain, onMount }) {
  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) { hasRun.current = true; onMount(); saveStats(null, 0); }
  }, [onMount]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "2rem", textAlign: "center", gap: "1.5rem" }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "3.5rem", fontWeight: 900, color: "#FF6B6B", letterSpacing: "-0.02em", lineHeight: 1, textShadow: "0 2px 32px rgba(255,107,107,0.5)" }}>
        GAME OVER
      </div>
      <button onClick={onViewChain} style={{
        background: "rgba(242,232,255,0.07)", border: "1px solid rgba(242,232,255,0.2)", borderRadius: "14px",
        padding: "1rem 2rem", color: "#F2E8FF", fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "1rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em",
        width: "100%", maxWidth: "340px", transition: "all 0.2s ease",
      }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(242,232,255,0.12)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(242,232,255,0.07)"; }}
      >
        Check the Right Timeline
      </button>
      <button onClick={() => {
        const msg = "I failed FlashBack today. How about you? 👀\nhttps://flashback.game";
        if (navigator.share) { navigator.share({ text: msg }); }
        else { navigator.clipboard.writeText(msg); alert("Copied to clipboard!"); }
      }} style={{
        background: "#FF6B6B", border: "none", borderRadius: "14px",
        padding: "1rem 2rem", color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "1rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em",
        width: "100%", maxWidth: "340px", transition: "all 0.2s ease",
      }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
      >
        Invite Others to Play
      </button>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "rgba(242,232,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        Try Again Tomorrow
      </div>
    </div>
  );
}

function PlayingScreen({ events, lockedCorrect, wrongCards, onReorder, onLockIn, timeDisplay, failedAttempts = 0, isReadOnly = false, onBackToResults, playerWon = false }) {
  return (
    <div style={{ width: "100%", maxWidth: "440px", margin: "0 auto", padding: "0.75rem 0.75rem", height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexShrink: 0 }}>
        <LiveStars failedAttempts={failedAttempts} />
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.4rem", fontWeight: 700, color: "#F2E8FF" }}>{timeDisplay}</div>
      </div>
      <div style={{ height: "3px", background: "rgba(242,232,255,0.12)", borderRadius: "2px", marginBottom: "0.6rem", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${(Object.keys(lockedCorrect).length / 7) * 100}%`, background: "#F2C94C", borderRadius: "2px", transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      </div>
      <DraggableList events={events} lockedCorrect={lockedCorrect} wrongCards={wrongCards} onReorder={onReorder} allCorrect={Object.keys(lockedCorrect).length === 7} />
      <div style={{ paddingTop: "0.6rem", paddingBottom: "env(safe-area-inset-bottom, 0.5rem)", flexShrink: 0 }}>
        {isReadOnly ? (
          playerWon ? (
            <button onClick={onBackToResults} style={{
              width: "100%", background: "rgba(242,232,255,0.1)", color: "#F2E8FF", border: "1px solid rgba(242,232,255,0.2)", borderRadius: "14px",
              padding: "0.85rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em", transition: "all 0.2s ease",
            }}>← Back to your Score</button>
          ) : (
            <button onClick={() => {
              const msg = "I failed FlashBack today. How about you? 👀\nhttps://flashback.game";
              if (navigator.share) { navigator.share({ text: msg }); }
              else { navigator.clipboard.writeText(msg); alert("Copied to clipboard!"); }
            }} style={{
              width: "100%", background: "#FF6B6B", color: "#ffffff", border: "none", borderRadius: "14px",
              padding: "0.85rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em", transition: "all 0.2s ease",
            }}>Invite Others to Play</button>
          )
        ) : (
          <button onClick={onLockIn} style={{
            width: "100%", background: "#FF6B6B", color: "#ffffff", border: "none", borderRadius: "14px",
            padding: "0.85rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em", transition: "all 0.2s ease",
          }}>Lock it in!</button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SHARE BUTTON
// ============================================================
const SHARE_BLURBS = [
  (t, url) => `I put history back in order in ${t}. How bout you? ${url}`,
  (t, url) => `I fixed the timeline in ${t}. Your turn? ${url}`,
  (t, url) => `I put the past in its place in ${t}. What about you? ${url}`,
  (t, url) => `I untangled history in ${t}. Can you? ${url}`,
];

function ShareButton({ time }) {
  const [blurbIndex] = useState(() => Math.floor(Math.random() * SHARE_BLURBS.length));
  const gameUrl = "https://flashback-lemon.vercel.app";
  const timeDisplay = formatTime(time).display;

  const handleShare = async () => {
    const text = SHARE_BLURBS[blurbIndex](timeDisplay, gameUrl);

    // Try to generate a score card image
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600; canvas.height = 300;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#2D1B4E";
      ctx.fillRect(0, 0, 600, 300);
      ctx.fillStyle = "#F2C94C";
      ctx.roundRect(40, 40, 520, 220, 20);
      ctx.fill();
      ctx.fillStyle = "#2D1B4E";
      ctx.font = "bold 100px monospace";
      ctx.textAlign = "center";
      ctx.fillText(timeDisplay, 300, 170);
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("FlashBack", 300, 230);

      canvas.toBlob(async (blob) => {
        const file = new File([blob], "flashback-score.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ text, files: [file] });
        } else if (navigator.share) {
          await navigator.share({ text });
        } else {
          await navigator.clipboard.writeText(text);
          alert("Copied to clipboard!");
        }
      }, "image/png");
    } catch {
      // Fallback — no image
      if (navigator.share) { navigator.share({ text }); }
      else { navigator.clipboard.writeText(text); alert("Copied to clipboard!"); }
    }
  };

  return (
    <button onClick={handleShare} style={{
      width: "100%", maxWidth: "340px", background: "#F2C94C", color: "#2D1B4E",
      border: "none", borderRadius: "14px", padding: "1rem", fontSize: "1rem",
      fontWeight: 800, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
      letterSpacing: "0.03em", transition: "all 0.2s ease",
    }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >Share your Score with Others!</button>
  );
}

// ============================================================
// SCREEN: RESULTS
// ============================================================
function CompleteScreen({ time, failedAttempts, puzzle, onViewChain, firstVisit = true, onMount }) {
  const [show, setShow] = useState(false);
  const [showCelebWord, setShowCelebWord] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const stars = getStars(failedAttempts);
  const { display } = formatTime(time);
  const [celebWord] = useState(() => getCelebWord(stars));
  // Save first, then read — so today's score shows up immediately
  if (firstVisit) { saveStats(time, stars); }
  const localStats = getStats();
  const played = localStats.played;
  const perfects = localStats.perfects;
  const bestTime = localStats.best ? formatTime(localStats.best).display : display;

  useEffect(() => {
    setTimeout(() => setShow(true), 300);
    if (firstVisit) {
      setTimeout(() => { setShowCelebWord(true); setShowConfetti(true); }, 500);
      setTimeout(() => setShowConfetti(false), 3500);
      if (onMount) onMount();
    } else {
      setShowCelebWord(true);
    }
  }, []);

  return (
    <>
      <Confetti active={showConfetti} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "1.5rem", textAlign: "center", position: "relative",
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}>

        {/* Stars */}
        <StarDisplay stars={stars} size={44} celebrate={firstVisit} />

        {/* Celebratory word */}
        <div style={{
          fontSize: "clamp(1.6rem, 5.5vw, 2.2rem)", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif",
          color: "#F2E8FF", marginTop: "1rem", marginBottom: "1.5rem",
          opacity: showCelebWord ? 1 : 0, transform: showCelebWord ? "scale(1)" : "scale(0.8)",
          transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>{celebWord}</div>

        {/* Time + stats card */}
        <div style={{ background: "#F2C94C", borderRadius: "16px", padding: "1.25rem 2rem", marginBottom: "1rem", width: "100%", maxWidth: "340px" }}>
          <div style={{ fontSize: "clamp(2.4rem, 8vw, 3.2rem)", fontWeight: 800, color: "#2D1B4E", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{display}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "0.75rem" }}>
            {[
              [played, "Played"],
              [perfects, "Perfect Scores"],
              [bestTime, "Best"],
            ].map(([val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#2D1B4E", fontFamily: "'JetBrains Mono', monospace" }}>{val}</div>
                <div style={{ fontSize: "0.55rem", color: "rgba(45,27,78,0.5)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Check your timeline button */}
        <button onClick={onViewChain} style={{
          width: "100%", maxWidth: "340px", background: "rgba(242,232,255,0.08)", color: "#F2E8FF",
          border: "1px solid rgba(242,232,255,0.2)", borderRadius: "14px", padding: "0.85rem",
          fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", marginBottom: "1.5rem",
          fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.03em", transition: "all 0.2s ease",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(242,232,255,0.13)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(242,232,255,0.08)"; }}
        >&#8801; Check your Winning Timeline!</button>

        {/* Your top 5 personal scores */}
        <div style={{ width: "100%", maxWidth: "340px", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(242,232,255,0.28)", fontFamily: "'JetBrains Mono', monospace", marginBottom: "0.6rem", textAlign: "left" }}>Your Top 5</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {(() => {
              const times = JSON.parse(typeof localStorage !== "undefined" ? localStorage.getItem("flashback_times") || "[]" : "[]");
              return [0,1,2,3,4].map(i => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "0.5rem 0.75rem", background: i === 0 ? "rgba(242,232,255,0.07)" : "transparent", borderRadius: "8px" }}>
                  <div style={{ width: "24px", fontSize: "0.7rem", fontWeight: 700, color: i === 0 ? "#F2E8FF" : "rgba(242,232,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: "0.75rem", color: i === 0 ? "#F2E8FF" : "rgba(242,232,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textAlign: "left" }}>
                    {times[i] ? formatTime(times[i]).display : "—"}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Share button */}
        <ShareButton time={time} />
      </div>
    </>
  );
}

// ============================================================
// APP ROOT
// ============================================================
const SCREENS = { LOADING: "loading", ERROR: "error", INTRO: "intro", REVEAL: "reveal", PLAYING: "playing", CHAIN_VIEW: "chain_view", COMPLETE: "complete", GAME_OVER: "game_over" };

export default function FlashBackApp() {
  const [screen, setScreen] = useState(SCREENS.LOADING);
  const [puzzle, setPuzzle] = useState(null);
  const [answerOrder, setAnswerOrder] = useState([]);
  const [yearMap, setYearMap] = useState({});
  const [events, setEvents] = useState([]);
  const [revealEvents, setRevealEvents] = useState([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedCorrect, setLockedCorrect] = useState({});
  const [wrongCards, setWrongCards] = useState({});
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const confettiShown = useRef(false);
  const gameOverShown = useRef(false);
  const prevScreen = useRef(null);
  const timer = useTimer();

  useEffect(() => {
    const localDate = new Date().toLocaleDateString("en-CA");
    fetch(`/api/puzzle?date=${localDate}`)
      .then(r => { if (!r.ok) throw new Error("No puzzle"); return r.json(); })
      .then(data => { setPuzzle(data.puzzle); setAnswerOrder(data.answerOrder); setYearMap(data.yearMap); setScreen(SCREENS.INTRO); })
      .catch(() => setScreen(SCREENS.ERROR));
  }, []);

  const handleStart = () => {
    const evts = puzzle.events.map(e => ({ ...e, year: yearMap[e.id] }));
    const shuffled = shuffleArray(evts);
    setEvents(shuffled); setRevealEvents(shuffled);
    setFailedAttempts(0); setLockedCorrect({}); setWrongCards({});
    setScreen(SCREENS.REVEAL);
  };

  const handleRevealComplete = useCallback(() => {
    const evts = puzzle.events.map(e => ({ ...e, year: yearMap[e.id] }));
    setEvents(shuffleArray(evts)); setScreen(SCREENS.PLAYING); timer.start();
  }, [timer, puzzle, yearMap]);

  const handleReorder = useCallback((newEvents) => setEvents(newEvents), []);

  const handleLockIn = () => {
    const newLocked = { ...lockedCorrect }; const newWrong = {};
    let anyNewCorrect = false;
    events.forEach((ev, i) => {
      if (lockedCorrect[ev.id]) return;
      if (ev.id === answerOrder[i]) { newLocked[ev.id] = true; anyNewCorrect = true; }
      else newWrong[ev.id] = true;
    });
    setLockedCorrect(newLocked); setWrongCards(newWrong);
    setTimeout(() => setWrongCards({}), 800);

    const allCorrect = Object.keys(newLocked).length === 7;
    if (allCorrect) {
      timer.stop();
      if (!scoreSubmitted) {
        setScoreSubmitted(true);
        fetch("/api/score", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId: getPlayerId(), date: puzzle.date, time: timer.time, attempts: failedAttempts, stars: getStars(failedAttempts) }),
        }).catch(() => {});
      }
      setTimeout(() => setScreen(SCREENS.COMPLETE), 3200);
      return;
    }

    // Wrong — burn a star
    const newFailed = failedAttempts + 1;
    setFailedAttempts(newFailed);
    if (newFailed >= MAX_ATTEMPTS) {
      timer.stop();
      // Sort events into correct order for game over display
      const sorted = [...answerOrder].map(id => events.find(ev => ev.id === id)).filter(Boolean);
      setEvents(sorted);
      setTimeout(() => setScreen(SCREENS.GAME_OVER), 1000);
    }
  };

  const handleViewChain = () => { prevScreen.current = SCREENS.COMPLETE; setScreen(SCREENS.CHAIN_VIEW); };
  const handleViewCorrectChain = () => {
    // Sort events into the correct answer order and lock them all
    const sorted = [...answerOrder].map(id => events.find(ev => ev.id === id)).filter(Boolean);
    setEvents(sorted);
    const allLocked = Object.fromEntries(sorted.map(ev => [ev.id, true]));
    setLockedCorrect(allLocked);
    prevScreen.current = SCREENS.GAME_OVER;
    setScreen(SCREENS.CHAIN_VIEW);
  };
  const handleBackToResults = () => setScreen(SCREENS.COMPLETE);

  return (
    <div style={{ background: "#2D1B4E", minHeight: "100dvh", color: "#F2E8FF", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
      <style>{globalStyles}</style>
      {screen === SCREENS.LOADING && <LoadingScreen />}
      {screen === SCREENS.ERROR && <ErrorScreen />}
      {screen === SCREENS.INTRO && puzzle && <IntroScreen puzzle={puzzle} onStart={handleStart} />}
      {screen === SCREENS.REVEAL && <RevealScreen events={revealEvents} onRevealComplete={handleRevealComplete} />}
      {screen === SCREENS.PLAYING && (
        <PlayingScreen events={events} lockedCorrect={lockedCorrect} wrongCards={wrongCards}
          onReorder={handleReorder} onLockIn={handleLockIn} timeDisplay={formatTime(timer.time).display} failedAttempts={failedAttempts} />
      )}
      {screen === SCREENS.CHAIN_VIEW && (
        <PlayingScreen events={events} lockedCorrect={lockedCorrect} wrongCards={{}}
          onReorder={() => {}} onLockIn={() => {}} timeDisplay={formatTime(timer.time).display}
          isReadOnly={true} onBackToResults={handleBackToResults}
          playerWon={prevScreen.current === SCREENS.COMPLETE} />
      )}
      {screen === SCREENS.COMPLETE && <CompleteScreen time={timer.time} failedAttempts={failedAttempts} puzzle={puzzle} onViewChain={handleViewChain} firstVisit={!confettiShown.current} onMount={() => { confettiShown.current = true; }} />}
      {screen === SCREENS.GAME_OVER && <GameOverScreen events={events} onViewChain={handleViewCorrectChain} onMount={() => { gameOverShown.current = true; }} />}
    </div>
  );
}

const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
  body { background: #2D1B4E; margin: 0; overflow: hidden; }
  html { overflow: hidden; }
  ::-webkit-scrollbar { display: none; }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
  @keyframes celebrate { 0% { transform: scale(1); } 25% { transform: scale(1.03) rotate(-0.5deg); } 50% { transform: scale(1.05) rotate(0.5deg); } 75% { transform: scale(1.03) rotate(-0.3deg); } 100% { transform: scale(1); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes starPop { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.5); opacity: 1; } 75% { transform: scale(0.9); } 100% { transform: scale(1.15); opacity: 1; } }
  @keyframes confettiFall { 0% { transform: translateY(-10px) translateX(0) rotate(0deg); opacity: 1; } 85% { opacity: 1; } 100% { transform: translateY(110vh) translateX(var(--cdrift)) rotate(var(--crot)); opacity: 0; } }
`;
