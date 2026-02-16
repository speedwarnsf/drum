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

/* ------------------------------------------------------------------ */
/* Warm-up sequences by time of day                                    */
/* ------------------------------------------------------------------ */
const WARMUPS = {
  morning: [
    { name: "Wrist circles", duration: "30s each direction", note: "Loosen joints before contact" },
    { name: "Finger taps on pad", duration: "1 min", note: "Alternating, light pressure" },
    { name: "Single strokes at 60 BPM", duration: "2 min", note: "Even volume, relaxed grip" },
    { name: "Accent tap", duration: "2 min", note: "Accent every 4th stroke, both hands lead" },
  ],
  afternoon: [
    { name: "Finger control singles", duration: "1 min", note: "Fingers only, minimal wrist" },
    { name: "Double strokes at 70 BPM", duration: "2 min", note: "Let the bounce do the work" },
    { name: "Paradiddle walk", duration: "2 min", note: "RLRR LRLL, accent the first" },
  ],
  evening: [
    { name: "Slow singles at 50 BPM", duration: "2 min", note: "Full stroke, full rebound" },
    { name: "Soft doubles", duration: "2 min", note: "Piano dynamic, control the second stroke" },
    { name: "Buzz rolls", duration: "1 min", note: "Sustained press, even density" },
  ],
};

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function getGreeting(): string {
  const tod = getTimeOfDay();
  if (tod === "morning") return "Good morning";
  if (tod === "afternoon") return "Good afternoon";
  return "Good evening";
}

