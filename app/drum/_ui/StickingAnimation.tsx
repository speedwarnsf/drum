"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

type StickingAnimationProps = {
  stickingPattern: string; // e.g. "RLRL" or "RRLLRRLL"
  bpm: number;
  isPlaying: boolean;
  onBeatChange?: (beatIndex: number) => void;
};

export default function StickingAnimation({
  stickingPattern,
  bpm,
  isPlaying,
  onBeatChange,
}: StickingAnimationProps) {
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [leftStriking, setLeftStriking] = useState(false);
  const [rightStriking, setRightStriking] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const beatRef = useRef(-1);

  const pattern = stickingPattern.toUpperCase().split("");

  const advanceBeat = useCallback(() => {
    const nextBeat = (beatRef.current + 1) % pattern.length;
    beatRef.current = nextBeat;
    setCurrentBeat(nextBeat);
    onBeatChange?.(nextBeat);

    const hand = pattern[nextBeat];
    if (hand === "R") {
      setRightStriking(true);
      setLeftStriking(false);
    } else {
      setLeftStriking(true);
      setRightStriking(false);
    }

    // Reset strike after short duration
    setTimeout(() => {
      setLeftStriking(false);
      setRightStriking(false);
    }, Math.min(120, (60 / bpm) * 400));
  }, [pattern, bpm, onBeatChange]);

  useEffect(() => {
    if (isPlaying) {
      beatRef.current = -1;
      const msPerBeat = (60 / bpm) * 1000;
      advanceBeat();
      intervalRef.current = window.setInterval(advanceBeat, msPerBeat);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      beatRef.current = -1;
      setCurrentBeat(-1);
      setLeftStriking(false);
      setRightStriking(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, bpm, advanceBeat]);

  // Update interval when BPM changes while playing
  useEffect(() => {
    if (isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      const msPerBeat = (60 / bpm) * 1000;
      intervalRef.current = window.setInterval(advanceBeat, msPerBeat);
    }
  }, [bpm, isPlaying, advanceBeat]);

  const strikeDuration = Math.min(150, (60 / bpm) * 500);

  return (
    <div className="sticking-animation">
      <div className="sticking-animation-sticks">
        {/* Left hand */}
        <div className="sticking-stick-container">
          <div className="sticking-label" style={{ color: "#2980b9" }}>L</div>
          <div
            className="sticking-stick"
            style={{
              transform: leftStriking ? "rotate(-5deg) translateY(18px)" : "rotate(-15deg) translateY(0)",
              transition: `transform ${strikeDuration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
            }}
          >
            <svg width="40" height="120" viewBox="0 0 40 120" fill="none">
              {/* Stick shaft */}
              <rect x="17" y="0" width="6" height="100" fill="#8B6914" />
              {/* Tip */}
              <ellipse cx="20" cy="105" rx="8" ry="12" fill="#A0782C" />
              {/* Grip area */}
              <rect x="16" y="0" width="8" height="30" fill="#6B4F12" />
            </svg>
          </div>
          <div
            className="sticking-hit-zone"
            style={{
              opacity: leftStriking ? 1 : 0,
              transition: `opacity ${strikeDuration}ms ease`,
            }}
          />
        </div>

        {/* Pad / surface */}
        <div className="sticking-pad">
          <div
            className="sticking-pad-surface"
            style={{
              background: leftStriking || rightStriking
                ? "var(--ink, #3a3a3a)"
                : "var(--stroke, #ccc)",
              transition: `background ${strikeDuration}ms ease`,
            }}
          />
        </div>

        {/* Right hand */}
        <div className="sticking-stick-container">
          <div className="sticking-label" style={{ color: "#c0392b" }}>R</div>
          <div
            className="sticking-stick"
            style={{
              transform: rightStriking ? "rotate(5deg) translateY(18px)" : "rotate(15deg) translateY(0)",
              transition: `transform ${strikeDuration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
            }}
          >
            <svg width="40" height="120" viewBox="0 0 40 120" fill="none">
              <rect x="17" y="0" width="6" height="100" fill="#8B6914" />
              <ellipse cx="20" cy="105" rx="8" ry="12" fill="#A0782C" />
              <rect x="16" y="0" width="8" height="30" fill="#6B4F12" />
            </svg>
          </div>
          <div
            className="sticking-hit-zone"
            style={{
              opacity: rightStriking ? 1 : 0,
              transition: `opacity ${strikeDuration}ms ease`,
            }}
          />
        </div>
      </div>

      {/* Pattern indicator */}
      <div className="sticking-pattern-track">
        {pattern.map((hand, i) => (
          <div
            key={i}
            className="sticking-pattern-beat"
            style={{
              color: hand === "R" ? "#c0392b" : "#2980b9",
              fontWeight: i === currentBeat ? 900 : 400,
              background: i === currentBeat ? "var(--ink, #3a3a3a)" : "transparent",
              borderColor: i === currentBeat ? "var(--ink, #3a3a3a)" : "var(--stroke, #ccc)",
            }}
          >
            <span style={{ color: i === currentBeat ? "var(--bg, #fff)" : undefined }}>
              {hand}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
