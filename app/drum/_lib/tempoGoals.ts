/**
 * Tempo Goals — per-rudiment target BPM tracking with history
 */

export type TempoGoal = {
  rudimentId: string;
  targetBpm: number;
  createdAt: string;
  achievedAt: string | null;
};

export type TempoProgress = {
  rudimentId: string;
  date: string;
  bpm: number;
};

const GOALS_KEY = "drum_tempo_goals";
const PROGRESS_KEY = "drum_tempo_progress";

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Goals ---

export function getTempoGoals(): TempoGoal[] {
  return load<TempoGoal>(GOALS_KEY);
}

export function getTempoGoal(rudimentId: string): TempoGoal | null {
  return getTempoGoals().find(g => g.rudimentId === rudimentId) ?? null;
}

export function setTempoGoal(rudimentId: string, targetBpm: number): TempoGoal {
  const goals = getTempoGoals().filter(g => g.rudimentId !== rudimentId);
  const goal: TempoGoal = {
    rudimentId,
    targetBpm,
    createdAt: new Date().toISOString(),
    achievedAt: null,
  };
  goals.push(goal);
  save(GOALS_KEY, goals);
  return goal;
}

export function markGoalAchieved(rudimentId: string): void {
  const goals = getTempoGoals();
  const idx = goals.findIndex(g => g.rudimentId === rudimentId);
  if (idx !== -1) {
    goals[idx].achievedAt = new Date().toISOString();
    save(GOALS_KEY, goals);
  }
}

export function removeTempoGoal(rudimentId: string): void {
  save(GOALS_KEY, getTempoGoals().filter(g => g.rudimentId !== rudimentId));
}

// --- Progress History ---

export function getTempoProgress(rudimentId: string): TempoProgress[] {
  return load<TempoProgress>(PROGRESS_KEY)
    .filter(p => p.rudimentId === rudimentId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function recordTempoProgress(rudimentId: string, bpm: number): void {
  const all = load<TempoProgress>(PROGRESS_KEY);
  const today = new Date().toISOString().slice(0, 10);
  // Update today's entry if exists, else add new
  const existing = all.findIndex(p => p.rudimentId === rudimentId && p.date === today);
  if (existing !== -1) {
    // Keep the higher BPM for the day
    if (bpm > all[existing].bpm) {
      all[existing].bpm = bpm;
    }
  } else {
    all.push({ rudimentId, date: today, bpm });
  }
  save(PROGRESS_KEY, all);

  // Check if goal achieved
  const goal = getTempoGoal(rudimentId);
  if (goal && !goal.achievedAt && bpm >= goal.targetBpm) {
    markGoalAchieved(rudimentId);
  }
}

export function getTempoProgressSummary(rudimentId: string): {
  history: TempoProgress[];
  currentBpm: number;
  peakBpm: number;
  goal: TempoGoal | null;
  progressPercent: number;
} {
  const history = getTempoProgress(rudimentId);
  const goal = getTempoGoal(rudimentId);
  const peakBpm = history.length > 0 ? Math.max(...history.map(p => p.bpm)) : 0;
  const currentBpm = history.length > 0 ? history[history.length - 1].bpm : 0;
  const progressPercent = goal && goal.targetBpm > 0
    ? Math.min(100, Math.round((peakBpm / goal.targetBpm) * 100))
    : 0;

  return { history, currentBpm, peakBpm, goal, progressPercent };
}
