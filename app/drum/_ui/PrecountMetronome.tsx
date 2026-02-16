"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { preloadSamples, playSample, hasSample } from "../_lib/samplePlayer";

type PrecountMetronomeProps = {
  bpm: number;
  precountBeats?: number;
  onPrecountComplete: () => void;
  onCancel: () => void;
};

export default function PrecountMetronome({
  bpm,
  precountBeats = 4,
  onPrecountComplete,
  onCancel,
}: PrecountMetronomeProps) {
  const [currentBeat, setCurrentBeat] = useState(0);
  const [active, setActive] = useState(false);
  const beatRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const playClick = useCallback((audioCtx: AudioContext, isFirst: boolean) => {
    // Try sample-based playback first
    const sampleName = isFirst ? "metronome-accent" : "metronome-click";
    if (playSample(sampleName as any, 0.8)) return;

    // Synthesis fallback
    const freq = isFirst ? 1800 : 1200;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }, []);

  const start = useCallback(async () => {
    await preloadSamples();
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    audioCtxRef.current = new AudioCtx();
    await audioCtxRef.current.resume();

    beatRef.current = 0;
    setCurrentBeat(1);
    setActive(true);

    // Play first click immediately
    playClick(audioCtxRef.current, true);

    const msPerBeat = (60 / bpm) * 1000;
    intervalRef.current = window.setInterval(() => {
      beatRef.current++;
      if (beatRef.current >= precountBeats) {
        // Done
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setActive(false);
        audioCtxRef.current?.close();
        audioCtxRef.current = null;
        onPrecountComplete();
      } else {
        setCurrentBeat(beatRef.current + 1);
        if (audioCtxRef.current) {
          playClick(audioCtxRef.current, false);
        }
      }
    }, msPerBeat);
  }, [bpm, precountBeats, onPrecountComplete, playClick]);

  useEffect(() => {
    start();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      audioCtxRef.current?.close();
    };
  }, [start]);

  const handleCancel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setActive(false);
    onCancel();
  };

  return (
    <div className="precount-overlay">
      <div className="precount-display">
        <div className="precount-label">Count In</div>
        <div className="precount-beat">{currentBeat}</div>
        <div className="precount-dots">
          {Array.from({ length: precountBeats }).map((_, i) => (
            <div
              key={i}
              className="precount-dot"
              style={{
                background: i < currentBeat ? "var(--ink, #3a3a3a)" : "var(--stroke, #ccc)",
              }}
            />
          ))}
        </div>
        <button className="btn btn-ghost" onClick={handleCancel} style={{ marginTop: 16 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
