"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "../_ui/Shell";
import { Icon } from "../_ui/Icon";
import SkillTree, { ProgressSummary } from "../_ui/SkillTree";
import {
  SKILLS,
  CATEGORY_INFO,
  Skill,
  SkillProgress,
  loadSkillProgress,
  getSkillStatus,
  getOverallProgress,
  getRecommendedSkill,
} from "../_lib/skillTree";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { SkeletonCard } from "../_ui/SkeletonCard";

export default function SkillsPage() {
  return (
    <ErrorBoundary>
      <SkillsPageInner />
    </ErrorBoundary>
  );
}

function SkillsPageInner() {
  const router = useRouter();
  const [progressMap, setProgressMap] = useState<Map<string, SkillProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const progress = loadSkillProgress();
    setProgressMap(progress);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Shell title="Skills" subtitle="Loading your skill tree...">
        <SkeletonCard lines={3} showTitle />
        <SkeletonCard lines={4} showTitle />
      </Shell>
    );
  }

  const { unlocked, mastered, total, percent } = getOverallProgress(progressMap);
  const recommended = getRecommendedSkill(progressMap);

  // Get recently unlocked/mastered skills
  const recentlyMastered = SKILLS
    .filter(s => progressMap.get(s.id)?.status === "mastered")
    .sort((a, b) => {
      const aDate = progressMap.get(a.id)?.masteredAt ?? "";
      const bDate = progressMap.get(b.id)?.masteredAt ?? "";
      return bDate.localeCompare(aDate);
    })
    .slice(0, 3);

  // Skills in progress (unlocked but not mastered, with some sessions)
  const inProgress = SKILLS
    .filter(s => {
      const progress = progressMap.get(s.id);
      return progress && 
             progress.status === "unlocked" && 
             (progress.sessionsCompleted ?? 0) > 0;
    })
    .sort((a, b) => {
      const aPercent = (progressMap.get(a.id)?.sessionsCompleted ?? 0) / a.sessionsToMaster;
      const bPercent = (progressMap.get(b.id)?.sessionsCompleted ?? 0) / b.sessionsToMaster;
      return bPercent - aPercent;
    })
    .slice(0, 3);

  return (
    <Shell
      title="Skill Tree"
      subtitle={`${mastered} of ${total} skills mastered`}
    >
      {/* Overall Progress */}
      <section className="card">
        <div className="skill-page-progress">
          <div className="skill-page-progress-main">
            <div className="skill-page-progress-percent">{percent}%</div>
            <div className="skill-page-progress-label">mastery</div>
          </div>
          <div className="skill-page-progress-stats">
            <div className="skill-page-stat">
              <span className="skill-page-stat-value">{mastered}</span>
              <span className="skill-page-stat-label">mastered</span>
            </div>
            <div className="skill-page-stat">
              <span className="skill-page-stat-value">{unlocked - mastered}</span>
              <span className="skill-page-stat-label">in progress</span>
            </div>
            <div className="skill-page-stat">
              <span className="skill-page-stat-value">{total - unlocked}</span>
              <span className="skill-page-stat-label">locked</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Next */}
      {recommended && (
        <section className="card skill-page-recommended">
          <div className="kicker">Suggested Focus</div>
          <div className="skill-page-recommended-content">
            <div className="skill-page-recommended-icon">
              <Icon name={CATEGORY_INFO[recommended.category].icon} size={24} />
            </div>
            <div className="skill-page-recommended-info">
              <h3 className="skill-page-recommended-name">{recommended.name}</h3>
              <p className="skill-page-recommended-desc">{recommended.description}</p>
              <div className="skill-page-recommended-meta">
                {CATEGORY_INFO[recommended.category].label} · {recommended.sessionsToMaster} sessions to master
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Skills In Progress */}
      {inProgress.length > 0 && (
        <section className="card">
          <h2 className="card-title">In Progress</h2>
          <div className="skill-page-list">
            {inProgress.map(skill => {
              const progress = progressMap.get(skill.id);
              const percent = Math.round(((progress?.sessionsCompleted ?? 0) / skill.sessionsToMaster) * 100);
              return (
                <div key={skill.id} className="skill-page-item">
                  <div className="skill-page-item-icon">
                    <Icon name={CATEGORY_INFO[skill.category].icon} size={20} />
                  </div>
                  <div className="skill-page-item-info">
                    <div className="skill-page-item-name">{skill.name}</div>
                    <div className="skill-page-item-progress">
                      <div className="skill-page-item-progress-bar">
                        <div 
                          className="skill-page-item-progress-fill"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="skill-page-item-progress-text">
                        {progress?.sessionsCompleted ?? 0}/{skill.sessionsToMaster}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recently Mastered */}
      {recentlyMastered.length > 0 && (
        <section className="card">
          <h2 className="card-title">Recently Mastered</h2>
          <div className="skill-page-mastered-list">
            {recentlyMastered.map(skill => {
              const progress = progressMap.get(skill.id);
              const masteredDate = progress?.masteredAt 
                ? new Date(progress.masteredAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : "";
              return (
                <div key={skill.id} className="skill-page-mastered-item">
                  <div className="skill-page-mastered-check"><Icon name="check" size={16} /></div>
                  <div className="skill-page-mastered-name">{skill.name}</div>
                  {masteredDate && (
                    <div className="skill-page-mastered-date">{masteredDate}</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Full Skill Tree */}
      <section className="card">
        <h2 className="card-title">All Skills</h2>
        <SkillTree showProgress={false} />
      </section>

      {/* Navigation */}
      <section className="card">
        <div className="row">
          <button className="btn" onClick={() => router.push("/drum/today")}>
            ← Back to Today
          </button>
          <a href="/drum/progress" className="btn btn-ghost">
            View Progress
          </a>
          <a href="/drum/drills" className="btn btn-ghost">
            Practice Drills
          </a>
        </div>
      </section>
    </Shell>
  );
}
