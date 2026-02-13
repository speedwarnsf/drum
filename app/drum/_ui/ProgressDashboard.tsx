"use client";

import React, { useEffect, useState } from "react";
import { AchievementTracker, Achievement, PracticeStats } from "../_lib/achievementSystem";

type ProgressDashboardProps = {
  showDetailed?: boolean;
  className?: string;
};

export default function ProgressDashboard({ 
  showDetailed = false, 
  className = "" 
}: ProgressDashboardProps) {
  const [achievementTracker] = useState(() => new AchievementTracker());
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const currentStats = achievementTracker.getStats();
    const allAchievements = achievementTracker.getAllAchievements();
    
    setStats(currentStats);
    setAchievements(allAchievements);
  }, [achievementTracker]);

  if (!stats) {
    return <div className="progress-dashboard-loading">Loading progress...</div>;
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const nextAchievements = achievementTracker.getProgressToNextAchievements(3);
  const insights = achievementTracker.getPracticeInsights();

  const categories = ['all', 'practice', 'timing', 'rudiments', 'consistency', 'special'];
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  return (
    <div className={`progress-dashboard ${className}`}>
      <div className="dashboard-header">
        <h2>Progress Dashboard</h2>
        <div className="quick-stats">
          <div className="quick-stat">
            <span className="stat-value">{stats.totalSessions}</span>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="quick-stat">
            <span className="stat-value">{Math.round(insights.totalPracticeHours)}</span>
            <span className="stat-label">Hours</span>
          </div>
          <div className="quick-stat">
            <span className="stat-value">{stats.currentStreak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
          <div className="quick-stat">
            <span className="stat-value">{unlockedAchievements.length}</span>
            <span className="stat-label">Achievements</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Streak Card */}
        <div className="dashboard-card streak-card">
          <h3>
            Practice Streak
          </h3>
          <div className="streak-display">
            <div className="streak-number">{stats.currentStreak}</div>
            <div className="streak-label">
              {stats.currentStreak === 1 ? 'Day' : 'Days'}
            </div>
          </div>
          <div className="streak-progress">
            <div className="streak-info">
              <span>Best: {stats.longestStreak} days</span>
              <span>Last: {formatLastPractice(stats.lastPracticeDate)}</span>
            </div>
            <StreakCalendar stats={stats} />
          </div>
        </div>

        {/* Weekly Practice Chart */}
        <div className="dashboard-card weekly-chart">
          <h3>Weekly Practice</h3>
          <WeeklyChart weeklyMinutes={stats.weeklyMinutes} />
          <div className="weekly-summary">
            <span>Most active: {insights.mostActiveDay}</span>
            <span>Avg session: {Math.round(insights.averageSessionLength)}min</span>
          </div>
        </div>

        {/* Skill Levels */}
        <div className="dashboard-card skill-levels">
          <h3>Skill Progress</h3>
          <SkillRadar skillLevels={stats.skillLevels} />
          <div className="skill-summary">
            <span>Overall accuracy: {Math.round(stats.averageAccuracy)}%</span>
            <span>Rudiments mastered: {stats.rudientsCompleted}</span>
          </div>
        </div>

        {/* Next Achievements */}
        <div className="dashboard-card next-achievements">
          <h3>Next Goals</h3>
          {nextAchievements.length > 0 ? (
            <div className="achievement-progress-list">
              {nextAchievements.map(achievement => (
                <div key={achievement.id} className="achievement-progress-item">
                  <div className="achievement-header">
                    <span className="achievement-icon">{achievement.icon}</span>
                    <span className="achievement-name">{achievement.name}</span>
                    <span className="achievement-percentage">{Math.round(achievement.progress)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <div className="achievement-description">{achievement.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <p>All available achievements unlocked! !</p>
          )}
        </div>
      </div>

      {showDetailed && (
        <>
          {/* Achievement Gallery */}
          <div className="achievement-section">
            <div className="section-header">
              <h3>Achievements ({unlockedAchievements.length}/{achievements.length})</h3>
              <div className="category-filter">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="achievement-grid">
              {filteredAchievements.map(achievement => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                />
              ))}
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="statistics-section">
            <h3>Detailed Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Practice History</h4>
                <div className="stat-list">
                  <div className="stat-item">
                    <span>Total sessions:</span>
                    <span>{stats.totalSessions}</span>
                  </div>
                  <div className="stat-item">
                    <span>Total practice time:</span>
                    <span>{Math.round(insights.totalPracticeHours * 10) / 10} hours</span>
                  </div>
                  <div className="stat-item">
                    <span>Average session length:</span>
                    <span>{Math.round(insights.averageSessionLength)} minutes</span>
                  </div>
                  <div className="stat-item">
                    <span>Longest streak:</span>
                    <span>{stats.longestStreak} days</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <h4>Performance Metrics</h4>
                <div className="stat-list">
                  <div className="stat-item">
                    <span>Average accuracy:</span>
                    <span>{Math.round(stats.averageAccuracy)}%</span>
                  </div>
                  <div className="stat-item">
                    <span>Rudiments completed:</span>
                    <span>{stats.rudientsCompleted}</span>
                  </div>
                  <div className="stat-item">
                    <span>Highest tempo:</span>
                    <span>{Math.max(...stats.tempoMilestones, 0)} BPM</span>
                  </div>
                  <div className="stat-item">
                    <span>Favorite practice time:</span>
                    <span>{stats.favoriteTimeOfDay}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <h4>Monthly Overview</h4>
                <MonthlyChart monthlyMinutes={stats.monthlyMinutes} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Achievement Card Component
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const rarityColors = {
    common: '#95a5a6',
    uncommon: '#3498db',
    rare: '#9b59b6',
    epic: '#f39c12',
    legendary: '#e74c3c',
  };

  return (
    <div 
      className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} rarity-${achievement.rarity}`}
      style={{ borderColor: rarityColors[achievement.rarity] }}
    >
      <div className="achievement-icon-large">{achievement.icon}</div>
      <div className="achievement-content">
        <h4 className="achievement-name">{achievement.name}</h4>
        <p className="achievement-description">{achievement.description}</p>
        {!achievement.unlocked && (
          <div className="achievement-progress">
            <div className="progress-bar small">
              <div 
                className="progress-fill" 
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
            <span className="progress-text">{Math.round(achievement.progress)}%</span>
          </div>
        )}
        {achievement.unlockedAt && (
          <div className="achievement-date">
            Unlocked: {formatUnlockDate(achievement.unlockedAt)}
          </div>
        )}
      </div>
    </div>
  );
}

// Streak Calendar Component
function StreakCalendar({ stats }: { stats: PracticeStats }) {
  const today = new Date();
  const days = [];
  
  // Show last 14 days
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // This is simplified - in a real app you'd track actual practice dates
    const isPracticeDay = i < stats.currentStreak;
    
    days.push(
      <div 
        key={i}
        className={`streak-day ${isPracticeDay ? 'practiced' : 'missed'}`}
        title={date.toDateString()}
      >
        {date.getDate()}
      </div>
    );
  }
  
  return <div className="streak-calendar">{days}</div>;
}

// Weekly Chart Component
function WeeklyChart({ weeklyMinutes }: { weeklyMinutes: number[] }) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const maxMinutes = Math.max(...weeklyMinutes, 1);
  
  return (
    <div className="weekly-chart">
      {days.map((day, index) => (
        <div key={index} className="chart-day">
          <div 
            className="chart-bar"
            style={{ 
              height: `${(weeklyMinutes[index] / maxMinutes) * 100}%`,
              minHeight: '4px'
            }}
          />
          <span className="chart-label">{day}</span>
        </div>
      ))}
    </div>
  );
}

// Monthly Chart Component
function MonthlyChart({ monthlyMinutes }: { monthlyMinutes: number[] }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxMinutes = Math.max(...monthlyMinutes, 1);
  
  return (
    <div className="monthly-chart">
      {months.map((month, index) => (
        <div key={index} className="chart-month">
          <div 
            className="chart-bar"
            style={{ 
              height: `${(monthlyMinutes[index] / maxMinutes) * 100}%`,
              minHeight: '2px'
            }}
            title={`${month}: ${monthlyMinutes[index]} minutes`}
          />
          <span className="chart-label">{month.slice(0, 1)}</span>
        </div>
      ))}
    </div>
  );
}

// Skill Radar Component (simplified)
function SkillRadar({ skillLevels }: { skillLevels: PracticeStats['skillLevels'] }) {
  return (
    <div className="skill-radar">
      <div className="skill-item">
        <span>Timing</span>
        <div className="skill-bar">
          <div 
            className="skill-fill" 
            style={{ width: `${(skillLevels.timing / 100) * 100}%` }}
          />
        </div>
        <span>{skillLevels.timing}/100</span>
      </div>
      <div className="skill-item">
        <span>Technique</span>
        <div className="skill-bar">
          <div 
            className="skill-fill" 
            style={{ width: `${(skillLevels.technique / 100) * 100}%` }}
          />
        </div>
        <span>{skillLevels.technique}/100</span>
      </div>
      <div className="skill-item">
        <span>Rudiments</span>
        <div className="skill-bar">
          <div 
            className="skill-fill" 
            style={{ width: `${(skillLevels.rudiments / 100) * 100}%` }}
          />
        </div>
        <span>{skillLevels.rudiments}/100</span>
      </div>
      <div className="skill-item">
        <span>Creativity</span>
        <div className="skill-bar">
          <div 
            className="skill-fill" 
            style={{ width: `${(skillLevels.creativity / 100) * 100}%` }}
          />
        </div>
        <span>{skillLevels.creativity}/100</span>
      </div>
    </div>
  );
}

// Utility functions
function formatLastPractice(date: Date | null): string {
  if (!date) return 'Never';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}

function formatUnlockDate(date: Date): string {
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

// Compact version for smaller spaces
export function CompactProgressDashboard() {
  return (
    <ProgressDashboard 
      showDetailed={false} 
      className="compact"
    />
  );
}