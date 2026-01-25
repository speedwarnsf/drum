"use client";

import React, { useEffect, useState } from "react";
import Shell from "../_ui/Shell";
import { Profile, loadProfile, saveProfile } from "../_lib/drumMvp";

export default function DrumStartPage() {
  const [ready, setReady] = useState(false);

  const [level, setLevel] = useState<Profile["level"]>("true_beginner");
  const [kit, setKit] = useState<Profile["kit"]>("roland_edrum");
  const [minutes, setMinutes] = useState<Profile["minutes"]>(15);
  const [goal, setGoal] = useState<Profile["goal"]>("comfort_time");

  useEffect(() => {
    const p = loadProfile();
    if (p) {
      setLevel(p.level);
      setKit(p.kit);
      setMinutes(p.minutes);
      setGoal(p.goal);
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <Shell title="Setup" subtitle="60 seconds. This is intentionally simple.">
      <section className="card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveProfile({ level, kit, minutes, goal });
            window.location.href = "/drum/today";
          }}
          className="form-grid"
        >
          <Field label="Experience">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as Profile["level"])}
            >
              <option value="true_beginner">Barely ever drummed</option>
              <option value="beginner">Beginner</option>
              <option value="rusty">Rusty</option>
            </select>
          </Field>

          <Field label="Kit">
            <select
              value={kit}
              onChange={(e) => setKit(e.target.value as Profile["kit"])}
            >
              <option value="roland_edrum">Roland e-drum kit</option>
              <option value="other_edrum">Other electronic kit</option>
              <option value="acoustic">Acoustic kit</option>
            </select>
          </Field>

          <Field label="Daily practice time">
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            >
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </Field>

          <Field label="Primary goal">
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as Profile["goal"])}
            >
              <option value="comfort_time">Comfort + steady time</option>
              <option value="basic_grooves">Basic grooves</option>
              <option value="play_music">Play along to songs</option>
            </select>
          </Field>

          <button type="submit" className="btn">
            Save and go to today's card
          </button>

          <p className="tiny">
            Stored locally in your browser (no accounts / database yet).
          </p>
        </form>
      </section>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