function getDailyGoalText(sessions: StoredSession[], streakInfo: StreakInfo | null): string {
  const count = sessions.length;
  if (count === 0) return "Complete your first practice session today. Even 10 minutes builds the habit.";
  if (streakInfo && streakInfo.isAtRisk) return "Practice today to keep your streak alive. A short session counts.";
  if (count < 5) return "Stay consistent. Focus on clean technique over speed.";
  if (count < 15) return "You have momentum. Push one rudiment to a new tempo today.";
  if (count < 30) return "Solid foundation forming. Try a rudiment you have been avoiding.";
  return "Experienced hands. Refine dynamics and accent clarity today.";
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

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
  const [warmupExpanded, setWarmupExpanded] = useState(false);

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
      setLoadError("You are offline and no saved profile was found.");
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

  // Loading -- but only block on profile, not on plan
  if (profileLoading || sessionsLoading) {
    return <Shell title="Loading..." subtitle="Preparing your practice"><SkeletonTodayPage /></Shell>;
  }

  // History view
  if (sessionMeta && plan) {
    return (
      <Shell title="Saved Practice Card" subtitle={`${plan.minutes} min | ${plan.metronome} | ${plan.focus}`}>
        <PageTransition direction="fade" duration={400}>
          <section className="card">
            <div className="kicker">History</div>
            <p className="sub">Saved session from {formatDate(sessionMeta.ts)}.</p>
            <a href="/drum/today" className="btn btn-ghost" style={{ marginTop: 8 }}>Back to today</a>
          </section>
          {renderPlanBlocks(plan, metroBpm, setMetroBpm, activeBlock, setActiveBlock, completedBlocks, handleBlockComplete)}
          {renderReflection(plan, sessionMeta, moduleProgress, profile, reflectionEntry, setReflectionEntry)}
        </PageTransition>
      </Shell>
    );
  }

  const timeOfDay = getTimeOfDay();
  const warmup = WARMUPS[timeOfDay];
  const goalText = getDailyGoalText(sessions, streakInfo);

  const totalBlocks = plan?.blocks.length ?? 0;
  const completedCount = completedBlocks.size;
  const sessionProgress = totalBlocks > 0 ? completedCount / totalBlocks : 0;

  return (
    <Shell
      title="Today"
      subtitle={plan ? `${plan.minutes} min | ${plan.metronome} | ${plan.focus}` : undefined}
    >
      <PageTransition direction="fade" duration={400}>

        {/* ============================================= */}
        {/* HERO: Instant content, no API wait            */}
        {/* ============================================= */}

        <section className="today-hero">
          <div className="today-hero-greeting">{getGreeting()}</div>
          <p className="today-hero-goal">{goalText}</p>

          {/* Streak indicator */}
          {streakInfo && streakInfo.current > 0 && (
            <div className="today-streak-bar">
              <span className="today-streak-count">
                <Icon name="flame" size={14} />
                {streakInfo.current} day{streakInfo.current !== 1 ? "s" : ""}
              </span>
              {streakInfo.isAtRisk && (
                <span className="today-streak-risk">Practice today to keep it</span>
              )}
              {streakInfo.isActive && !streakInfo.isAtRisk && (
                <span className="today-streak-active">Active</span>
              )}
              <span className="today-streak-total">{sessions.length} total session{sessions.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </section>

        {/* ============================================= */}
        {/* SUGGESTED RUDIMENT (spaced repetition, local) */}
        {/* ============================================= */}

        <DailyRudiment />

        {/* ============================================= */}
        {/* WARM-UP ROUTINE                               */}
        {/* ============================================= */}

        <section className="card today-warmup">
          <div className="today-warmup-header" onClick={() => setWarmupExpanded(!warmupExpanded)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setWarmupExpanded(!warmupExpanded)}>
            <div>
              <div className="kicker">{timeOfDay} warm-up</div>
              <h2 className="card-title" style={{ margin: 0 }}>{warmup.length} steps -- {warmup.reduce((_, __, i) => i, 0) + 5} min</h2>
            </div>
            <span className="today-warmup-toggle">{warmupExpanded ? "Collapse" : "Expand"}</span>
          </div>

          {warmupExpanded && (
            <ol className="today-warmup-steps">
              {warmup.map((step, i) => (
                <li key={i} className="today-warmup-step">
                  <div className="today-warmup-step-name">{step.name}</div>
                  <div className="today-warmup-step-meta">
                    <span>{step.duration}</span>
                    <span className="today-warmup-step-note">{step.note}</span>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <a href="/drum/warmup" className="btn">Full warm-up page</a>
          </div>
        </section>

        {/* ============================================= */}
        {/* PRACTICE PLAN (AI or fallback)                */}
        {/* ============================================= */}

        {aiLoading && !plan && (
          <section className="card">
            <div className="kicker">Building your plan</div>
            <AILoadingState stage={aiStage} />
          </section>
        )}

        {plan && (
          <>
            {/* Session progress bar */}
            {totalBlocks > 0 && (
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

            {/* Coach line */}
            {plan.coachLine && (
              <section className="card today-coach">
                <p className="today-coach-text">{plan.coachLine}</p>
                {plan.contextLine && <p className="sub" style={{ marginTop: 6 }}>{plan.contextLine}</p>}
              </section>
            )}

            {/* Setup guide */}
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

            {/* Metronome */}
            <Metronome bpm={metroBpm} onBpmChange={setMetroBpm} showGapControls showBpmControls />

            {/* Practice blocks */}
            {renderPlanBlocks(plan, metroBpm, setMetroBpm, activeBlock, setActiveBlock, completedBlocks, handleBlockComplete)}

            {/* Reflection */}
            {renderReflection(plan, sessionMeta, moduleProgress, profile, reflectionEntry, setReflectionEntry)}
          </>
        )}

        {!plan && !aiLoading && (
          <section className="card">
            <div className="kicker">Ready when you are</div>
            <p className="sub">Your personalized plan is loading. In the meantime, start with the warm-up above or pick a rudiment to drill.</p>
          </section>
        )}

        {/* Quick tools */}
        <section className="card">
          <div className="row" style={{ flexWrap: "wrap" }}>
            <a href="/drum/warmup" className="btn btn-ghost">Warm-Up</a>
            <a href="/drum/drills" className="btn btn-ghost">Drills</a>
            <a href="/drum/rudiments" className="btn btn-ghost">Rudiments</a>
            <a href="/drum/routines" className="btn btn-ghost">Routines</a>
          </div>
        </section>

        {/* History */}
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

/* ------------------------------------------------------------------ */
/* Daily Rudiment Suggestion (local, instant)                          */
/* ------------------------------------------------------------------ */

function DailyRudiment() {
  const allIds = Object.keys(ESSENTIAL_RUDIMENTS);
  const needWork = getRudimentsNeedingWork(allIds, 3);
  const stats = getAllRudimentStats();
  const weeklyData = getPracticeMinutesByDate(7);
  const weekTotal = weeklyData.reduce((s, d) => s + d.minutes, 0);

  // Pick the top rudiment as "today's focus"
  const topId = needWork[0];
  const topRudiment = topId ? ESSENTIAL_RUDIMENTS[topId] : null;
  const topStats = topId ? stats[topId] : null;

  if (!topRudiment) return null;

  const neverPracticed = !topStats || topStats.sessionCount === 0;
  const daysSince = topStats?.lastPracticed
    ? Math.max(0, Math.floor((Date.now() - new Date(topStats.lastPracticed).getTime()) / 86400000))
    : null;

  return (
    <section className="card today-rudiment-focus">
      <div className="kicker">Today's rudiment</div>
      <h2 className="card-title" style={{ margin: "4px 0 2px", fontSize: "1.3rem" }}>
        {topRudiment.name}
      </h2>
      <p className="sub" style={{ marginBottom: 8 }}>
        {neverPracticed
          ? "You have not practiced this one yet. Good time to start."
          : daysSince !== null && daysSince > 3
            ? `Last practiced ${daysSince} days ago. Due for review.`
            : topStats
              ? `${topStats.sessionCount} session${topStats.sessionCount !== 1 ? "s" : ""} logged, ${Math.round(topStats.totalSeconds / 60)} min total.`
              : ""}
      </p>

      <div className="today-rudiment-sticking">
        {topRudiment.pattern.stickingPattern}
      </div>

      <p className="today-rudiment-desc">{topRudiment.pattern.description}</p>

      <div className="today-rudiment-tempo">
        Target: {topRudiment.pattern.suggestedTempo.min}--{topRudiment.pattern.suggestedTempo.max} BPM
        {topStats && topStats.maxBpm > 0 && (
          <span style={{ marginLeft: 12 }}>Your best: {topStats.maxBpm} BPM</span>
        )}
      </div>

      <div className="row" style={{ marginTop: 12, gap: 8 }}>
        <a href={`/drum/rudiments/${topId}`} className="btn">
          Practice now
        </a>
      </div>

      {/* Other rudiments needing work */}
      {needWork.length > 1 && (
        <div className="today-rudiment-others">
          <div className="today-rudiment-others-label">Also due for review:</div>
          {needWork.slice(1).map((id) => {
            const r = ESSENTIAL_RUDIMENTS[id];
            if (!r) return null;
            const s = stats[id];
            return (
              <a key={id} href={`/drum/rudiments/${id}`} className="btn btn-ghost" style={{ justifyContent: "flex-start", textAlign: "left", display: "flex", gap: 12 }}>
                <span style={{ flex: 1, fontWeight: 600 }}>{r.name}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                  {s ? `${Math.round(s.totalSeconds / 60)}m total` : "New"}
                </span>
              </a>
            );
          })}
        </div>
      )}

      {weekTotal > 0 && (
        <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginTop: 10 }}>
          {weekTotal} min practiced this week
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Shared rendering helpers                                            */
/* ------------------------------------------------------------------ */

function renderPlanBlocks(
  plan: PracticePlan,
  _metroBpm: number,
  _setMetroBpm: (v: number) => void,
  activeBlock: string | null,
  setActiveBlock: (v: string | null) => void,
  completedBlocks: Set<number>,
  handleBlockComplete: (id: string) => void,
) {
  return plan.blocks.map((b, idx) => {
    const isBlockDone = completedBlocks.has(idx);
    return (
      <article key={idx} className={`card practice-block ${isBlockDone ? "practice-block-done" : ""}`}>
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
  });
}

function renderReflection(
  plan: PracticePlan,
  sessionMeta: StoredSession | null,
  moduleProgress: { currentModule: number; sessionsInModule: number } | null,
  profile: Profile | null,
  reflectionEntry: ReflectionEntry | null,
  setReflectionEntry: (e: ReflectionEntry | null) => void,
) {
  return (
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
  );
}

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

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

/* eslint-enable react-hooks/set-state-in-effect */
