"use client";

import React, { useState, useEffect, use } from "react";
import Shell from "../../_ui/Shell";
import RudimentNotation from "../../_ui/RudimentNotation";
import EnhancedMetronome from "../../_ui/EnhancedMetronome";
import { ESSENTIAL_RUDIMENTS, Rudiment, RudimentProgression } from "../../_lib/rudimentLibrary";
import Link from "next/link";

export default function RudimentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [rudiment, setRudiment] = useState<Rudiment | null>(null);
  const [progression] = useState(() => new RudimentProgression());
  const [isCompleted, setIsCompleted] = useState(false);
  const [skillLevel, setSkillLevel] = useState(0);
  const [bpm, setBpm] = useState(80);

  useEffect(() => {
    const r = ESSENTIAL_RUDIMENTS[id];
    if (r) {
      setRudiment(r);
      setBpm(r.pattern.suggestedTempo.target);
      setIsCompleted(progression.isCompleted(r.id));
      setSkillLevel(progression.getSkillLevel(r.id));
    }
  }, [id, progression]);

  if (!rudiment) {
    return (
      <Shell title="Rudiment Not Found" subtitle="This rudiment doesn't exist">
        <section className="card">
          <p>Could not find rudiment with id &quot;{id}&quot;.</p>
          <Link href="/drum/rudiments" className="btn" style={{ marginTop: 12, display: "inline-block" }}>
            ← Browse All Rudiments
          </Link>
        </section>
      </Shell>
    );
  }

  const handleMarkCompleted = (level: number) => {
    progression.markCompleted(rudiment.id, level);
    setIsCompleted(true);
    setSkillLevel(level);
  };

  const prereqRudiments = rudiment.prerequisites
    .map(pid => ESSENTIAL_RUDIMENTS[pid])
    .filter(Boolean);

  const nextRudiments = rudiment.nextRudiments
    .map(nid => ESSENTIAL_RUDIMENTS[nid])
    .filter(Boolean);

  return (
    <Shell title={rudiment.name} subtitle={rudiment.pattern.description}>
      {/* Hero */}
      <div className="rudiment-detail-hero">
        <span className="category-badge">{rudiment.category}</span>
        <h1>{rudiment.name}</h1>
        <p style={{ color: "var(--text-muted)", margin: "4px 0 0" }}>{rudiment.pattern.description}</p>
        <div className="difficulty-stars" aria-label={`Difficulty: ${rudiment.pattern.difficulty} out of 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="difficulty-star">
              {i < rudiment.pattern.difficulty ? "★" : "☆"}
            </span>
          ))}
        </div>
        {isCompleted && (
          <div style={{ marginTop: 8, color: "var(--accent, #667eea)", fontWeight: 600 }}>
            ✓ Mastered (Skill Level {skillLevel}/5)
          </div>
        )}
      </div>

      {/* Key Info */}
      <div className="rudiment-info-grid">
        <div className="rudiment-info-item">
          <div className="info-label">Sticking</div>
          <div className="info-value" style={{ fontFamily: "monospace", fontSize: "1.2rem" }}>
            {rudiment.pattern.stickingPattern}
          </div>
        </div>
        <div className="rudiment-info-item">
          <div className="info-label">Tempo Range</div>
          <div className="info-value">
            {rudiment.pattern.suggestedTempo.min}–{rudiment.pattern.suggestedTempo.max}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Target: {rudiment.pattern.suggestedTempo.target} BPM
          </div>
        </div>
        <div className="rudiment-info-item">
          <div className="info-label">Time Signature</div>
          <div className="info-value">
            {rudiment.pattern.timeSignature[0]}/{rudiment.pattern.timeSignature[1]}
          </div>
        </div>
        <div className="rudiment-info-item">
          <div className="info-label">Difficulty</div>
          <div className="info-value">{rudiment.pattern.difficulty}/5</div>
        </div>
      </div>

      {/* Notation */}
      <section className="card">
        <h2 className="card-title">Notation</h2>
        <RudimentNotation
          rudiment={rudiment}
          showVariations={rudiment.variations.length > 0}
          interactive={false}
        />
      </section>

      {/* Practice Metronome */}
      <section className="card">
        <h2 className="card-title">Practice</h2>
        <p className="sub" style={{ marginBottom: 12 }}>
          Start at {rudiment.pattern.suggestedTempo.min} BPM, work up to {rudiment.pattern.suggestedTempo.max} BPM.
        </p>
        <EnhancedMetronome
          bpm={bpm}
          onBpmChange={setBpm}
          showGapControls={false}
          showTempoTrainer={true}
          showSoundOptions={true}
          showVisualPulse={true}
        />
      </section>

      {/* Tips & Mistakes */}
      <section className="card">
        <h2 className="card-title">Practice Guide</h2>
        <div className="rudiment-tips-grid">
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>💡 Practice Tips</h3>
            <ul className="rudiment-tip-list">
              {rudiment.practiceNotes.map((note, i) => (
                <li key={i} data-icon="✓">{note}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>Common Mistakes</h3>
            <ul className="rudiment-tip-list">
              {rudiment.commonMistakes.map((mistake, i) => (
                <li key={i} data-icon="✗">{mistake}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Mark Mastered */}
      {!isCompleted && (
        <section className="card" style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: 12 }}>Rate Your Mastery</h3>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                className="btn btn-ghost"
                onClick={() => handleMarkCompleted(level)}
                style={{ minWidth: 60 }}
              >
                {"★".repeat(level)}{"☆".repeat(5 - level)}
              </button>
            ))}
          </div>
          <p className="sub" style={{ marginTop: 8, fontSize: "0.8rem" }}>
            1 = just learning · 3 = comfortable · 5 = fully mastered
          </p>
        </section>
      )}

      {/* Prerequisites & Next */}
      {(prereqRudiments.length > 0 || nextRudiments.length > 0) && (
        <section className="card">
          <h2 className="card-title">Learning Path</h2>
          {prereqRudiments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Prerequisites</h3>
              <div className="rudiment-nav-links">
                {prereqRudiments.map(r => (
                  <Link key={r.id} href={`/drum/rudiments/${r.id}`}>
                    {progression.isCompleted(r.id) ? "✓ " : ""}{r.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {nextRudiments.length > 0 && (
            <div>
              <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Learn Next</h3>
              <div className="rudiment-nav-links">
                {nextRudiments.map(r => (
                  <Link key={r.id} href={`/drum/rudiments/${r.id}`}>
                    {r.name} →
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Navigation */}
      <section className="card">
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Link href="/drum/rudiments" className="btn btn-ghost">
            ← All Rudiments
          </Link>
          <Link href="/drum/practice-enhanced" className="btn">
            🎯 Practice Mode
          </Link>
        </div>
      </section>
    </Shell>
  );
}
