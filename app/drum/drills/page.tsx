"use client";

import React, { useEffect, useState } from "react";
import Shell from "../_ui/Shell";
import { GapSettings, GapPreset, GAP_PRESETS } from "../_ui/GapDrillControls";

export default function DrillsPage() {
  const [metroOn, setMetroOn] = useState(false);
  const [bpm, setBpm] = useState(60);
  const [gapPreset, setGapPreset] = useState<GapPreset>("medium");
  const [gapSettings, setGapSettings] = useState<GapSettings>(GAP_PRESETS.medium);
  const [drillTimer, setDrillTimer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [cycleCount, setCycleCount] = useState(0);

  // Audio context and scheduling
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  const handlePresetChange = (preset: GapPreset) => {
    setGapPreset(preset);
    if (preset !== "custom") {
      setGapSettings(GAP_PRESETS[preset]);
    }
  };

  const handleStart = async () => {
    const ctx = new AudioContext();
    await ctx.resume();
    setAudioCtx(ctx);
    setMetroOn(true);
    setCycleCount(0);
    if (drillTimer) {
      setTimeRemaining(drillTimer * 60);
    }
  };

  const handleStop = () => {
    setMetroOn(false);
    if (audioCtx) {
      audioCtx.close();
      setAudioCtx(null);
    }
    setTimeRemaining(0);
  };

  // Timer countdown
  useEffect(() => {
    if (!metroOn || !drillTimer || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleStop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metroOn, drillTimer, timeRemaining]);

  // Main metronome scheduling
  useEffect(() => {
    if (!metroOn || !audioCtx) return;

    let nextTime = audioCtx.currentTime + 0.05;
    let beatCount = 0;
    let isCancelled = false;
    const totalCycle = gapSettings.beatsOn + gapSettings.beatsOff;

    const tick = (time: number, shouldPlay: boolean) => {
      if (!shouldPlay) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.value = gapSettings.offBeatMode ? 800 : 1200;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.2, time + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + 0.06);
    };

    const schedule = () => {
      if (isCancelled) return;
      const secondsPerBeat = 60 / bpm;
      const secondsPerHalfBeat = secondsPerBeat / 2;

      while (nextTime < audioCtx.currentTime + 0.2) {
        const cyclePosition = beatCount % totalCycle;
        const inGap = cyclePosition >= gapSettings.beatsOn;
        const shouldPlay = !inGap;

        // Track cycles
        if (cyclePosition === 0 && beatCount > 0) {
          setCycleCount((prev) => prev + 1);
        }

        if (gapSettings.offBeatMode) {
          tick(nextTime + secondsPerHalfBeat, shouldPlay);
        } else {
          tick(nextTime, shouldPlay);
        }

        nextTime += secondsPerBeat;
        beatCount++;
      }

      if (!isCancelled) {
        setTimeout(schedule, 60);
      }
    };

    schedule();

    return () => {
      isCancelled = true;
    };
  }, [metroOn, audioCtx, bpm, gapSettings]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Shell
      title="Gap Drills"
      subtitle="Build your internal clock with silence"
    >
      <section className="card">
        <div className="kicker">Internal Clock Training</div>
        <p>
          Gap drills strengthen your internal sense of time. The click plays, then goes
          silent. Your job: maintain the exact tempo during the gap. When the click
          returns, you should still be perfectly aligned.
        </p>
        <p className="sub" style={{ marginTop: 8 }}>
          Off-beat mode shifts the click to the &quot;and&quot; counts, training you to feel
          the spaces between downbeats.
        </p>
      </section>

      {/* Main drill controls */}
      <section className="card">
        <div className="drill-controls">
          {/* BPM */}
          <div className="drill-section">
            <label className="drill-label">Tempo</label>
            <div className="drill-bpm">
              <button
                type="button"
                className="btn btn-small"
                onClick={() => setBpm((prev) => Math.max(30, prev - 5))}
                disabled={metroOn}
              >
                −5
              </button>
              <input
                type="number"
                min={30}
                max={200}
                value={bpm}
                onChange={(e) => setBpm(Math.max(30, Math.min(200, parseInt(e.target.value) || 60)))}
                className="drill-bpm-input"
                disabled={metroOn}
              />
              <button
                type="button"
                className="btn btn-small"
                onClick={() => setBpm((prev) => Math.min(200, prev + 5))}
                disabled={metroOn}
              >
                +5
              </button>
            </div>
            <span className="drill-hint">{bpm} BPM</span>
          </div>

          {/* Preset selection */}
          <div className="drill-section">
            <label className="drill-label">Difficulty</label>
            <div className="drill-presets">
              {(["easy", "medium", "hard"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn drill-preset-btn ${gapPreset === p ? "" : "btn-ghost"}`}
                  onClick={() => handlePresetChange(p)}
                  disabled={metroOn}
                >
                  <span className="drill-preset-name">
                    {p === "easy" && "Easy"}
                    {p === "medium" && "Medium"}
                    {p === "hard" && "Hard"}
                  </span>
                  <span className="drill-preset-detail">
                    {p === "easy" && "8 on, 4 off"}
                    {p === "medium" && "4 on, 4 off"}
                    {p === "hard" && "4 on, 8 off"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom settings */}
          <details className="drill-custom-details" open={gapPreset === "custom"}>
            <summary className="drill-custom-summary">
              <span>Custom settings</span>
              {gapPreset === "custom" && (
                <span className="drill-custom-active">Active</span>
              )}
            </summary>
            <div className="drill-custom-body">
              <div className="drill-custom-row">
                <label className="drill-custom-field">
                  <span>Beats on</span>
                  <input
                    type="number"
                    min={1}
                    max={32}
                    value={gapSettings.beatsOn}
                    onChange={(e) => {
                      setGapPreset("custom");
                      setGapSettings((prev) => ({
                        ...prev,
                        beatsOn: Math.max(1, parseInt(e.target.value) || 1),
                      }));
                    }}
                    disabled={metroOn}
                  />
                </label>
                <label className="drill-custom-field">
                  <span>Beats off</span>
                  <input
                    type="number"
                    min={1}
                    max={32}
                    value={gapSettings.beatsOff}
                    onChange={(e) => {
                      setGapPreset("custom");
                      setGapSettings((prev) => ({
                        ...prev,
                        beatsOff: Math.max(1, parseInt(e.target.value) || 1),
                      }));
                    }}
                    disabled={metroOn}
                  />
                </label>
              </div>
            </div>
          </details>

          {/* Off-beat toggle */}
          <div className="drill-section">
            <label className="drill-checkbox-label">
              <input
                type="checkbox"
                checked={gapSettings.offBeatMode}
                onChange={(e) => {
                  setGapPreset("custom");
                  setGapSettings((prev) => ({
                    ...prev,
                    offBeatMode: e.target.checked,
                  }));
                }}
                disabled={metroOn}
              />
              <span>Off-beat mode</span>
            </label>
            <span className="drill-hint">Click on the &quot;and&quot; instead of downbeat</span>
          </div>

          {/* Timer */}
          <div className="drill-section">
            <label className="drill-label">Practice timer (optional)</label>
            <div className="drill-timer-options">
              {[null, 2, 5, 10].map((mins) => (
                <button
                  key={mins ?? "none"}
                  type="button"
                  className={`btn btn-small ${drillTimer === mins ? "" : "btn-ghost"}`}
                  onClick={() => setDrillTimer(mins)}
                  disabled={metroOn}
                >
                  {mins === null ? "None" : `${mins} min`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start/Stop */}
        <div className="drill-action">
          {!metroOn ? (
            <button type="button" className="btn drill-start-btn" onClick={handleStart}>
              Start Drill
            </button>
          ) : (
            <button type="button" className="btn drill-stop-btn" onClick={handleStop}>
              Stop
            </button>
          )}
        </div>
      </section>

      {/* Active drill display */}
      {metroOn && (
        <section className="card drill-active-card">
          <div className="drill-active-header">
            <span className="drill-active-label">Drill Active</span>
            <span className="drill-active-bpm">{bpm} BPM</span>
          </div>

          <div className="drill-active-pattern">
            <div className="drill-pattern-visual">
              {Array.from({ length: gapSettings.beatsOn }).map((_, i) => (
                <div key={`on-${i}`} className="drill-pattern-dot drill-pattern-dot-on" />
              ))}
              {Array.from({ length: gapSettings.beatsOff }).map((_, i) => (
                <div key={`off-${i}`} className="drill-pattern-dot drill-pattern-dot-off" />
              ))}
            </div>
            <div className="drill-pattern-labels">
              <span className="drill-pattern-label drill-pattern-label-on">
                {gapSettings.beatsOn} click{gapSettings.beatsOn !== 1 ? "s" : ""}
              </span>
              <span className="drill-pattern-label drill-pattern-label-off">
                {gapSettings.beatsOff} silent
              </span>
            </div>
          </div>

          {gapSettings.offBeatMode && (
            <div className="drill-offbeat-badge">Off-beat mode active</div>
          )}

          <div className="drill-stats">
            <div className="drill-stat">
              <span className="drill-stat-value">{cycleCount}</span>
              <span className="drill-stat-label">Cycles</span>
            </div>
            {drillTimer && timeRemaining > 0 && (
              <div className="drill-stat">
                <span className="drill-stat-value">{formatTime(timeRemaining)}</span>
                <span className="drill-stat-label">Remaining</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tips */}
      <section className="card">
        <h3 className="card-title">Tips for Gap Drills</h3>
        <ul>
          <li>Start with Easy (8 on, 4 off) until alignment feels natural</li>
          <li>Walk in place or tap your foot during gaps to maintain pulse</li>
          <li>Internally sing &quot;1-2-3-4&quot; during silent beats</li>
          <li>If you rush or drag, slow down 10 BPM and try again</li>
          <li>Success = click returns and you&apos;re still on time</li>
        </ul>
      </section>

      <section className="card">
        <div className="row">
          <a href="/drum/today" className="btn btn-ghost">
            Back to Today
          </a>
        </div>
      </section>
    </Shell>
  );
}
