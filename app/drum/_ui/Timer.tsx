"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useMemo, useState, useCallback } from "react";

type TimerProps = {
  id: string;
  durationSeconds: number;
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
  onComplete?: (id: string) => void;
};

export default function Timer({
  id,
  durationSeconds,
  activeId,
  onActiveChange,
  onComplete,
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
      onComplete?.(id);
      return;
    }
    const tid = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(tid);
  }, [isRunning, secondsLeft, id, onComplete]);

  useEffect(() => {
    if (isRunning) return;
    if (!isSelected) return;
    setSecondsLeft(durationSeconds);
  }, [durationSeconds, isRunning, isSelected]);

  const displaySeconds = useMemo(
    () => (isSelected ? secondsLeft : durationSeconds),
    [isSelected, secondsLeft, durationSeconds]
  );

  const progress = isSelected
    ? Math.max(0, 1 - secondsLeft / durationSeconds)
    : 0;

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

  return (
    <div className="timer-wrapper">
      <button
        type="button"
        className={`timer touch-target ${isSelected && isRunning ? "timer-active" : ""} ${isComplete ? "timer-done" : ""}`}
        onClick={toggle}
        aria-pressed={isSelected && isRunning}
        aria-label={`Timer ${formatTime(displaySeconds)}. ${isComplete ? "Complete" : isSelected && isRunning ? "Running, tap to pause" : "Paused, tap to start"}`}
      >
        {/* Progress bar fill */}
        {isSelected && (isRunning || progress > 0) && (
          <div
            className="timer-progress"
            style={{ width: `${progress * 100}%` }}
            aria-hidden="true"
          />
        )}
        <span className="timer-label">
          {isComplete ? "Done" : isSelected && isRunning ? "Tap to pause" : "Tap to start"}
        </span>
        <span className="timer-readout" aria-live="polite">
          {formatTime(displaySeconds)}
        </span>
        <span className="timer-state">
          {isComplete ? "Complete — tap to restart" : isSelected && isRunning ? "Running" : "Idle"}
        </span>
      </button>
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
/* eslint-enable react-hooks/set-state-in-effect */
