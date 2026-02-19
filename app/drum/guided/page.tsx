"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Shell from "../_ui/Shell";
import {
  GuidedSessionTemplate,
  GuidedStep,
  GUIDED_SESSIONS,
} from "../_lib/community";
import { recordPractice } from "../_lib/practiceTracker";
import { DrumAudioEngine, ClickSound } from "../_lib/audioEngine";

type SessionState = "select" | "playing" | "complete";

export default function GuidedPage() {
  const [state, setState] = useState<SessionState>("select");
  const [template, setTemplate] = useState<GuidedSessionTemplate | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepElapsed, setStepElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState<ClickSound>("classic");
  const audioRef = useRef<DrumAudioEngine | null>(null);
  const timerRef = useRef<number | null>(null);

  const currentStep = template?.steps[stepIndex] ?? null;

  // Timer
  useEffect(() => {
    if (state !== "playing" || paused) return;

    timerRef.current = window.setInterval(() => {
      setStepElapsed(prev => {
        const next = prev + 1;
        if (currentStep && next >= currentStep.durationSeconds) {
          advanceStep();
          return 0;
        }
        return next;
      });
      setTotalElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, paused, stepIndex, currentStep]);

  // Metronome for practice steps
  useEffect(() => {
    if (state !== "playing" || paused || !currentStep) return;

    if (currentStep.type === "practice" && currentStep.targetBpm) {
      const engine = new DrumAudioEngine({ clickSound: sound, volume: 0.6 });
      audioRef.current = engine;
      engine.initialize().then(() => {
        engine.start(currentStep.targetBpm!);
      });
      return () => { engine.stop(); };
    } else {
      // Rest step - no metronome
      if (audioRef.current) { audioRef.current.stop(); audioRef.current = null; }
    }
  }, [state, paused, stepIndex, currentStep, sound]);

  const advanceStep = useCallback(() => {
    if (!template) return;

    // Record practice for completed step
    const step = template.steps[stepIndex];
    if (step?.type === "practice" && step.rudimentId) {
      recordPractice({
        rudimentId: step.rudimentId,
        date: new Date().toISOString().slice(0, 10),
        durationSeconds: step.durationSeconds,
        bpm: step.targetBpm || 80,
      });
    }

    if (stepIndex + 1 < template.steps.length) {
      setStepIndex(stepIndex + 1);
      setStepElapsed(0);
    } else {
      // Session complete
      if (audioRef.current) audioRef.current.stop();
      setState("complete");
    }
  }, [template, stepIndex]);

  const handleStart = useCallback((t: GuidedSessionTemplate) => {
    setTemplate(t);
    setStepIndex(0);
    setStepElapsed(0);
    setTotalElapsed(0);
    setPaused(false);
    setState("playing");
  }, []);

  const handlePause = useCallback(() => {
    setPaused(p => {
      if (!p && audioRef.current) audioRef.current.stop();
      return !p;
    });
  }, []);

  const handleQuit = useCallback(() => {
    if (audioRef.current) audioRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setState("select");
  }, []);

  const handleSkipStep = useCallback(() => {
    advanceStep();
  }, [advanceStep]);

  const totalSessionSeconds = template?.steps.reduce((a, s) => a + s.durationSeconds, 0) || 0;

  return (
    <Shell title="Practice With Me" subtitle="Guided drumming sessions">
      {/* Select */}
      {state === "select" && (
        <>
          <section className="card">
            <p className="sub">
              Choose a timed session. The app walks you through rudiments with rest breaks
              and plays the metronome at the right tempo for each exercise.
            </p>
          </section>

          {/* Sound selector */}
          <section className="card">
            <label className="sub" style={{ display: "block", marginBottom: 8 }}>Metronome Sound</label>
            <select
              className="sound-select"
              value={sound}
              onChange={(e) => setSound(e.target.value as ClickSound)}
            >
              <option value="classic">Classic Click</option>
              <option value="woodblock">Wood Block</option>
              <option value="hihat">Hi-Hat</option>
              <option value="rim">Rim Click</option>
              <option value="cowbell">Cowbell</option>
              <option value="digital">Digital</option>
            </select>
          </section>

          {GUIDED_SESSIONS.map((session) => (
            <section key={session.id} className="card">
              <h2 className="card-title">{session.name}</h2>
              <p className="sub">{session.durationMinutes} minutes</p>
              <div className="guided-steps-preview">
                {session.steps.map((step, i) => (
                  <span key={i} className={`guided-step-tag ${step.type}`}>
                    {step.type === "practice" ? step.rudimentName : "Rest"}
                    {" "}({Math.floor(step.durationSeconds / 60)}:{(step.durationSeconds % 60).toString().padStart(2, "0")})
                  </span>
                ))}
              </div>
              <button className="btn" style={{ marginTop: 12 }} onClick={() => handleStart(session)}>
                Start Session
              </button>
            </section>
          ))}
        </>
      )}

      {/* Playing */}
      {state === "playing" && template && currentStep && (
        <>
          {/* Overall progress */}
          <section className="card">
            <div className="guided-overall">
              <span className="sub">{template.name}</span>
              <span className="sub">
                {Math.floor(totalElapsed / 60)}:{(totalElapsed % 60).toString().padStart(2, "0")}
                {" / "}
                {Math.floor(totalSessionSeconds / 60)}:{(totalSessionSeconds % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="challenge-progress-bar">
              <div
                className="challenge-progress-fill"
                style={{ width: `${Math.min(100, (totalElapsed / totalSessionSeconds) * 100)}%` }}
              />
            </div>
            <div className="guided-step-indicator">
              Step {stepIndex + 1} of {template.steps.length}
            </div>
          </section>

          {/* Current step */}
          <section className={`card guided-active-step ${currentStep.type}`}>
            <div className="guided-step-type">
              {currentStep.type === "practice" ? "PRACTICE" : "REST"}
            </div>
            {currentStep.type === "practice" && (
              <>
                <h2 className="card-title" style={{ marginTop: 8 }}>
                  {currentStep.rudimentName}
                </h2>
                <div className="guided-bpm">{currentStep.targetBpm} BPM</div>
              </>
            )}
            <p style={{ margin: "12px 0" }}>{currentStep.instruction}</p>
            <div className="challenge-timer">
              <span className="challenge-elapsed">{stepElapsed}s</span>
              <span className="challenge-target"> / {currentStep.durationSeconds}s</span>
            </div>
            <div className="challenge-progress-bar" style={{ marginTop: 8 }}>
              <div
                className="challenge-progress-fill"
                style={{ width: `${Math.min(100, (stepElapsed / currentStep.durationSeconds) * 100)}%` }}
              />
            </div>
          </section>

          {/* Controls */}
          <section className="card">
            <div className="row" style={{ justifyContent: "center", gap: 12 }}>
              <button className="btn" onClick={handlePause}>
                {paused ? "Resume" : "Pause"}
              </button>
              <button className="btn btn-ghost" onClick={handleSkipStep}>
                Skip
              </button>
              <button className="btn btn-ghost" onClick={handleQuit}>
                Quit
              </button>
            </div>
          </section>

          {/* Up next */}
          {stepIndex + 1 < template.steps.length && (
            <section className="card" style={{ opacity: 0.7 }}>
              <div className="sub">Up next:</div>
              <strong>
                {template.steps[stepIndex + 1].type === "practice"
                  ? template.steps[stepIndex + 1].rudimentName
                  : "Rest Break"
                }
              </strong>
            </section>
          )}
        </>
      )}

      {/* Complete */}
      {state === "complete" && template && (
        <section className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
          <h2 className="card-title">Session Complete</h2>
          <p className="sub">{template.name} -- {template.durationMinutes} minutes</p>
          <p style={{ marginTop: 12 }}>
            Total time: {Math.floor(totalElapsed / 60)}:{(totalElapsed % 60).toString().padStart(2, "0")}
          </p>
          <div className="row" style={{ marginTop: 20, justifyContent: "center" }}>
            <button className="btn" onClick={() => handleStart(template)}>
              Do It Again
            </button>
            <a href="/drum/community" className="btn btn-ghost">
              Community
            </a>
            <a href="/drum/progress" className="btn btn-ghost">
              Progress
            </a>
          </div>
        </section>
      )}

      <section className="card">
        <a href="/drum/community" className="btn btn-ghost">
          Back to Community
        </a>
      </section>
    </Shell>
  );
}
