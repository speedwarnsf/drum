"use client";

import { Icon } from "./Icon";
import { formatPracticeTime, PracticeStats, Achievement } from "../_lib/statsUtils";

type StatItemProps = {
  value: string | number;
  label: string;
  trend?: number;
  trendLabel?: string;
};

function StatItem({ value, label, trend, trendLabel }: StatItemProps) {
  return (
    <div className="stat-item">
      <span className="stat-item-value">{value}</span>
      <span className="stat-item-label">{label}</span>
      {trend !== undefined && trend !== 0 && (
        <span
          className={`stat-item-trend ${trend > 0 ? "stat-item-trend-up" : "stat-item-trend-down"}`}
        >
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)} {trendLabel || ""}
        </span>
      )}
    </div>
  );
}

type StatsCardProps = {
  stats: PracticeStats;
  showTrend?: boolean;
};

export default function StatsCard({ stats, showTrend = true }: StatsCardProps) {
  const {
    totalSessions,
    totalMinutes,
    averageMinutes,
    sessionsThisWeek,
    weeklyTrend,
  } = stats;

  return (
    <div className="stats-card">
      <div className="stats-grid">
        <StatItem
          value={totalSessions}
          label="Total Sessions"
        />
        <StatItem
          value={formatPracticeTime(totalMinutes)}
          label="Total Practice Time"
        />
        <StatItem
          value={`${averageMinutes}m`}
          label="Avg Session"
        />
        <StatItem
          value={sessionsThisWeek}
          label="This Week"
          trend={showTrend ? weeklyTrend : undefined}
          trendLabel="vs last week"
        />
      </div>
    </div>
  );
}

type AchievementsCardProps = {
  achievements: Achievement[];
  showLocked?: boolean;
};

export function AchievementsCard({ achievements, showLocked = true }: AchievementsCardProps) {
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  if (unlockedAchievements.length === 0 && !showLocked) {
    return null;
  }

  return (
    <div className="achievements-card">
      <div className="achievements-header">
        <span className="achievements-title">Milestones</span>
        <span className="achievements-count">
          {unlockedAchievements.length}/{achievements.length}
        </span>
      </div>

      {unlockedAchievements.length > 0 && (
        <div className="achievements-grid">
          {unlockedAchievements.map((achievement) => (
            <div key={achievement.id} className="achievement achievement-unlocked">
              <span className="achievement-icon"><Icon name={achievement.icon} size={24} /></span>
              <div className="achievement-info">
                <span className="achievement-title">{achievement.title}</span>
                <span className="achievement-desc">{achievement.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showLocked && lockedAchievements.length > 0 && (
        <div className="achievements-locked">
          <span className="achievements-locked-label">Coming up</span>
          <div className="achievements-grid achievements-grid-locked">
            {lockedAchievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="achievement achievement-locked">
                <span className="achievement-icon achievement-icon-locked">
                  <Icon name={achievement.icon} size={24} />
                </span>
                <div className="achievement-info">
                  <span className="achievement-title">{achievement.title}</span>
                  <span className="achievement-desc">{achievement.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact stats row for the today page
type CompactStatsProps = {
  totalSessions: number;
  streak: number;
  isStreakActive: boolean;
};

export function CompactStats({ totalSessions, streak, isStreakActive }: CompactStatsProps) {
  return (
    <div className="compact-stats">
      <div className="compact-stat">
        <span className="compact-stat-value">{totalSessions}</span>
        <span className="compact-stat-label">sessions</span>
      </div>
      <div className="compact-stat-sep">·</div>
      <div className="compact-stat">
        {streak > 0 && <span className="compact-stat-fire"><Icon name="flame" size={16} /></span>}
        <span className="compact-stat-value">{streak}</span>
        <span className="compact-stat-label">day streak</span>
        {isStreakActive && <span className="compact-stat-check"><Icon name="check" size={14} /></span>}
      </div>
    </div>
  );
}
