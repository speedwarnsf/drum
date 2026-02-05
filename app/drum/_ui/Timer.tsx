"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useMemo, useState } from "react";

type TimerProps = {
  id: string;
  durationSeconds: number;
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
};

export default function Timer({
  id,
  durationSeconds,
  activeId,
  onActiveChange,
}: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const isSelected = activeId ? activeId === id : true;

  useEffect(() => {
    if (!isSelected && isRunning) {
      setIsRunning(false);
    }
  }, [isSelected, isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) {
      setIsRunning(false);
      setIsComplete(true);
      return;
    }
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (isRunning) return;
    if (!isSelected) return;
    setSecondsLeft(durationSeconds);
  }, [durationSeconds, isRunning, isSelected]);

  const displaySeconds = useMemo(
    () => (isSelected ? secondsLeft : durationSeconds),
    [isSelected, secondsLeft, durationSeconds]
  );

  const toggle = () => {
    if (onActiveChange) onActiveChange(id);
    if (!isSelected) {
      setSecondsLeft(durationSeconds);
      setIsRunning(true);
      setIsComplete(false);
      return;
    }
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    if (secondsLeft <= 0) {
      setSecondsLeft(durationSeconds);
    }
    setIsComplete(false);
    setIsRunning(true);
  };

  const dismissComplete = () => setIsComplete(false);

  return (
    <>
      {isComplete ? (
        <div
          className="timer-flash"
          onClick={dismissComplete}
          onTouchEnd={(e) => {
            e.preventDefault();
            dismissComplete();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") dismissComplete();
          }}
          aria-label="Timer complete. Tap to dismiss."
        >
          <div className="timer-flash-inner">
            <div className="kicker">Time</div>
            <div className="timer-flash-title">Block Complete</div>
            <div className="timer-flash-sub">Tap anywhere to continue.</div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className={`timer touch-target ${isSelected && isRunning ? "timer-active" : ""}`}
        onClick={toggle}
        aria-pressed={isSelected && isRunning}
        aria-label={`Timer ${formatTime(displaySeconds)}. ${isSelected && isRunning ? "Running, tap to pause" : "Paused, tap to start"}`}
      >
        <span className="timer-label">
          Tap to {isSelected && isRunning ? "pause" : "start"}
        </span>
        <span className="timer-readout" aria-live="polite">
          {formatTime(displaySeconds)}
        </span>
        <span className="timer-state">
          {isSelected && isRunning ? "Running" : "Idle"}
        </span>
      </button>
    </>
  );
}

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
/* eslint-enable react-hooks/set-state-in-effect */
