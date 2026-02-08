/**
 * Achievement and progress tracking system for drum practice
 * Features: Badges, streak tracking, skill progression, practice statistics
 */

export type AchievementCategory = 'practice' | 'timing' | 'rudiments' | 'consistency' | 'milestones' | 'special';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: 'practice_sessions' | 'streak_days' | 'rudiments_mastered' | 'accuracy_score' | 'practice_minutes' | 'tempo_milestone' | 'special';
    target: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100
  reward?: {
    type: 'badge' | 'feature_unlock' | 'cosmetic';
    value: string;
  };
};

export type PracticeStats = {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: Date | null;
  averageAccuracy: number;
  rudientsCompleted: number;
  favoriteTimeOfDay: string;
  weeklyMinutes: number[];
  monthlyMinutes: number[];
  skillLevels: {
    timing: number;
    technique: number;
    rudiments: number;
    creativity: number;
  };
  tempoMilestones: number[];
};

// Predefined achievements
const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Practice Achievements
  {
    id: 'first_session',
    name: 'First Steps',
    description: 'Complete your first practice session',
    category: 'practice',
    icon: '🥁',
    rarity: 'common',
    requirement: { type: 'practice_sessions', target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'ten_sessions',
    name: 'Getting Started',
    description: 'Complete 10 practice sessions',
    category: 'practice',
    icon: '🎯',
    rarity: 'common',
    requirement: { type: 'practice_sessions', target: 10 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'hundred_sessions',
    name: 'Dedicated Drummer',
    description: 'Complete 100 practice sessions',
    category: 'practice',
    icon: '💯',
    rarity: 'uncommon',
    requirement: { type: 'practice_sessions', target: 100 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'marathon_month',
    name: 'Marathon Month',
    description: 'Practice for 20+ hours in a single month',
    category: 'practice',
    icon: '🏃‍♂️',
    rarity: 'rare',
    requirement: { type: 'practice_minutes', target: 1200, timeframe: 'monthly' },
    unlocked: false,
    progress: 0,
  },

  // Streak Achievements
  {
    id: 'three_day_streak',
    name: 'Building Habits',
    description: 'Practice for 3 consecutive days',
    category: 'consistency',
    icon: '🔥',
    rarity: 'common',
    requirement: { type: 'streak_days', target: 3 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: 'Practice for 7 consecutive days',
    category: 'consistency',
    icon: '📅',
    rarity: 'uncommon',
    requirement: { type: 'streak_days', target: 7 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'month_streak',
    name: 'Month Master',
    description: 'Practice for 30 consecutive days',
    category: 'consistency',
    icon: '🎖️',
    rarity: 'rare',
    requirement: { type: 'streak_days', target: 30 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'hundred_day_streak',
    name: 'Century of Practice',
    description: 'Practice for 100 consecutive days',
    category: 'consistency',
    icon: '👑',
    rarity: 'legendary',
    requirement: { type: 'streak_days', target: 100 },
    unlocked: false,
    progress: 0,
  },

  // Timing Achievements
  {
    id: 'good_timing',
    name: 'In the Pocket',
    description: 'Achieve 85% timing accuracy in a session',
    category: 'timing',
    icon: '🎵',
    rarity: 'common',
    requirement: { type: 'accuracy_score', target: 85 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'perfect_timing',
    name: 'Metronome Master',
    description: 'Achieve 95% timing accuracy in a session',
    category: 'timing',
    icon: '⏰',
    rarity: 'rare',
    requirement: { type: 'accuracy_score', target: 95 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'tempo_120',
    name: 'Moderate Pace',
    description: 'Successfully practice at 120 BPM',
    category: 'timing',
    icon: '🚶‍♂️',
    rarity: 'common',
    requirement: { type: 'tempo_milestone', target: 120 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'tempo_180',
    name: 'Speed Demon',
    description: 'Successfully practice at 180 BPM',
    category: 'timing',
    icon: '💨',
    rarity: 'epic',
    requirement: { type: 'tempo_milestone', target: 180 },
    unlocked: false,
    progress: 0,
  },

  // Rudiment Achievements
  {
    id: 'first_rudiment',
    name: 'Fundamentals',
    description: 'Master your first drum rudiment',
    category: 'rudiments',
    icon: '📚',
    rarity: 'common',
    requirement: { type: 'rudiments_mastered', target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'five_rudiments',
    name: 'Building Blocks',
    description: 'Master 5 different rudiments',
    category: 'rudiments',
    icon: '🧱',
    rarity: 'uncommon',
    requirement: { type: 'rudiments_mastered', target: 5 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'essential_rudiments',
    name: 'Essential Knowledge',
    description: 'Master 20 essential rudiments',
    category: 'rudiments',
    icon: '🎓',
    rarity: 'epic',
    requirement: { type: 'rudiments_mastered', target: 20 },
    unlocked: false,
    progress: 0,
  },

  // Special Achievements
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Practice between 10 PM and 6 AM',
    category: 'special',
    icon: '🦉',
    rarity: 'uncommon',
    requirement: { type: 'special', target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Practice before 6 AM',
    category: 'special',
    icon: '🐦',
    rarity: 'uncommon',
    requirement: { type: 'special', target: 1 },
    unlocked: false,
    progress: 0,
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Practice every weekend for a month',
    category: 'special',
    icon: '🏃‍♂️',
    rarity: 'rare',
    requirement: { type: 'special', target: 4 },
    unlocked: false,
    progress: 0,
  },
];

export class AchievementTracker {
  private achievements: Map<string, Achievement>;
  private stats: PracticeStats;
  private listeners: Array<(achievement: Achievement) => void> = [];

  constructor() {
    this.achievements = new Map();
    this.stats = this.getDefaultStats();
    this.initializeAchievements();
    this.loadProgress();
  }

  private getDefaultStats(): PracticeStats {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      averageAccuracy: 0,
      rudientsCompleted: 0,
      favoriteTimeOfDay: 'morning',
      weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
      monthlyMinutes: new Array(12).fill(0),
      skillLevels: {
        timing: 0,
        technique: 0,
        rudiments: 0,
        creativity: 0,
      },
      tempoMilestones: [],
    };
  }

  private initializeAchievements(): void {
    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      this.achievements.set(achievement.id, { ...achievement });
    });
  }

  private loadProgress(): void {
    try {
      const savedStats = localStorage.getItem('drum-practice-stats');
      const savedAchievements = localStorage.getItem('drum-achievements');

      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        this.stats = {
          ...this.getDefaultStats(),
          ...parsed,
          lastPracticeDate: parsed.lastPracticeDate ? new Date(parsed.lastPracticeDate) : null,
        };
      }

      if (savedAchievements) {
        const achievementData = JSON.parse(savedAchievements);
        achievementData.forEach((data: any) => {
          const achievement = this.achievements.get(data.id);
          if (achievement) {
            achievement.unlocked = data.unlocked;
            achievement.progress = data.progress;
            achievement.unlockedAt = data.unlockedAt ? new Date(data.unlockedAt) : undefined;
          }
        });
      }
    } catch (error) {
      console.warn('Could not load achievement progress:', error);
    }
  }

  private saveProgress(): void {
    try {
      localStorage.setItem('drum-practice-stats', JSON.stringify(this.stats));
      
      const achievementData = Array.from(this.achievements.values()).map(a => ({
        id: a.id,
        unlocked: a.unlocked,
        progress: a.progress,
        unlockedAt: a.unlockedAt,
      }));
      localStorage.setItem('drum-achievements', JSON.stringify(achievementData));
    } catch (error) {
      console.warn('Could not save achievement progress:', error);
    }
  }

  // Track practice session
  recordPracticeSession(data: {
    durationMinutes: number;
    accuracy?: number;
    rudientsPracticed?: string[];
    tempo?: number;
    sessionDate?: Date;
  }): Achievement[] {
    const sessionDate = data.sessionDate || new Date();
    const newlyUnlocked: Achievement[] = [];

    // Update basic stats
    this.stats.totalSessions++;
    this.stats.totalMinutes += data.durationMinutes;

    // Update streak
    this.updateStreak(sessionDate);

    // Update accuracy
    if (data.accuracy !== undefined) {
      const totalAccuracy = this.stats.averageAccuracy * (this.stats.totalSessions - 1) + data.accuracy;
      this.stats.averageAccuracy = totalAccuracy / this.stats.totalSessions;
    }

    // Update weekly/monthly minutes
    const dayOfWeek = sessionDate.getDay();
    const month = sessionDate.getMonth();
    this.stats.weeklyMinutes[dayOfWeek] += data.durationMinutes;
    this.stats.monthlyMinutes[month] += data.durationMinutes;

    // Track tempo milestones
    if (data.tempo && !this.stats.tempoMilestones.includes(data.tempo)) {
      this.stats.tempoMilestones.push(data.tempo);
    }

    // Update favorite time of day
    const hour = sessionDate.getHours();
    if (hour >= 5 && hour < 12) this.stats.favoriteTimeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) this.stats.favoriteTimeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) this.stats.favoriteTimeOfDay = 'evening';
    else this.stats.favoriteTimeOfDay = 'night';

    this.stats.lastPracticeDate = sessionDate;

    // Check achievements
    newlyUnlocked.push(...this.checkAchievements(data));

    this.saveProgress();
    return newlyUnlocked;
  }

  private updateStreak(sessionDate: Date): void {
    if (!this.stats.lastPracticeDate) {
      this.stats.currentStreak = 1;
    } else {
      const daysSince = Math.floor(
        (sessionDate.getTime() - this.stats.lastPracticeDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSince === 1) {
        // Consecutive day
        this.stats.currentStreak++;
      } else if (daysSince === 0) {
        // Same day, don't change streak
      } else {
        // Break in streak
        this.stats.currentStreak = 1;
      }
    }

    this.stats.longestStreak = Math.max(this.stats.longestStreak, this.stats.currentStreak);
  }

  private checkAchievements(sessionData: any): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let currentValue = 0;
      let achieved = false;

      switch (achievement.requirement.type) {
        case 'practice_sessions':
          currentValue = this.stats.totalSessions;
          break;
        case 'streak_days':
          currentValue = this.stats.currentStreak;
          break;
        case 'rudiments_mastered':
          currentValue = this.stats.rudientsCompleted;
          break;
        case 'accuracy_score':
          currentValue = sessionData.accuracy || 0;
          break;
        case 'practice_minutes':
          if (achievement.requirement.timeframe === 'monthly') {
            currentValue = this.stats.monthlyMinutes[new Date().getMonth()];
          } else {
            currentValue = this.stats.totalMinutes;
          }
          break;
        case 'tempo_milestone':
          achieved = this.stats.tempoMilestones.includes(achievement.requirement.target);
          currentValue = achieved ? achievement.requirement.target : 0;
          break;
        case 'special':
          // Handle special achievements
          achieved = this.checkSpecialAchievement(achievement.id, sessionData);
          currentValue = achieved ? achievement.requirement.target : 0;
          break;
      }

      // Update progress
      achievement.progress = Math.min(100, (currentValue / achievement.requirement.target) * 100);

      // Check if unlocked
      if (!achieved && currentValue >= achievement.requirement.target) {
        achieved = true;
      }

      if (achieved && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        newlyUnlocked.push(achievement);
        
        // Notify listeners
        this.listeners.forEach(listener => listener(achievement));
      }
    });

    return newlyUnlocked;
  }

  private checkSpecialAchievement(achievementId: string, sessionData: any): boolean {
    const sessionDate = sessionData.sessionDate || new Date();
    const hour = sessionDate.getHours();

    switch (achievementId) {
      case 'night_owl':
        return hour >= 22 || hour < 6;
      case 'early_bird':
        return hour < 6;
      case 'weekend_warrior':
        // Check if practiced every weekend for the current month
        // This is simplified - would need more complex tracking
        return sessionDate.getDay() === 0 || sessionDate.getDay() === 6;
      default:
        return false;
    }
  }

  // Public interface
  getStats(): PracticeStats {
    return { ...this.stats };
  }

  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  getUnlockedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.unlocked);
  }

  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.category === category);
  }

  getProgressToNextAchievements(count: number = 3): Achievement[] {
    return Array.from(this.achievements.values())
      .filter(a => !a.unlocked && a.progress > 0)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, count);
  }

  onAchievementUnlocked(callback: (achievement: Achievement) => void): void {
    this.listeners.push(callback);
  }

  recordRudimentMastery(rudimentId: string): Achievement[] {
    this.stats.rudientsCompleted++;
    return this.checkAchievements({ rudiments: [rudimentId] });
  }

  updateSkillLevel(skill: keyof PracticeStats['skillLevels'], level: number): void {
    this.stats.skillLevels[skill] = Math.max(this.stats.skillLevels[skill], level);
    this.saveProgress();
  }

  reset(): void {
    this.stats = this.getDefaultStats();
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.progress = 0;
      achievement.unlockedAt = undefined;
    });
    this.saveProgress();
  }

  // Analytics methods
  getPracticeInsights(): {
    averageSessionLength: number;
    mostActiveDay: string;
    totalPracticeHours: number;
    improvementTrend: 'improving' | 'stable' | 'declining';
    nextMilestone?: Achievement;
  } {
    const averageSessionLength = this.stats.totalSessions > 0 
      ? this.stats.totalMinutes / this.stats.totalSessions 
      : 0;

    const mostActiveDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      this.stats.weeklyMinutes.indexOf(Math.max(...this.stats.weeklyMinutes))
    ];

    const totalPracticeHours = this.stats.totalMinutes / 60;

    // Simple trend calculation based on recent accuracy
    const improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';

    const nextMilestone = this.getProgressToNextAchievements(1)[0];

    return {
      averageSessionLength,
      mostActiveDay,
      totalPracticeHours,
      improvementTrend,
      nextMilestone,
    };
  }
}

