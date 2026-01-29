"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import Shell from "../_ui/Shell";
import { loadRemoteSessions, loadSessions, StoredSession } from "../_lib/drumMvp";

export default function DrumHistoryPage() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);

  useEffect(() => {
    let mounted = true;
    const local = loadSessions();
    setSessions(local);
    loadRemoteSessions().then((remote) => {
      if (!mounted) return;
      const map = new Map<string, StoredSession>();
      local.forEach((s) => map.set(s.id, s));
      remote.forEach((s) => map.set(s.id, s));
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
      );
      setSessions(merged);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Shell title="History" subtitle="Reopen any past session and run it again.">
      <section className="card">
        {sessions.length ? (
          <ul style={{ marginTop: 0 }}>
            {sessions.map((entry) => (
              <li key={entry.id}>
                <div className="row">
                  <a href={`/drum/today?session=${entry.id}`} className="btn">
                    {formatDate(entry.ts)} - {entry.plan.focus} ({entry.plan.minutes} min)
                  </a>
                  <span className="tiny">
                    Broke: {entry.log.broke} | Felt: {entry.log.felt}
                  </span>
                </div>
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

function formatDate(ts: string) {
  const date = new Date(ts);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
/* eslint-enable react-hooks/set-state-in-effect */
