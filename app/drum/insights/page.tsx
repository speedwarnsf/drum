"use client";

import React, { useEffect, useState, useMemo } from "react";
import Shell from "../_ui/Shell";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { OfflineIndicator, useOnlineStatus } from "../_ui/OfflineIndicator";
import { getSupabaseClient } from "../_lib/supabaseClient";

type InsightsData = {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  maxStreak: number;
  weeklyBreakdown: { week: string; sessions: number; minutes: number }[];
  focusCounts: Record<string, number>;
  brokeCounts: Record<string, number>;
  feltCounts: Record<string, number>;
  dayOfWeekCounts: number[];
  hourCounts: number[];
  insights: string[];
};

export default function InsightsPage() {
  return (
    <ErrorBoundary>
      <InsightsPageInner />
      <OfflineIndicator />
    </ErrorBoundary>
  );
}

function InsightsPageInner() {
  const { isOnline } = useOnlineStatus();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!supabase || !isOnline) {
        setLoading(false);
        return;
      }
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/insights", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setData(await res.json());
        } else {
          setError("Failed to load insights.");
        }
      } catch (err) {
        setError("Could not connect to server.");
      }
      setLoading(false);
    }
    load();
  }, [supabase, isOnline]);

  if (loading) {
    return (
      <Shell title="Insights" subtitle="Analyzing your practice...">
        <section className="card"><p className="sub">Loading analytics...</p></section>
      </Shell>
    );
  }

  if (!data || error) {
    return (
      <Shell title="Insights" subtitle="Practice analytics">
        <section className="card">
          <p>{error || "Sign in and practice a few sessions to see insights."}</p>
          <div className="row" style={{ marginTop: 16 }}>
            <a href="/drum/today" className="btn btn-ghost">← Back to Practice</a>
          </div>
        </section>
      </Shell>
    );
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Shell title="Practice Insights" subtitle={`${data.totalSessions} sessions · ${data.totalMinutes} total minutes`}>
      {/* Key Metrics */}
      <section className="card insights-metrics">
        <div className="insights-metric-grid">
          <div className="insights-metric">
            <span className="insights-metric-value">{data.totalSessions}</span>
            <span className="insights-metric-label">Sessions</span>
          </div>
          <div className="insights-metric">
            <span className="insights-metric-value">{data.totalMinutes}</span>
            <span className="insights-metric-label">Minutes</span>
          </div>
          <div className="insights-metric">
            <span className="insights-metric-value">{data.currentStreak}</span>
            <span className="insights-metric-label">Current Streak</span>
          </div>
          <div className="insights-metric">
            <span className="insights-metric-value">{data.maxStreak}</span>
            <span className="insights-metric-label">Best Streak</span>
          </div>
        </div>
      </section>

      {/* AI Insights */}
      {data.insights.length > 0 && (
        <section className="card insights-ai">
          <h3 className="card-title">💡 Personalized Insights</h3>
          <ul className="insights-list">
            {data.insights.map((insight, i) => (
              <li key={i} className="insights-item">{insight}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Weekly Activity Chart */}
      {data.weeklyBreakdown.length > 0 && (
        <section className="card">
          <h3 className="card-title">📊 Weekly Activity</h3>
          <div className="insights-chart">
            {data.weeklyBreakdown.map((w) => {
              const maxSessions = Math.max(...data.weeklyBreakdown.map((wk) => wk.sessions), 1);
              const height = Math.max(8, (w.sessions / maxSessions) * 100);
              return (
                <div key={w.week} className="insights-bar-container">
                  <div className="insights-bar-value">{w.sessions}</div>
                  <div
                    className="insights-bar"
                    style={{ height: `${height}%` }}
                    title={`${w.week}: ${w.sessions} sessions, ${w.minutes} min`}
                  />
                  <div className="insights-bar-label">
                    {new Date(w.week + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Day of Week Distribution */}
      <section className="card">
        <h3 className="card-title">📅 Practice by Day</h3>
        <div className="insights-day-grid">
          {data.dayOfWeekCounts.map((count, i) => {
            const max = Math.max(...data.dayOfWeekCounts, 1);
            const intensity = count / max;
            return (
              <div key={i} className="insights-day-item">
                <div
                  className="insights-day-bar"
                  style={{
                    height: `${Math.max(4, intensity * 60)}px`,
                    opacity: Math.max(0.2, intensity),
                  }}
                />
                <div className="insights-day-label">{dayNames[i]}</div>
                <div className="insights-day-count">{count}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Time of Day Heatmap */}
      <section className="card">
        <h3 className="card-title">🕐 Practice by Time of Day</h3>
        <div className="insights-hour-grid">
          {data.hourCounts.map((count, hour) => {
            if (hour < 5 || hour > 23) return null; // Skip unlikely hours
            const max = Math.max(...data.hourCounts, 1);
            const intensity = count / max;
            return (
              <div
                key={hour}
                className="insights-hour-cell"
                style={{
                  backgroundColor: `rgba(102, 126, 234, ${Math.max(0.05, intensity)})`,
                }}
                title={`${hour}:00 — ${count} sessions`}
              >
                <span className="insights-hour-label">
                  {hour === 12 ? "12p" : hour > 12 ? `${hour - 12}p` : `${hour}a`}
                </span>
                {count > 0 && (
                  <span className="insights-hour-count">{count}</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* What Broke Distribution */}
      {Object.keys(data.brokeCounts).length > 0 && (
        <section className="card">
          <h3 className="card-title">Challenge Areas</h3>
          <div className="insights-distribution">
            {Object.entries(data.brokeCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([key, count]) => {
                const total = Object.values(data.brokeCounts).reduce((a, b) => a + b, 0);
                const percent = Math.round((count / total) * 100);
                const label =
                  key === "nothing" ? "Clean session" :
                  key === "time" ? "Timing ⏱️" :
                  key === "control" ? "Control 🎯" :
                  key === "coordination" ? "Coordination 🤝" :
                  key === "feel" ? "Feel 🎵" : key;
                return (
                  <div key={key} className="insights-dist-row">
                    <span className="insights-dist-label">{label}</span>
                    <div className="insights-dist-bar-track">
                      <div
                        className="insights-dist-bar-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="insights-dist-percent">{percent}%</span>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* How Sessions Felt */}
      {Object.keys(data.feltCounts).length > 0 && (
        <section className="card">
          <h3 className="card-title">🎭 How Sessions Felt</h3>
          <div className="insights-felt-grid">
            {[
              { key: "easier", emoji: "😊", label: "Easier" },
              { key: "right", emoji: "😌", label: "Just Right" },
              { key: "harder", emoji: "😤", label: "Harder" },
            ].map(({ key, emoji, label }) => {
              const count = data.feltCounts[key] || 0;
              const total = Object.values(data.feltCounts).reduce((a, b) => a + b, 0);
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={key} className="insights-felt-item">
                  <span className="insights-felt-emoji">{emoji}</span>
                  <span className="insights-felt-percent">{percent}%</span>
                  <span className="insights-felt-label">{label}</span>
                  <span className="insights-felt-count">{count} sessions</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Focus Areas */}
      {Object.keys(data.focusCounts).length > 0 && (
        <section className="card">
          <h3 className="card-title">🎯 Practice Focus Areas</h3>
          <div className="insights-focus-list">
            {Object.entries(data.focusCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([focus, count]) => (
                <div key={focus} className="insights-focus-item">
                  <span className="insights-focus-name">{focus}</span>
                  <span className="insights-focus-count">{count}×</span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Navigation */}
      <section className="card">
        <div className="row">
          <a href="/drum/today" className="btn btn-ghost">← Practice</a>
          <a href="/drum/progress" className="btn btn-ghost">Progress</a>
          <a href="/drum/goals" className="btn btn-ghost">Goals</a>
        </div>
      </section>
    </Shell>
  );
}
