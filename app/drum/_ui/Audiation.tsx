"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "./Icon";

/**
 * Audiation Component - "Sing Before Play" Exercise
 * 
 * Based on Edwin Gordon's Music Learning Theory:
 * - "Audiation" = hearing music in your mind (like thinking in a language)
 * - Always vocalize the pattern BEFORE playing it
 * - This builds the internal musical representation
 * 
 * Rhythm syllables (Gordon Method):
 * - Quarter notes: "Du"
 * - Eighth notes: "Du-De"
 * - Sixteenth notes: "Du-Ta-De-Ta"
 * - Onomatopoeia: "Boom" (kick), "Chack" (snare), "Tss" (hi-hat)
 */

type AudiationPattern = {
  id: string;
  name: string;
  syllables: string;
  notation: string; // Simple text representation
  bars: number;
  bpm?: number;
  category: "basic" | "groove" | "fill" | "rudiment";
};

const PATTERNS: AudiationPattern[] = [
  // ========================================
  // BASIC PATTERNS - Foundation rhythms
  // ========================================
  {
    id: "quarters",
    name: "Quarter Notes",
    syllables: "Du   Du   Du   Du",
    notation: "1    2    3    4",
    bars: 1,
    category: "basic",
  },
  {
    id: "eighths",
    name: "Eighth Notes",
    syllables: "Du-De Du-De Du-De Du-De",
    notation: "1 & 2 & 3 & 4 &",
    bars: 1,
    category: "basic",
  },
  {
    id: "sixteenths",
    name: "Sixteenth Notes",
    syllables: "Du-Ta-De-Ta Du-Ta-De-Ta Du-Ta-De-Ta Du-Ta-De-Ta",
    notation: "1 e & a  2 e & a  3 e & a  4 e & a",
    bars: 1,
    category: "basic",
  },
  {
    id: "triplets",
    name: "Eighth Triplets",
    syllables: "Du-Da-Di Du-Da-Di Du-Da-Di Du-Da-Di",
    notation: "1 & a  2 & a  3 & a  4 & a",
    bars: 1,
    category: "basic",
  },
  {
    id: "dotted-eighths",
    name: "Dotted Eighths",
    syllables: "Du---De Du---De",
    notation: "1    &  3    &",
    bars: 1,
    category: "basic",
  },

  // ========================================
  // ROCK GROOVES - Essential rock patterns
  // ========================================
  {
    id: "basic-rock",
    name: "Basic Rock",
    syllables: "Boom Chack Boom-Boom Chack",
    notation: "K    S    K-K       S",
    bars: 1,
    bpm: 80,
    category: "groove",
  },
  {
    id: "rock-steady",
    name: "Rock Beat (8th HH)",
    syllables: "Tss-Boom Tss-Chack Tss-Boom Tss-Chack",
    notation: "H-K      H-S       H-K      H-S",
    bars: 1,
    bpm: 90,
    category: "groove",
  },
  {
    id: "rock-16th",
    name: "Rock (16th Hi-Hat)",
    syllables: "Tss-Tss-Boom-Tss Tss-Chack-Tss-Tss",
    notation: "H-H-K-H      H-S-H-H",
    bars: 1,
    bpm: 75,
    category: "groove",
  },
  {
    id: "rock-shuffle",
    name: "Rock Shuffle",
    syllables: "Tss-Boom-Tss Chack-Tss-Tss",
    notation: "H-K-H     S-H-H    (swing feel)",
    bars: 1,
    bpm: 85,
    category: "groove",
  },
  {
    id: "half-time",
    name: "Half Time Rock",
    syllables: "Boom Boom Chack Boom",
    notation: "K    K    S     K",
    bars: 1,
    bpm: 70,
    category: "groove",
  },

  // ========================================
  // FUNK GROOVES - Syncopated patterns
  // ========================================
  {
    id: "funk-basic",
    name: "Basic Funk",
    syllables: "Boom-Tss-ghost-Chack Tss-Boom-ghost-Tss",
    notation: "K-H-(s)-S    H-K-(s)-H",
    bars: 1,
    bpm: 95,
    category: "groove",
  },
  {
    id: "funk-linear",
    name: "Linear Funk",
    syllables: "Boom rest Chack-Tss rest-Boom rest-Chack",
    notation: "K    -    S-H     -K    -S",
    bars: 1,
    bpm: 85,
    category: "groove",
  },
  {
    id: "funk-ghost",
    name: "Ghost Note Funk",
    syllables: "Boom-ghost-ghost-Chack ghost-Boom-ghost-ghost",
    notation: "K-(s)-(s)-S     (s)-K-(s)-(s)",
    bars: 1,
    bpm: 90,
    category: "groove",
  },
  {
    id: "funky-drummer",
    name: "Funky Drummer",
    syllables: "Boom-ghost-Boom-Chack ghost-ghost-Boom-Chack",
    notation: "K-(s)-K-S     (s)-(s)-K-S",
    bars: 1,
    bpm: 100,
    category: "groove",
  },

  // ========================================
  // DISCO & DANCE - Four-on-floor patterns
  // ========================================
  {
    id: "disco",
    name: "Classic Disco",
    syllables: "Boom-Tss Chack-Tss Boom-Tss Chack-Tss",
    notation: "K-H      S-H       K-H      S-H",
    bars: 1,
    bpm: 110,
    category: "groove",
  },
  {
    id: "four-on-floor",
    name: "Four on the Floor",
    syllables: "Boom Boom Boom Boom (+ backbeat)",
    notation: "K    K    K    K",
    bars: 1,
    bpm: 120,
    category: "groove",
  },
  {
    id: "house-beat",
    name: "House Beat",
    syllables: "Boom-Tss-Tss-Tss Chack-Tss-Boom-Tss",
    notation: "K-H-H-H      S-H-K-H",
    bars: 1,
    bpm: 125,
    category: "groove",
  },

  // ========================================
  // JAZZ PATTERNS - Swing and bebop
  // ========================================
  {
    id: "jazz-swing",
    name: "Jazz Swing",
    syllables: "Spang-a-lang Spang-a-lang (ride cymbal)",
    notation: "R---R-R   R---R-R   (swing)",
    bars: 1,
    bpm: 120,
    category: "groove",
  },
  {
    id: "jazz-waltz",
    name: "Jazz Waltz",
    syllables: "Boom Chack Tss",
    notation: "K    S     R (3/4 time)",
    bars: 1,
    bpm: 100,
    category: "groove",
  },
  {
    id: "bebop",
    name: "Bebop Comping",
    syllables: "Boom-rest-Chack-rest",
    notation: "K    -    S     -",
    bars: 1,
    bpm: 140,
    category: "groove",
  },

  // ========================================
  // LATIN RHYTHMS - World music patterns
  // ========================================
  {
    id: "bossa-nova",
    name: "Bossa Nova",
    syllables: "Boom-rest-Boom-Chack rest-Boom-rest-Chack",
    notation: "K    -    K-S     -K    -S",
    bars: 1,
    bpm: 110,
    category: "groove",
  },
  {
    id: "samba",
    name: "Samba",
    syllables: "Boom-Chack-Boom-Chack-Boom-Chack",
    notation: "K-S-K-S-K-S (surdo pattern)",
    bars: 1,
    bpm: 105,
    category: "groove",
  },
  {
    id: "mambo",
    name: "Mambo",
    syllables: "Boom-Boom-Chack Boom-Boom-Chack",
    notation: "K-K-S     K-K-S",
    bars: 1,
    bpm: 95,
    category: "groove",
  },
  {
    id: "reggae",
    name: "Reggae",
    syllables: "rest-Boom-Chack rest-Boom-Chack",
    notation: "-K-S     -K-S (one drop)",
    bars: 1,
    bpm: 75,
    category: "groove",
  },

  // ========================================
  // SHUFFLE PATTERNS - Triplet feel grooves
  // ========================================
  {
    id: "texas-shuffle",
    name: "Texas Shuffle",
    syllables: "Boom-rest-Boom Chack-rest-Boom",
    notation: "K----K   S----K (shuffle)",
    bars: 1,
    bpm: 85,
    category: "groove",
  },
  {
    id: "blues-shuffle",
    name: "Blues Shuffle",
    syllables: "Boom-Boom-rest Chack-rest-Boom",
    notation: "K-K--     S--K (swing)",
    bars: 1,
    bpm: 90,
    category: "groove",
  },
  {
    id: "train-beat",
    name: "Train Beat",
    syllables: "Chack-a-Chack-a Chack-a-Chack-a",
    notation: "S-S-S-S     S-S-S-S",
    bars: 1,
    bpm: 120,
    category: "groove",
  },

  // ========================================
  // MODERN STYLES - Contemporary patterns
  // ========================================
  {
    id: "trap",
    name: "Trap Beat",
    syllables: "Boom-rest-Boom-rest Chack-rest-Boom-Boom",
    notation: "K----K--     S--K-K",
    bars: 1,
    bpm: 140,
    category: "groove",
  },
  {
    id: "dnb",
    name: "Drum & Bass",
    syllables: "Boom-rest-Chack-rest rest-Boom-Chack-Boom",
    notation: "K--S-    -K-S-K",
    bars: 1,
    bpm: 170,
    category: "groove",
  },
  {
    id: "breakbeat",
    name: "Breakbeat",
    syllables: "Boom-Boom-Chack-Boom rest-Boom-Chack-rest",
    notation: "K-K-S-K     -K-S-",
    bars: 1,
    bpm: 130,
    category: "groove",
  },

  // ========================================
  // RUDIMENTS - Essential sticking patterns
  // ========================================
  {
    id: "singles",
    name: "Single Stroke Roll",
    syllables: "Du-De Du-De Du-De Du-De (R-L R-L R-L R-L)",
    notation: "R L R L R L R L",
    bars: 1,
    category: "rudiment",
  },
  {
    id: "doubles",
    name: "Double Stroke Roll",
    syllables: "Du-Du De-De Du-Du De-De (R-R L-L R-R L-L)",
    notation: "R R L L R R L L",
    bars: 1,
    category: "rudiment",
  },
  {
    id: "paradiddle",
    name: "Paradiddle",
    syllables: "Du-de-du-DU De-du-de-DE",
    notation: "R L R R  L R L L",
    bars: 1,
    category: "rudiment",
  },
  {
    id: "flam",
    name: "Flam",
    syllables: "Ka-DU Ka-DE",
    notation: "lR   rL",
    bars: 1,
    category: "rudiment",
  },
  {
    id: "drag",
    name: "Drag (Ruff)",
    syllables: "rra-DU lla-DE",
    notation: "rrR   llL",
    bars: 1,
    category: "rudiment",
  },
  {
    id: "flamacue",
    name: "Flamacue",
    syllables: "Ka-du-DU De-du-DE",
    notation: "lRL R  rLR L",
    bars: 1,
    category: "rudiment",
  },
  {
    id: "ratamacue",
    name: "Ratamacue",
    syllables: "Du-Du-Ka-du-DU",
    notation: "R L lR L R",
    bars: 1,
    category: "rudiment",
  },

  // ========================================
  // FILLS - Transitional patterns
  // ========================================
  {
    id: "basic-fill",
    name: "Basic Tom Fill",
    syllables: "Du-De-Du-De (high-low-high-low)",
    notation: "H L H L (toms)",
    bars: 1,
    category: "fill",
  },
  {
    id: "linear-fill",
    name: "Linear Fill",
    syllables: "Boom-Chack-Tom-Tom",
    notation: "K-S-T-T",
    bars: 1,
    category: "fill",
  },
  {
    id: "paradiddle-fill",
    name: "Paradiddle Fill",
    syllables: "Du-de-du-DU (around kit)",
    notation: "S-T-T-F",
    bars: 1,
    category: "fill",
  },
];

