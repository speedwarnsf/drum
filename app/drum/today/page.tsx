"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Shell from "../_ui/Shell";
import Metronome from "../_ui/Metronome";
import Timer from "../_ui/Timer";
import {
  buildTodaysPlan,
  loadProfile,
  loadProfileFromSupabase,
  loadRemoteSessions,
  loadSessions,
  saveLastPlan,
  saveProfile,
  PracticePlan,
  Profile,
  StoredSession,
} from "../_lib/drumMvp";

export default function DrumTodayPage() {
  return (
    <Suspense fallback={null}>
      <DrumTodayInner />
    </Suspense>
  );
}

function DrumTodayInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [metroBpm, setMetroBpm] = useState<number>(60);
  const [sessionPlan, setSessionPlan] = useState<PracticePlan | null>(null);
  const [sessionMeta, setSessionMeta] = useState<StoredSession | null>(null);
  const [sessions, setSessions] = useState<StoredSession[]>([]);

  useEffect(() => {
    let mounted = true;
    const local = loadSessions();
    const setAll = (list: StoredSession[]) => {
      if (!mounted) return;
      setSessions(list);
      if (sessionId) {
        const match = list.find((item) => item.id === sessionId) ?? null;
        setSessionPlan(match ? match.plan : null);
        setSessionMeta(match);
      }
    };
    setAll(local);
    loadRemoteSessions().then((remote) => {
      const map = new Map<string, StoredSession>();
      local.forEach((s) => map.set(s.id, s));
      remote.forEach((s) => map.set(s.id, s));
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
      );
      setAll(merged);
    });
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) return;
    setSessionPlan(null);
    setSessionMeta(null);
    const p = loadProfile();
    if (p) {
      setProfile(p);
      return;
    }
    loadProfileFromSupabase().then((remote) => {
      if (remote) {
        saveProfile(remote);
        setProfile(remote);
        return;
      }
      window.location.href = "/drum/start";
    });
  }, [sessionId]);

  const plan: PracticePlan | null = useMemo(() => {
    if (sessionPlan) return sessionPlan;
    if (!profile) return null;
    return buildTodaysPlan(profile);
  }, [profile, sessionPlan]);

  useEffect(() => {
    if (!plan) return;
    if (!sessionPlan) {
      saveLastPlan(plan);
    }
    const bpm = parseBpm(plan.metronome);
    if (bpm) setMetroBpm(bpm);
  }, [plan, sessionPlan]);

  if (!plan) return null;

  return (
    <Shell
      title={sessionMeta ? "Saved Practice Card" : "Today's Practice Card"}
      subtitle={`${plan.minutes} minutes • Metronome: ${plan.metronome} • Focus: ${plan.focus}`}
    >
      {sessionMeta ? (
        <section className="card">
          <div className="kicker">History</div>
          <p className="sub">
            Viewing a saved session from {formatDate(sessionMeta.ts)}.
          </p>
          <div className="row">
            <a href="/drum/today" className="btn btn-ghost">
              Back to today
            </a>
          </div>
        </section>
      ) : null}

      <section className="card">
        <p>{plan.contextLine}</p>
      </section>

      {plan.setupGuide ? (
        <details className="setup-guide" open={plan.setupGuide.defaultOpen}>
          <summary>
            <span className="setup-title">{plan.setupGuide.title}</span>
            <span className="setup-sub">Tap to expand or collapse</span>
          </summary>
          <div className="setup-body">
            <ul>
              {plan.setupGuide.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </details>
      ) : null}

      <Metronome bpm={metroBpm} />

      {plan.blocks.map((b, idx) => (
        <article key={idx} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h2 className="card-title">{b.title}</h2>
            <div className="meta">{b.time}</div>
          </div>

          <Timer
            id={`block-${idx}`}
            durationSeconds={Math.round(parseMinutes(b.time) * 60)}
            activeId={activeBlock}
            onActiveChange={setActiveBlock}
          />

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

      <section className="card">
        <h2 className="card-title">Practice history</h2>
        {sessions.length ? (
          <ul style={{ marginTop: 0 }}>
            {sessions.map((entry) => (
              <li key={entry.id}>
                <a href={`/drum/today?session=${entry.id}`} className="btn btn-ghost">
                  {formatDate(entry.ts)} - {entry.plan.focus} ({entry.plan.minutes} min)
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sub">No history yet. Log a session to save it here.</p>
        )}
      </section>
    </Shell>
  );
}

function parseMinutes(text: string) {
  const match = text.match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function parseBpm(text: string) {
  const match = text.match(/(\d+)\s*BPM/i);
  return match ? Number(match[1]) : 60;
}

function formatDate(ts: string) {
  const date = new Date(ts);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
/* eslint-enable react-hooks/set-state-in-effect */
