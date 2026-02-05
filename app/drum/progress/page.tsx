"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "../_ui/Shell";
import ModuleProgress from "../_ui/ModuleProgress";
import PracticeCalendar from "../_ui/PracticeCalendar";
import StreakCounter from "../_ui/StreakCounter";
import StatsCard, { AchievementsCard } from "../_ui/StatsCard";
import { getModuleProgress, loadRemoteSessions, loadSessions, MODULE_INFO, StoredSession } from "../_lib/drumMvp";
import {
  calculatePracticeStats,
  checkAchievements,
  getCachedStats,
  setCachedStats,
  PracticeStats,
} from "../_lib/statsUtils";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { SkeletonStatsCard, SkeletonCalendar, SkeletonCard } from "../_ui/SkeletonCard";
import { OfflineIndicator, useOnlineStatus } from "../_ui/OfflineIndicator";

type ProgressData = {
  currentModule: number;
  moduleStartedAt: string | null;
  sessionCount: number;
  sessionsInModule: number;
};

export default function ProgressPage() {
  return (
    <ErrorBoundary>
      <ProgressPageInner />
      <OfflineIndicator />
    </ErrorBoundary>
  );
}

function ProgressPageInner() {
  const router = useRouter();
  const { isOnline } = useOnlineStatus();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Load module progress
        const progressData = await getModuleProgress();
        setProgress(progressData);

        // Try cached stats first
        const cached = getCachedStats();
        if (cached) {
          setStats(cached);
        }

        // Load sessions and calculate stats
        const localSessions = loadSessions();
        let remoteSessions: StoredSession[] = [];
        
        if (isOnline) {
          try {
            remoteSessions = await loadRemoteSessions();
          } catch (err) {
            console.error("[Drum] Failed to load remote sessions:", err);
            // Continue with local data
          }
        }

        // Merge sessions
        const sessionMap = new Map<string, StoredSession>();
        localSessions.forEach((s) => sessionMap.set(s.id, s));
        remoteSessions.forEach((s) => sessionMap.set(s.id, s));
        const allSessions = Array.from(sessionMap.values()).sort(
          (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
        );

        // Calculate and cache stats
        const calculated = calculatePracticeStats(allSessions);
        setStats(calculated);
        setCachedStats(calculated);

        setLoading(false);
      } catch (err) {
        console.error("[Drum] Failed to load progress data:", err);
        setError("Unable to load your progress. Please try again.");
        setLoading(false);
      }
    }

    loadData();
  }, [isOnline]);

  function handleAdvance(newModule: number) {
    if (progress) {
      setProgress({
        ...progress,
        currentModule: newModule,
        moduleStartedAt: new Date().toISOString(),
        sessionsInModule: 0,
      });
    }
  }

  function handleDayClick(date: string) {
    // Navigate to history filtered by date (future enhancement)
    router.push(`/drum/history?date=${date}`);
  }

  if (error) {
    return (
      <Shell title="Progress" subtitle="Something went wrong">
        <section className="card error-page-card">
          <div className="error-page-icon">📊</div>
          <h2 className="card-title">Unable to load progress</h2>
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

  if (loading) {
    return (
      <Shell title="Progress" subtitle="Loading your journey...">
        <SkeletonStatsCard />
        <SkeletonCalendar />
        <SkeletonCard lines={3} showTitle />
        <SkeletonCard lines={2} showTitle />
      </Shell>
    );
  }

  if (!progress) {
    return (
      <Shell title="Progress" subtitle="Your drumming journey">
        <section className="card">
          <p className="sub">Sign in to track your progress.</p>
          <div className="row">
            <a href="/drum/login" className="btn">
              Sign in
            </a>
          </div>
        </section>
      </Shell>
    );
  }

  const currentModuleInfo = MODULE_INFO[progress.currentModule - 1];
  const achievements = stats ? checkAchievements(stats) : [];

  return (
    <Shell
      title="Your Progress"
      subtitle={`Module ${progress.currentModule}: ${currentModuleInfo.title}`}
    >
      {/* Streak Counter - prominent */}
      {stats && (
        <section className="card" style={{ padding: 0, overflow: "hidden" }}>
          <StreakCounter streak={stats.streak} />
        </section>
      )}

      {/* Stats Overview */}
      {stats && (
        <section className="card" style={{ padding: 0, overflow: "hidden" }}>
          <StatsCard stats={stats} />
        </section>
      )}

      {/* Practice Calendar Heatmap */}
      {stats && (
        <section className="card">
          <PracticeCalendar
            dailyStats={stats.dailyStats}
            weeks={12}
            onDayClick={handleDayClick}
          />
        </section>
      )}

      {/* Module Progress */}
      <ModuleProgress
        currentModule={progress.currentModule}
        sessionsInModule={progress.sessionsInModule}
        onAdvance={handleAdvance}
      />

      {/* Current Focus */}
      <section className="card">
        <h2 className="card-title">Current Focus</h2>
        <p>{currentModuleInfo.focus}</p>
        <div className="progress-keywords">
          {currentModuleInfo.keywords.map((keyword) => (
            <span key={keyword} className="progress-keyword">
              {keyword}
            </span>
          ))}
        </div>
      </section>

      {/* Achievements */}
      {achievements.length > 0 && (
        <section className="card" style={{ padding: 0, overflow: "hidden" }}>
          <AchievementsCard achievements={achievements} showLocked />
        </section>
      )}

      {/* Ready to advance hint */}
      {progress.sessionsInModule >= 14 && progress.currentModule < 4 && (
        <section className="card" style={{ background: "var(--panel-deep)" }}>
          <div className="kicker">Ready to advance</div>
          <p>
            You&apos;ve completed {progress.sessionsInModule} sessions in this module.
            Consider advancing to the next module when you feel solid.
          </p>
        </section>
      )}

      {/* Navigation */}
      <section className="card">
        <div className="row">
          <button className="btn" onClick={() => router.push("/drum/today")}>
            ← Back to Today
          </button>
          <a href="/drum/method" className="btn btn-ghost">
            View Method
          </a>
          <a href="/drum/history" className="btn btn-ghost">
            Session History
          </a>
        </div>
      </section>
    </Shell>
  );
}
