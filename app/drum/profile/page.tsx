"use client";

import React, { useState, useEffect, useMemo } from "react";
import Shell from "../_ui/Shell";
import { Icon } from "../_ui/Icon";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { loadProfile, loadSessions, StoredSession, Profile } from "../_lib/drumMvp";
import { calculatePracticeStats, checkAchievements, formatPracticeTime, PracticeStats, Achievement } from "../_lib/statsUtils";
import { getPracticeLog, RudimentPracticeEntry } from "../_lib/practiceTracker";
import { ESSENTIAL_RUDIMENTS } from "../_lib/rudimentLibrary";

const BADGE_DEFS: {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (stats: PracticeStats, log: RudimentPracticeEntry[]) => boolean;
  progress: (stats: PracticeStats, log: RudimentPracticeEntry[]) => number;
}[] = [
  {
    id: "first_session",
    title: "First Step",
    description: "Complete your first practice session",
    icon: "target",
    check: (s) => s.totalSessions >= 1,
    progress: (s) => Math.min(100, (s.totalSessions / 1) * 100),
  },
  {
    id: "ten_sessions",
    title: "Finding Rhythm",
    description: "Complete 10 practice sessions",
    icon: "drum",
    check: (s) => s.totalSessions >= 10,
    progress: (s) => Math.min(100, (s.totalSessions / 10) * 100),
  },
  {
    id: "fifty_sessions",
    title: "Dedicated",
    description: "Complete 50 practice sessions",
    icon: "star",
    check: (s) => s.totalSessions >= 50,
    progress: (s) => Math.min(100, (s.totalSessions / 50) * 100),
  },
  {
    id: "centurion",
    title: "Centurion",
    description: "Complete 100 practice sessions",
    icon: "temple",
    check: (s) => s.totalSessions >= 100,
    progress: (s) => Math.min(100, (s.totalSessions / 100) * 100),
  },
  {
    id: "week_streak",
    title: "Week Warrior",
    description: "Maintain a 7-day practice streak",
    icon: "flame",
    check: (s) => s.streak.longest >= 7,
    progress: (s) => Math.min(100, (s.streak.longest / 7) * 100),
  },
  {
    id: "month_streak",
    title: "Steady Hand",
    description: "Maintain a 30-day practice streak",
    icon: "gem",
    check: (s) => s.streak.longest >= 30,
    progress: (s) => Math.min(100, (s.streak.longest / 30) * 100),
  },
  {
    id: "hour_practiced",
    title: "First Hour",
    description: "Accumulate 60 minutes of practice",
    icon: "stopwatch",
    check: (s) => s.totalMinutes >= 60,
    progress: (s) => Math.min(100, (s.totalMinutes / 60) * 100),
  },
  {
    id: "ten_hours",
    title: "Ten Hours In",
    description: "Accumulate 10 hours of practice",
    icon: "stopwatch",
    check: (s) => s.totalMinutes >= 600,
    progress: (s) => Math.min(100, (s.totalMinutes / 600) * 100),
  },
  {
    id: "five_rudiments",
    title: "Building Blocks",
    description: "Practice 5 different rudiments",
    icon: "layers",
    check: (_, log) => {
      const unique = new Set(log.map(e => e.rudimentId));
      return unique.size >= 5;
    },
    progress: (_, log) => {
      const unique = new Set(log.map(e => e.rudimentId));
      return Math.min(100, (unique.size / 5) * 100);
    },
  },
  {
    id: "all_rudiments",
    title: "Complete Collection",
    description: "Practice all 40 PAS rudiments",
    icon: "book",
    check: (_, log) => {
      const unique = new Set(log.map(e => e.rudimentId));
      return unique.size >= 40;
    },
    progress: (_, log) => {
      const unique = new Set(log.map(e => e.rudimentId));
      return Math.min(100, (unique.size / 40) * 100);
    },
  },
  {
    id: "tempo_100",
    title: "Triple Digits",
    description: "Practice a rudiment at 100+ BPM",
    icon: "speed",
    check: (_, log) => log.some(e => e.bpm >= 100),
    progress: (_, log) => {
      const max = Math.max(0, ...log.map(e => e.bpm));
      return Math.min(100, (max / 100) * 100);
    },
  },
  {
    id: "tempo_150",
    title: "Speed Demon",
    description: "Practice a rudiment at 150+ BPM",
    icon: "speed",
    check: (_, log) => log.some(e => e.bpm >= 150),
    progress: (_, log) => {
      const max = Math.max(0, ...log.map(e => e.bpm));
      return Math.min(100, (max / 150) * 100);
    },
  },
];

