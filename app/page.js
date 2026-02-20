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

// ── Stars now based on time, not attempts ──────────────────
function getStars(ms) {
  const secs = ms / 1000;
  if (secs < 30) return 3;
  if (secs < 60) return 2;
  return 1;
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
function AnimatedLogo() {
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
      if (current.every((v, i) => v === i)) { clearInterval(interval); setSolved(true); }
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
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "2rem", textAlign: "center",
      opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}>
      <AnimatedLogo />
      <p style={{ fontSize: "1rem", color: "rgba(242,232,255,0.35)", lineHeight: 1.5, margin: "0 0 2.5rem 0", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>{todayTagline}</p>
      <div style={{ fontSize: "0.85rem", color: "rgba(242,232,255,0.2)", fontFamily: "'JetBrains Mono', monospace", marginBottom: "2.5rem" }}>
        {new Date(puzzle.date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </div>
      <button onClick={onStart} style={{
        background: "#FF6B6B", color: "#ffffff", border: "none", borderRadius: "16px", padding: "1rem 3rem",
        fontSize: "1.1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: "0.05em", transition: "all 0.2s ease",
      }}
        onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; }}
        onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
      >START</button>
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
            {!isLocked && <div style={{ flexShrink: 0 }}><span style={{ color: "rgba(242,232,255,0.22)", fontSize: "1rem" }}>⠿</span></div>}
          </div>
        );
      })}
    </div>
  );
}

