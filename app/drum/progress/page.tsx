"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "../_ui/Shell";
import { Icon } from "../_ui/Icon";
import ModuleProgress from "../_ui/ModuleProgress";
import PracticeCalendar from "../_ui/PracticeCalendar";
import StreakCounter from "../_ui/StreakCounter";
import StatsCard, { AchievementsCard } from "../_ui/StatsCard";
import CompetencyGateDisplay from "../_ui/CompetencyGateDisplay";
import ProgressCharts from "../_ui/ProgressCharts";
import { PageTransition, SlideUpSequence } from "../_ui/MusicalAnimations";
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
  const [diagnosticResults, setDiagnosticResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Load module progress (try remote, fallback to local)
        let progressData = await getModuleProgress();
        if (!progressData) {
          // Fallback: build progress from local sessions
          const localSessions = loadSessions();
          if (localSessions.length > 0) {
            progressData = {
              currentModule: 1,
              moduleStartedAt: localSessions[localSessions.length - 1]?.ts ?? null,
              sessionCount: localSessions.length,
              sessionsInModule: localSessions.length,
            };
          }
        }
        setProgress(progressData);

        // Load diagnostic results from localStorage
        const storedDiagnostics = localStorage.getItem("drum_diagnostic_results");
        if (storedDiagnostics) {
          try {
            setDiagnosticResults(JSON.parse(storedDiagnostics));
          } catch (e) {
            console.error("Failed to parse diagnostic results:", e);
          }
        }

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
          <div className="error-page-icon"><Icon name="progress" size={48} /></div>
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
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <Icon name="progress" size={48} />
            <h2 className="card-title" style={{ marginTop: 16 }}>Your journey starts here</h2>
            <p className="sub" style={{ maxWidth: 360, margin: "8px auto 0" }}>
              Complete your first practice session to begin tracking progress. Sign in to sync across devices.
            </p>
            <div className="row" style={{ marginTop: 20, justifyContent: "center" }}>
              <a href="/drum/today" className="btn">
                Start practicing
              </a>
              <a href="/drum/login" className="btn btn-ghost">
                Sign in
              </a>
            </div>
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

      {/* Enhanced Visual Progress Charts */}
      {stats && (
        <ProgressCharts
          sessions={stats.dailyStats.flatMap(day => 
            Array.from({ length: day.sessionCount || 0 }, () => ({
              date: day.date,
              duration: (day.totalMinutes || 0) / (day.sessionCount || 1),
              accuracy: (day as any).avgAccuracy ?? 0,
              bpm: 120, // Default, could be enhanced with real data
              mode: 'practice'
            }))
          )}
          rudiments={[
            { name: 'Single Stroke Roll', mastery: 85, sessions: 12, lastPracticed: '2023-10-15' },
            { name: 'Double Stroke Roll', mastery: 75, sessions: 8, lastPracticed: '2023-10-14' },
            { name: 'Paradiddle', mastery: 90, sessions: 15, lastPracticed: '2023-10-15' },
            { name: 'Flam', mastery: 65, sessions: 6, lastPracticed: '2023-10-13' },
            { name: 'Drag', mastery: 55, sessions: 4, lastPracticed: '2023-10-12' }
          ]}
          streakData={stats.dailyStats.map(day => ({
            date: day.date,
            practiced: (day.sessionCount || 0) > 0,
            duration: day.totalMinutes
          }))}
          skillLevels={{
            timing: Math.min(90, progress?.currentModule ? progress.currentModule * 25 : 25),
            technique: Math.min(85, progress?.currentModule ? progress.currentModule * 22 : 22),
            creativity: Math.min(70, progress?.currentModule ? progress.currentModule * 18 : 18),
            endurance: Math.min(80, progress?.currentModule ? progress.currentModule * 20 : 20)
          }}
          showAnimation={true}
        />
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
        diagnosticResults={diagnosticResults}
        onAdvance={handleAdvance}
      />

      {/* Competency Gates */}
      <section className="card">
        <CompetencyGateDisplay
          currentModule={progress.currentModule}
          diagnosticResults={diagnosticResults}
        />
      </section>

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
