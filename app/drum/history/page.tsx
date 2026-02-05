"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import Shell from "../_ui/Shell";
import Recorder from "../_ui/Recorder";
import { loadRemoteSessions, loadSessions, StoredSession } from "../_lib/drumMvp";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { SkeletonSessionList, SkeletonCard } from "../_ui/SkeletonCard";
import { OfflineIndicator, useOnlineStatus } from "../_ui/OfflineIndicator";

export default function DrumHistoryPage() {
  return (
    <ErrorBoundary>
      <HistoryPageInner />
      <OfflineIndicator />
    </ErrorBoundary>
  );
}

function HistoryPageInner() {
  const { isOnline } = useOnlineStatus();
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    
    try {
      const local = loadSessions();
      setSessions(local);
      
      if (isOnline) {
        loadRemoteSessions()
          .then((remote) => {
            if (!mounted) return;
            const map = new Map<string, StoredSession>();
            local.forEach((s) => map.set(s.id, s));
            remote.forEach((s) => map.set(s.id, s));
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
            );
            setSessions(merged);
          })
          .catch((err) => {
            console.error("[Drum] Failed to load remote sessions:", err);
            // Don't show error - we have local data
          })
          .finally(() => {
            if (mounted) setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("[Drum] Failed to load sessions:", err);
      setError("Unable to load your practice history. Please try again.");
      setLoading(false);
    }
    
    return () => {
      mounted = false;
    };
  }, [isOnline]);

  if (error) {
    return (
      <Shell title="History" subtitle="Something went wrong">
        <section className="card error-page-card">
          <div className="error-page-icon">🥁</div>
          <h2 className="card-title">Unable to load history</h2>
          <p>{error}</p>
          <div className="row" style={{ marginTop: 16, justifyContent: "center" }}>
            <button onClick={() => window.location.reload()} className="btn">
              Try again
            </button>
            <a href="/drum/today" className="btn btn-ghost">
              Back to practice
            </a>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell title="History" subtitle="Reopen any past session and run it again.">
      <section className="card">
        <h2 className="card-title">Self-Audit Recordings</h2>
        <p className="sub" style={{ marginBottom: 8 }}>
          Your recent practice recordings for self-review.
        </p>
        <Recorder showHistory compact />
      </section>

      <section className="card">
        <h2 className="card-title">Practice Sessions</h2>
        {loading ? (
          <SkeletonSessionList count={3} />
        ) : sessions.length ? (
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
