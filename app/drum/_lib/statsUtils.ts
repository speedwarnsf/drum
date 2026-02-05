import { StoredSession } from "./drumMvp";

export type DailyStats = {
  date: string; // YYYY-MM-DD
  sessionCount: number;
  totalMinutes: number;
};

export type StreakInfo = {
  current: number;
  longest: number;
  isActive: boolean; // practiced today
  lastPracticeDate: string | null;
};

export type PracticeStats = {
  totalSessions: number;
  totalMinutes: number;
  averageMinutes: number;
  sessionsThisWeek: number;
  weeklyTrend: number; // positive = improving, negative = declining
  dailyStats: DailyStats[];
  streak: StreakInfo;
};

const STATS_CACHE_KEY = "drum_stats_cache";
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

type CachedStats = {
  stats: PracticeStats;
  timestamp: number;
};

function getDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getToday(): string {
  return getDateString(new Date());
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDateString(d);
}

function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return getDateString(d);
}

function isConsecutiveDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d1.getTime() - d2.getTime());
  const dayMs = 24 * 60 * 60 * 1000;
  return diff <= dayMs;
}

export function calculateDailyStats(sessions: StoredSession[]): DailyStats[] {
  const dailyMap = new Map<string, DailyStats>();

  for (const session of sessions) {
    const date = getDateString(new Date(session.ts));
    const existing = dailyMap.get(date) || {
      date,
      sessionCount: 0,
      totalMinutes: 0,
    };
    existing.sessionCount += 1;
    existing.totalMinutes += session.plan?.minutes || 15;
    dailyMap.set(date, existing);
  }

  // Sort by date descending
  return Array.from(dailyMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function calculateStreak(dailyStats: DailyStats[]): StreakInfo {
  if (dailyStats.length === 0) {
    return { current: 0, longest: 0, isActive: false, lastPracticeDate: null };
  }

  // Sort by date ascending for streak calculation
  const sortedDays = [...dailyStats].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const today = getToday();
  const yesterday = getYesterday();
  const lastPracticeDate = sortedDays[sortedDays.length - 1].date;

  // Check if streak is active (practiced today or yesterday)
  const isActive = lastPracticeDate === today || lastPracticeDate === yesterday;

  // Calculate current streak (counting back from most recent practice)
  let currentStreak = 0;
  if (isActive) {
    currentStreak = 1;
    for (let i = sortedDays.length - 2; i >= 0; i--) {
      const currentDate = sortedDays[i + 1].date;
      const prevDate = sortedDays[i].date;
      if (isConsecutiveDay(currentDate, prevDate)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    if (isConsecutiveDay(sortedDays[i].date, sortedDays[i - 1].date)) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // If current streak is longest, update
  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    current: currentStreak,
    longest: longestStreak,
    isActive: lastPracticeDate === today,
    lastPracticeDate,
  };
}

export function calculatePracticeStats(sessions: StoredSession[]): PracticeStats {
  const dailyStats = calculateDailyStats(sessions);
  const streak = calculateStreak(dailyStats);

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce(
    (acc, s) => acc + (s.plan?.minutes || 15),
    0
  );
  const averageMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  // Sessions this week
  const weekAgo = getDaysAgo(7);
  const sessionsThisWeek = sessions.filter(
    (s) => getDateString(new Date(s.ts)) >= weekAgo
  ).length;

  // Calculate weekly trend (compare last 7 days vs previous 7 days)
  const twoWeeksAgo = getDaysAgo(14);
  const sessionsLastWeek = sessions.filter((s) => {
    const date = getDateString(new Date(s.ts));
    return date >= twoWeeksAgo && date < weekAgo;
  }).length;

  const weeklyTrend = sessionsThisWeek - sessionsLastWeek;

  return {
    totalSessions,
    totalMinutes,
    averageMinutes,
    sessionsThisWeek,
    weeklyTrend,
    dailyStats,
    streak,
  };
}

export function getCachedStats(): PracticeStats | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(STATS_CACHE_KEY);
    if (!cached) return null;
    const { stats, timestamp } = JSON.parse(cached) as CachedStats;
    if (Date.now() - timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(STATS_CACHE_KEY);
      return null;
    }
    return stats;
  } catch {
    return null;
  }
}

export function setCachedStats(stats: PracticeStats): void {
  if (typeof window === "undefined") return;
  try {
    const cached: CachedStats = { stats, timestamp: Date.now() };
    localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Ignore storage errors
  }
}

export function clearStatsCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STATS_CACHE_KEY);
}

// Generate calendar data for the last N weeks
export function generateCalendarData(
  dailyStats: DailyStats[],
  weeks: number = 12
): { date: string; level: number; minutes: number; count: number }[] {
  const days = weeks * 7;
  const result: { date: string; level: number; minutes: number; count: number }[] = [];

  // Create a map for quick lookup
  const statsMap = new Map(dailyStats.map((d) => [d.date, d]));

  // Find max minutes for scaling
  const maxMinutes = Math.max(...dailyStats.map((d) => d.totalMinutes), 15);

  for (let i = days - 1; i >= 0; i--) {
    const date = getDaysAgo(i);
    const stats = statsMap.get(date);
    const minutes = stats?.totalMinutes || 0;
    const count = stats?.sessionCount || 0;

    // Calculate level (0-4) based on minutes practiced
    let level = 0;
    if (minutes > 0) {
      const ratio = minutes / maxMinutes;
      if (ratio > 0.75) level = 4;
      else if (ratio > 0.5) level = 3;
      else if (ratio > 0.25) level = 2;
      else level = 1;
    }

    result.push({ date, level, minutes, count });
  }

  return result;
}

// Achievement definitions
export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
};

export function checkAchievements(stats: PracticeStats): Achievement[] {
  const { totalSessions, streak } = stats;

  return [
    {
      id: "first_session",
      title: "First Step",
      description: "Complete your first practice session",
      icon: "🎯",
      unlocked: totalSessions >= 1,
    },
    {
      id: "week_streak",
      title: "Week Warrior",
      description: "Maintain a 7-day practice streak",
      icon: "🔥",
      unlocked: streak.longest >= 7,
    },
    {
      id: "month_streak",
      title: "Steady Hand",
      description: "Maintain a 30-day practice streak",
      icon: "💎",
      unlocked: streak.longest >= 30,
    },
    {
      id: "centurion",
      title: "Centurion",
      description: "Complete 100 practice sessions",
      icon: "🏛️",
      unlocked: totalSessions >= 100,
    },
    {
      id: "ten_sessions",
      title: "Finding Rhythm",
      description: "Complete 10 practice sessions",
      icon: "🥁",
      unlocked: totalSessions >= 10,
    },
    {
      id: "fifty_sessions",
      title: "Dedicated",
      description: "Complete 50 practice sessions",
      icon: "⭐",
      unlocked: totalSessions >= 50,
    },
  ];
}

// Format minutes to readable time
export function formatPracticeTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}
