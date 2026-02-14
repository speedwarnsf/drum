"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Shell from "../_ui/Shell";
import { ErrorBoundary } from "../_ui/ErrorBoundary";

type WarmupStep = {
  title: string;
  description: string;
  duration: number; // seconds
  category: "stretch" | "grip" | "singles" | "dynamics" | "breath";
};

const WARMUP_ROUTINES: Record<string, { name: string; emoji: string; steps: WarmupStep[] }> = {
  quick: {
    name: "Quick (3 min)",
    emoji: "",
    steps: [
      { title: "Deep Breaths", description: "3 slow breaths. Shoulders drop on each exhale.", duration: 20, category: "breath" },
      { title: "Wrist Circles", description: "10 circles each direction, each hand. Keep loose.", duration: 30, category: "stretch" },
      { title: "Finger Stretches", description: "Spread fingers wide, hold 5 seconds, release. Repeat 3×.", duration: 20, category: "stretch" },
      { title: "Bird Grip Check", description: "Hold sticks like a small bird—secure, never squeezing. Feel the fulcrum.", duration: 15, category: "grip" },
      { title: "Slow Singles", description: "Alternating singles on pad, no metronome. Focus on matching volume L vs R.", duration: 45, category: "singles" },
      { title: "Accent Tap", description: "4 taps: LOUD-soft-soft-soft, each hand. Feel the rebound on soft taps.", duration: 40, category: "dynamics" },
    ],
  },
  standard: {
    name: "Standard (5 min)",
    emoji: "",
    steps: [
      { title: "Body Scan", description: "Sit on throne. Close eyes. Notice tension in shoulders, jaw, hands. Release it.", duration: 20, category: "breath" },
      { title: "Shoulder Rolls", description: "5 forward, 5 backward. Big, slow circles.", duration: 20, category: "stretch" },
      { title: "Wrist Circles", description: "10 circles each direction per hand.", duration: 25, category: "stretch" },
      { title: "Finger Stretches", description: "Spread, hold 5s, release. Then make a fist, hold 5s, release. 3× each.", duration: 25, category: "stretch" },
      { title: "Grip Reset", description: "Drop sticks, pick them up fresh. Find the fulcrum point. Tap gently—feel the bounce.", duration: 20, category: "grip" },
      { title: "Free Singles", description: "Alternating hands, no click. Match volume. Say 'Du' on each hit.", duration: 40, category: "singles" },
      { title: "Controlled Singles @ 50 BPM", description: "Turn on metronome at 50. One hit per click, alternating. Land with the click.", duration: 45, category: "singles" },
      { title: "Accent Patterns", description: "LOUD-soft-soft-soft per hand. Then LOUD-soft-LOUD-soft. Feel dynamic control.", duration: 35, category: "dynamics" },
      { title: "Double Bounce", description: "Let stick bounce twice naturally per stroke. Don't force the second hit.", duration: 30, category: "dynamics" },
    ],
  },
  deep: {
    name: "Deep (8 min)",
    emoji: "",
    steps: [
      { title: "Breath Work", description: "4 counts inhale, 4 counts hold, 4 counts exhale. 3 cycles. Center yourself.", duration: 40, category: "breath" },
      { title: "Body Scan", description: "Head to toe: release tension in jaw, neck, shoulders, arms, wrists, fingers.", duration: 30, category: "breath" },
      { title: "Shoulder & Neck", description: "Ear to shoulder, hold 10s each side. Shoulder rolls 5× each direction.", duration: 30, category: "stretch" },
      { title: "Wrist Circles", description: "10 circles each direction, each hand. Slow and deliberate.", duration: 25, category: "stretch" },
      { title: "Finger Independence", description: "Tap each finger to thumb, L then R. Speed up gradually.", duration: 25, category: "stretch" },
      { title: "Grip Calibration", description: "Hold stick at balance point. Tap gently. Find where it bounces most freely.", duration: 20, category: "grip" },
      { title: "Rebound Test", description: "Drop stick from 6 inches onto pad. Let it bounce without gripping. Count bounces.", duration: 20, category: "grip" },
      { title: "Free Singles", description: "No click. Alternating. Match volume perfectly. Close your eyes—listen.", duration: 40, category: "singles" },
      { title: "Metered Singles @ 50", description: "Metronome at 50 BPM. One per click. Say 'Du'. Zero flams.", duration: 40, category: "singles" },
      { title: "Accents", description: "LOUD-soft-soft-soft per hand, then switch to LOUD-soft-LOUD-soft.", duration: 30, category: "dynamics" },
      { title: "Double Strokes", description: "RR-LL-RR-LL. Bounce the second stroke—don't muscle it.", duration: 35, category: "dynamics" },
      { title: "Paradiddle Warm", description: "RLRR LRLL very slowly. Accent the first note of each group.", duration: 35, category: "dynamics" },
      { title: "Descending Volume", description: "Play 8 hits, starting f and ending pp. Then reverse. Feel the gradient.", duration: 30, category: "dynamics" },
      { title: "Quick Breath", description: "One final deep breath. Shoulders down. You're ready.", duration: 15, category: "breath" },
    ],
  },
};

