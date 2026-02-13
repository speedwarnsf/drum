"use client";

import React, { useEffect, useState, useMemo } from "react";
import Shell from "../_ui/Shell";
import { Icon } from "../_ui/Icon";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { OfflineIndicator, useOnlineStatus } from "../_ui/OfflineIndicator";
import { getSupabaseClient } from "../_lib/supabaseClient";

type GoalProgress = {
  minutes: number;
  sessions: number;
  streak: number;
  minutesPercent: number;
  sessionsPercent: number;
  streakPercent: number;
};

type Goal = {
  id: string;
  goal_type: string;
  target_minutes: number;
  target_sessions: number;
  target_streak: number;
  starts_at: string;
  ends_at: string;
  completed_at: string | null;
  progress: GoalProgress | null;
};

export default function GoalsPage() {
  return (
    <ErrorBoundary>
      <GoalsPageInner />
      <OfflineIndicator />
    </ErrorBoundary>
  );
}

function GoalsPageInner() {
  const { isOnline } = useOnlineStatus();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // New goal form
  const [goalType, setGoalType] = useState<"weekly" | "monthly">("weekly");
  const [targetMinutes, setTargetMinutes] = useState(60);
  const [targetSessions, setTargetSessions] = useState(5);
  const [targetStreak, setTargetStreak] = useState(3);

  useEffect(() => {
    async function init() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }
      setAccessToken(token);
      await fetchGoals(token);
    }
    init();
  }, [supabase]);

  async function fetchGoals(token: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/goals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
      }
    } catch (err) {
      console.error("[Goals] Failed to fetch:", err);
    }
    setLoading(false);
  }

  async function createGoal() {
    if (!accessToken) return;
    setCreating(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          goalType,
          targetMinutes,
          targetSessions,
          targetStreak,
        }),
      });
      if (res.ok) {
        setShowCreate(false);
        await fetchGoals(accessToken);
      }
    } catch (err) {
      console.error("[Goals] Failed to create:", err);
    }
    setCreating(false);
  }

  const activeGoals = goals.filter(
    (g) => g.progress && !g.completed_at
  );
  const pastGoals = goals.filter(
    (g) => !g.progress || g.completed_at
  );

  if (!accessToken && !loading) {
    return (
      <Shell title="Practice Goals" subtitle="Set targets, track progress">
        <section className="card">
          <p>Sign in to set and track practice goals.</p>
          <div className="row" style={{ marginTop: 16 }}>
            <a href="/drum/login" className="btn">Sign In</a>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell title="Practice Goals" subtitle="Set targets, build consistency">
      {/* Active Goals */}
      {loading ? (
        <section className="card">
          <p className="sub">Loading goals...</p>
        </section>
      ) : activeGoals.length > 0 ? (
        activeGoals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))
      ) : (
        <section className="card">
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: "2rem", marginBottom: 8 }}></p>
            <h3 className="card-title">No Active Goals</h3>
            <p className="sub">Set a goal to stay on track with your practice.</p>
          </div>
        </section>
      )}

      {/* Create Goal */}
      {!showCreate ? (
        <section className="card" style={{ textAlign: "center" }}>
          <button className="btn" onClick={() => setShowCreate(true)}>
            + Set New Goal
          </button>
        </section>
      ) : (
        <section className="card">
          <h3 className="card-title">New Practice Goal</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            {/* Goal type */}
            <div>
              <label className="goals-label">Goal Period</label>
              <div className="goals-type-buttons">
                <button
                  className={`btn ${goalType === "weekly" ? "" : "btn-ghost"}`}
                  onClick={() => setGoalType("weekly")}
                >
                  Weekly
                </button>
                <button
                  className={`btn ${goalType === "monthly" ? "" : "btn-ghost"}`}
                  onClick={() => setGoalType("monthly")}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Target minutes */}
            <div>
              <label className="goals-label">
                Total Practice Time: {targetMinutes} minutes
              </label>
              <input
                type="range"
                min={15}
                max={goalType === "monthly" ? 600 : 180}
                step={15}
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Number(e.target.value))}
                className="goals-slider"
              />
              <div className="goals-slider-labels">
                <span>15 min</span>
                <span>{goalType === "monthly" ? "600" : "180"} min</span>
              </div>
            </div>

            {/* Target sessions */}
            <div>
              <label className="goals-label">
                Practice Sessions: {targetSessions}
              </label>
              <input
                type="range"
                min={1}
                max={goalType === "monthly" ? 30 : 7}
                step={1}
                value={targetSessions}
                onChange={(e) => setTargetSessions(Number(e.target.value))}
                className="goals-slider"
              />
              <div className="goals-slider-labels">
                <span>1</span>
                <span>{goalType === "monthly" ? "30" : "7"}</span>
              </div>
            </div>

            {/* Target streak */}
            <div>
              <label className="goals-label">
                Streak Target: {targetStreak} days
              </label>
              <input
                type="range"
                min={1}
                max={goalType === "monthly" ? 14 : 7}
                step={1}
                value={targetStreak}
                onChange={(e) => setTargetStreak(Number(e.target.value))}
                className="goals-slider"
              />
              <div className="goals-slider-labels">
                <span>1 day</span>
                <span>{goalType === "monthly" ? "14" : "7"} days</span>
              </div>
            </div>

            {/* Preset quick picks */}
            <div>
              <label className="goals-label">Quick Presets</label>
              <div className="goals-presets">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setTargetMinutes(45);
                    setTargetSessions(3);
                    setTargetStreak(3);
                  }}
                >
                  🌱 Casual
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setTargetMinutes(90);
                    setTargetSessions(5);
                    setTargetStreak(4);
                  }}
                >
                  💪 Committed
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setTargetMinutes(150);
                    setTargetSessions(7);
                    setTargetStreak(7);
                  }}
                >
                  Intense
                </button>
              </div>
            </div>

            <div className="row" style={{ justifyContent: "center", marginTop: 8 }}>
              <button
                className="btn"
                onClick={createGoal}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Goal"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Past Goals */}
      {pastGoals.length > 0 && (
        <section className="card">
          <h3 className="card-title">Past Goals</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {pastGoals.map((goal) => (
              <div key={goal.id} className="goals-past-item">
                <div className="goals-past-header">
                  <span className="goals-past-type">
                    {goal.goal_type === "weekly" ? "Weekly" : "Monthly"}
                  </span>
                  <span className="goals-past-dates">
                    {formatDate(goal.starts_at)} — {formatDate(goal.ends_at)}
                  </span>
                  {goal.completed_at && (
                    <span className="goals-past-badge">Completed</span>
                  )}
                </div>
                <div className="goals-past-targets">
                  {goal.target_minutes} min · {goal.target_sessions} sessions · {goal.target_streak}-day streak
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Navigation */}
      <section className="card">
        <div className="row">
          <a href="/drum/today" className="btn btn-ghost">← Back to Today</a>
          <a href="/drum/progress" className="btn btn-ghost">Progress</a>
          <a href="/drum/insights" className="btn btn-ghost">Insights</a>
        </div>
      </section>
    </Shell>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const p = goal.progress!;
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(goal.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const overallPercent = Math.round(
    (p.minutesPercent + p.sessionsPercent + p.streakPercent) / 3
  );

  return (
    <section className="card goals-active-card">
      <div className="goals-active-header">
        <div>
          <span className="goals-active-type">
            {goal.goal_type === "weekly" ? "📅 Weekly Goal" : "📆 Monthly Goal"}
          </span>
          <span className="goals-active-dates">
            {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
          </span>
        </div>
        <div className="goals-active-overall">
          <span className="goals-active-overall-value">{overallPercent}%</span>
        </div>
      </div>

      <div className="goals-progress-bars">
        <GoalProgressBar
          label="Practice Time"
          current={p.minutes}
          target={goal.target_minutes}
          unit="min"
          percent={p.minutesPercent}
          emoji="⏱️"
        />
        <GoalProgressBar
          label="Sessions"
          current={p.sessions}
          target={goal.target_sessions}
          unit=""
          percent={p.sessionsPercent}
          emoji=""
        />
        <GoalProgressBar
          label="Streak"
          current={p.streak}
          target={goal.target_streak}
          unit="days"
          percent={p.streakPercent}
          emoji=""
        />
      </div>
    </section>
  );
}

function GoalProgressBar({
  label,
  current,
  target,
  unit,
  percent,
  emoji,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  percent: number;
  emoji: string;
}) {
  const completed = percent >= 100;
  return (
    <div className="goals-progress-bar">
      <div className="goals-progress-label">
        <span>
          {emoji} {label}
        </span>
        <span className={completed ? "goals-complete" : ""}>
          {current}/{target} {unit} {completed ? "done" : ""}
        </span>
      </div>
      <div className="goals-bar-track">
        <div
          className={`goals-bar-fill ${completed ? "goals-bar-complete" : ""}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
