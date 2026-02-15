"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  bpm: number;
  isPlaying: boolean;
  beat: number;
  size?: "small" | "medium" | "large";
};

export default function PendulumMetronome({ bpm, isPlaying, beat, size = "medium" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const directionRef = useRef(1);
  const frameRef = useRef<number>(0);

  const dimensions = { small: 120, medium: 200, large: 280 };
  const dim = dimensions[size];
  const canvasW = dim;
  const canvasH = dim * 1.2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale for high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    ctx.scale(dpr, dpr);

    const pivotX = canvasW / 2;
    const pivotY = 20;
    const armLength = canvasH * 0.65;
    const maxAngle = 0.45; // radians (~25 degrees)
    const beatInterval = 60 / bpm; // seconds per beat

    let startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, canvasW, canvasH);

      const styles = getComputedStyle(canvas);
      const inkColor = styles.getPropertyValue("color").trim() || "#3a3a3a";
      const strokeColor = "rgba(60, 60, 60, 0.2)";

      let angle: number;
      if (isPlaying) {
        // Sinusoidal swing synced to BPM
        const period = beatInterval * 2; // full swing = 2 beats
        angle = maxAngle * Math.sin((elapsed / period) * Math.PI * 2);
      } else {
        // Resting at center
        angle = 0;
      }

      angleRef.current = angle;

      // Arm endpoint
      const bobX = pivotX + Math.sin(angle) * armLength;
      const bobY = pivotY + Math.cos(angle) * armLength;

      // Draw base/housing at top
      ctx.fillStyle = inkColor;
      ctx.fillRect(pivotX - 15, 0, 30, 12);

      // Draw arm
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Draw weight (bob)
      const bobRadius = size === "small" ? 8 : size === "medium" ? 12 : 16;
      ctx.fillStyle = inkColor;
      ctx.fillRect(bobX - bobRadius, bobY - bobRadius, bobRadius * 2, bobRadius * 2);

      // Draw pivot point
      ctx.fillStyle = inkColor;
      ctx.fillRect(pivotX - 4, pivotY - 4, 8, 8);

      // Draw tick marks at the bottom
      const tickY = canvasH - 30;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;

      // Center tick
      ctx.beginPath();
      ctx.moveTo(pivotX, tickY);
      ctx.lineTo(pivotX, tickY + 10);
      ctx.stroke();

      // Left & right ticks
      for (const side of [-1, 1]) {
        const tickX = pivotX + side * Math.sin(maxAngle) * armLength * 0.8;
        ctx.beginPath();
        ctx.moveTo(tickX, tickY);
        ctx.lineTo(tickX, tickY + 6);
        ctx.stroke();
      }

      // BPM display
      ctx.fillStyle = inkColor;
      ctx.font = `bold ${size === "small" ? 12 : 14}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`${bpm} BPM`, pivotX, canvasH - 8);

      // Beat flash on downbeat
      if (isPlaying && beat === 1) {
        ctx.fillStyle = "rgba(60, 60, 60, 0.15)";
        ctx.fillRect(0, 0, canvasW, canvasH);
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [bpm, isPlaying, beat, canvasW, canvasH, size]);

  return (
    <div style={{ textAlign: "center" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: canvasW,
          height: canvasH,
          color: "var(--ink)",
          display: "block",
          margin: "0 auto",
        }}
        aria-label={`Pendulum metronome at ${bpm} BPM, ${isPlaying ? "playing" : "stopped"}`}
      />
    </div>
  );
}
