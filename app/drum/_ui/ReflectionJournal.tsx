"use client";

import React, { useState, useEffect } from "react";

/**
 * ReflectionJournal - Formative Evaluation Component
 * 
 * Based on research-backed teaching methodology:
 * - "Stop-Start-Continue" framework for habit formation
 * - "Minute Paper" quick reflection after each session
 * - Stored with session data for progress tracking
 * 
 * The goal: develop metacognitive awareness of practice quality.
 */

export type ReflectionEntry = {
  stop: string;
  start: string;
  continue: string;
  minutePaper?: string;
  timestamp: string;
};

type ReflectionJournalProps = {
  sessionId?: string | null;
  moduleId?: number;
  onSave?: (entry: ReflectionEntry) => void;
  savedEntry?: ReflectionEntry | null;
  compact?: boolean;
};

// Module-specific prompts with examples
const MODULE_PROMPTS: Record<number, {
  stop: { prompt: string; examples: string[] };
  start: { prompt: string; examples: string[] };
  continue: { prompt: string; examples: string[] };
  minutePaper: string;
}> = {
  1: {
    stop: {
      prompt: "What habit do you need to STOP?",
      examples: ["Tensing shoulders", "Death-gripping sticks", "Looking at hands"],
    },
    start: {
      prompt: "What should you START doing?",
      examples: ["Checking grip every minute", "Counting aloud", "Recording more often"],
    },
    continue: {
      prompt: "What's working well? CONTINUE this.",
      examples: ["Steady kick placement", "Relaxed grip", "Even stick height"],
    },
    minutePaper: "In one sentence: What was the most important thing you learned today about clean sound?",
  },
  2: {
    stop: {
      prompt: "What habit do you need to STOP?",
      examples: ["Rushing during gaps", "Waiting for the click", "Speeding up fills"],
    },
    start: {
      prompt: "What should you START doing?",
      examples: ["Breathing with the beat", "Stepping to the pulse", "Singing before playing"],
    },
    continue: {
      prompt: "What's working well? CONTINUE this.",
      examples: ["Solid groove feel", "Good gap recovery", "Natural body movement"],
    },
    minutePaper: "In one sentence: Are you PROJECTING the beat or REACTING to it?",
  },
  3: {
    stop: {
      prompt: "What habit do you need to STOP?",
      examples: ["Uneven singles", "Muscling doubles", "Losing paradiddle accents"],
    },
    start: {
      prompt: "What should you START doing?",
      examples: ["Practicing weak hand alone", "Using bounce for doubles", "Accenting clearly"],
    },
    continue: {
      prompt: "What's working well? CONTINUE this.",
      examples: ["Smooth transitions", "Consistent rudiments", "Natural flow"],
    },
    minutePaper: "In one sentence: Which rudiment is becoming natural? Which still needs work?",
  },
  4: {
    stop: {
      prompt: "What habit do you need to STOP?",
      examples: ["Playing without recording", "Making excuses for flams", "Skipping playback"],
    },
    start: {
      prompt: "What should you START doing?",
      examples: ["Recording every session", "Using the checklist", "Identifying ONE thing to fix"],
    },
    continue: {
      prompt: "What's working well? CONTINUE this.",
      examples: ["Honest self-assessment", "Clean transitions", "Consistent volume"],
    },
    minutePaper: "In one sentence: What ONE specific thing will you fix next session?",
  },
};

const DEFAULT_PROMPTS = MODULE_PROMPTS[1];

