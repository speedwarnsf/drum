"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Shell from "../_ui/Shell";
import { Icon } from "../_ui/Icon";
import {
  Challenge,
  ChallengeResult,
  PRESET_CHALLENGES,
  loadChallengeResults,
  saveChallengeResult,
} from "../_lib/community";
import { DrumAudioEngine } from "../_lib/audioEngine";

type ChallengeState = "select" | "countdown" | "playing" | "result";

export default function ChallengePage() {
  const [state, setState] = useState<ChallengeState>("select");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [passed, setPassed] = useState(false);
  const [results, setResults] = useState<ChallengeResult[]>([]);
  const audioRef = useRef<DrumAudioEngine | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setResults(loadChallengeResults());
  }, []);

  const startChallenge = useCallback((challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setState("countdown");
    setCountdown(3);
    setElapsed(0);
  }, []);

  // Countdown
  useEffect(() => {
    if (state !== "countdown") return;
    if (countdown <= 0) {
      setState("playing");
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [state, countdown]);

  // Playing timer + metronome
  useEffect(() => {
    if (state !== "playing" || !selectedChallenge) return;

    // Start metronome
    const engine = new DrumAudioEngine({ clickSound: "classic", volume: 0.6 });
    audioRef.current = engine;
    engine.initialize().then(() => {
      engine.start(selectedChallenge.targetBpm);
    });

    // Timer
    const start = Date.now();
    timerRef.current = window.setInterval(() => {
      const sec = Math.floor((Date.now() - start) / 1000);
      setElapsed(sec);
      if (sec >= selectedChallenge.durationSeconds) {
        // Auto-pass
        handleComplete(true, selectedChallenge.durationSeconds);
      }
    }, 250);

    return () => {
      engine.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, selectedChallenge]);

  const handleComplete = useCallback((didPass: boolean, actualSec?: number) => {
    if (!selectedChallenge) return;
    if (audioRef.current) audioRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);

    setPassed(didPass);
    setState("result");

    const result: ChallengeResult = {
      challengeId: selectedChallenge.id,
      completedAt: new Date().toISOString(),
      passed: didPass,
      actualSeconds: actualSec ?? elapsed,
    };
    saveChallengeResult(result);
    setResults(loadChallengeResults());
  }, [selectedChallenge, elapsed]);

  const handleFail = useCallback(() => {
    handleComplete(false, elapsed);
  }, [handleComplete, elapsed]);

  const getPassCount = (challengeId: string) => {
    return results.filter(r => r.challengeId === challengeId && r.passed).length;
  };

  return (
    <Shell title="Challenge Mode" subtitle="Test your limits">
      {/* Select */}
      {state === "select" && (
        <>
          <section className="card">
            <p className="sub">
              Pick a challenge. The metronome plays at the target BPM.
              Keep up for the full duration to pass.
            </p>
          </section>
          {PRESET_CHALLENGES.map((c) => {
            const passes = getPassCount(c.id);
            return (
              <section key={c.id} className="card challenge-card">
                <div className="challenge-header">
                  <h3 className="card-title" style={{ margin: 0 }}>{c.rudimentName}</h3>
                  <span className="challenge-bpm">{c.targetBpm} BPM</span>
                </div>
                <p className="sub" style={{ margin: "8px 0" }}>{c.description}</p>
                <div className="challenge-meta">
                  <span>{c.durationSeconds}s</span>
                  {passes > 0 && <span className="challenge-pass-count">Passed {passes}x</span>}
                </div>
                <button className="btn" onClick={() => startChallenge(c)} style={{ marginTop: 12 }}>
                  Accept Challenge
                </button>
              </section>
            );
          })}
        </>
      )}

      {/* Countdown */}
      {state === "countdown" && selectedChallenge && (
        <section className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <h2 className="card-title">{selectedChallenge.rudimentName}</h2>
          <p className="sub">{selectedChallenge.targetBpm} BPM for {selectedChallenge.durationSeconds}s</p>
          <div className="challenge-countdown">{countdown > 0 ? countdown : "GO"}</div>
        </section>
      )}

      {/* Playing */}
      {state === "playing" && selectedChallenge && (
        <section className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
          <h2 className="card-title">{selectedChallenge.rudimentName}</h2>
          <div className="challenge-timer">
            <span className="challenge-elapsed">{elapsed}s</span>
            <span className="challenge-target"> / {selectedChallenge.durationSeconds}s</span>
          </div>
          <div className="challenge-progress-bar">
            <div
              className="challenge-progress-fill"
              style={{ width: `${Math.min(100, (elapsed / selectedChallenge.durationSeconds) * 100)}%` }}
            />
          </div>
          <p className="sub" style={{ marginTop: 16 }}>
            {selectedChallenge.targetBpm} BPM -- Keep going!
          </p>
          <button className="btn challenge-fail-btn" onClick={handleFail} style={{ marginTop: 24 }}>
            I Broke -- Failed
          </button>
        </section>
      )}

      {/* Result */}
      {state === "result" && selectedChallenge && (
        <section className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
          <div className={`challenge-result ${passed ? "challenge-passed" : "challenge-failed"}`}>
            {passed ? "PASSED" : "FAILED"}
          </div>
          <h2 className="card-title" style={{ marginTop: 12 }}>{selectedChallenge.rudimentName}</h2>
          <p className="sub">
            {passed
              ? `You held ${selectedChallenge.targetBpm} BPM for the full ${selectedChallenge.durationSeconds} seconds.`
              : `You made it to ${elapsed}s out of ${selectedChallenge.durationSeconds}s.`
            }
          </p>
          <div className="row" style={{ marginTop: 20, justifyContent: "center" }}>
            <button className="btn" onClick={() => startChallenge(selectedChallenge)}>
              Try Again
            </button>
            <button className="btn btn-ghost" onClick={() => setState("select")}>
              Back to Challenges
            </button>
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
