"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Pattern,
  PatternWithWeight,
  InterleavedSequence,
  PATTERN_LIBRARY,
  generateInterleavedSequence,
  advanceSequence,
  getCurrentAndNext,
  isSequenceComplete,
  filterPatterns,
  loadSessionLogs,
  saveSessionLog,
  getWeaknessReport,
} from "../_lib/interleaving";

/**
 * Shuffle Mode / Interleaved Practice Component
 * 
 * DESIRABLE DIFFICULTIES:
 * The stumbles during interleaved practice ARE the learning.
 * 
 * When you switch patterns, your brain must reconstruct the motor program.
 * This reconstruction—not the smooth repetition—is what builds durable skill.
 * 
 * Blocked practice feels better. Interleaved practice IS better.
 */

type ShuffleModeProps = {
  baseTempo?: number;
  onTempoChange?: (tempo: number) => void;
  onPatternChange?: (pattern: Pattern, tempoOffset: number) => void;
  onComplete?: () => void;
  compact?: boolean;
};

type Phase = "setup" | "active" | "rating" | "complete";

export default function ShuffleMode({
  baseTempo = 60,
  onTempoChange,
  onPatternChange,
  onComplete,
  compact = false,
}: ShuffleModeProps) {
  // Setup state
  const [selectedCategories, setSelectedCategories] = useState<Pattern["category"][]>([
    "rudiment",
  ]);
  const [mode, setMode] = useState<"random" | "weighted">("random");
  const [sequenceLength, setSequenceLength] = useState(8);
  const [tempoVariation, setTempoVariation] = useState(true);
  
  // Active state
  const [phase, setPhase] = useState<Phase>("setup");
  const [sequence, setSequence] = useState<InterleavedSequence | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Weakness report
  const [weaknessReport, setWeaknessReport] = useState<ReturnType<typeof getWeaknessReport>>([]);
  
  // Audio context for the metronome clicks
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Load weakness report on mount
  useEffect(() => {
    const logs = loadSessionLogs();
    const patterns = filterPatterns(PATTERN_LIBRARY, selectedCategories);
    setWeaknessReport(getWeaknessReport(patterns, logs));
  }, [selectedCategories]);
  
  const handleCategoryToggle = useCallback((category: Pattern["category"]) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // Don't allow empty selection
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  }, []);
  
  const startSequence = useCallback(() => {
    const patterns = filterPatterns(PATTERN_LIBRARY, selectedCategories);
    
    if (patterns.length === 0) {
      return;
    }
    
    const logs = loadSessionLogs();
    const newSequence = generateInterleavedSequence(patterns, logs, {
      sequenceLength,
      mode,
      tempoVariation,
    });
    
    setSequence(newSequence);
    setPhase("active");
    
    // Notify parent of first pattern
    const { current, tempoOffset } = getCurrentAndNext(newSequence);
    onPatternChange?.(current, tempoOffset);
    onTempoChange?.(baseTempo + tempoOffset);
  }, [selectedCategories, sequenceLength, mode, tempoVariation, baseTempo, onPatternChange, onTempoChange]);
  
  const handleRating = useCallback((rating: "smooth" | "okay" | "struggled") => {
    if (!sequence) return;
    
    const { current, tempoOffset } = getCurrentAndNext(sequence);
    
    // Save the log
    saveSessionLog({
      patternId: current.id,
      timestamp: new Date().toISOString(),
      rating,
      tempo: baseTempo + tempoOffset,
    });
    
    // Check if complete
    if (isSequenceComplete(sequence)) {
      setPhase("complete");
      onComplete?.();
      return;
    }
    
    // Advance to next
    const nextSequence = advanceSequence(sequence);
    setSequence(nextSequence);
    setPhase("active");
    
    // Notify parent of new pattern
    const next = getCurrentAndNext(nextSequence);
    onPatternChange?.(next.current, next.tempoOffset);
    onTempoChange?.(baseTempo + next.tempoOffset);
  }, [sequence, baseTempo, onPatternChange, onTempoChange, onComplete]);
  
  const resetToSetup = useCallback(() => {
    setSequence(null);
    setPhase("setup");
    
    // Refresh weakness report
    const logs = loadSessionLogs();
    const patterns = filterPatterns(PATTERN_LIBRARY, selectedCategories);
    setWeaknessReport(getWeaknessReport(patterns, logs));
  }, [selectedCategories]);
  
  // Cleanup audio context
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);
  
  // Setup phase
  if (phase === "setup") {
    return (
      <div className={`shuffle-mode ${compact ? "shuffle-mode-compact" : ""}`}>
        <div className="shuffle-header">
          <div className="shuffle-title">
            <span className="shuffle-icon" aria-hidden="true">🔀</span>
            <span>Interleaved Practice</span>
          </div>
          <button
            type="button"
            className="shuffle-explain-btn"
            onClick={() => setShowExplanation(!showExplanation)}
            aria-expanded={showExplanation}
          >
            Why this works {showExplanation ? "▼" : "▶"}
          </button>
        </div>
        
        {showExplanation && (
          <div className="shuffle-explanation">
            <p>
              <strong>Blocked practice</strong> (same pattern over and over) feels smooth but 
              creates SHORT-TERM fluency—not durable skill.
            </p>
            <p>
              <strong>Interleaved practice</strong> (random switching) forces your brain to 
              RECONSTRUCT each motor program from scratch. That reconstruction is where 
              real learning happens.
            </p>
            <p className="shuffle-explanation-key">
              💡 The stumbles during interleaved practice ARE the learning. Embrace the difficulty.
            </p>
          </div>
        )}
        
        <div className="shuffle-setup">
          {/* Category Selection */}
          <div className="shuffle-section">
            <label className="shuffle-label">Include patterns:</label>
            <div className="shuffle-categories">
              {(["basic", "rudiment", "groove", "fill"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`btn btn-small shuffle-cat-btn ${
                    selectedCategories.includes(cat) ? "" : "btn-ghost"
                  }`}
                  onClick={() => handleCategoryToggle(cat)}
                  aria-pressed={selectedCategories.includes(cat)}
                >
                  {cat === "basic" && "Basic"}
                  {cat === "rudiment" && "Rudiments"}
                  {cat === "groove" && "Grooves"}
                  {cat === "fill" && "Fills"}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mode Selection */}
          <div className="shuffle-section">
            <label className="shuffle-label">Mode:</label>
            <div className="shuffle-modes">
              <button
                type="button"
                className={`btn btn-small ${mode === "random" ? "" : "btn-ghost"}`}
                onClick={() => setMode("random")}
                aria-pressed={mode === "random"}
              >
                <span className="shuffle-mode-name">Random</span>
                <span className="shuffle-mode-desc">Equal chance</span>
              </button>
              <button
                type="button"
                className={`btn btn-small ${mode === "weighted" ? "" : "btn-ghost"}`}
                onClick={() => setMode("weighted")}
                aria-pressed={mode === "weighted"}
              >
                <span className="shuffle-mode-name">Weighted</span>
                <span className="shuffle-mode-desc">Focus on weaknesses</span>
              </button>
            </div>
          </div>
          
          {/* Sequence Length */}
          <div className="shuffle-section">
            <label className="shuffle-label">Sequence length:</label>
            <div className="shuffle-lengths">
              {[6, 8, 12, 16].map((len) => (
                <button
                  key={len}
                  type="button"
                  className={`btn btn-small ${sequenceLength === len ? "" : "btn-ghost"}`}
                  onClick={() => setSequenceLength(len)}
                  aria-pressed={sequenceLength === len}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tempo Variation Toggle */}
          <div className="shuffle-section">
            <label className="shuffle-checkbox-label">
              <input
                type="checkbox"
                checked={tempoVariation}
                onChange={(e) => setTempoVariation(e.target.checked)}
              />
              <span>Contextual interference</span>
            </label>
            <span className="shuffle-hint">
              Vary tempo slightly (±5 BPM) between patterns for deeper learning
            </span>
          </div>
          
          {/* Weakness Report (if weighted mode and has data) */}
          {mode === "weighted" && weaknessReport.length > 0 && (
            <div className="shuffle-weakness">
              <div className="kicker">Your weak spots</div>
              <div className="shuffle-weakness-list">
                {weaknessReport.slice(0, 3).map((item) => (
                  <div key={item.pattern.id} className="shuffle-weakness-item">
                    <span className="shuffle-weakness-name">{item.pattern.name}</span>
                    <span className="shuffle-weakness-ratio">
                      {Math.round(item.struggleRatio * 100)}% struggle rate
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button
          type="button"
          className="btn shuffle-start-btn"
          onClick={startSequence}
        >
          Start Interleaved Drill
        </button>
      </div>
    );
  }
  
  // Active phase - showing current pattern
  if ((phase === "active" || phase === "rating") && sequence) {
    const { current, next, tempoOffset, progress } = getCurrentAndNext(sequence);
    const effectiveTempo = baseTempo + tempoOffset;
    
    return (
      <div className={`shuffle-mode shuffle-mode-active ${compact ? "shuffle-mode-compact" : ""}`}>
        <div className="shuffle-active-header">
          <span className="shuffle-progress">
            {progress.current} / {progress.total}
          </span>
          <span className="shuffle-active-tempo">
            {effectiveTempo} BPM
            {tempoOffset !== 0 && (
              <span className="shuffle-tempo-offset">
                ({tempoOffset > 0 ? "+" : ""}{tempoOffset})
              </span>
            )}
          </span>
        </div>
        
        {/* Current Pattern Display */}
        <div className="shuffle-current">
          <div className="kicker">Now Playing</div>
          <div className="shuffle-pattern-name">{current.name}</div>
          <div className="shuffle-pattern-syllables">{current.syllables}</div>
          <div className="shuffle-pattern-notation">{current.notation}</div>
        </div>
        
        {/* Next Pattern Preview */}
        {next && (
          <div className="shuffle-next-preview">
            <span className="shuffle-next-label">Up next:</span>
            <span className="shuffle-next-name">{next.name}</span>
          </div>
        )}
        
        {/* Rating buttons */}
        <div className="shuffle-rating">
          <div className="shuffle-rating-prompt">How did that feel?</div>
          <div className="shuffle-rating-buttons">
            <button
              type="button"
              className="btn shuffle-rating-btn shuffle-rating-smooth"
              onClick={() => handleRating("smooth")}
            >
              ✓ Smooth
            </button>
            <button
              type="button"
              className="btn shuffle-rating-btn shuffle-rating-okay"
              onClick={() => handleRating("okay")}
            >
              ~ Okay
            </button>
            <button
              type="button"
              className="btn shuffle-rating-btn shuffle-rating-struggled"
              onClick={() => handleRating("struggled")}
            >
              ✗ Struggled
            </button>
          </div>
        </div>
        
        <button
          type="button"
          className="btn btn-ghost shuffle-cancel-btn"
          onClick={resetToSetup}
        >
          End early
        </button>
      </div>
    );
  }
  
  // Complete phase
  if (phase === "complete") {
    // Calculate summary
    const logs = loadSessionLogs();
    const recentLogs = logs.slice(-sequenceLength);
    const smoothCount = recentLogs.filter((l) => l.rating === "smooth").length;
    const struggledCount = recentLogs.filter((l) => l.rating === "struggled").length;
    
    return (
      <div className={`shuffle-mode shuffle-mode-complete ${compact ? "shuffle-mode-compact" : ""}`}>
        <div className="shuffle-complete-header">
          <span className="shuffle-complete-icon" aria-hidden="true">✅</span>
          <span className="shuffle-complete-title">Sequence Complete</span>
        </div>
        
        <div className="shuffle-summary">
          <div className="shuffle-summary-item">
            <span className="shuffle-summary-value">{sequenceLength}</span>
            <span className="shuffle-summary-label">Patterns</span>
          </div>
          <div className="shuffle-summary-item shuffle-summary-smooth">
            <span className="shuffle-summary-value">{smoothCount}</span>
            <span className="shuffle-summary-label">Smooth</span>
          </div>
          <div className="shuffle-summary-item shuffle-summary-struggled">
            <span className="shuffle-summary-value">{struggledCount}</span>
            <span className="shuffle-summary-label">Struggled</span>
          </div>
        </div>
        
        {struggledCount > 0 && (
          <div className="shuffle-complete-tip">
            <strong>Remember:</strong> The patterns you struggled with are where you learned the most.
            Consider using <strong>Weighted mode</strong> next time to practice them more.
          </div>
        )}
        
        <div className="shuffle-complete-actions">
          <button
            type="button"
            className="btn"
            onClick={startSequence}
          >
            Go Again
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={resetToSetup}
          >
            Change Settings
          </button>
        </div>
      </div>
    );
  }
  
  return null;
}
