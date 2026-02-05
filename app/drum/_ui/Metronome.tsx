"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import GapDrillControls, { GapPreset, GapSettings, GAP_PRESETS } from "./GapDrillControls";

type MetronomeProps = {
  bpm: number;
  showGapControls?: boolean;
  initialGapSettings?: Partial<GapSettings>;
  compact?: boolean;
  showVisualPulse?: boolean; // Show visual pulse circle for visual learners
};

type BeatState = {
  beat: number;        // Current beat in cycle (1-indexed)
  inGap: boolean;      // Whether we're in the silent gap
  cyclePosition: number; // Position in full cycle
  totalCycle: number;  // Total beats in cycle
  isPulse: boolean;    // Flash state for visual pulse
};

export default function Metronome({
  bpm,
  showGapControls = false,
  initialGapSettings,
  compact = false,
  showVisualPulse: initialShowVisualPulse = false,
}: MetronomeProps) {
  const [metroOn, setMetroOn] = useState(false);
  const [gapEnabled, setGapEnabled] = useState(false);
  const [gapPreset, setGapPreset] = useState<GapPreset>("medium");
  const [showVisualPulse, setShowVisualPulse] = useState(initialShowVisualPulse);
  const [gapSettings, setGapSettings] = useState<GapSettings>({
    beatsOn: initialGapSettings?.beatsOn ?? GAP_PRESETS.medium.beatsOn,
    beatsOff: initialGapSettings?.beatsOff ?? GAP_PRESETS.medium.beatsOff,
    offBeatMode: initialGapSettings?.offBeatMode ?? false,
  });
  const [beatState, setBeatState] = useState<BeatState>({
    beat: 0,
    inGap: false,
    cyclePosition: 0,
    totalCycle: gapSettings.beatsOn + gapSettings.beatsOff,
    isPulse: false,
  });

  // Refs for audio scheduling
  const audioCtxRef = useRef<AudioContext | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const nextTimeRef = useRef<number>(0);
  const beatCountRef = useRef<number>(0);
  const cancelledRef = useRef<boolean>(false);

  // Update totalCycle when settings change
  useEffect(() => {
    setBeatState((prev) => ({
      ...prev,
      totalCycle: gapSettings.beatsOn + gapSettings.beatsOff,
    }));
  }, [gapSettings.beatsOn, gapSettings.beatsOff]);

  // Clear pulse after a short duration
  const pulseTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (beatState.isPulse) {
      pulseTimeoutRef.current = window.setTimeout(() => {
        setBeatState((prev) => ({ ...prev, isPulse: false }));
      }, 80); // Short pulse duration
    }
    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, [beatState.isPulse]);

  const clampedBpm = Math.max(30, Math.min(240, Math.round(bpm)));

  const tick = useCallback(
    (audioCtx: AudioContext, time: number, shouldPlay: boolean) => {
      if (!shouldPlay) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.value = gapSettings.offBeatMode ? 800 : 1200; // Lower pitch for off-beat
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.2, time + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + 0.06);
    },
    [gapSettings.offBeatMode]
  );

  const schedule = useCallback(() => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx || cancelledRef.current) return;

    const secondsPerBeat = 60 / clampedBpm;
    const secondsPerHalfBeat = secondsPerBeat / 2;
    const lookahead = 0.2;

    while (nextTimeRef.current < audioCtx.currentTime + lookahead) {
      const totalCycle = gapSettings.beatsOn + gapSettings.beatsOff;
      const cyclePosition = beatCountRef.current % totalCycle;
      const inGap = gapEnabled && cyclePosition >= gapSettings.beatsOn;
      const shouldPlay = !inGap;

      // Update visual state
      setBeatState({
        beat: (cyclePosition % (inGap ? gapSettings.beatsOff : gapSettings.beatsOn)) + 1,
        inGap,
        cyclePosition: cyclePosition + 1,
        totalCycle,
        isPulse: shouldPlay, // Trigger pulse on audible beats
      });

      // For off-beat mode, schedule click at half-beat offset
      if (gapSettings.offBeatMode) {
        tick(audioCtx, nextTimeRef.current + secondsPerHalfBeat, shouldPlay);
      } else {
        tick(audioCtx, nextTimeRef.current, shouldPlay);
      }

      nextTimeRef.current += secondsPerBeat;
      beatCountRef.current++;
    }

    schedulerRef.current = window.setTimeout(schedule, 60);
  }, [clampedBpm, gapEnabled, gapSettings, tick]);

  useEffect(() => {
    if (!metroOn) {
      setBeatState({ beat: 0, inGap: false, cyclePosition: 0, totalCycle: gapSettings.beatsOn + gapSettings.beatsOff, isPulse: false });
      return;
    }

    cancelledRef.current = false;
    beatCountRef.current = 0;

    const start = async () => {
      // Use webkitAudioContext for older Safari
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("AudioContext not supported");
        return;
      }
      audioCtxRef.current = new AudioContextClass();
      await audioCtxRef.current.resume();
      nextTimeRef.current = audioCtxRef.current.currentTime + 0.05;
      schedule();
    };

    start();

    return () => {
      cancelledRef.current = true;
      if (schedulerRef.current) {
        window.clearTimeout(schedulerRef.current);
        schedulerRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [metroOn, schedule, gapSettings.beatsOn, gapSettings.beatsOff]);

  // Reset beat count when gap settings change while playing
  useEffect(() => {
    beatCountRef.current = 0;
  }, [gapEnabled]);

  const beatsUntilChange = gapEnabled
    ? beatState.inGap
      ? gapSettings.beatsOff - ((beatState.cyclePosition - 1) % gapSettings.beatsOff)
      : gapSettings.beatsOn - ((beatState.cyclePosition - 1) % gapSettings.beatsOn)
    : 0;

  const toggleMetro = () => setMetroOn((prev) => !prev);

  return (
    <section className="card">
      <div className="metronome">
        <div>
          <div className="kicker">Metronome</div>
          <div className="metronome-title">{clampedBpm} BPM</div>
          <div className="metronome-sub">
            {gapSettings.offBeatMode && gapEnabled ? "Off-beat clicks. " : "Quarter notes. "}
            {gapEnabled
              ? `${gapSettings.beatsOn} on, ${gapSettings.beatsOff} off.`
              : "Keep it calm."}
          </div>
        </div>
        <button
          type="button"
          className={`btn touch-target ${metroOn ? "" : "btn-ghost"}`}
          onClick={toggleMetro}
          aria-pressed={metroOn}
          aria-label={metroOn ? "Stop metronome" : "Start metronome"}
        >
          {metroOn ? "Stop click" : "Start click"}
        </button>
      </div>

      {/* Visual Pulse Circle - for visual learners */}
      {metroOn && showVisualPulse && (
        <div className="visual-metronome" role="img" aria-label={`Beat ${beatState.beat}`}>
          <div className="visual-metronome-beat-indicator">
            {gapEnabled && beatState.inGap ? "🤫" : beatState.beat || "—"}
          </div>
          <div
            className={`visual-metronome-circle ${
              beatState.isPulse ? "visual-metronome-circle-pulse" : ""
            } ${gapEnabled && beatState.inGap ? "visual-metronome-circle-gap" : ""}`}
          />
          <div className="visual-metronome-beat-indicator">
            {gapEnabled ? (beatState.inGap ? "gap" : "on") : ""}
          </div>
        </div>
      )}

      {/* Visual feedback bar */}
      {metroOn && gapEnabled && (
        <div className="gap-visual" role="img" aria-label={`Gap drill: ${beatState.inGap ? "silent gap" : "clicking"}, beat ${beatState.beat}`}>
          <div className="gap-visual-bar">
            <div
              className={`gap-visual-fill ${beatState.inGap ? "gap-visual-fill-gap" : "gap-visual-fill-click"}`}
              style={{
                width: `${(beatState.cyclePosition / beatState.totalCycle) * 100}%`,
              }}
            />
            {/* Beat markers */}
            <div className="gap-visual-markers" aria-hidden="true">
              {Array.from({ length: beatState.totalCycle }).map((_, i) => (
                <div
                  key={i}
                  className={`gap-visual-marker ${
                    i < gapSettings.beatsOn ? "gap-visual-marker-click" : "gap-visual-marker-gap"
                  } ${i === beatState.cyclePosition - 1 ? "gap-visual-marker-active" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="gap-visual-info">
            <span className={`gap-visual-status ${beatState.inGap ? "gap-visual-status-gap" : "gap-visual-status-click"}`}>
              {beatState.inGap ? "🔇 GAP" : "🔊 CLICK"}
            </span>
            <span className="gap-visual-beat">
              Beat {beatState.beat} of {beatState.inGap ? gapSettings.beatsOff : gapSettings.beatsOn}
            </span>
            <span className="gap-visual-countdown">
              {beatsUntilChange} → {beatState.inGap ? "click" : "gap"}
            </span>
          </div>
        </div>
      )}

      {/* Simple LED for non-gap mode */}
      {metroOn && !gapEnabled && (
        <div className="metronome-led metronome-led-on" role="img" aria-label="Metronome active" />
      )}

      {/* LED with gap awareness */}
      {metroOn && gapEnabled && (
        <div
          className={`metronome-led ${beatState.inGap ? "metronome-led-gap" : "metronome-led-on"}`}
          role="img"
          aria-hidden="true"
        />
      )}

      {/* Inactive LED */}
      {!metroOn && <div className="metronome-led" role="img" aria-label="Metronome inactive" />}

      {/* Visual Pulse Toggle */}
      <div className="visual-metronome-toggle">
        <label>
          <input
            type="checkbox"
            checked={showVisualPulse}
            onChange={(e) => setShowVisualPulse(e.target.checked)}
          />
          <span>Show visual pulse (for visual learners)</span>
        </label>
      </div>

      {/* Gap drill controls */}
      {showGapControls && (
        <GapDrillControls
          enabled={gapEnabled}
          onEnabledChange={setGapEnabled}
          settings={gapSettings}
          onSettingsChange={setGapSettings}
          preset={gapPreset}
          onPresetChange={setGapPreset}
          compact={compact}
        />
      )}
    </section>
  );
}
