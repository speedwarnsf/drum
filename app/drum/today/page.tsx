"use client";

import React, { useEffect, useMemo, useState } from "react";
import Shell from "../_ui/Shell";
import { buildTodaysPlan, loadProfile, PracticePlan, Profile } from "../_lib/drumMvp";

export default function DrumTodayPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      window.location.href = "/drum/start";
      return;
    }
    setProfile(p);
  }, []);

  const plan: PracticePlan | null = useMemo(() => {
    if (!profile) return null;
    return buildTodaysPlan(profile);
  }, [profile]);

  if (!plan) return null;

  return (
    <Shell
      title="Today's Practice Card"
      subtitle={`${plan.minutes} minutes • Metronome: ${plan.metronome} • Focus: ${plan.focus}`}
    >
      <section className="card">
        <p>{plan.contextLine}</p>
      </section>

      {plan.blocks.map((b, idx) => (
        <article key={idx} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h2 className="card-title">{b.title}</h2>
            <div className="meta">{b.time}</div>
          </div>

          <ul style={{ marginTop: 0 }}>
            {b.bullets.map((x, i) => (
              <li key={i}>
                {x}
              </li>
            ))}
          </ul>

          {b.stop?.length ? (
            <div className="stop">
              <strong>Stop if:</strong> {b.stop.join(" ")}
            </div>
          ) : null}
        </article>
      ))}

      <article className="card">
        <h2 className="card-title">Reflection (30-60s)</h2>
        <ul style={{ marginTop: 0 }}>
          {plan.reflection.map((x, i) => (
            <li key={i}>
              {x}
            </li>
          ))}
        </ul>
        <div className="stop">
          <strong>Closure:</strong> {plan.closure}
        </div>

        <div className="row">
          <a href="/drum/journal" className="btn">
            Log today
          </a>
          <a href="/drum/start" className="btn btn-ghost">
            Edit setup
          </a>
        </div>
      </article>
    </Shell>
  );
}
