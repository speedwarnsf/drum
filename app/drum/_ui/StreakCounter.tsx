"use client";

import { StreakInfo } from "../_lib/statsUtils";
import { Icon } from "./Icon";

type StreakCounterProps = {
  streak: StreakInfo;
  compact?: boolean;
};

const MILESTONES = [
  { days: 7, label: "1 Week", desc: "Week warrior" },
  { days: 30, label: "30 Days", desc: "Steady hand" },
  { days: 100, label: "100 Days", desc: "Centurion" },
];

export default function StreakCounter({ streak, compact = false }: StreakCounterProps) {
  const { current, longest, isActive, isAtRisk, lastPracticeDate } = streak;

  const hasStreak = current > 0;
  const streakBroken = !isActive && !isAtRisk && lastPracticeDate !== null && current === 0;

  const lastPracticeText = lastPracticeDate
    ? new Date(lastPracticeDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  if (compact) {
    return (
      <div className="streak-compact">
        <span className="streak-compact-fire">{hasStreak ? <Icon name="flame" size={16} /> : <Icon name="circle" size={16} />}</span>
        <span className="streak-compact-count">{current}</span>
        <span className="streak-compact-label">day streak</span>
        {isActive && <span className="streak-compact-active">Active</span>}
      </div>
    );
  }

  return (
    <div className="streak-card">
      <div className="streak-main">
        <div className="streak-fire-container">
          <span className={`streak-fire ${hasStreak ? "streak-fire-active" : ""}`}>
            {hasStreak ? <Icon name="flame" size={24} /> : <Icon name="circle" size={24} />}
          </span>
          {hasStreak && isActive && (
            <span className="streak-fire-glow" />
          )}
        </div>

        <div className="streak-info">
          <div className="streak-current">
            <span className="streak-current-number">{current}</span>
            <span className="streak-current-label">
              day{current !== 1 ? "s" : ""} in a row
            </span>
          </div>

          {isActive && (
            <span className="streak-status streak-status-active">
              Practiced today
            </span>
          )}

          {isAtRisk && lastPracticeText && (
            <span className="streak-status streak-status-warning">
              Practice today to keep it going!
            </span>
          )}

          {streakBroken && (
            <span className="streak-status streak-status-gentle">
              Start fresh -- every session counts
            </span>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="streak-milestones">
        {MILESTONES.map((m) => {
          const reached = longest >= m.days;
          const approaching = !reached && current >= m.days - 3 && current > 0;
          return (
            <div
              key={m.days}
              className={`streak-milestone ${reached ? "streak-milestone-reached" : ""} ${approaching ? "streak-milestone-approaching" : ""}`}
            >
              <Icon name="flame" size={14} />
              <span className="streak-milestone-label">{m.label}</span>
              {reached && <Icon name="check" size={12} />}
            </div>
          );
        })}
      </div>

      <div className="streak-secondary">
        <div className="streak-stat">
          <span className="streak-stat-value">{longest}</span>
          <span className="streak-stat-label">Longest streak</span>
        </div>
        {lastPracticeText && !isActive && (
          <div className="streak-stat">
            <span className="streak-stat-value">{lastPracticeText}</span>
            <span className="streak-stat-label">Last practice</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Minimal inline streak indicator for headers/nav
export function StreakBadge({ streak }: { streak: StreakInfo }) {
  if (streak.current === 0) return null;

  return (
    <span className="streak-badge">
      <span className="streak-badge-fire"><Icon name="flame" size={16} /></span>
      <span className="streak-badge-count">{streak.current}</span>
    </span>
  );
}