// Notification system for achievement unlocks
export class AchievementNotificationManager {
  private queue: Achievement[] = [];
  private isShowing = false;

  showNotification(achievement: Achievement): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(achievement);
      if (!this.isShowing) {
        this.processQueue();
      }
      resolve();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const achievement = this.queue.shift()!;
    
    // Create and show notification
    await this.createNotificationElement(achievement);
    
    // Process next in queue
    setTimeout(() => this.processQueue(), 100);
  }

  private createNotificationElement(achievement: Achievement): Promise<void> {
    return new Promise((resolve) => {
      const notification = document.createElement('div');
      notification.className = `achievement-notification rarity-${achievement.rarity}`;
      notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
          <div class="achievement-title">Achievement Unlocked!</div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-description">${achievement.description}</div>
        </div>
        <div class="achievement-close">×</div>
      `;

      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 400px;
        z-index: 9999;
        animation: slideIn 0.5s ease-out;
        cursor: pointer;
      `;

      const closeBtn = notification.querySelector('.achievement-close') as HTMLElement;
      closeBtn.onclick = () => this.removeNotification(notification);

      // Auto-remove after 5 seconds
      setTimeout(() => this.removeNotification(notification), 5000);

      document.body.appendChild(notification);
      
      // Trigger animation
      setTimeout(() => {
        notification.style.animation = 'slideIn 0.5s ease-out forwards';
        resolve();
      }, 50);
    });
  }

  private removeNotification(notification: HTMLElement): void {
    notification.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}