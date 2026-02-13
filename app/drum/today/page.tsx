"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Shell from "../_ui/Shell";
import { Icon } from "../_ui/Icon";
import Metronome from "../_ui/Metronome";
import Timer from "../_ui/Timer";
import Recorder from "../_ui/Recorder";
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
import ModuleProgress from "../_ui/ModuleProgress";
import { CompactStats } from "../_ui/StatsCard";
import { calculatePracticeStats, StreakInfo } from "../_lib/statsUtils";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { AILoadingState } from "../_ui/LoadingSpinner";
import { SkeletonTodayPage } from "../_ui/SkeletonCard";
import { OfflineIndicator, useOnlineStatus } from "../_ui/OfflineIndicator";
import ReflectionJournal, { loadReflectionEntry, ReflectionEntry } from "../_ui/ReflectionJournal";

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
    // Calculate streak from local sessions initially
    if (local.length > 0) {
      const stats = calculatePracticeStats(local);
      setStreakInfo(stats.streak);
    }
    // Only fetch remote if online
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
          // Recalculate streak with merged sessions
          if (merged.length > 0 && mounted) {
            const stats = calculatePracticeStats(merged);
            setStreakInfo(stats.streak);
          }
        })
        .catch((err) => {
          console.error("[Drum] Failed to load remote sessions:", err);
          // Continue with local data - graceful degradation
          setSessionsLoading(false);
        });
    } else {
      setSessionsLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [sessionId, isOnline]);

  useEffect(() => {
    if (sessionId) {
      setProfileLoading(false);
      return;
    }
    setSessionPlan(null);
    setSessionMeta(null);
    const p = loadProfile();
    if (p) {
      setProfile(p);
      setProfileLoading(false);
      return;
    }
    // Only try remote if online
    if (isOnline) {
      loadProfileFromSupabase()
        .then((remote) => {
          if (remote) {
            saveProfile(remote);
            setProfile(remote);
            setProfileLoading(false);
            return;
          }
          window.location.href = "/drum/start";
        })
        .catch((err) => {
          console.error("[Drum] Failed to load profile:", err);
          setLoadError("Unable to load your profile. Please try again.");
          setProfileLoading(false);
        });
    } else {
      // Offline without local profile
      setLoadError("You're offline and no saved profile was found. Please connect to set up.");
      setProfileLoading(false);
    }
  }, [sessionId, isOnline]);

  useEffect(() => {
    if (!profile || sessionId) return;
    getModuleProgress().then((data) => {
      if (data) {
        setModuleProgress({
          currentModule: data.currentModule,
          sessionsInModule: data.sessionsInModule,
        });
      }
    });
  }, [profile, sessionId]);

  useEffect(() => {
    if (!profile || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token) {
        // No auth session — skip credit check, allow local-only usage
        setCreditsReady(true);
        return;
      }
      const lessonId = `daily:${new Date().toISOString().slice(0, 10)}`;
      fetch("/api/credits/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token, lessonId }),
      }).then((res) => {
        if (res.status === 402) {
          window.location.href = "/drum/signup";
          return;
        }
        if (res.status === 200 && sessions.length === 0) {
          fetch("/api/admin/seed-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: token }),
          }).then(() => {
            loadRemoteSessions().then((remote) => {
              if (remote.length) {
                const merged = remote.sort(
                  (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
                );
                setSessions(merged);
              }
            });
          });
        }
        setCreditsReady(true);
      }).catch(() => {
        setCreditsReady(true);
      });
    });
  }, [profile, supabase, sessions.length]);

  useEffect(() => {
    if (!profile || !creditsReady || sessionPlan || aiPlan || aiFailed || aiLoading) return;
    // Don't try AI generation if offline
    if (!isOnline) {
      setAiFailed(true);
      return;
    }
    
    setAiLoading(true);
    setAiStage("thinking");
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    // Progress simulation for better UX
    const progressTimer1 = setTimeout(() => setAiStage("generating"), 2000);
    const progressTimer2 = setTimeout(() => setAiStage("finalizing"), 5000);
    
    const recentLogs = sessions.slice(0, 3).map((s) => s.log);
    const dayIndex = sessions.length ? sessions.length + 1 : 1;
    
    fetch("/api/lesson/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        recentLogs,
        dayIndex,
        lastPlan: loadLastPlan(),
        currentModule: moduleProgress?.currentModule ?? profile.currentModule ?? 1,
      }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.status === 408 ? "Request timed out" : "AI generation failed");
        }
        return res.json();
      })
      .then((data) => {
        const plan = (data?.plan || null) as PracticePlan | null;
        if (plan) {
          setAiPlan(plan);
          saveLastPlan(plan);
        } else {
          setAiFailed(true);
        }
      })
      .catch((err) => {
        console.error("[Drum] AI lesson generation failed:", err);
        setAiFailed(true);
      })
      .finally(() => {
        clearTimeout(timeout);
        clearTimeout(progressTimer1);
        clearTimeout(progressTimer2);
        setAiLoading(false);
      });
      
    return () => {
      clearTimeout(timeout);
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
    };
  }, [profile, creditsReady, sessionPlan, aiPlan, aiFailed, aiLoading, sessions, moduleProgress, isOnline]);

  const plan: PracticePlan | null = useMemo(() => {
    if (sessionPlan) return sessionPlan;
    if (!profile) return null;
    if (!creditsReady) return null;
    if (aiPlan) return aiPlan;
    if (!aiFailed) return null;
    const lastLog = sessions[0]?.log ?? null;
    return buildTodaysPlan(profile, {
      sessionCount: sessions.length,
      lastLog,
    });
  }, [profile, sessionPlan, creditsReady, aiPlan, aiFailed, sessions]);

  useEffect(() => {
    if (!plan) return;
    if (!sessionPlan) {
      saveLastPlan(plan);
    }
    const bpm = parseBpm(plan.metronome);
    if (bpm) setMetroBpm(bpm);
  }, [plan, sessionPlan]);

  // Load saved reflection entry for historical sessions
  useEffect(() => {
    if (sessionId) {
      const saved = loadReflectionEntry(sessionId);
      setReflectionEntry(saved);
    } else {
      setReflectionEntry(null);
    }
  }, [sessionId]);

  // Show error state
  if (loadError) {
    return (
      <Shell title="Unable to Load" subtitle="Something went wrong">
        <section className="card error-page-card">
          <div className="error-page-icon"><Icon name="drum" size={48} /></div>
          <h2 className="card-title">Couldn&apos;t load your practice</h2>
          <p>{loadError}</p>
          <div className="row" style={{ marginTop: 16, justifyContent: "center" }}>
            <button onClick={() => window.location.reload()} className="btn">
              Try again
            </button>
            <a href="/drum/start" className="btn btn-ghost">
              Setup profile
            </a>
          </div>
        </section>
      </Shell>
    );
  }

  // Show loading state while profile or sessions are loading
  if (profileLoading || sessionsLoading) {
    return (
      <Shell title="Loading..." subtitle="Preparing your practice">
        <SkeletonTodayPage />
      </Shell>
    );
  }

  // Show AI loading state
  if (aiLoading && !plan) {
    return (
      <Shell title="Preparing Today's Practice" subtitle="Building your personalized plan">
        <AILoadingState stage={aiStage} />
        <section className="card">
          <p className="sub">
            Your practice plan is being customized based on your recent sessions and progress.
          </p>
        </section>
      </Shell>
    );
  }

  if (!plan) {
    return (
      <Shell title="Preparing..." subtitle="Setting up your practice session">
        <SkeletonTodayPage />
      </Shell>
    );
  }

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

      {!sessionMeta && moduleProgress && (
        <ModuleProgress
          currentModule={moduleProgress.currentModule}
          sessionsInModule={moduleProgress.sessionsInModule}
          compact
          onAdvance={(newModule) => {
            setModuleProgress({ ...moduleProgress, currentModule: newModule, sessionsInModule: 0 });
          }}
        />
      )}

      {!sessionMeta && streakInfo && (
        <CompactStats
          totalSessions={sessions.length}
          streak={streakInfo.current}
          isStreakActive={streakInfo.isActive}
        />
      )}

      <section className="card">
        {plan.coachLine ? <div className="kicker">{plan.coachLine}</div> : null}
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

      <Metronome bpm={metroBpm} showGapControls />

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

        <Recorder
          sessionId={sessionMeta?.id ?? null}
          disabled={activeBlock !== null}
        />

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

        <div className="row">
          <a href="/drum/journal" className="btn">
            Log today
          </a>
          <a href="/drum/start" className="btn btn-ghost">
            Edit setup
          </a>
        </div>
      </article>

      {/* Quick Access */}
      <section className="card">
        <h2 className="card-title">Tools</h2>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <a href="/drum/warmup" className="btn btn-ghost">🧘 Warm-Up</a>
          <a href="/drum/drills" className="btn btn-ghost">Drills</a>
          <a href="/drum/goals" className="btn btn-ghost">📋 Goals</a>
          <a href="/drum/insights" className="btn btn-ghost">📊 Insights</a>
          <a href="/drum/rudiments" className="btn btn-ghost">📖 Rudiments</a>
          <a href="/drum/diagnostic" className="btn btn-ghost">🔍 Diagnostic</a>
          <a href="/drum/practice-enhanced" className="btn btn-ghost">🎵 Enhanced Mode</a>
        </div>
      </section>

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
