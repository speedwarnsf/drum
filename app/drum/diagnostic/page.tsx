"use client";

import React, { useState, useCallback, useEffect } from "react";
import Shell from "../_ui/Shell";
import Recorder from "../_ui/Recorder";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { OfflineIndicator } from "../_ui/OfflineIndicator";
import { getModuleProgress } from "../_lib/drumMvp";

/**
 * Diagnostic Page - The "Hidden Coordination Flaw" Test
 * 
 * This is THE key exercise for Module 1. It helps students identify
 * whether their kick and snare are truly unified (Personal Drum Troupe)
 * or if they're producing flams (two sounds instead of one).
 * 
 * The test: Play kick + right hand together 20 times. Record. Listen.
 * Good = "Thud" (one unified sound)
 * Flam = "Ka-Thunk" (two separate attacks)
 */

type DiagnosticResult = "untested" | "clean" | "flam" | "unsure";

const EXERCISES = [
  {
    id: "kick-rh",
    title: "Kick + Right Hand",
    description: "Play your bass drum and right hand (on snare) at exactly the same moment.",
    count: 20,
    listenFor: "Does it sound like 'THUD' (one sound) or 'Ka-THUNK' (two sounds)?",
    goodSign: "THUD - One unified attack",
    badSign: "Ka-THUNK - Two separate sounds (flam)",
  },
  {
    id: "kick-lh",
    title: "Kick + Left Hand",
    description: "Same test with your left hand. Often the weaker coordination.",
    count: 20,
    listenFor: "Listen carefully - flams are often more noticeable on the non-dominant side.",
    goodSign: "THUD - Clean and unified",
    badSign: "Ka-THUNK - Timing is off",
  },
  {
    id: "snare-kick-2-4",
    title: "Snare on 2 & 4 with Kick",
    description: "Play a simple groove: kick on 1, snare on 2, kick on 3, snare on 4. Focus on 2 & 4.",
    count: 16,
    listenFor: "When snare and kick overlap, is it one sound or two?",
    goodSign: "Solid backbeat - unified attack",
    badSign: "Sloppy backbeat - snare drags or rushes",
  },
];

export default function DiagnosticPage() {
  return (
    <ErrorBoundary>
      <DiagnosticPageInner />
      <OfflineIndicator />
    </ErrorBoundary>
  );
}