function ProfileInner() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [practiceLog, setPracticeLog] = useState<RudimentPracticeEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    const sessions = loadSessions();
    if (sessions.length > 0) {
      setStats(calculatePracticeStats(sessions));
    }
    setPracticeLog(getPracticeLog());
  }, []);

  const badges = useMemo(() => {
    if (!stats) return BADGE_DEFS.map(b => ({ ...b, unlocked: false, pct: 0 }));
    return BADGE_DEFS.map(b => ({
      ...b,
      unlocked: b.check(stats, practiceLog),
      pct: Math.round(b.progress(stats, practiceLog)),
    }));
  }, [stats, practiceLog]);

  const filtered = useMemo(() => {
    if (filter === "unlocked") return badges.filter(b => b.unlocked);
    if (filter === "locked") return badges.filter(b => !b.unlocked);
    return badges;
  }, [badges, filter]);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <Shell title="Profile" subtitle="Your achievements and progress">
      {/* Profile summary */}
      <section className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 64, height: 64,
            background: "var(--accent, var(--ink, #3c3c3c))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--bg, #fff)",
            fontSize: "1.5rem", fontWeight: 700,
          }}>
            <Icon name="user" size={32} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.2rem" }}>
              {profile?.level === "true_beginner" ? "Beginner" : profile?.level === "rusty" ? "Returning Player" : "Drummer"}
            </div>
            <div style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>
              {stats ? `${stats.totalSessions} sessions | ${formatPracticeTime(stats.totalMinutes)} practiced` : "No sessions yet"}
            </div>
            {stats && stats.streak.current > 0 && (
              <div style={{ fontSize: "0.85rem", marginTop: 4 }}>
                <Icon name="flame" size={14} /> {stats.streak.current}-day streak
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Badge count */}
      <section className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", fontWeight: 700 }}>{unlockedCount} / {badges.length}</div>
        <div style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>Achievements Unlocked</div>
        <div style={{ height: 6, background: "var(--border, #eee)", marginTop: 12, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(unlockedCount / badges.length) * 100}%`,
            background: "var(--accent, var(--ink, #3c3c3c))",
            transition: "width 0.3s",
          }} />
        </div>
      </section>

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {(["all", "unlocked", "locked"] as const).map(f => (
          <button
            key={f}
            className={`btn btn-small ${filter === f ? "" : "btn-ghost"}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "unlocked" ? "Unlocked" : "Locked"}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      <section className="grid" style={{ gap: 12 }} role="list" aria-label="Achievements">
        {filtered.map(badge => (
          <div
            key={badge.id}
            role="listitem"
            aria-label={`${badge.title}: ${badge.unlocked ? "unlocked" : `${badge.pct}% progress`}`}
            className="card"
            style={{
              padding: "16px",
              opacity: badge.unlocked ? 1 : 0.6,
              borderLeft: badge.unlocked ? "3px solid var(--accent, var(--ink, #3c3c3c))" : "3px solid transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40,
                background: badge.unlocked ? "var(--accent, var(--ink, #3c3c3c))" : "var(--border, #ddd)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: badge.unlocked ? "var(--bg, #fff)" : "var(--ink-muted)",
              }}>
                <Icon name={badge.icon} size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{badge.title}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>{badge.description}</div>
              </div>
            </div>
            {!badge.unlocked && (
              <div style={{ height: 4, background: "var(--border, #eee)", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${badge.pct}%`,
                  background: "var(--ink-muted)",
                  transition: "width 0.3s",
                }} />
              </div>
            )}
            {badge.unlocked && (
              <div style={{ fontSize: "0.75rem", color: "var(--accent, var(--ink, #3c3c3c))", fontWeight: 600 }}>
                UNLOCKED
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Nav */}
      <section className="card">
        <div className="row" style={{ gap: 8 }}>
          <a href="/drum/progress" className="btn btn-ghost">Progress</a>
          <a href="/drum/settings" className="btn btn-ghost">Settings</a>
        </div>
      </section>
    </Shell>
  );
}

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfileInner />
    </ErrorBoundary>
  );
}
