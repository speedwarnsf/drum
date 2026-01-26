"use client";

import React, { useEffect, useState } from "react";

type MetronomeProps = {
  bpm: number;
};

export default function Metronome({ bpm }: MetronomeProps) {
  const [metroOn, setMetroOn] = useState(false);

  useEffect(() => {
    if (!metroOn) return;
    let isCancelled = false;
    let nextTime = 0;
    let audioCtx: AudioContext | null = null;

    const tick = (time: number) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.value = 1200;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.2, time + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + 0.06);
    };

    const schedule = () => {
      if (!audioCtx) return;
      const secondsPerBeat = 60 / clampBpm(bpm);
      while (nextTime < audioCtx.currentTime + 0.2) {
        tick(nextTime);
        nextTime += secondsPerBeat;
      }
      if (!isCancelled) {
        window.setTimeout(schedule, 60);
      }
    };

    const start = async () => {
      audioCtx = new AudioContext();
      await audioCtx.resume();
      nextTime = audioCtx.currentTime + 0.05;
      schedule();
    };

    start();

    return () => {
      isCancelled = true;
      if (audioCtx) {
        audioCtx.close();
      }
    };
  }, [metroOn, bpm]);

  return (
    <section className="card">
      <div className="metronome">
        <div>
          <div className="kicker">Metronome</div>
          <div className="metronome-title">{clampBpm(bpm)} BPM</div>
          <div className="metronome-sub">Quarter notes. Keep it calm.</div>
        </div>
        <button
          type="button"
          className={`btn ${metroOn ? "" : "btn-ghost"}`}
          onClick={() => setMetroOn((prev) => !prev)}
          aria-pressed={metroOn}
        >
          {metroOn ? "Stop click" : "Start click"}
        </button>
      </div>
      <div className={`metronome-led ${metroOn ? "metronome-led-on" : ""}`} />
    </section>
  );
}

function clampBpm(bpm: number) {
  return Math.max(30, Math.min(240, Math.round(bpm)));
}