function PlayingScreen({ events, lockedCorrect, wrongCards, onReorder, onLockIn, timeDisplay, isReadOnly = false, onBackToResults }) {
  return (
    <div style={{ width: "100%", maxWidth: "440px", margin: "0 auto", padding: "0.75rem 0.75rem", height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "0.5rem", flexShrink: 0 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.4rem", fontWeight: 700, color: "#F2E8FF" }}>{timeDisplay}</div>
        <div style={{ fontSize: "0.6rem", color: "rgba(242,232,255,0.28)", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginTop: "0.15rem" }}>{todayTagline}</div>
      </div>
      <div style={{ height: "3px", background: "rgba(242,232,255,0.12)", borderRadius: "2px", marginBottom: "0.6rem", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${(Object.keys(lockedCorrect).length / 7) * 100}%`, background: "#F2C94C", borderRadius: "2px", transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      </div>
      <DraggableList events={events} lockedCorrect={lockedCorrect} wrongCards={wrongCards} onReorder={onReorder} allCorrect={Object.keys(lockedCorrect).length === 7} />
      <div style={{ paddingTop: "0.6rem", paddingBottom: "env(safe-area-inset-bottom, 0.5rem)", flexShrink: 0 }}>
        {isReadOnly ? (
          <button onClick={onBackToResults} style={{
            width: "100%", background: "rgba(242,232,255,0.1)", color: "#F2E8FF", border: "1px solid rgba(242,232,255,0.2)", borderRadius: "14px",
            padding: "0.85rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em", transition: "all 0.2s ease",
          }}>← Back to results</button>
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
// SHARE ICONS
// ============================================================
const SHARE_CTAS = [
  "Share your score!",
  "Spread the word!",
  "Share it!",
  "Pass it on!",
  "Share the fun!",
  "Share the chain!",
  "Share your win!",
];

function ShareIcons({ stars, time, date }) {
  const gameUrl = typeof window !== "undefined" ? window.location.origin : "https://flashback-lemon.vercel.app";
  const shareText = `I know my history. Do you? 🤓 I solved today's FlashBack in ${formatTime(time).display}. ${gameUrl}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(gameUrl);
  const c = "rgba(242,232,255,0.5)";
  const platforms = [
    { name: "Instagram", action: () => { navigator.clipboard?.writeText(shareText).then(() => { window.open("https://www.instagram.com/", "_blank"); }); }, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill={c} stroke="none"/></svg> },
    { name: "WhatsApp", action: () => { window.open(`https://wa.me/?text=${encodedText}`, "_blank"); }, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
    { name: "X", action: () => { window.open(`https://x.com/intent/tweet?text=${encodedText}`, "_blank"); }, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill={c}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { name: "World Chat", action: () => { navigator.clipboard?.writeText(shareText); alert("Copied! Paste it in World Chat."); }, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
      {platforms.map(p => (
        <button key={p.name} onClick={p.action} style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(242,232,255,0.08)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(242,232,255,0.14)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(242,232,255,0.08)"; }}
          title={p.name}>{p.icon}</button>
      ))}
    </div>
  );
}

// ============================================================
// SCREEN: RESULTS
// ============================================================
function CompleteScreen({ time, attempts, puzzle, onViewChain, firstVisit = true, onMount }) {
  const [show, setShow] = useState(false);
  const [showCelebWord, setShowCelebWord] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [todayLB, setTodayLB] = useState([]);
  const [stats, setStats] = useState(null);
  const stars = getStars(time);
  const { display } = formatTime(time);
  const [celebWord] = useState(() => getCelebWord(stars));

  useEffect(() => {
    setTimeout(() => setShow(true), 300);
    if (firstVisit) {
      setTimeout(() => { setShowCelebWord(true); setShowConfetti(true); }, 500);
      setTimeout(() => setShowConfetti(false), 3500);
      if (onMount) onMount();
    } else {
      setShowCelebWord(true);
    }
    fetch("/api/leaderboard?type=today&limit=5").then(r => r.json()).then(d => setTodayLB(d.leaderboard || [])).catch(() => {});
    const pid = getPlayerId();
    fetch(`/api/player?id=${pid}`).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const playerRank = stats?.rankToday || 0;
  const played = stats?.chainsCompleted || 1;
  const streak = stats?.streak || 1;

  return (
    <>
      <Confetti active={showConfetti} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "1.5rem", textAlign: "center", position: "relative",
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}>

        <button onClick={onViewChain} style={{ position: "absolute", top: "1.5rem", left: "1.5rem", background: "none", border: "none", cursor: "pointer", padding: "0.5rem", color: "rgba(242,232,255,0.2)", display: "flex", alignItems: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="5"/><circle cx="16" cy="16" r="5"/></svg>
        </button>

        {/* Only earned stars — no empty slots */}
        <StarDisplay stars={stars} size={44} celebrate={true} />

        {/* Random celebratory word */}
        <div style={{
          fontSize: "clamp(1.6rem, 5.5vw, 2.2rem)", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif",
          color: "#F2E8FF", marginTop: "1rem", marginBottom: "1.5rem",
          opacity: showCelebWord ? 1 : 0, transform: showCelebWord ? "scale(1)" : "scale(0.8)",
          transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>{celebWord}</div>

        <div style={{ background: "#F2C94C", borderRadius: "16px", padding: "1.25rem 2rem", marginBottom: "1.5rem", width: "100%", maxWidth: "340px" }}>
          <div style={{ fontSize: "clamp(2.4rem, 8vw, 3.2rem)", fontWeight: 800, color: "#2D1B4E", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{display}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "0.75rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#2D1B4E", fontFamily: "'JetBrains Mono', monospace" }}>{attempts}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(45,27,78,0.5)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Attempts</div>
            </div>
            <div style={{ width: "1px", background: "rgba(45,27,78,0.15)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#2D1B4E", fontFamily: "'JetBrains Mono', monospace" }}>{played}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(45,27,78,0.4)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Played</div>
            </div>
            <div style={{ width: "1px", background: "rgba(45,27,78,0.15)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#2D1B4E", fontFamily: "'JetBrains Mono', monospace" }}>{streak}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(45,27,78,0.4)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Streak</div>
            </div>
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: "340px", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(242,232,255,0.28)", fontFamily: "'JetBrains Mono', monospace", marginBottom: "0.6rem", textAlign: "left" }}>Today&apos;s Top 5</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {todayLB.length === 0 && (
              <div style={{ padding: "0.75rem", color: "rgba(242,232,255,0.25)", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}>No scores yet - you are the pioneer!</div>
            )}
            {todayLB.slice(0, 5).map((entry, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "0.5rem 0.75rem", background: i === 0 ? "rgba(242,232,255,0.07)" : "transparent", borderRadius: "8px" }}>
                <div style={{ width: "24px", fontSize: "0.7rem", fontWeight: 700, color: i === 0 ? "#F2E8FF" : "rgba(242,232,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>{entry.rank}</div>
                <div style={{ flex: 1, fontSize: "0.75rem", color: i === 0 ? "#F2E8FF" : "rgba(242,232,255,0.4)", fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>{entry.name}</div>
                <div style={{ fontSize: "0.7rem", color: i === 0 ? "#F2E8FF" : "rgba(242,232,255,0.25)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{formatTime(entry.time).display}</div>
              </div>
            ))}
            {playerRank > 5 && (
              <>
                <div style={{ height: "1px", background: "rgba(242,232,255,0.08)", margin: "0.25rem 0" }} />
                <div style={{ display: "flex", alignItems: "center", padding: "0.5rem 0.75rem", background: "#F2C94C", borderRadius: "8px" }}>
                  <div style={{ width: "24px", fontSize: "0.7rem", fontWeight: 700, color: "#2D1B4E", fontFamily: "'JetBrains Mono', monospace" }}>{playerRank}</div>
                  <div style={{ flex: 1, fontSize: "0.75rem", color: "#2D1B4E", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textAlign: "left" }}>You</div>
                  <div style={{ fontSize: "0.7rem", color: "#2D1B4E", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{display}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Rotating CTA above share buttons */}
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(242,232,255,0.5)", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "0.6rem", letterSpacing: "0.03em" }}>
          {SHARE_CTAS[Math.floor(Math.random() * SHARE_CTAS.length)]}
        </div>
        <ShareIcons stars={stars} time={time} date={puzzle.date} />
        <div style={{ fontSize: "0.65rem", color: "rgba(242,232,255,0.2)", fontFamily: "'JetBrains Mono', monospace", marginTop: "1.25rem" }}>Next chain drops at midnight</div>
      </div>
    </>
  );
}

// ============================================================
// APP ROOT
// ============================================================
const SCREENS = { LOADING: "loading", ERROR: "error", INTRO: "intro", REVEAL: "reveal", PLAYING: "playing", CHAIN_VIEW: "chain_view", COMPLETE: "complete" };

export default function FlashBackApp() {
  const [screen, setScreen] = useState(SCREENS.LOADING);
  const [puzzle, setPuzzle] = useState(null);
  const [answerOrder, setAnswerOrder] = useState([]);
  const [yearMap, setYearMap] = useState({});
  const [events, setEvents] = useState([]);
  const [revealEvents, setRevealEvents] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [lockedCorrect, setLockedCorrect] = useState({});
  const [wrongCards, setWrongCards] = useState({});
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const confettiShown = useRef(false);
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
    setAttempts(0); setLockedCorrect({}); setWrongCards({});
    setScreen(SCREENS.REVEAL);
  };

  const handleRevealComplete = useCallback(() => {
    const evts = puzzle.events.map(e => ({ ...e, year: yearMap[e.id] }));
    setEvents(shuffleArray(evts)); setScreen(SCREENS.PLAYING); timer.start();
  }, [timer, puzzle, yearMap]);

  const handleReorder = useCallback((newEvents) => setEvents(newEvents), []);

  const handleLockIn = () => {
    const newAttempts = attempts + 1; setAttempts(newAttempts);
    const newLocked = { ...lockedCorrect }; const newWrong = {};
    events.forEach((ev, i) => {
      if (lockedCorrect[ev.id]) return;
      if (ev.id === answerOrder[i]) newLocked[ev.id] = true;
      else newWrong[ev.id] = true;
    });
    setLockedCorrect(newLocked); setWrongCards(newWrong);
    setTimeout(() => setWrongCards({}), 800);
    if (Object.keys(newLocked).length === 7) {
      timer.stop();
      if (!scoreSubmitted) {
        setScoreSubmitted(true);
        fetch("/api/score", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId: getPlayerId(), date: puzzle.date, time: timer.time, attempts: newAttempts, stars: getStars(timer.time) }),
        }).catch(() => {});
      }
      setTimeout(() => setScreen(SCREENS.COMPLETE), 3200);
    }
  };

  const handleViewChain = () => setScreen(SCREENS.CHAIN_VIEW);
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
          onReorder={handleReorder} onLockIn={handleLockIn} timeDisplay={formatTime(timer.time).display} />
      )}
      {screen === SCREENS.CHAIN_VIEW && (
        <PlayingScreen events={events} lockedCorrect={lockedCorrect} wrongCards={{}}
          onReorder={() => {}} onLockIn={() => {}} timeDisplay={formatTime(timer.time).display}
          isReadOnly={true} onBackToResults={handleBackToResults} />
      )}
      {screen === SCREENS.COMPLETE && <CompleteScreen time={timer.time} attempts={attempts} puzzle={puzzle} onViewChain={handleViewChain} firstVisit={!confettiShown.current} onMount={() => { confettiShown.current = true; }} />}
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
