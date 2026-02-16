"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Shell from "../_ui/Shell";
import { Icon } from "../_ui/Icon";
import Metronome from "../_ui/Metronome";
import Timer from "../_ui/Timer";
import Recorder from "../_ui/Recorder";
import { PageTransition } from "../_ui/MusicalAnimations";
import { getSupabaseClient } from "../_lib/supabaseClient";
import {
  buildTodaysPlan,
  loadProfile,
  loadProfileFromSupabase,
  loadRemoteSessions,
  loadSessions,
  loadLastPlan,
  saveLastPlan,
  saveProfile,
  getModuleProgress,
  PracticePlan,
  Profile,
  StoredSession,
} from "../_lib/drumMvp";
import { calculatePracticeStats, StreakInfo } from "../_lib/statsUtils";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { AILoadingState } from "../_ui/LoadingSpinner";
import { SkeletonTodayPage } from "../_ui/SkeletonCard";
import { OfflineIndicator, useOnlineStatus } from "../_ui/OfflineIndicator";
import ReflectionJournal, { loadReflectionEntry, ReflectionEntry } from "../_ui/ReflectionJournal";
import { getRudimentsNeedingWork, getAllRudimentStats, getPracticeMinutesByDate } from "../_lib/practiceTracker";
import { ESSENTIAL_RUDIMENTS } from "../_lib/rudimentLibrary";

export default function DrumTodayPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<TodayPageSkeleton />}>
        <DrumTodayInner />
      </Suspense>
      <OfflineIndicator />
    </ErrorBoundary>
  );
}

function TodayPageSkeleton() {
  return (
    <Shell title="Loading..." subtitle="Preparing your practice card">
      <SkeletonTodayPage />
    </Shell>
  );
}

function DrumTodayInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { isOnline } = useOnlineStatus();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [metroBpm, setMetroBpm] = useState<number>(60);
  const [sessionPlan, setSessionPlan] = useState<PracticePlan | null>(null);
  const [sessionMeta, setSessionMeta] = useState<StoredSession | null>(null);
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [aiPlan, setAiPlan] = useState<PracticePlan | null>(null);
  const [aiFailed, setAiFailed] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStage, setAiStage] = useState<"thinking" | "generating" | "finalizing">("thinking");
  const [creditsReady, setCreditsReady] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [moduleProgress, setModuleProgress] = useState<{
    currentModule: number;
    sessionsInModule: number;
  } | null>(null);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reflectionEntry, setReflectionEntry] = useState<ReflectionEntry | null>(null);
  const [completedBlocks, setCompletedBlocks] = useState<Set<number>>(new Set());
  const [showHistory, setShowHistory] = useState(false);

  const handleBlockComplete = useCallback((blockId: string) => {
    const idx = parseInt(blockId.replace("block-", ""), 10);
    if (!isNaN(idx)) {
      setCompletedBlocks(prev => new Set(prev).add(idx));
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const local = loadSessions();
    const setAll = (list: StoredSession[]) => {
      if (!mounted) return;
      setSessions(list);
      setSessionsLoading(false);
      if (sessionId) {
        const match = list.find((item) => item.id === sessionId) ?? null;
        setSessionPlan(match ? match.plan : null);
        setSessionMeta(match);
      }
    };
    setAll(local);
    if (local.length > 0) {
      const stats = calculatePracticeStats(local);
      setStreakInfo(stats.streak);
    }
    if (isOnline) {
      loadRemoteSessions()
        .then((remote) => {
          const map = new Map<string, StoredSession>();
          local.forEach((s) => map.set(s.id, s));
          remote.forEach((s) => map.set(s.id, s));
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
          );
          setAll(merged);
          if (merged.length > 0 && mounted) {
            const stats = calculatePracticeStats(merged);
            setStreakInfo(stats.streak);
          }
        })
        .catch(() => setSessionsLoading(false));
    } else {
      setSessionsLoading(false);
    }
    return () => { mounted = false; };
  }, [sessionId, isOnline]);

  useEffect(() => {
    if (sessionId) { setProfileLoading(false); return; }
    setSessionPlan(null);
    setSessionMeta(null);
    const p = loadProfile();
    if (p) { setProfile(p); setProfileLoading(false); return; }
    if (isOnline) {
      loadProfileFromSupabase()
        .then((remote) => {
          if (remote) { saveProfile(remote); setProfile(remote); setProfileLoading(false); return; }
          window.location.href = "/drum/start";
        })
        .catch(() => {
          setLoadError("Unable to load your profile. Please try again.");
          setProfileLoading(false);
        });
    } else {
      setLoadError("You're offline and no saved profile was found.");
      setProfileLoading(false);
    }
  }, [sessionId, isOnline]);

  useEffect(() => {
    if (!profile || sessionId) return;
    getModuleProgress().then((data) => {
      if (data) setModuleProgress({ currentModule: data.currentModule, sessionsInModule: data.sessionsInModule });
    });
  }, [profile, sessionId]);

  useEffect(() => {
    if (!profile || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token) { setCreditsReady(true); return; }
      const lessonId = `daily:${new Date().toISOString().slice(0, 10)}`;
      fetch("/api/credits/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token, lessonId }),
      }).then((res) => {
        if (res.status === 402) { window.location.href = "/drum/signup"; return; }
        if (res.status === 200 && sessions.length === 0) {
          fetch("/api/admin/seed-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: token }),
          }).then(() => {
            loadRemoteSessions().then((remote) => {
              if (remote.length) setSessions(remote.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()));
            });
          });
        }
        setCreditsReady(true);
      }).catch(() => setCreditsReady(true));
    });
  }, [profile, supabase, sessions.length]);

  useEffect(() => {
    if (!profile || !creditsReady || sessionPlan || aiPlan || aiFailed || aiLoading) return;
    if (!isOnline) { setAiFailed(true); return; }
    setAiLoading(true);
    setAiStage("thinking");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const p1 = setTimeout(() => setAiStage("generating"), 2000);
    const p2 = setTimeout(() => setAiStage("finalizing"), 5000);
    const recentLogs = sessions.slice(0, 3).map((s) => s.log);
    const dayIndex = sessions.length ? sessions.length + 1 : 1;
    fetch("/api/lesson/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile, recentLogs, dayIndex,
        lastPlan: loadLastPlan(),
        currentModule: moduleProgress?.currentModule ?? profile.currentModule ?? 1,
      }),
      signal: controller.signal,
    })
      .then((res) => { if (!res.ok) throw new Error("fail"); return res.json(); })
      .then((data) => {
        const plan = (data?.plan || null) as PracticePlan | null;
        if (plan) { setAiPlan(plan); saveLastPlan(plan); } else setAiFailed(true);
      })
      .catch(() => setAiFailed(true))
      .finally(() => { clearTimeout(timeout); clearTimeout(p1); clearTimeout(p2); setAiLoading(false); });
    return () => { clearTimeout(timeout); clearTimeout(p1); clearTimeout(p2); };
  }, [profile, creditsReady, sessionPlan, aiPlan, aiFailed, aiLoading, sessions, moduleProgress, isOnline]);

  const plan: PracticePlan | null = useMemo(() => {
    if (sessionPlan) return sessionPlan;
    if (!profile || !creditsReady) return null;
    if (aiPlan) return aiPlan;
    if (!aiFailed) return null;
    const lastLog = sessions[0]?.log ?? null;
    return buildTodaysPlan(profile, { sessionCount: sessions.length, lastLog });
  }, [profile, sessionPlan, creditsReady, aiPlan, aiFailed, sessions]);

  useEffect(() => {
    if (!plan) return;
    if (!sessionPlan) saveLastPlan(plan);
    const bpm = parseBpm(plan.metronome);
    if (bpm) setMetroBpm(bpm);
  }, [plan, sessionPlan]);

  useEffect(() => {
    if (sessionId) setReflectionEntry(loadReflectionEntry(sessionId));
    else setReflectionEntry(null);
  }, [sessionId]);

  // Error state
  if (loadError) {
    return (
      <Shell title="Unable to Load" subtitle="Something went wrong">
        <section className="card">
          <h2 className="card-title">Could not load your practice</h2>
          <p>{loadError}</p>
          <div className="row" style={{ marginTop: 16 }}>
            <button onClick={() => window.location.reload()} className="btn">Try again</button>
            <a href="/drum/start" className="btn btn-ghost">Setup profile</a>
          </div>
        </section>
      </Shell>
    );
  }

  // Loading
  if (profileLoading || sessionsLoading) {
    return <Shell title="Loading..." subtitle="Preparing your practice"><SkeletonTodayPage /></Shell>;
  }

  // AI generating
  if (aiLoading && !plan) {
    return (
      <Shell title="Building Your Plan" subtitle="Customizing based on your recent sessions">
        <AILoadingState stage={aiStage} />
      </Shell>
    );
  }

  if (!plan) {
    return <Shell title="Preparing..." subtitle="Setting up"><SkeletonTodayPage /></Shell>;
  }

  const totalBlocks = plan.blocks.length;
  const completedCount = completedBlocks.size;
  const sessionProgress = totalBlocks > 0 ? completedCount / totalBlocks : 0;

  return (
    <Shell
      title={sessionMeta ? "Saved Practice Card" : "Today"}
      subtitle={`${plan.minutes} min | ${plan.metronome} | ${plan.focus}`}
    >
      <PageTransition direction="fade" duration={400}>

        {/* Session progress bar - only for active (non-history) sessions */}
        {!sessionMeta && totalBlocks > 0 && (
          <div className="session-progress">
            <div className="session-progress-bar">
              <div
                className="session-progress-fill"
                style={{ width: `${sessionProgress * 100}%` }}
              />
            </div>
            <div className="session-progress-label">
              {completedCount === 0
                ? `${totalBlocks} blocks ahead`
                : completedCount < totalBlocks
                  ? `${completedCount} of ${totalBlocks} blocks done`
                  : "Session complete"}
            </div>
          </div>
        )}

        {/* Compact streak + stats bar */}
        {!sessionMeta && streakInfo && streakInfo.current > 0 && (
          <div className="today-streak-bar">
            <span className="today-streak-count">
              <Icon name="flame" size={14} />
              {streakInfo.current} day{streakInfo.current !== 1 ? "s" : ""}
            </span>
            {streakInfo.isAtRisk && (
              <span className="today-streak-risk">Practice today to keep it</span>
            )}
            {streakInfo.isActive && (
              <span className="today-streak-active">Active</span>
            )}
            <span className="today-streak-total">{sessions.length} total sessions</span>
          </div>
        )}

        {/* History notice */}
        {sessionMeta && (
          <section className="card">
            <div className="kicker">History</div>
            <p className="sub">Saved session from {formatDate(sessionMeta.ts)}.</p>
            <a href="/drum/today" className="btn btn-ghost" style={{ marginTop: 8 }}>Back to today</a>
          </section>
        )}

        {/* Coach line */}
        {plan.coachLine && (
          <section className="card today-coach">
            <p className="today-coach-text">{plan.coachLine}</p>
            {plan.contextLine && <p className="sub" style={{ marginTop: 6 }}>{plan.contextLine}</p>}
          </section>
        )}

        {/* Setup guide - collapsed by default */}
        {plan.setupGuide && (
          <details className="setup-guide">
            <summary>
              <span className="setup-title">{plan.setupGuide.title}</span>
              <span className="setup-sub">Tap to expand</span>
            </summary>
            <div className="setup-body">
              <ul>{plan.setupGuide.items.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
            </div>
          </details>
        )}

        {/* Metronome - with inline BPM controls */}
        <Metronome bpm={metroBpm} onBpmChange={setMetroBpm} showGapControls showBpmControls />

        {/* Practice blocks - THE CORE */}
        {plan.blocks.map((b, idx) => {
          const isBlockDone = completedBlocks.has(idx);
          return (
            <article
              key={idx}
              className={`card practice-block ${isBlockDone ? "practice-block-done" : ""}`}
            >
              <div className="practice-block-header">
                <div className="practice-block-index">{isBlockDone ? "Done" : idx + 1}</div>
                <div style={{ flex: 1 }}>
                  <h2 className="card-title" style={{ margin: 0 }}>{b.title}</h2>
                  <div className="meta">{b.time}</div>
                </div>
              </div>

              <Timer
                id={`block-${idx}`}
                durationSeconds={Math.round(parseMinutes(b.time) * 60)}
                activeId={activeBlock}
                onActiveChange={setActiveBlock}
                onComplete={handleBlockComplete}
              />

              <ul style={{ marginTop: 0 }}>
                {b.bullets.map((x, i) => <li key={i}>{x}</li>)}
              </ul>

              {b.stop?.length ? (
                <div className="stop"><strong>Stop if:</strong> {b.stop.join(" ")}</div>
              ) : null}
            </article>
          );
        })}

        {/* Reflection */}
        <article className="card">
          <h2 className="card-title">Reflection</h2>
          <ul style={{ marginTop: 0 }}>
            {plan.reflection.map((x, i) => <li key={i}>{x}</li>)}
          </ul>

          <Recorder sessionId={sessionMeta?.id ?? null} disabled={false} />

          <ReflectionJournal
            key={sessionMeta?.id ?? `today-${new Date().toISOString().slice(0, 10)}`}
            sessionId={sessionMeta?.id ?? `today-${new Date().toISOString().slice(0, 10)}`}
            moduleId={moduleProgress?.currentModule ?? profile?.currentModule ?? 1}
            savedEntry={reflectionEntry}
            compact={!sessionMeta}
            onSave={(entry) => setReflectionEntry(entry)}
          />

          <div className="stop" style={{ marginTop: 16 }}>
            <strong>Closure:</strong> {plan.closure}
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <a href="/drum/journal" className="btn">Log today</a>
            <a href="/drum/start" className="btn btn-ghost">Edit setup</a>
          </div>
        </article>

        {/* Smart Rudiment Suggestions */}
        {!sessionMeta && (
          <RudimentSuggestions />
        )}

        {/* Quick tools - compact */}
        <section className="card">
          <div className="row" style={{ flexWrap: "wrap" }}>
            <a href="/drum/warmup" className="btn btn-ghost">Warm-Up</a>
            <a href="/drum/drills" className="btn btn-ghost">Drills</a>
            <a href="/drum/rudiments" className="btn btn-ghost">Rudiments</a>
            <a href="/drum/routines" className="btn btn-ghost">Routines</a>
          </div>
        </section>

        {/* History - collapsible */}
        {sessions.length > 0 && (
          <section className="card">
            <button
              className="btn btn-ghost"
              onClick={() => setShowHistory(!showHistory)}
              style={{ width: "100%", textAlign: "left" }}
            >
              Past sessions ({sessions.length}) {showHistory ? "—" : "+"}
            </button>
            {showHistory && (
              <ul style={{ marginTop: 8 }}>
                {sessions.slice(0, 10).map((entry) => (
                  <li key={entry.id}>
                    <a href={`/drum/today?session=${entry.id}`} className="btn btn-ghost" style={{ justifyContent: "flex-start" }}>
                      {formatDate(entry.ts)} — {entry.plan.focus} ({entry.plan.minutes} min)
                    </a>
                  </li>
                ))}
                {sessions.length > 10 && (
                  <li><a href="/drum/history" className="btn btn-ghost">View all</a></li>
                )}
              </ul>
            )}
          </section>
        )}
      </PageTransition>
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
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function RudimentSuggestions() {
  const allIds = Object.keys(ESSENTIAL_RUDIMENTS);
  const needWork = getRudimentsNeedingWork(allIds, 4);
  const stats = getAllRudimentStats();
  const weeklyData = getPracticeMinutesByDate(7);
  const weekTotal = weeklyData.reduce((s, d) => s + d.minutes, 0);

  if (needWork.length === 0) return null;

  return (
    <section className="card">
      <div className="kicker">Focus Rudiments</div>
      {weekTotal > 0 && (
        <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginBottom: 8 }}>
          {weekTotal} min practiced this week
        </div>
      )}
      <p className="sub" style={{ marginBottom: 12 }}>
        Based on your practice history -- these need the most attention:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {needWork.map((id) => {
          const r = ESSENTIAL_RUDIMENTS[id];
          if (!r) return null;
          const s = stats[id];
          return (
            <a
              key={id}
              href={`/drum/rudiments/${id}`}
              className="btn btn-ghost"
              style={{ justifyContent: "flex-start", textAlign: "left", display: "flex", gap: 12 }}
            >
              <span style={{ flex: 1, fontWeight: 600 }}>{r.name}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                {s ? `${Math.round(s.totalSeconds / 60)}m total` : "Not practiced"}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

/* eslint-enable react-hooks/set-state-in-effect */
