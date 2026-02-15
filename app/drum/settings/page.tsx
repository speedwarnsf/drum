"use client";

import React, { useState, useEffect } from "react";
import Shell from "../_ui/Shell";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { loadProfile, saveProfile, Profile } from "../_lib/drumMvp";

function SettingsInner() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [defaultBpm, setDefaultBpm] = useState(80);
  const [sessionTarget, setSessionTarget] = useState(20);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [visualPulse, setVisualPulse] = useState(false);
  const [countIn, setCountIn] = useState(true);
  const [practiceReminder, setPracticeReminder] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (p) setProfile(p);
    // Load settings from localStorage
    const settings = localStorage.getItem("drum_settings");
    if (settings) {
      try {
        const s = JSON.parse(settings);
        setDefaultBpm(s.defaultBpm ?? 80);
        setSessionTarget(s.sessionTarget ?? 20);
        setSoundEnabled(s.soundEnabled ?? true);
        setVisualPulse(s.visualPulse ?? false);
        setCountIn(s.countIn ?? true);
        setPracticeReminder(s.practiceReminder ?? false);
        setHighContrast(s.highContrast ?? false);
      } catch {}
    }
  }, []);

  function handleExportData() {
    const data: Record<string, string | null> = {};
    ["drum_sessions", "drum_profile", "drum_settings", "drum_last_plan", "drum_diagnostic_results"].forEach(key => {
      data[key] = localStorage.getItem(key);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repodrum-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  function handleSave() {
    const settings = { defaultBpm, sessionTarget, soundEnabled, visualPulse, countIn, practiceReminder, highContrast };
    localStorage.setItem("drum_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClearData() {
    if (confirm("This will clear all local practice data. Are you sure?")) {
      localStorage.removeItem("drum_sessions");
      localStorage.removeItem("drum_profile");
      localStorage.removeItem("drum_settings");
      localStorage.removeItem("drum_last_plan");
      localStorage.removeItem("drum_diagnostic_results");
      localStorage.removeItem("drum_stats_cache");
      window.location.href = "/drum/start";
    }
  }

  return (
    <Shell title="Settings" subtitle="Customize your practice experience">
      {/* Practice Defaults */}
      <section className="card">
        <h2 className="card-title">Practice Defaults</h2>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Default BPM
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="range"
              min={30}
              max={200}
              value={defaultBpm}
              onChange={(e) => setDefaultBpm(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontWeight: 700, minWidth: 50, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {defaultBpm}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Session Target (minutes)
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={sessionTarget}
              onChange={(e) => setSessionTarget(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontWeight: 700, minWidth: 50, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {sessionTarget}
            </span>
          </div>
        </div>
      </section>

      {/* Audio & Visual */}
      <section className="card">
        <h2 className="card-title">Audio & Visual</h2>

        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />
          <span>UI sound effects</span>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={visualPulse}
            onChange={(e) => setVisualPulse(e.target.checked)}
          />
          <span>Show visual metronome pulse by default</span>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={countIn}
            onChange={(e) => setCountIn(e.target.checked)}
          />
          <span>4-beat count-in before metronome starts</span>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={practiceReminder}
            onChange={(e) => setPracticeReminder(e.target.checked)}
          />
          <span>Daily practice reminder (browser notification)</span>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
          />
          <span>High contrast mode (accessibility)</span>
        </label>
      </section>

      {/* Profile Info */}
      {profile && (
        <section className="card">
          <h2 className="card-title">Profile</h2>
          <div style={{ fontSize: "0.9rem", color: "var(--ink-muted)" }}>
            <p><strong>Level:</strong> {profile.level || "Not set"}</p>
            <p><strong>Goal:</strong> {profile.goal || "Not set"}</p>
            <p><strong>Module:</strong> {profile.currentModule || 1}</p>
          </div>
          <div style={{ marginTop: 12 }}>
            <a href="/drum/start" className="btn btn-ghost">Edit Profile</a>
          </div>
        </section>
      )}

      {/* Keyboard Shortcuts */}
      <section className="card">
        <h2 className="card-title">Keyboard Shortcuts</h2>
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--stroke)" }}>
            <span>Toggle metronome</span>
            <kbd style={{ background: "var(--panel-deep)", padding: "2px 8px", fontFamily: "monospace" }}>Space</kbd>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span>Stop metronome</span>
            <kbd style={{ background: "var(--panel-deep)", padding: "2px 8px", fontFamily: "monospace" }}>Esc</kbd>
          </div>
        </div>
      </section>

      {/* Save */}
      <section className="card" style={{ textAlign: "center" }}>
        <button className="btn" onClick={handleSave} style={{ marginRight: 8 }}>
          {saved ? "Saved" : "Save Settings"}
        </button>
      </section>

      {/* Data Management */}
      <section className="card">
        <h2 className="card-title" style={{ color: "var(--ink)" }}>Data Management</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <button className="btn btn-ghost" onClick={handleExportData}>
            Export Backup
          </button>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginBottom: 12 }}>
          Clear all local data and start fresh. This cannot be undone.
        </p>
        <button className="btn btn-ghost" onClick={handleClearData}>
          Clear All Local Data
        </button>
      </section>

      {/* About */}
      <section className="card">
        <h2 className="card-title">About RepoDrum</h2>
        <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>
          <p style={{ marginBottom: 6 }}>Adaptive drum practice system by Dyork Music.</p>
          <p style={{ marginBottom: 6 }}>Calm, tactile practice cards for focused improvement.</p>
          <p>repodrum.com</p>
        </div>
      </section>

      <section className="card">
        <div className="row">
          <a href="/drum/today" className="btn btn-ghost">← Practice</a>
          <a href="/drum/progress" className="btn btn-ghost">Progress</a>
        </div>
      </section>
    </Shell>
  );
}

export default function SettingsPage() {
  return (
    <ErrorBoundary>
      <SettingsInner />
    </ErrorBoundary>
  );
}
