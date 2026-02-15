"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ESSENTIAL_RUDIMENTS, Rudiment } from "../_lib/rudimentLibrary";
import {
  startActiveSession,
  endActiveSession,
  getActiveSession,
} from "../_lib/practiceTracker";
import { recordTempoProgress } from "../_lib/tempoGoals";
import EnhancedMetronome from "../_ui/EnhancedMetronome";
import PendulumMetronome from "../_ui/PendulumMetronome";
import RudimentNotation from "../_ui/RudimentNotation";

export default function FocusModePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rudimentId = searchParams.get("rudiment") || "single-stroke-roll";
  const rudiment = ESSENTIAL_RUDIMENTS[rudimentId];

  const [bpm, setBpm] = useState(rudiment?.pattern.suggestedTempo.target ?? 100);
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceSeconds, setPracticeSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [metronomeStyle, setMetronomeStyle] = useState<"pendulum" | "bounce">("pendulum");
  const [beat, setBeat] = useState(0);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    if (isPracticing) {
      timerRef.current = window.setInterval(() => {
        setPracticeSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPracticing]);

  // Beat counter synced to BPM
  useEffect(() => {
    if (!isPracticing) { setBeat(0); return; }
    const interval = (60 / bpm) * 1000;
    const id = window.setInterval(() => {
      setBeat(prev => (prev % 4) + 1);
    }, interval);
    return () => clearInterval(id);
  }, [isPracticing, bpm]);

  // Fullscreen API
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (isPracticing) handleStop();
        else handleStart();
      }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "Escape" && !document.fullscreenElement) router.back();
      if (e.key === "ArrowUp") setBpm(prev => Math.min(300, prev + 5));
      if (e.key === "ArrowDown") setBpm(prev => Math.max(30, prev - 5));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPracticing, toggleFullscreen, router]);

  const handleStart = () => {
    if (!rudiment) return;
    startActiveSession(rudiment.id, bpm);
    setIsPracticing(true);
    setPracticeSeconds(0);
  };

  const handleStop = () => {
    const entry = endActiveSession();
    setIsPracticing(false);
    if (entry) {
      recordTempoProgress(rudimentId, bpm);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!rudiment) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p>Rudiment not found.</p>
        <button className="btn" onClick={() => router.push("/drum/rudiments")}>
          Browse Rudiments
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
      }}
    >
      {/* Exit button */}
      <button
        onClick={() => {
          if (isPracticing) handleStop();
          router.back();
        }}
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          background: "none",
          border: "1px solid var(--stroke)",
          padding: "6px 12px",
          cursor: "pointer",
          fontSize: "0.85rem",
          fontWeight: 600,
        }}
      >
        Exit Focus
      </button>

      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "none",
          border: "1px solid var(--stroke)",
          padding: "6px 12px",
          cursor: "pointer",
          fontSize: "0.85rem",
        }}
      >
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>

      {/* Rudiment name */}
      <h1 style={{
        fontSize: "2rem",
        fontWeight: 800,
        textAlign: "center",
        margin: "0 0 4px",
      }}>
        {rudiment.name}
      </h1>

      {/* Sticking pattern */}
      <div style={{
        fontFamily: "monospace",
        fontSize: "1.8rem",
        fontWeight: 700,
        letterSpacing: 3,
        margin: "8px 0 20px",
        textAlign: "center",
      }}>
        {rudiment.pattern.stickingPattern.split("").map((char, i) => (
          <span
            key={i}
            style={{
              color: char === "R" || char === "r" ? "#c0392b"
                : char === "L" || char === "l" ? "#2980b9"
                : "var(--ink)",
              fontSize: char === char.toLowerCase() && char !== " " ? "1.1rem" : undefined,
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Notation */}
      <div style={{ width: "100%", maxWidth: 500, marginBottom: 20 }}>
        <RudimentNotation
          rudiment={rudiment}
          width={500}
          height={120}
          showPlayhead={isPracticing}
          currentBeat={beat}
        />
      </div>

      {/* Metronome visual */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
          <button
            className={`btn ${metronomeStyle === "pendulum" ? "" : "btn-ghost"}`}
            onClick={() => setMetronomeStyle("pendulum")}
            style={{ fontSize: "0.75rem", padding: "3px 8px" }}
          >
            Pendulum
          </button>
          <button
            className={`btn ${metronomeStyle === "bounce" ? "" : "btn-ghost"}`}
            onClick={() => setMetronomeStyle("bounce")}
            style={{ fontSize: "0.75rem", padding: "3px 8px" }}
          >
            Bounce
          </button>
        </div>
        <PendulumMetronome bpm={bpm} isPlaying={isPracticing} beat={beat} size="medium" />
      </div>

      {/* Timer */}
      <div style={{
        fontSize: "3rem",
        fontWeight: 800,
        fontFamily: "var(--font-dm-mono), monospace",
        margin: "8px 0",
      }}>
        {formatTime(practiceSeconds)}
      </div>

      {/* BPM display + controls */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "12px 0",
      }}>
        <button className="btn btn-ghost" onClick={() => setBpm(prev => Math.max(30, prev - 5))}>-5</button>
        <button className="btn btn-ghost" onClick={() => setBpm(prev => Math.max(30, prev - 1))}>-1</button>
        <span style={{ fontSize: "1.5rem", fontWeight: 700, minWidth: 80, textAlign: "center" }}>
          {bpm} BPM
        </span>
        <button className="btn btn-ghost" onClick={() => setBpm(prev => Math.min(300, prev + 1))}>+1</button>
        <button className="btn btn-ghost" onClick={() => setBpm(prev => Math.min(300, prev + 5))}>+5</button>
      </div>

      {/* Start/Stop */}
      <button
        className="btn"
        onClick={isPracticing ? handleStop : handleStart}
        style={{
          padding: "14px 48px",
          fontSize: "1.2rem",
          fontWeight: 700,
          marginTop: 16,
        }}
      >
        {isPracticing ? "Stop" : "Start Practice"}
      </button>

      {/* Keyboard shortcuts hint */}
      <div style={{
        position: "absolute",
        bottom: 16,
        fontSize: "0.7rem",
        color: "var(--ink-muted)",
        textAlign: "center",
      }}>
        Space: start/stop | F: fullscreen | Up/Down: BPM | Esc: exit
      </div>
    </div>
  );
}