export default function ReflectionJournal({
  sessionId,
  moduleId = 1,
  onSave,
  savedEntry,
  compact = false,
}: ReflectionJournalProps) {
  const prompts = MODULE_PROMPTS[moduleId] || DEFAULT_PROMPTS;
  
  const [stop, setStop] = useState(savedEntry?.stop || "");
  const [start, setStart] = useState(savedEntry?.start || "");
  const [continueItem, setContinueItem] = useState(savedEntry?.continue || "");
  const [minutePaper, setMinutePaper] = useState(savedEntry?.minutePaper || "");
  const [saved, setSaved] = useState(!!savedEntry);
  const [expanded, setExpanded] = useState(!compact);

  useEffect(() => {
    if (savedEntry) {
      setStop(savedEntry.stop);
      setStart(savedEntry.start);
      setContinueItem(savedEntry.continue);
      setMinutePaper(savedEntry.minutePaper || "");
      setSaved(true);
    }
  }, [savedEntry]);

  const handleSave = () => {
    const entry: ReflectionEntry = {
      stop,
      start,
      continue: continueItem,
      minutePaper: minutePaper || undefined,
      timestamp: new Date().toISOString(),
    };
    
    // Store locally
    if (sessionId) {
      const key = `reflection_${sessionId}`;
      localStorage.setItem(key, JSON.stringify(entry));
    }
    
    onSave?.(entry);
    setSaved(true);
  };

  const hasContent = stop || start || continueItem || minutePaper;
  const isComplete = stop && start && continueItem;

  if (compact && !expanded) {
    return (
      <button
        type="button"
        className="btn btn-ghost reflection-expand-btn"
        onClick={() => setExpanded(true)}
        style={{ width: "100%", marginTop: 16 }}
      >
        📝 Add Reflection (Stop-Start-Continue)
      </button>
    );
  }

  return (
    <div className="reflection-journal">
      <div className="reflection-header">
        <h3 className="card-title">Session Reflection</h3>
        {compact && (
          <button
            type="button"
            className="btn btn-small btn-ghost"
            onClick={() => setExpanded(false)}
            aria-label="Collapse reflection"
          >
            ✕
          </button>
        )}
      </div>
      
      <p className="reflection-intro">
        Take 60 seconds to reflect. This builds metacognition—awareness of how you practice.
      </p>

      {/* Stop */}
      <div className="reflection-field">
        <label htmlFor="reflection-stop" className="reflection-label reflection-stop">
          🛑 STOP
        </label>
        <p className="reflection-prompt">{prompts.stop.prompt}</p>
        <p className="reflection-examples">
          Examples: {prompts.stop.examples.join(", ")}
        </p>
        <input
          id="reflection-stop"
          type="text"
          className="reflection-input touch-target"
          placeholder="What habit should you stop?"
          value={stop}
          onChange={(e) => { setStop(e.target.value); setSaved(false); }}
        />
      </div>

      {/* Start */}
      <div className="reflection-field">
        <label htmlFor="reflection-start" className="reflection-label reflection-start">
          ▶️ START
        </label>
        <p className="reflection-prompt">{prompts.start.prompt}</p>
        <p className="reflection-examples">
          Examples: {prompts.start.examples.join(", ")}
        </p>
        <input
          id="reflection-start"
          type="text"
          className="reflection-input touch-target"
          placeholder="What should you start doing?"
          value={start}
          onChange={(e) => { setStart(e.target.value); setSaved(false); }}
        />
      </div>

      {/* Continue */}
      <div className="reflection-field">
        <label htmlFor="reflection-continue" className="reflection-label reflection-continue">
          ✅ CONTINUE
        </label>
        <p className="reflection-prompt">{prompts.continue.prompt}</p>
        <p className="reflection-examples">
          Examples: {prompts.continue.examples.join(", ")}
        </p>
        <input
          id="reflection-continue"
          type="text"
          className="reflection-input touch-target"
          placeholder="What's working well?"
          value={continueItem}
          onChange={(e) => { setContinueItem(e.target.value); setSaved(false); }}
        />
      </div>

      {/* Minute Paper (optional) */}
      <div className="reflection-field reflection-minute-paper">
        <label htmlFor="reflection-minute" className="reflection-label">
          📄 Minute Paper (optional)
        </label>
        <p className="reflection-prompt">{prompts.minutePaper}</p>
        <textarea
          id="reflection-minute"
          className="reflection-textarea touch-target"
          placeholder="One sentence summary..."
          value={minutePaper}
          onChange={(e) => { setMinutePaper(e.target.value); setSaved(false); }}
          rows={2}
        />
      </div>

      {/* Save button */}
      <div className="reflection-actions">
        <button
          type="button"
          className={`btn ${saved ? "btn-ghost" : ""}`}
          onClick={handleSave}
          disabled={!hasContent}
        >
          {saved ? "✓ Saved" : "Save Reflection"}
        </button>
        {!isComplete && hasContent && (
          <span className="reflection-hint">
            Complete all three fields for best results
          </span>
        )}
      </div>

      <style jsx>{`
        .reflection-journal {
          margin-top: 24px;
          padding: 20px;
          background: var(--surface);
          border-radius: 12px;
          border: 1px solid var(--border);
        }
        
        .reflection-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .reflection-intro {
          font-size: 0.9rem;
          color: var(--muted);
          margin-bottom: 20px;
        }
        
        .reflection-field {
          margin-bottom: 20px;
        }
        
        .reflection-label {
          display: block;
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 4px;
        }
        
        .reflection-stop { color: #e74c3c; }
        .reflection-start { color: #3498db; }
        .reflection-continue { color: #27ae60; }
        
        .reflection-prompt {
          font-size: 0.95rem;
          margin-bottom: 4px;
        }
        
        .reflection-examples {
          font-size: 0.8rem;
          color: var(--muted);
          font-style: italic;
          margin-bottom: 8px;
        }
        
        .reflection-input {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          color: var(--text);
          font-size: 1rem;
        }
        
        .reflection-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          color: var(--text);
          font-size: 1rem;
          resize: vertical;
          min-height: 60px;
        }
        
        .reflection-minute-paper {
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        
        .reflection-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
        }
        
        .reflection-hint {
          font-size: 0.8rem;
          color: var(--muted);
        }
        
        .reflection-expand-btn {
          border: 1px dashed var(--border);
        }
      `}</style>
    </div>
  );
}

/**
 * Load a saved reflection entry from localStorage
 */
export function loadReflectionEntry(sessionId: string): ReflectionEntry | null {
  if (typeof window === "undefined") return null;
  const key = `reflection_${sessionId}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as ReflectionEntry;
  } catch {
    return null;
  }
}
