"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "../_ui/Shell";
import ModuleProgress from "../_ui/ModuleProgress";
import { getModuleProgress, MODULE_INFO } from "../_lib/drumMvp";

type ProgressData = {
  currentModule: number;
  moduleStartedAt: string | null;
  sessionCount: number;
  sessionsInModule: number;
};

export default function ProgressPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModuleProgress().then((data) => {
      setProgress(data);
      setLoading(false);
    });
  }, []);

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

  if (loading) {
    return (
      <Shell title="Progress" subtitle="Loading your journey...">
        <section className="card">
          <p className="sub">Loading...</p>
        </section>
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
  const daysInModule = progress.moduleStartedAt
    ? Math.floor(
        (Date.now() - new Date(progress.moduleStartedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <Shell
      title="Your Progress"
      subtitle={`Module ${progress.currentModule}: ${currentModuleInfo.title}`}
    >
      <section className="card">
        <div className="kicker">Journey Overview</div>
        <div className="progress-stats">
          <div className="progress-stat">
            <span className="progress-stat-value">{progress.sessionCount}</span>
            <span className="progress-stat-label">Total Sessions</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value">{progress.sessionsInModule}</span>
            <span className="progress-stat-label">Sessions This Module</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value">{daysInModule}</span>
            <span className="progress-stat-label">Days in Module</span>
          </div>
        </div>
      </section>

      <ModuleProgress
        currentModule={progress.currentModule}
        sessionsInModule={progress.sessionsInModule}
        onAdvance={handleAdvance}
      />

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

      {progress.sessionsInModule >= 14 && progress.currentModule < 4 && (
        <section className="card" style={{ background: "var(--panel-deep)" }}>
          <div className="kicker">Ready to advance</div>
          <p>
            You&apos;ve completed {progress.sessionsInModule} sessions in this module.
            Consider advancing to the next module when you feel solid.
          </p>
        </section>
      )}

      <section className="card">
        <div className="row">
          <button className="btn" onClick={() => router.push("/drum/today")}>
            ← Back to Today
          </button>
          <a href="/drum/method" className="btn btn-ghost">
            View Method
          </a>
        </div>
      </section>
    </Shell>
  );
}
