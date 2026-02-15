"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

type SpeedTrainerProps = {
  startBpm: number;
  maxBpm?: number;
  incrementBpm?: number;
  barsPerStep?: number;
  beatsPerBar?: number;
  onBpmChange: (bpm: number) => void;
  onStop?: () => void;
};

export default function SpeedTrainer({
  startBpm,
  maxBpm = 240,
  incrementBpm = 5,
  barsPerStep = 4,
  beatsPerBar = 4,
  onBpmChange,
  onStop,
}: SpeedTrainerProps) {
  const [active, setActive] = useState(false);
  const [currentBpm, setCurrentBpm] = useState(startBpm);
  const [barsCompleted, setBarsCompleted] = useState(0);
  const [totalBarsInStep, setTotalBarsInStep] = useState(barsPerStep);
  const beatCountRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const bpmRef = useRef(startBpm);

  const tick = useCallback(() => {
    beatCountRef.current++;
    if (beatCountRef.current >= beatsPerBar) {
      beatCountRef.current = 0;
      setBarsCompleted((prev) => {
        const next = prev + 1;
        if (next >= barsPerStep) {
          // Increment BPM
          const newBpm = Math.min(bpmRef.current + incrementBpm, maxBpm);
          bpmRef.current = newBpm;
          setCurrentBpm(newBpm);
          onBpmChange(newBpm);

          if (newBpm >= maxBpm) {
            // Hit max, stop
            setActive(false);
            onStop?.();
          } else {
            // Restart interval with new timing
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = window.setInterval(tick, (60 / newBpm) * 1000);
          }
          return 0;
        }
        return next;
      });
    }
  }, [beatsPerBar, barsPerStep, incrementBpm, maxBpm, onBpmChange, onStop]);

  const handleStart = () => {
    bpmRef.current = startBpm;
    setCurrentBpm(startBpm);
    onBpmChange(startBpm);
    beatCountRef.current = 0;
    setBarsCompleted(0);
    setActive(true);

    const msPerBeat = (60 / startBpm) * 1000;
    intervalRef.current = window.setInterval(tick, msPerBeat);
  };

  const handleStop = () => {
    setActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onStop?.();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Sync startBpm when not active
  useEffect(() => {
    if (!active) {
      setCurrentBpm(startBpm);
      bpmRef.current = startBpm;
    }
  }, [startBpm, active]);

  const progressInStep = barsCompleted / barsPerStep;

  return (
    <div className="speed-trainer">
      <div className="kicker">Speed Trainer</div>
      <p className="sub" style={{ margin: "4px 0 12px" }}>
        Auto-increments BPM by {incrementBpm} every {barsPerStep} bars
      </p>

      {active ? (
        <>
          <div className="speed-trainer-display">
            <div className="speed-trainer-bpm">{currentBpm} BPM</div>
            <div className="speed-trainer-progress-label">
              Bar {barsCompleted + 1} of {barsPerStep}
            </div>
          </div>

          {/* Progress bar */}
          <div className="speed-trainer-bar">
            <div
              className="speed-trainer-bar-fill"
              style={{ width: `${progressInStep * 100}%` }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn" onClick={handleStop}>
              Stop
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn" onClick={handleStart}>
            Start Speed Trainer
          </button>
          <span className="sub" style={{ fontSize: "0.8rem" }}>
            Starting at {startBpm} BPM, max {maxBpm} BPM
          </span>
        </div>
      )}
    </div>
  );
}
