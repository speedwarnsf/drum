"use client";

import React, { useState, useEffect, useCallback } from "react";

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.2.0",
    date: "2026-02-15",
    changes: [
      "Share any rudiment with a direct link — includes BPM preset",
      "PWA install prompt — add RepoDrum to your home screen",
      "Enhanced offline support — practice without internet",
      "What's New changelog (you're looking at it)",
      "Open Graph meta tags for rich link previews",
    ],
  },
  {
    version: "2.1.0",
    date: "2026-02-12",
    changes: [
      "Practice goals with daily/weekly targets",
      "Tempo goal tracking per rudiment",
      "Focus mode for distraction-free practice",
      "Speed trainer with auto-incrementing BPM",
      "Recording and self-audit with rhythm scoring",
    ],
  },
  {
    version: "2.0.0",
    date: "2026-02-08",
    changes: [
      "Complete rewrite with all 40 PAS rudiments",
      "Spaced repetition for rudiment review",
      "Achievement system and skill tree",
      "Rudiment relationship map",
      "Enhanced metronome with gap drills",
      "Practice session tracking and stats",
    ],
  },
];

const CURRENT_VERSION = CHANGELOG[0].version;
const STORAGE_KEY = "whats-new-seen";

export default function WhatsNew() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== CURRENT_VERSION) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
  }, []);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "var(--card-bg, #fff)",
          border: "2px solid var(--ink)",
          maxWidth: 480,
          width: "calc(100% - 32px)",
          maxHeight: "80vh",
          overflow: "auto",
          padding: "24px",
          boxShadow: "6px 6px 0 var(--ink)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: "1.3rem" }}>What&apos;s New</h2>
          <button
            className="btn btn-ghost"
            onClick={handleClose}
            style={{ padding: "4px 10px", fontSize: "0.85rem" }}
          >
            Close
          </button>
        </div>

        {CHANGELOG.map((entry) => (
          <div key={entry.version} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "0.9rem",
                background: "var(--ink)",
                color: "var(--bg, #fff)",
                padding: "2px 8px",
              }}>
                v{entry.version}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>{entry.date}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.85rem", lineHeight: 1.7 }}>
              {entry.changes.map((change, i) => (
                <li key={i}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Small button to manually trigger the changelog */
export function WhatsNewButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="btn btn-ghost"
        onClick={() => setOpen(true)}
        style={{ fontSize: "0.75rem", padding: "4px 8px" }}
      >
        What&apos;s New
      </button>
      {open && (
        <WhatsNewInline onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function WhatsNewInline({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--card-bg, #fff)",
          border: "2px solid var(--ink)",
          maxWidth: 480,
          width: "calc(100% - 32px)",
          maxHeight: "80vh",
          overflow: "auto",
          padding: "24px",
          boxShadow: "6px 6px 0 var(--ink)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: "1.3rem" }}>What&apos;s New</h2>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            style={{ padding: "4px 10px", fontSize: "0.85rem" }}
          >
            Close
          </button>
        </div>
        {CHANGELOG.map((entry) => (
          <div key={entry.version} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "0.9rem",
                background: "var(--ink)",
                color: "var(--bg, #fff)",
                padding: "2px 8px",
              }}>
                v{entry.version}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>{entry.date}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.85rem", lineHeight: 1.7 }}>
              {entry.changes.map((change, i) => (
                <li key={i}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
