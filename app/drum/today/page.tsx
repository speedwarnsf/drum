"use client";

import React, { useEffect, useMemo, useState } from "react";
import Shell from "../_ui/Shell";
import {
  buildTodaysPlan,
  loadProfile,
  PracticePlan,
  Profile,
} from "../_lib/drumMvp";

export default function DrumTodayPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeBlock, setActiveBlock] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      window.location.href = "/drum/start";
      return;
    }
    setProfile(p);
  }, []);

  const plan: PracticePlan | null = useMemo(() => {
    if (!profile) return null;
    return buildTodaysPlan(profile);
  }, [profile]);

  if (!plan) return null;

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) {
      setIsRunning(false);
      setIsComplete(true);
      return;
    }
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, secondsLeft]);

  const startTimer = (blockIndex: number, minutesText: string) => {
    const minutes = parseMinutes(minutesText);
    if (!minutes) return;
    setActiveBlock(blockIndex);
    setSecondsLeft(Math.round(minutes * 60));
    setIsRunning(true);
    setIsComplete(false);
  };

  const toggleTimer = (blockIndex: number, minutesText: string) => {
    if (activeBlock !== blockIndex) {
      startTimer(blockIndex, minutesText);
      return;
    }
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    if (secondsLeft <= 0) {
      startTimer(blockIndex, minutesText);
      return;
    }
    setIsRunning(true);
  };

  return (
    <Shell
      title="Today's Practice Card"
      subtitle={`${plan.minutes} minutes • Metronome: ${plan.metronome} • Focus: ${plan.focus}`}
    >
      {isComplete ? (
        <div
          className="timer-flash"
          onClick={() => setIsComplete(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsComplete(false);
          }}
          aria-label="Timer complete. Click to dismiss."
        >
          <div className="timer-flash-inner">
            <div className="kicker">Time</div>
            <div className="timer-flash-title">Block Complete</div>
            <div className="timer-flash-sub">Click anywhere to continue.</div>
          </div>
        </div>
      ) : null}

      <section className="card">
        <p>{plan.contextLine}</p>
      </section>

      {plan.blocks.map((b, idx) => (
        <article key={idx} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h2 className="card-title">{b.title}</h2>
            <div className="meta">{b.time}</div>
          </div>

          <button
            type="button"
            className={`timer ${activeBlock === idx ? "timer-active" : ""}`}
            onClick={() => toggleTimer(idx, b.time)}
            aria-pressed={activeBlock === idx && isRunning}
          >
            <span className="timer-label">Tap to {activeBlock === idx && isRunning ? "pause" : "start"}</span>
            <span className="timer-readout">
              {formatTime(activeBlock === idx ? secondsLeft : parseMinutes(b.time) * 60)}
            </span>
            <span className="timer-state">
              {activeBlock === idx && isRunning ? "Running" : "Idle"}
            </span>
          </button>

          <ul style={{ marginTop: 0 }}>
            {b.bullets.map((x, i) => (
              <li key={i}>
                {x}
              </li>
            ))}
          </ul>

          {b.stop?.length ? (
            <div className="stop">
              <strong>Stop if:</strong> {b.stop.join(" ")}
            </div>
          ) : null}
        </article>
      ))}

      <article className="card">
        <h2 className="card-title">Reflection (30-60s)</h2>
        <ul style={{ marginTop: 0 }}>
          {plan.reflection.map((x, i) => (
            <li key={i}>
              {x}
            </li>
          ))}
        </ul>
        <div className="stop">
          <strong>Closure:</strong> {plan.closure}
        </div>

        <div className="row">
          <a href="/drum/journal" className="btn">
            Log today
          </a>
          <a href="/drum/start" className="btn btn-ghost">
            Edit setup
          </a>
        </div>
      </article>
    </Shell>
  );
}

function parseMinutes(text: string) {
  const match = text.match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
