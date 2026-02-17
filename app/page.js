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

function getStars(attempts) { if (attempts === 1) return 3; if (attempts === 2) return 2; if (attempts === 3) return 1; return 0; }
function getOrdinal(n) { const s = ["th", "st", "nd", "rd"]; const v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

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
// PLAYER ID (uses World ID when in World App, random when testing)
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
// SHARED COMPONENTS
// ============================================================
function StarDisplay({ stars, size = 28, celebrate = false }) {
  const [visibleStars, setVisibleStars] = useState(celebrate ? 0 : stars);
  useEffect(() => {
    if (!celebrate) { setVisibleStars(stars); return; }
    setVisibleStars(0);
    const timers = [];
    for (let i = 1; i <= stars; i++) timers.push(setTimeout(() => setVisibleStars(i), 480 + i * 336));
    return () => timers.forEach(clearTimeout);
  }, [celebrate, stars]);

  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {[1, 2, 3].map(i => {
        const filled = i <= visibleStars; const empty = i > stars;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24"
            fill={filled ? "#F59E0B" : "none"} stroke={empty ? "#D1D5DB" : filled ? "#F59E0B" : "#D1D5DB"}
            strokeWidth="2" strokeLinejoin="round"
            style={{
              filter: filled ? "drop-shadow(0 0 6px rgba(245, 158, 11, 0.5))" : "none",
              transform: filled ? "scale(1.15)" : "scale(1)", transition: "all 0.3s ease",
              animation: filled && celebrate ? `starPop 0.6s ease ${0.4 + i * 0.336}s both` : "none",
            }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
}

function StarIcons({ count, size = 12 }) {
  return (
    <span style={{ display: "inline-flex", gap: "1px" }}>
      {[1, 2, 3].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= count ? "#F59E0B" : "none"} stroke={i <= count ? "#F59E0B" : "#D1D5DB"} strokeWidth="2.5" strokeLinejoin="round"
          style={{ filter: i <= count ? "drop-shadow(0 0 2px rgba(245, 158, 11, 0.3))" : "none" }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

// ============================================================
// SCREEN: LOADING
// ============================================================
function LoadingScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div style={{
        fontSize: "2rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif",
        background: "linear-gradient(135deg, #F59E0B, #EF4444, #F59E0B)", backgroundSize: "200% 200%",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 2s ease infinite",
      }}>FLASH<span style={{ fontWeight: 300 }}>BACK</span></div>
      <div style={{ marginTop: "1rem", color: "#9CA3AF", fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace", animation: "pulse 1.5s ease infinite" }}>Loading today&apos;s chain...</div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", background: "linear-gradient(135deg, #F59E0B, #EF4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        FLASH<span style={{ fontWeight: 300 }}>BACK</span>
      </div>
      <div style={{ marginTop: "1.5rem", color: "#6B7280", fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif" }}>{message || "No puzzle available today"}</div>
      <div style={{ marginTop: "0.5rem", color: "#9CA3AF", fontSize: "0.75rem" }}>Come back tomorrow for a fresh chain!</div>
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
  const [glowing, setGlowing] = useState(false);

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
      if (current.every((v, i) => v === i)) { clearInterval(interval); setSolved(true); setTimeout(() => setGlowing(true), 200); }
    }, 350);
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
            background: glowing ? "linear-gradient(135deg, #F59E0B, #EF4444, #F59E0B)" : solved ? "#D97706" : "#9CA3AF",
            backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: glowing ? "shimmer 3s ease infinite" : "none",
            transition: "left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.4s ease",
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
      <p style={{ fontSize: "1rem", color: "#6B7280", lineHeight: 1.5, margin: "0 0 2.5rem 0", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>Moments That Changed Everything</p>
      <div style={{ fontSize: "0.85rem", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", marginBottom: "2.5rem" }}>
        {new Date(puzzle.date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </div>
      <button onClick={onStart} style={{
        background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff", border: "none",
        borderRadius: "16px", padding: "1rem 3rem", fontSize: "1.1rem", fontWeight: 700, cursor: "pointer",
        fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em", boxShadow: "0 4px 24px rgba(245, 158, 11, 0.3)", transition: "all 0.2s ease",
      }}
        onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 4px 32px rgba(245, 158, 11, 0.45)"; }}
        onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 4px 24px rgba(245, 158, 11, 0.3)"; }}
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
            background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "clamp(0.5rem, 1.2vh, 1rem) clamp(0.7rem, 2vw, 1.25rem)",
            display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minHeight: 0, overflow: "hidden",
            opacity: index < revealed ? 1 : 0, transform: index < revealed ? "translateX(0)" : "translateX(-20px)",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "clamp(0.78rem, 2.2vw, 0.95rem)", fontWeight: 600, color: "#1F2937", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.25 }}>{event.title}</div>
              <div style={{ fontSize: "clamp(0.6rem, 1.8vw, 0.75rem)", color: "#9CA3AF", marginTop: "0.1rem", fontFamily: "'JetBrains Mono', monospace" }}>{event.hint}</div>
            </div>
          </div>
        ))}
      </div>
      {revealed >= events.length && (
        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "#F59E0B", fontFamily: "'JetBrains Mono', monospace", animation: "pulse 1s ease infinite" }}>Shuffling...</div>
      )}
    </div>
  );
}

// ============================================================
// SCREEN: PLAYING (draggable list)
// ============================================================
function DraggableList({ events, lockedCorrect, wrongCards, onReorder }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const listRef = useRef(null);
  const touchData = useRef({ active: false, index: null, startY: 0, clone: null, itemHeight: 0 });

  const handleDragStart = (e, index) => { if (lockedCorrect[events[index]?.id]) return; setDragIndex(index); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e, index) => { e.preventDefault(); if (!lockedCorrect[events[index]?.id]) setOverIndex(index); };
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== targetIndex && !lockedCorrect[events[targetIndex]?.id]) {
      const n = [...events]; const [m] = n.splice(dragIndex, 1); n.splice(targetIndex, 0, m); onReorder(n);
    }
    setDragIndex(null); setOverIndex(null);
  };
  const handleDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  const handleTouchStart = useCallback((e, index) => {
    if (lockedCorrect[events[index]?.id]) return;
    const touch = e.touches[0]; const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const clone = target.cloneNode(true);
    Object.assign(clone.style, { position: "fixed", left: rect.left + "px", top: rect.top + "px", width: rect.width + "px", zIndex: 9999, opacity: "0.9", transform: "scale(1.04)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", pointerEvents: "none", transition: "none" });
    document.body.appendChild(clone);
    touchData.current = { active: true, index, startY: touch.clientY, clone, itemHeight: rect.height + 8, startTop: rect.top };
    target.style.opacity = "0.2";

    const onTouchMove = (ev) => {
      ev.preventDefault();
      const t = ev.touches[0]; const dy = t.clientY - touchData.current.startY;
      touchData.current.clone.style.top = (touchData.current.startTop + dy) + "px";
      const listEl = listRef.current; if (!listEl) return;
      const items = listEl.children;
      for (let i = 0; i < items.length; i++) {
        const r = items[i].getBoundingClientRect(); if (t.clientY >= r.top && t.clientY <= r.bottom && i !== touchData.current.index && !lockedCorrect[events[i]?.id]) { setOverIndex(i); break; }
      }
    };
    const onTouchEnd = () => {
      document.removeEventListener("touchmove", onTouchMove); document.removeEventListener("touchend", onTouchEnd);
      if (touchData.current.clone?.parentNode) touchData.current.clone.parentNode.removeChild(touchData.current.clone);
      const from = touchData.current.index; const to = overIndex;
      if (from !== null && to !== null && from !== to && !lockedCorrect[events[to]?.id]) {
        const n = [...events]; const [m] = n.splice(from, 1); n.splice(to, 0, m); onReorder(n);
      }
      if (listRef.current?.children[from]) listRef.current.children[from].style.opacity = "1";
      touchData.current = { active: false, index: null, startY: 0, clone: null, itemHeight: 0 };
      setDragIndex(null); setOverIndex(null);
    };
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
  }, [events, lockedCorrect, onReorder, overIndex]);

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
              background: isLocked ? "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))" : isWrong ? "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))" : isOver ? "#FEF3C7" : "#F9FAFB",
              border: isLocked ? "1px solid rgba(34,197,94,0.35)" : isWrong ? "1px solid rgba(239,68,68,0.35)" : isOver ? "1px solid #F59E0B" : "1px solid #E5E7EB",
              borderRadius: "12px", padding: "clamp(0.4rem, 1.2vh, 1rem) clamp(0.7rem, 2vw, 1.25rem)",
              cursor: isLocked ? "default" : "grab", flex: 1, minHeight: 0,
              opacity: isDragging ? 0.3 : 1, transform: isOver && !isLocked ? "scale(1.02)" : "scale(1)",
              transition: isDragging ? "none" : "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex", alignItems: "center", gap: "0.75rem", userSelect: "none", touchAction: "none",
              animation: isWrong ? "shake 0.4s ease" : "none", overflow: "hidden",
            }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "clamp(0.78rem, 2.2vw, 0.95rem)", fontWeight: 600, color: isLocked ? "#166534" : "#1F2937", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{event.title}</div>
              <div style={{ fontSize: "clamp(0.6rem, 1.8vw, 0.75rem)", color: isLocked ? "#22C55E" : "#9CA3AF", marginTop: "0.1rem", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {event.hint}{isLocked && <span style={{ color: "#22C55E", marginLeft: "0.5rem", fontWeight: 700 }}>— {event.year}</span>}
              </div>
            </div>
            <div style={{ flexShrink: 0, fontSize: "1rem" }}>
              {isLocked ? <span style={{ color: "#22C55E" }}>✓</span> : <span style={{ color: "#D1D5DB" }}>⠿</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlayingScreen({ events, lockedCorrect, wrongCards, onReorder, onLockIn, timeDisplay }) {
  return (
    <div style={{ width: "100%", maxWidth: "440px", margin: "0 auto", padding: "0.75rem 0.75rem", height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "0.5rem", flexShrink: 0 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.4rem", fontWeight: 700, color: "#D97706" }}>{timeDisplay}</div>
        <div style={{ fontSize: "0.6rem", color: "#9CA3AF", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginTop: "0.15rem" }}>Moments That Changed Everything</div>
      </div>
      <div style={{ height: "3px", background: "#E5E7EB", borderRadius: "2px", marginBottom: "0.6rem", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${(Object.keys(lockedCorrect).length / 7) * 100}%`, background: "linear-gradient(90deg, #22C55E, #4ADE80)", borderRadius: "2px", transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      </div>
      <DraggableList events={events} lockedCorrect={lockedCorrect} wrongCards={wrongCards} onReorder={onReorder} />
      <div style={{ paddingTop: "0.6rem", paddingBottom: "env(safe-area-inset-bottom, 0.5rem)", flexShrink: 0 }}>
        <button onClick={onLockIn} style={{
          width: "100%", background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff", border: "none",
          borderRadius: "14px", padding: "0.85rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer",
          fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em", boxShadow: "0 4px 24px rgba(245, 158, 11, 0.3)", transition: "all 0.2s ease",
        }}
          onMouseEnter={e => { e.target.style.boxShadow = "0 4px 32px rgba(245, 158, 11, 0.45)"; }}
          onMouseLeave={e => { e.target.style.boxShadow = "0 4px 24px rgba(245, 158, 11, 0.3)"; }}
        >Lock the chain</button>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: RESULTS
// ============================================================
function CompleteScreen({ time, attempts, puzzle, onViewDashboard }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 300); }, []);
  const stars = getStars(attempts);
  const { display } = formatTime(time);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: "2rem", textAlign: "center",
      opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}>
      <div style={{ fontSize: "0.75rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "2rem", fontFamily: "'JetBrains Mono', monospace" }}>Daily Chain Completed</div>
      <StarDisplay stars={stars} size={44} celebrate={true} />
      <div style={{ fontSize: "3.2rem", fontWeight: 800, color: "#1F2937", fontFamily: "'JetBrains Mono', monospace", marginTop: "1.5rem", marginBottom: "0.25rem" }}>{display}</div>
      <div style={{ fontSize: "0.8rem", color: "#9CA3AF", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>your time</div>

      <div style={{ display: "flex", gap: "2rem", margin: "2rem 0", padding: "1.25rem 2rem", borderRadius: "16px", background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1F2937", fontFamily: "'JetBrains Mono', monospace" }}>{attempts}</div>
          <div style={{ fontSize: "0.7rem", color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.2rem" }}>{attempts === 1 ? "Attempt" : "Attempts"}</div>
        </div>
        <div style={{ width: "1px", background: "#E5E7EB" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#F59E0B", fontFamily: "'JetBrains Mono', monospace" }}>{stars}★</div>
          <div style={{ fontSize: "0.7rem", color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.2rem" }}>Stars</div>
        </div>
      </div>

      {puzzle.trivia && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "2rem", maxWidth: "340px", textAlign: "left" }}>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#D97706", fontFamily: "'JetBrains Mono', monospace", marginBottom: "0.4rem" }}>Did you know?</div>
          <div style={{ fontSize: "0.9rem", color: "#92400E", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, fontStyle: "italic" }}>{puzzle.trivia}</div>
        </div>
      )}

      <button onClick={onViewDashboard} style={{
        background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff", border: "none",
        borderRadius: "16px", padding: "1rem 2.5rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer",
        fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em", boxShadow: "0 4px 24px rgba(245, 158, 11, 0.3)", transition: "all 0.2s ease", marginBottom: "1rem",
      }}
        onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; }}
        onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
      >Share your Score</button>
      <div style={{ fontSize: "0.75rem", color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif" }}>Next chain drops at midnight</div>
    </div>
  );
}

// ============================================================
// SCREEN: DASHBOARD (fetches real data from API)
// ============================================================
function ScoreCard({ playerTime, playerStars, stats }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <div style={{ flex: 1, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "0.7rem 0.8rem", textAlign: "center" }}>
        <div style={{ fontSize: "0.55rem", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Today</div>
        <StarIcons count={playerStars} size={13} />
        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1F2937", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginTop: "0.2rem" }}>{formatTime(playerTime).display}</div>
        {stats?.rankToday > 0 && <div style={{ fontSize: "0.65rem", color: "#D97706", fontFamily: "'JetBrains Mono', monospace", marginTop: "0.25rem", fontWeight: 600 }}>#{stats.rankToday.toLocaleString()}</div>}
      </div>
      <div style={{ flex: 1, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "0.7rem 0.8rem", textAlign: "center" }}>
        <div style={{ fontSize: "0.55rem", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Best</div>
        <StarIcons count={stats?.bestStars || playerStars} size={13} />
        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1F2937", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginTop: "0.2rem" }}>{formatTime(stats?.bestTime || playerTime).display}</div>
        {stats?.rankAllTime > 0 && <div style={{ fontSize: "0.65rem", color: "#D97706", fontFamily: "'JetBrains Mono', monospace", marginTop: "0.25rem", fontWeight: 600 }}>#{stats.rankAllTime.toLocaleString()}</div>}
      </div>
      <div style={{ width: "72px", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "0.7rem 0.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1F2937", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{stats?.chainsCompleted || 1}</div>
        <div style={{ fontSize: "0.5rem", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", marginTop: "0.25rem", letterSpacing: "0.1em" }}>chains</div>
      </div>
    </div>
  );
}

function SwipeableLeaderboard({ todayEntries, allTimeEntries, playerRank, playerRankAllTime, playerTime, playerBestTime, playerStars }) {
  const [activeTab, setActiveTab] = useState(0);
  const touchRef = useRef({ startX: 0, startY: 0 });
  const entries = activeTab === 0 ? todayEntries : allTimeEntries;
  const rank = activeTab === 0 ? playerRank : playerRankAllTime;
  const time = activeTab === 0 ? playerTime : (playerBestTime || playerTime);

  const handleTouchStart = useCallback((e) => { touchRef.current.startX = e.touches[0].clientX; touchRef.current.startY = e.touches[0].clientY; }, []);
  const handleTouchEnd = useCallback((e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    const dy = e.changedTouches[0].clientY - touchRef.current.startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) { if (dx < 0) setActiveTab(t => Math.min(1, t + 1)); else setActiveTab(t => Math.max(0, t - 1)); }
  }, []);

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", marginBottom: "0.5rem", background: "#F3F4F6", borderRadius: "10px", padding: "3px" }}>
        {["Today", "All Time"].map((label, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            flex: 1, padding: "0.4rem", border: "none", borderRadius: "8px", fontSize: "0.7rem", fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            background: activeTab === i ? "#FFFFFF" : "transparent", color: activeTab === i ? "#1F2937" : "#9CA3AF",
            boxShadow: activeTab === i ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s ease",
          }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "0.4rem" }}>
        {[0, 1].map(i => <div key={i} style={{ width: activeTab === i ? "12px" : "5px", height: "3px", borderRadius: "2px", background: activeTab === i ? "#D97706" : "#E5E7EB", transition: "all 0.3s ease" }} />)}
      </div>
      <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden", flex: 1 }}>
        {entries.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "#9CA3AF", fontSize: "0.8rem" }}>No scores yet — you&apos;re the pioneer! 🚀</div>
        )}
        {entries.map((entry, i) => {
          const rankColors = { 1: "#F59E0B", 2: "#9CA3AF", 3: "#CD7F32" }; const isTop3 = entry.rank <= 3;
          return (
            <div key={`${activeTab}-${i}`} style={{
              display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.75rem",
              borderBottom: "1px solid #F3F4F6", opacity: 0, animation: "fadeSlideIn 0.25s ease forwards", animationDelay: `${i * 30}ms`,
            }}>
              <div style={{ width: "22px", flexShrink: 0, textAlign: "center", fontSize: "0.65rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: isTop3 ? rankColors[entry.rank] : "#9CA3AF" }}>{entry.rank}</div>
              <div style={{ fontSize: "0.9rem", flexShrink: 0 }}>{entry.country}</div>
              <div style={{ flex: 1, fontSize: "0.78rem", fontWeight: 500, color: "#1F2937", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name}</div>
              <StarIcons count={entry.stars} size={10} />
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{formatTime(entry.time).display}</div>
            </div>
          );
        })}
        {rank > 10 && (
          <>
            <div style={{ textAlign: "center", fontSize: "0.6rem", color: "#D1D5DB", padding: "0.15rem 0" }}>· · ·</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.75rem", background: "rgba(245, 158, 11, 0.06)" }}>
              <div style={{ width: "22px", flexShrink: 0, textAlign: "center", fontSize: "0.65rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#D97706" }}>{rank}</div>
              <div style={{ fontSize: "0.9rem", flexShrink: 0 }}>⚡</div>
              <div style={{ flex: 1, fontSize: "0.78rem", fontWeight: 700, color: "#D97706", fontFamily: "'DM Sans', sans-serif" }}>You</div>
              <StarIcons count={playerStars} size={10} />
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#D97706", fontFamily: "'JetBrains Mono', monospace" }}>{formatTime(time).display}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ShareIcons() {
  const c = "#6B7280";
  const platforms = [
    { name: "Instagram", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill={c} stroke="none"/></svg> },
    { name: "WhatsApp", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill={c}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
    { name: "X", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { name: "World Chat", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
      {platforms.map(p => (
        <button key={p.name} style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#F9FAFB", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.background = "#F3F4F6"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "#F9FAFB"; }}
          title={p.name}>{p.icon}</button>
      ))}
    </div>
  );
}

function DashboardScreen({ playerTime, playerStars, puzzle }) {
  const [show, setShow] = useState(false);
  const [stats, setStats] = useState(null);
  const [todayLB, setTodayLB] = useState([]);
  const [allTimeLB, setAllTimeLB] = useState([]);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
    // Fetch real data from our API
    const pid = getPlayerId();
    fetch(`/api/player?id=${pid}`).then(r => r.json()).then(setStats).catch(() => {});
    fetch("/api/leaderboard?type=today").then(r => r.json()).then(d => setTodayLB(d.leaderboard || [])).catch(() => {});
    fetch("/api/leaderboard?type=alltime").then(r => r.json()).then(d => setAllTimeLB(d.leaderboard || [])).catch(() => {});
  }, []);

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{
        width: "100%", maxWidth: "440px", margin: "0 auto", padding: "1.25rem 1rem 1rem 1rem",
        height: "100dvh", display: "flex", flexDirection: "column",
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "1rem", flexShrink: 0 }}>
          <div style={{ fontSize: "0.65rem", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
            {new Date(puzzle.date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>
        <div style={{ flexShrink: 0, marginBottom: "1rem" }}>
          <ScoreCard playerTime={playerTime} playerStars={playerStars} stats={stats} />
        </div>
        <SwipeableLeaderboard
          todayEntries={todayLB} allTimeEntries={allTimeLB}
          playerRank={stats?.rankToday || 0} playerRankAllTime={stats?.rankAllTime || 0}
          playerTime={playerTime} playerBestTime={stats?.bestTime} playerStars={playerStars}
        />
        <div style={{ flexShrink: 0, paddingTop: "0.75rem" }}>
          <ShareIcons />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP ROOT — Fetches puzzle from API, runs the game, submits scores
// ============================================================
const SCREENS = { LOADING: "loading", ERROR: "error", INTRO: "intro", REVEAL: "reveal", PLAYING: "playing", COMPLETE: "complete", DASHBOARD: "dashboard" };

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
  const timer = useTimer();

  // Fetch today's puzzle on mount
  useEffect(() => {
    fetch("/api/puzzle")
      .then(r => { if (!r.ok) throw new Error("No puzzle"); return r.json(); })
      .then(data => {
        setPuzzle(data.puzzle);
        setAnswerOrder(data.answerOrder);
        setYearMap(data.yearMap);
        setScreen(SCREENS.INTRO);
      })
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
    setEvents(shuffleArray(evts));
    setScreen(SCREENS.PLAYING);
    timer.start();
  }, [timer, puzzle, yearMap]);

  const handleReorder = useCallback((newEvents) => setEvents(newEvents), []);

  const handleLockIn = () => {
    const newAttempts = attempts + 1; setAttempts(newAttempts);
    const newLocked = { ...lockedCorrect }; const newWrong = {};
    // Check each event against the correct order
    events.forEach((ev, i) => {
      if (lockedCorrect[ev.id]) return;
      if (ev.id === answerOrder[i]) newLocked[ev.id] = true;
      else newWrong[ev.id] = true;
    });
    setLockedCorrect(newLocked); setWrongCards(newWrong);
    setTimeout(() => setWrongCards({}), 800);

    // All 7 correct!
    if (Object.keys(newLocked).length === 7) {
      timer.stop();
      // Submit score to backend
      if (!scoreSubmitted) {
        setScoreSubmitted(true);
        const stars = getStars(newAttempts);
        fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: getPlayerId(),
            date: puzzle.date,
            time: timer.time,
            attempts: newAttempts,
            stars,
          }),
        }).catch(() => {});
      }
      setTimeout(() => setScreen(SCREENS.COMPLETE), 1200);
    }
  };

  const handleViewDashboard = () => setScreen(SCREENS.DASHBOARD);
  const { display: timeDisplay } = formatTime(timer.time);
  const stars = getStars(attempts);

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100dvh", color: "#1F2937", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
      <style>{globalStyles}</style>

      {screen === SCREENS.LOADING && <LoadingScreen />}
      {screen === SCREENS.ERROR && <ErrorScreen />}
      {screen === SCREENS.INTRO && puzzle && <IntroScreen puzzle={puzzle} onStart={handleStart} />}
      {screen === SCREENS.REVEAL && <RevealScreen events={revealEvents} onRevealComplete={handleRevealComplete} />}
      {screen === SCREENS.PLAYING && (
        <PlayingScreen events={events} lockedCorrect={lockedCorrect} wrongCards={wrongCards}
          onReorder={handleReorder} onLockIn={handleLockIn} timeDisplay={timeDisplay} />
      )}
      {screen === SCREENS.COMPLETE && <CompleteScreen time={timer.time} attempts={attempts} puzzle={puzzle} onViewDashboard={handleViewDashboard} />}
      {screen === SCREENS.DASHBOARD && <DashboardScreen playerTime={timer.time} playerStars={stars} puzzle={puzzle} />}
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================
const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
  body { background: #FFFFFF; margin: 0; overflow: hidden; }
  html { overflow: hidden; }
  ::-webkit-scrollbar { display: none; }

  @keyframes shimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes starPop { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.5); opacity: 1; } 75% { transform: scale(0.9); } 100% { transform: scale(1.15); opacity: 1; } }
  @keyframes fadeSlideIn { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
`;
