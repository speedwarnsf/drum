"use client";

import React, { useEffect, useState } from "react";
import Shell from "../_ui/Shell";
import { loadProfile, saveLog, loadLogs, clearAllLocal } from "../_lib/drumMvp";

export default function DrumJournalPage() {
  const [ready, setReady] = useState(false);
  const [broke, setBroke] = useState<
    "time" | "control" | "coordination" | "feel" | "nothing"
  >("time");
  const [felt, setFelt] = useState<"easier" | "right" | "harder">("right");
  const [note, setNote] = useState("");

  const [count, setCount] = useState(0);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      window.location.href = "/drum/start";
      return;
    }
    setCount(loadLogs().length);
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <Shell title="Log today" subtitle="This is how the system adapts: simple and honest.">
      <section className="card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveLog({
              broke,
              felt,
              note: note.trim() ? note.trim() : undefined,
            });
            window.location.href = "/drum/today";
          }}
          className="form-grid"
        >
          <Field label="What broke first?">
            <select
              value={broke}
              onChange={(e) => setBroke(e.target.value as typeof broke)}
            >
              <option value="time">Time</option>
              <option value="control">Control</option>
              <option value="coordination">Coordination</option>
              <option value="feel">Feel</option>
              <option value="nothing">Nothing major</option>
            </select>
          </Field>

          <Field label="How did it feel?">
            <select
              value={felt}
              onChange={(e) => setFelt(e.target.value as typeof felt)}
            >
              <option value="easier">Easier than expected</option>
              <option value="right">About right</option>
              <option value="harder">Harder than expected</option>
            </select>
          </Field>

          <Field label="One note (optional, 1 sentence)">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={140}
              placeholder="e.g., left hand got tense at 60 BPM"
            />
          </Field>

          <button type="submit" className="btn">
            Save log
          </button>

          <p className="tiny">
            Logs so far in this browser: {count}
          </p>
        </form>
      </section>

      <section className="card">
        <h2 className="card-title">Admin</h2>
        <p className="sub">
          Reset local progress on this device (profile + logs). Useful for testing.
        </p>
        <button
          type="button"
          onClick={() => {
            clearAllLocal();
            window.location.href = "/drum/start";
          }}
          className="btn btn-ghost"
        >
          Reset local progress
        </button>
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