function DiagnosticPageInner() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [results, setResults] = useState<Record<string, DiagnosticResult>>({});
  const [currentModule, setCurrentModule] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [hitCount, setHitCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    getModuleProgress().then((data) => {
      if (data) setCurrentModule(data.currentModule);
    });
  }, []);

  const exercise = EXERCISES[currentExercise];

  const handleResult = useCallback((result: DiagnosticResult) => {
    setResults((prev) => ({
      ...prev,
      [exercise.id]: result,
    }));
    
    if (currentExercise < EXERCISES.length - 1) {
      setCurrentExercise((prev) => prev + 1);
      setHitCount(0);
      setIsPlaying(false);
    } else {
      setShowResults(true);
    }
  }, [currentExercise, exercise.id]);

  const handleHit = useCallback(() => {
    if (hitCount < exercise.count) {
      setHitCount((prev) => prev + 1);
    }
  }, [hitCount, exercise.count]);

  const resetDiagnostic = useCallback(() => {
    setCurrentExercise(0);
    setResults({});
    setShowResults(false);
    setHitCount(0);
    setIsPlaying(false);
  }, []);

  const getOverallResult = () => {
    const resultValues = Object.values(results);
    const cleanCount = resultValues.filter((r) => r === "clean").length;
    const flamCount = resultValues.filter((r) => r === "flam").length;
    
    if (flamCount >= 2) return "needs-work";
    if (cleanCount === resultValues.length) return "excellent";
    if (flamCount === 1) return "minor-issue";
    return "unclear";
  };

  if (showResults) {
    const overall = getOverallResult();
    
    return (
      <Shell
        title="Diagnostic Results"
        subtitle="Your Personal Drum Troupe Assessment"
      >
        <section className="card">
          <div className="diagnostic-result-header">
            {overall === "excellent" && (
              <>
                <span className="diagnostic-result-emoji">🎯</span>
                <h2 className="card-title">Excellent Coordination!</h2>
                <p>Your limbs are working as ONE drummer. Your "Personal Drum Troupe" is unified.</p>
              </>
            )}
            {overall === "minor-issue" && (
              <>
                <span className="diagnostic-result-emoji">⚠️</span>
                <h2 className="card-title">Minor Coordination Issue</h2>
                <p>One area needs attention. Focus your practice on the exercise marked as "flam."</p>
              </>
            )}
            {overall === "needs-work" && (
              <>
                <span className="diagnostic-result-emoji">🔧</span>
                <h2 className="card-title">Hidden Coordination Flaw Detected</h2>
                <p>This is common! Most beginners have this. The good news: now you know what to fix.</p>
              </>
            )}
            {overall === "unclear" && (
              <>
                <span className="diagnostic-result-emoji">🤔</span>
                <h2 className="card-title">Results Unclear</h2>
                <p>If you're unsure, that's okay. Record again and listen more carefully.</p>
              </>
            )}
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Results by Exercise</h3>
          <ul className="diagnostic-results-list">
            {EXERCISES.map((ex) => (
              <li key={ex.id} className="diagnostic-result-item">
                <span className="diagnostic-result-icon">
                  {results[ex.id] === "clean" && "✅"}
                  {results[ex.id] === "flam" && "❌"}
                  {results[ex.id] === "unsure" && "❓"}
                  {!results[ex.id] && "⏭️"}
                </span>
                <span className="diagnostic-result-title">{ex.title}</span>
                <span className="diagnostic-result-status">
                  {results[ex.id] === "clean" && "Clean"}
                  {results[ex.id] === "flam" && "Flam detected"}
                  {results[ex.id] === "unsure" && "Unsure"}
                  {!results[ex.id] && "Skipped"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {(overall === "needs-work" || overall === "minor-issue") && (
          <section className="card diagnostic-prescription">
            <div className="kicker">Your Prescription</div>
            <h3 className="card-title">Fix the Hidden Flaw</h3>
            <ol>
              <li><strong>Isolate first:</strong> Practice kick alone for 2 minutes. Then snare alone for 2 minutes.</li>
              <li><strong>Super slow:</strong> Combine kick + hand at 40 BPM (absurdly slow). Listen for ONE sound.</li>
              <li><strong>Record constantly:</strong> You can't fix what you can't hear. Record every attempt.</li>
              <li><strong>Stop on flams:</strong> The moment you hear "Ka-THUNK," stop. Reset. Try again.</li>
            </ol>
            <p className="sub" style={{ marginTop: 12 }}>
              This is the #1 thing that separates clean drummers from sloppy ones. It's worth the time.
            </p>
          </section>
        )}

        <section className="card">
          <div className="row">
            <button className="btn" onClick={resetDiagnostic}>
              Run Diagnostic Again
            </button>
            <a href="/drum/today" className="btn btn-ghost">
              Back to Practice
            </a>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell
      title="Coordination Diagnostic"
      subtitle="Find your Hidden Flaw (if you have one)"
    >
      {/* Intro explanation */}
      <section className="card">
        <div className="kicker">The Personal Drum Troupe Test</div>
        <p>
          When all your limbs hit at the exact same moment, it sounds like ONE drummer.
          When they're off, you hear a "flam" — two attacks instead of one.
        </p>
        <p className="sub" style={{ marginTop: 8 }}>
          Most beginners have a hidden coordination flaw they can't feel but CAN hear.
          This diagnostic finds it.
        </p>
      </section>

      {/* Current Exercise */}
      <section className="card diagnostic-exercise">
        <div className="diagnostic-progress">
          <span className="diagnostic-progress-text">
            Exercise {currentExercise + 1} of {EXERCISES.length}
          </span>
          <div className="diagnostic-progress-bar">
            <div 
              className="diagnostic-progress-fill"
              style={{ width: `${((currentExercise + 1) / EXERCISES.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="card-title">{exercise.title}</h2>
        <p>{exercise.description}</p>

        {/* Hit Counter */}
        <div className="diagnostic-counter">
          <button
            type="button"
            className={`diagnostic-hit-btn ${isPlaying ? "diagnostic-hit-btn-active" : ""}`}
            onClick={() => {
              setIsPlaying(true);
              handleHit();
            }}
            disabled={hitCount >= exercise.count}
          >
            {hitCount >= exercise.count ? (
              <span>✓ Done</span>
            ) : (
              <>
                <span className="diagnostic-hit-count">{hitCount}</span>
                <span className="diagnostic-hit-label">/ {exercise.count}</span>
              </>
            )}
          </button>
          <p className="sub">Tap for each hit to track your count</p>
        </div>

        {/* Recording */}
        <Recorder
          sessionId={`diagnostic_${exercise.id}_${Date.now()}`}
          disabled={false}
          showHistory={false}
        />

        {/* Listen For */}
        <div className="diagnostic-listen">
          <div className="kicker">Listen For</div>
          <p>{exercise.listenFor}</p>
          <div className="diagnostic-outcomes">
            <div className="diagnostic-outcome diagnostic-outcome-good">
              <span className="diagnostic-outcome-icon">✓</span>
              <span>{exercise.goodSign}</span>
            </div>
            <div className="diagnostic-outcome diagnostic-outcome-bad">
              <span className="diagnostic-outcome-icon">✗</span>
              <span>{exercise.badSign}</span>
            </div>
          </div>
        </div>

        {/* Result Buttons */}
        <div className="diagnostic-verdict">
          <p className="diagnostic-verdict-prompt">What did you hear?</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <button
              className="btn diagnostic-verdict-btn diagnostic-verdict-clean"
              onClick={() => handleResult("clean")}
            >
              🎯 Clean (THUD)
            </button>
            <button
              className="btn diagnostic-verdict-btn diagnostic-verdict-flam"
              onClick={() => handleResult("flam")}
            >
              ⚠️ Flam (Ka-THUNK)
            </button>
            <button
              className="btn btn-ghost diagnostic-verdict-btn"
              onClick={() => handleResult("unsure")}
            >
              Not Sure
            </button>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="card">
        <h3 className="card-title">Tips for Accurate Diagnosis</h3>
        <ul>
          <li>Use headphones when listening back</li>
          <li>Close your eyes while listening — flams are easier to hear than feel</li>
          <li>If in doubt, it's probably a flam</li>
          <li>Don't feel bad about flams — they're normal and fixable</li>
        </ul>
      </section>

      {/* Navigation */}
      <section className="card">
        <div className="row">
          {currentExercise > 0 && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                setCurrentExercise((prev) => prev - 1);
                setHitCount(0);
                setIsPlaying(false);
              }}
            >
              ← Previous Exercise
            </button>
          )}
          <a href="/drum/today" className="btn btn-ghost">
            Back to Today
          </a>
        </div>
      </section>
    </Shell>
  );
}
