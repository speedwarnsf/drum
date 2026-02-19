"use client";

import React, { useState, useEffect } from "react";
import Shell from "../_ui/Shell";
import PatternBrowser from "../_ui/PatternBrowser";
import { Icon } from "../_ui/Icon";
import { loadProfile, Profile } from "../_lib/drumMvp";
import { type DrumPattern } from "../_lib/patternLibrary";

export default function PatternsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completedPatterns, setCompletedPatterns] = useState<string[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<DrumPattern | null>(null);

  useEffect(() => {
    const userProfile = loadProfile();
    setProfile(userProfile);

    try {
      const saved = localStorage.getItem("drum_completed_patterns");
      if (saved) {
        setCompletedPatterns(JSON.parse(saved));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const handlePatternSelect = (pattern: DrumPattern) => {
    setSelectedPattern(pattern);
  };

  const handlePatternComplete = (patternId: string) => {
    const updated = [...completedPatterns, patternId];
    setCompletedPatterns(updated);
    try {
      localStorage.setItem("drum_completed_patterns", JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const getCurrentLevel = (): "beginner" | "intermediate" | "advanced" => {
    if (!profile) return "beginner";
    if (profile.level === "true_beginner") return "beginner";
    if (profile.level === "beginner") return "intermediate";
    return "advanced";
  };

  return (
    <Shell title="Pattern Library" subtitle="50+ grooves across 9 categories. Tap to explore.">
      <PatternBrowser
        onPatternSelect={handlePatternSelect}
        currentLevel={getCurrentLevel()}
        completedPatterns={completedPatterns}
      />

      {selectedPattern && (
        <section className="card">
          <h2 className="card-title">Practice: {selectedPattern.name}</h2>
          <p className="sub">{selectedPattern.description}</p>

          <div className="pattern-detail-grid">
            <div>
              <div className="kicker">Practice Steps</div>
              <ol style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Start with metronome at {selectedPattern.bpm.min} BPM</li>
                <li>Practice syllables first: &quot;{selectedPattern.syllables}&quot;</li>
                <li>Add hands/feet slowly, focusing on coordination</li>
                <li>Gradually increase tempo to {selectedPattern.bpm.target} BPM</li>
                <li>Record yourself and listen for flams or timing issues</li>
              </ol>
            </div>

            <div>
              <div className="kicker">Success Criteria</div>
              <ul style={{ marginTop: 8 }}>
                <li>Can play cleanly at target tempo</li>
                <li>No flams between limbs</li>
                <li>Even volume and timing</li>
                <li>Can start and stop smoothly</li>
                <li>Feels comfortable and relaxed</li>
              </ul>

              {!completedPatterns.includes(selectedPattern.id) ? (
                <button
                  onClick={() => handlePatternComplete(selectedPattern.id)}
                  className="btn"
                  style={{ marginTop: 12 }}
                >
                  Mark as Completed ✓
                </button>
              ) : (
                <div className="meta" style={{ marginTop: 12 }}>
                  ✓ Completed
                </div>
              )}
            </div>
          </div>

          {selectedPattern.tips && selectedPattern.tips.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="kicker">Practice Tips</div>
              <ul style={{ marginTop: 8 }}>
                {selectedPattern.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Progress Stats */}
      <section className="card">
        <h2 className="card-title">Your Progress</h2>
        <div className="row" style={{ gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="meta">Total Patterns</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>50+</div>
          </div>
          <div>
            <div className="meta">Completed</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{completedPatterns.length}</div>
          </div>
          <div>
            <div className="meta">Your Level</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, textTransform: "capitalize" }}>{getCurrentLevel()}</div>
          </div>
          <div>
            <div className="meta">Progress</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
              {Math.round((completedPatterns.length / 50) * 100)}%
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="card">
        <h2 className="card-title">Recommended Learning Path</h2>
        <div className="grid">
          <article className="card" style={{ background: "var(--panel-deep)" }}>
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="target" size={16} /> Start Here
            </h3>
            <p className="sub">Essential foundation patterns</p>
            <ul style={{ marginTop: 8 }}>
              <li>Quarter Notes</li>
              <li>Eighth Notes</li>
              <li>Basic Rock Beat</li>
            </ul>
          </article>
          <article className="card" style={{ background: "var(--panel-deep)" }}>
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="arrowUp" size={16} /> Next Level
            </h3>
            <p className="sub">Build coordination and feel</p>
            <ul style={{ marginTop: 8 }}>
              <li>Rock with Hi-Hat</li>
              <li>Single Stroke Roll</li>
              <li>Basic Funk</li>
            </ul>
          </article>
          <article className="card" style={{ background: "var(--panel-deep)" }}>
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="star" size={16} /> Advanced
            </h3>
            <p className="sub">Complex grooves and styles</p>
            <ul style={{ marginTop: 8 }}>
              <li>Jazz Swing</li>
              <li>Linear Fills</li>
              <li>Ghost Note Funk</li>
            </ul>
          </article>
        </div>
      </section>
    </Shell>
  );
}