export default function WarmupPage() {
  return (
    <ErrorBoundary>
      <WarmupPageInner />
    </ErrorBoundary>
  );
}

function WarmupPageInner() {
  const [selectedRoutine, setSelectedRoutine] = useState<string>("standard");
  const [currentStep, setCurrentStep] = useState(-1); // -1 = not started
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const audioRef = useRef<AudioContext | null>(null);

  const routine = WARMUP_ROUTINES[selectedRoutine];
  const totalDuration = routine.steps.reduce((sum, s) => sum + s.duration, 0);

  // Timer
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Play completion sound
          playTone(880, 0.15);
          return 0;
        }
        // Play tick at 3, 2, 1
        if (prev <= 4 && prev > 1) {
          playTone(440, 0.05);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Auto-advance when timer hits 0
  useEffect(() => {
    if (isRunning && timeLeft === 0 && currentStep >= 0) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      // Auto advance after brief pause
      const timeout = setTimeout(() => {
        if (currentStep < routine.steps.length - 1) {
          const next = currentStep + 1;
          setCurrentStep(next);
          setTimeLeft(routine.steps[next].duration);
        } else {
          // Done!
          setIsRunning(false);
          playTone(523, 0.3); // Completion tone
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isRunning, timeLeft, currentStep, routine.steps]);

  function playTone(freq: number, dur: number) {
    try {
      if (!audioRef.current) {
        audioRef.current = new AudioContext();
      }
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {}
  }

  function startWarmup() {
    setCurrentStep(0);
    setTimeLeft(routine.steps[0].duration);
    setIsRunning(true);
    setCompletedSteps(new Set());
  }

  function skipStep() {
    if (currentStep >= 0) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
    }
    if (currentStep < routine.steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setTimeLeft(routine.steps[next].duration);
    } else {
      setIsRunning(false);
    }
  }

  function stopWarmup() {
    setIsRunning(false);
    setCurrentStep(-1);
    setTimeLeft(0);
    setCompletedSteps(new Set());
  }

  const allDone = completedSteps.size === routine.steps.length;

  return (
    <Shell
      title="Warm-Up"
      subtitle={`${routine.name} · ${Math.ceil(totalDuration / 60)} minutes`}
    >
      {/* Routine Selector */}
      <section className="card">
        <h3 className="card-title">Choose Routine</h3>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {Object.entries(WARMUP_ROUTINES).map(([key, r]) => (
            <button
              key={key}
              className={`btn ${selectedRoutine === key ? "" : "btn-ghost"}`}
              onClick={() => {
                if (!isRunning) {
                  setSelectedRoutine(key);
                  setCurrentStep(-1);
                  setCompletedSteps(new Set());
                }
              }}
              disabled={isRunning}
            >
              {r.emoji} {r.name}
            </button>
          ))}
        </div>
      </section>

      {/* Timer Display */}
      {isRunning && currentStep >= 0 && (
        <section className="card" style={{
          background: "linear-gradient(135deg, var(--ink, #3c3c3c) 0%, var(--ink-muted, #5a5040) 100%)",
          color: "var(--bg, #f4ba34)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: 8 }}>
            Step {currentStep + 1} of {routine.steps.length}
          </div>
          <h2 style={{ fontSize: "1.3rem", margin: "0 0 8px" }}>
            {routine.steps[currentStep].title}
          </h2>
          <p style={{ fontSize: "0.9rem", opacity: 0.9, margin: "0 0 16px" }}>
            {routine.steps[currentStep].description}
          </p>
          <div style={{ fontSize: "3rem", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
            {timeLeft}s
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
            <button className="btn" style={{ background: "var(--surface-warm, #e8c87a)", color: "#3a3a3a" }} onClick={skipStep}>
              Skip →
            </button>
            <button className="btn" style={{ background: "var(--surface-warm, #e8c87a)", color: "#3a3a3a" }} onClick={stopWarmup}>
              Stop
            </button>
          </div>
        </section>
      )}

      {/* Completion */}
      {allDone && !isRunning && (
        <section className="card" style={{
          background: "var(--surface-warm, #deb760)",
          color: "#3a3a3a",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "2rem", margin: "0 0 8px" }}>Done</p>
          <h2 className="card-title" style={{ color: "#3a3a3a" }}>Warm-Up Complete!</h2>
          <p style={{ opacity: 0.9 }}>Your hands and mind are ready. Go practice.</p>
          <div style={{ marginTop: 16 }}>
            <a href="/drum/today" className="btn" style={{ background: "var(--surface-warm, #e8c87a)", color: "#3a3a3a" }}>
              Start Practice →
            </a>
          </div>
        </section>
      )}

      {/* Start Button */}
      {!isRunning && !allDone && (
        <section className="card" style={{ textAlign: "center" }}>
          <button className="btn" onClick={startWarmup} style={{ padding: "14px 32px", fontSize: "1.1rem" }}>
            ▶ Start Warm-Up
          </button>
        </section>
      )}

      {/* Step List */}
      <section className="card">
        <h3 className="card-title">Routine Steps</h3>
        <div className="warmup-routine">
          {routine.steps.map((step, i) => {
            const isDone = completedSteps.has(i);
            const isActive = isRunning && currentStep === i;
            return (
              <div
                key={i}
                className={`warmup-step ${isActive ? "warmup-step-active" : ""} ${isDone ? "warmup-step-done" : ""}`}
              >
                <div className="warmup-step-number">
                  {isDone ? "✓" : i + 1}
                </div>
                <div className="warmup-step-content">
                  <div className="warmup-step-title">{step.title}</div>
                  <div className="warmup-step-desc">{step.description}</div>
                  <div className="warmup-step-time">{step.duration}s</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Warm Up */}
      <section className="card">
        <h3 className="card-title">Why Warm Up?</h3>
        <ul>
          <li><strong>Injury Prevention:</strong> Cold muscles and tendons are more prone to strain</li>
          <li><strong>Better Technique:</strong> Warm hands = better rebound control and grip sensitivity</li>
          <li><strong>Mental Focus:</strong> The warm-up transitions your mind from daily noise to practice mode</li>
          <li><strong>Consistent Sound:</strong> A warmed-up drummer produces more even dynamics from beat 1</li>
        </ul>
      </section>

      <section className="card">
        <div className="row">
          <a href="/drum/today" className="btn btn-ghost">← Practice</a>
          <a href="/drum/drills" className="btn btn-ghost">Drills</a>
        </div>
      </section>
    </Shell>
  );
}