type AudiationProps = {
  moduleId?: number;
  onComplete?: (patternId: string) => void;
  compact?: boolean;
};

type Phase = "select" | "prepare" | "sing" | "play" | "review";

export default function Audiation({
  moduleId = 1,
  onComplete,
  compact = false,
}: AudiationProps) {
  const [selectedPattern, setSelectedPattern] = useState<AudiationPattern | null>(null);
  const [phase, setPhase] = useState<Phase>("select");
  const [countdown, setCountdown] = useState(0);
  const [barsCompleted, setBarsCompleted] = useState(0);
  const countdownRef = useRef<number | null>(null);

  // Filter patterns based on module
  const availablePatterns = PATTERNS.filter((p) => {
    if (moduleId === 1) return p.category === "basic";
    if (moduleId === 2) return p.category === "basic" || p.category === "groove";
    if (moduleId === 3) return true; // All patterns
    return true;
  });

  const startExercise = useCallback((pattern: AudiationPattern) => {
    setSelectedPattern(pattern);
    setPhase("prepare");
    setBarsCompleted(0);
    
    // 4-beat countdown before singing
    setCountdown(4);
    countdownRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setPhase("sing");
          return 0;
        }
        return prev - 1;
      });
    }, 600); // Approximately 100 BPM
  }, []);

  const handleSingComplete = useCallback(() => {
    setPhase("play");
  }, []);

  const handlePlayComplete = useCallback(() => {
    const newBars = barsCompleted + 1;
    setBarsCompleted(newBars);
    
    if (newBars >= 4) {
      setPhase("review");
      if (selectedPattern && onComplete) {
        onComplete(selectedPattern.id);
      }
    } else {
      // Another round
      setPhase("sing");
    }
  }, [barsCompleted, selectedPattern, onComplete]);

  const resetExercise = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setSelectedPattern(null);
    setPhase("select");
    setCountdown(0);
    setBarsCompleted(0);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  if (phase === "select") {
    return (
      <div className={`audiation ${compact ? "audiation-compact" : ""}`}>
        <div className="audiation-header">
          <span className="audiation-icon" aria-hidden="true"><Icon name="music" size={20} /></span>
          <span className="audiation-title">Sing Before Play</span>
        </div>
        <p className="audiation-intro">
          Vocalize the pattern BEFORE you play it. This builds your internal musical ear.
        </p>
        
        <div className="audiation-patterns">
          {availablePatterns.map((pattern) => (
            <button
              key={pattern.id}
              type="button"
              className="audiation-pattern-btn touch-target"
              onClick={() => startExercise(pattern)}
            >
              <span className="audiation-pattern-name">{pattern.name}</span>
              <span className="audiation-pattern-syllables">{pattern.syllables}</span>
            </button>
          ))}
        </div>
        
        <div className="audiation-legend">
          <div className="kicker">Rhythm Syllables</div>
          <p className="audiation-legend-item">
            <strong>Du</strong> = quarter note • <strong>Du-De</strong> = eighths • <strong>Du-Ta-De-Ta</strong> = sixteenths
          </p>
          <p className="audiation-legend-item">
            <strong>Boom</strong> = kick • <strong>Chack</strong> = snare • <strong>Tss</strong> = hi-hat
          </p>
        </div>
      </div>
    );
  }

  if (phase === "prepare" && selectedPattern) {
    return (
      <div className="audiation">
        <div className="audiation-countdown">
          <div className="audiation-countdown-number">{countdown}</div>
          <div className="audiation-countdown-label">Get ready to SING</div>
        </div>
        <div className="audiation-current-pattern">
          <div className="kicker">{selectedPattern.name}</div>
          <div className="audiation-syllables-display">{selectedPattern.syllables}</div>
        </div>
        <button type="button" className="btn btn-ghost" onClick={resetExercise}>
          Cancel
        </button>
      </div>
    );
  }

  if (phase === "sing" && selectedPattern) {
    return (
      <div className="audiation">
        <div className="audiation-phase-indicator audiation-phase-sing">
          🎤 SING IT
        </div>
        <div className="audiation-current-pattern">
          <div className="kicker">{selectedPattern.name}</div>
          <div className="audiation-syllables-display audiation-syllables-active">
            {selectedPattern.syllables}
          </div>
          <div className="audiation-notation">{selectedPattern.notation}</div>
        </div>
        <p className="audiation-instruction">
          Sing out loud: &quot;{selectedPattern.syllables}&quot;
        </p>
        <button
          type="button"
          className="btn audiation-action-btn touch-target"
          onClick={handleSingComplete}
        >
          ✓ I sang it — Now I&apos;ll play it
        </button>
        <button type="button" className="btn btn-ghost" onClick={resetExercise}>
          Start over
        </button>
      </div>
    );
  }

  if (phase === "play" && selectedPattern) {
    return (
      <div className="audiation">
        <div className="audiation-phase-indicator audiation-phase-play">
          🥁 NOW PLAY IT
        </div>
        <div className="audiation-current-pattern">
          <div className="kicker">{selectedPattern.name}</div>
          <div className="audiation-syllables-display">{selectedPattern.syllables}</div>
        </div>
        <div className="audiation-progress">
          <span>Round {barsCompleted + 1} of 4</span>
        </div>
        <p className="audiation-instruction">
          Play exactly what you just sang. Match the feel.
        </p>
        <button
          type="button"
          className="btn audiation-action-btn touch-target"
          onClick={handlePlayComplete}
        >
          ✓ Done — {barsCompleted < 3 ? "Sing again" : "Finish"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={resetExercise}>
          Start over
        </button>
      </div>
    );
  }

  if (phase === "review" && selectedPattern) {
    return (
      <div className="audiation">
        <div className="audiation-phase-indicator audiation-phase-complete">
          Complete!
        </div>
        <div className="audiation-current-pattern">
          <div className="kicker">{selectedPattern.name}</div>
          <p>You completed 4 sing-then-play cycles.</p>
        </div>
        <div className="audiation-review">
          <div className="kicker">Reflection</div>
          <ul>
            <li>Did your playing match what you sang?</li>
            <li>Was the timing consistent?</li>
            <li>Did you hear the pattern in your head before playing?</li>
          </ul>
        </div>
        <div className="row">
          <button
            type="button"
            className="btn"
            onClick={() => startExercise(selectedPattern)}
          >
            Try again
          </button>
          <button type="button" className="btn btn-ghost" onClick={resetExercise}>
            Choose new pattern
          </button>
        </div>
      </div>
    );
  }

  return null;
}
