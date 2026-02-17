/**
 * Practice Time Tracker
 * Tracks time spent on each rudiment and stores practice history.
 * Data persisted to localStorage + cloud sync when authenticated.
 */

import { syncPracticeEntry, syncCreateRoutine, syncUpdateRoutine, syncDeleteRoutine } from "./cloudSync";

export type RudimentPracticeEntry = {
  rudimentId: string;
  date: string; // YYYY-MM-DD
  durationSeconds: number;
  bpm: number;
  accuracy?: number;
  notes?: string;
};

export type RudimentPracticeStats = {
  rudimentId: string;
  totalSeconds: number;
  sessionCount: number;
  lastPracticed: string | null;
  avgBpm: number;
  maxBpm: number;
  recentSessions: RudimentPracticeEntry[];
};

export type PracticeRoutine = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  steps: RoutineStep[];
};

export type RoutineStep = {
  id: string;
  rudimentId: string;
  rudimentName: string;
  targetBpm: number;
  durationMinutes: number;
  notes: string;
};

const STORAGE_KEY = "drum_practice_log";
const ROUTINES_KEY = "drum_practice_routines";
const ACTIVE_SESSION_KEY = "drum_active_session";

// --- Practice Log ---

function loadLog(): RudimentPracticeEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLog(log: RudimentPracticeEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

export function recordPractice(entry: RudimentPracticeEntry): void {
  const log = loadLog();
  log.push(entry);
  saveLog(log);
  // Background cloud sync
  syncPracticeEntry(entry).catch(() => {});
}

export function getPracticeLog(): RudimentPracticeEntry[] {
  return loadLog();
}

export function getRudimentStats(rudimentId: string): RudimentPracticeStats {
  const log = loadLog().filter((e) => e.rudimentId === rudimentId);
  if (log.length === 0) {
    return {
      rudimentId,
      totalSeconds: 0,
      sessionCount: 0,
      lastPracticed: null,
      avgBpm: 0,
      maxBpm: 0,
      recentSessions: [],
    };
  }
  const totalSeconds = log.reduce((s, e) => s + e.durationSeconds, 0);
  const avgBpm = Math.round(log.reduce((s, e) => s + e.bpm, 0) / log.length);
  const maxBpm = Math.max(...log.map((e) => e.bpm));
  const sorted = [...log].sort((a, b) => b.date.localeCompare(a.date));
  return {
    rudimentId,
    totalSeconds,
    sessionCount: log.length,
    lastPracticed: sorted[0]?.date ?? null,
    avgBpm,
    maxBpm,
    recentSessions: sorted.slice(0, 10),
  };
}

export function getAllRudimentStats(): Record<string, RudimentPracticeStats> {
  const log = loadLog();
  const byId: Record<string, RudimentPracticeEntry[]> = {};
  for (const entry of log) {
    (byId[entry.rudimentId] ??= []).push(entry);
  }
  const result: Record<string, RudimentPracticeStats> = {};
  for (const [id, entries] of Object.entries(byId)) {
    const totalSeconds = entries.reduce((s, e) => s + e.durationSeconds, 0);
    const avgBpm = Math.round(entries.reduce((s, e) => s + e.bpm, 0) / entries.length);
    const maxBpm = Math.max(...entries.map((e) => e.bpm));
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    result[id] = {
      rudimentId: id,
      totalSeconds,
      sessionCount: entries.length,
      lastPracticed: sorted[0]?.date ?? null,
      avgBpm,
      maxBpm,
      recentSessions: sorted.slice(0, 10),
    };
  }
  return result;
}

/** Get rudiments sorted by which need the most work (least practiced + longest since last practice) */
export function getRudimentsNeedingWork(allRudimentIds: string[], topN: number = 5): string[] {
  const stats = getAllRudimentStats();
  const today = new Date().toISOString().slice(0, 10);

  const scored = allRudimentIds.map((id) => {
    const s = stats[id];
    if (!s || s.sessionCount === 0) {
      return { id, score: 1000 }; // Never practiced = highest priority
    }
    // Days since last practice
    const daysSince = s.lastPracticed
      ? Math.max(0, (new Date(today).getTime() - new Date(s.lastPracticed).getTime()) / 86400000)
      : 100;
    // Less total time = more need
    const timeScore = Math.max(0, 30 - s.totalSeconds / 60); // 30 min max useful
    // Combine: higher = more need
    return { id, score: daysSince * 2 + timeScore };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map((s) => s.id);
}

/** Get total practice minutes for a given date range */
export function getPracticeMinutesByDate(days: number = 30): { date: string; minutes: number }[] {
  const log = loadLog();
  const today = new Date();
  const result: { date: string; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayTotal = log
      .filter((e) => e.date === dateStr)
      .reduce((s, e) => s + e.durationSeconds, 0);
    result.push({ date: dateStr, minutes: Math.round(dayTotal / 60) });
  }
  return result;
}

// --- Active Session (for tracking current practice on rudiment detail page) ---

export type ActiveSession = {
  rudimentId: string;
  startedAt: number; // timestamp ms
  bpm: number;
};

export function startActiveSession(rudimentId: string, bpm: number): void {
  if (typeof window === "undefined") return;
  const session: ActiveSession = { rudimentId, startedAt: Date.now(), bpm };
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
}

export function getActiveSession(): ActiveSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function endActiveSession(): RudimentPracticeEntry | null {
  const session = getActiveSession();
  if (!session) return null;
  const durationSeconds = Math.round((Date.now() - session.startedAt) / 1000);
  if (durationSeconds < 5) {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    return null; // Too short to count
  }
  const entry: RudimentPracticeEntry = {
    rudimentId: session.rudimentId,
    date: new Date().toISOString().slice(0, 10),
    durationSeconds,
    bpm: session.bpm,
  };
  recordPractice(entry);
  localStorage.removeItem(ACTIVE_SESSION_KEY);
  return entry;
}

// --- Practice Routines ---

export function loadRoutines(): PracticeRoutine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ROUTINES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRoutines(routines: PracticeRoutine[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
}

export function createRoutine(name: string, steps: RoutineStep[]): PracticeRoutine {
  const routine: PracticeRoutine = {
    id: `routine-${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps,
  };
  const routines = loadRoutines();
  routines.push(routine);
  saveRoutines(routines);
  syncCreateRoutine(name, steps).catch(() => {});
  return routine;
}

export function updateRoutine(id: string, updates: Partial<Pick<PracticeRoutine, "name" | "steps">>): void {
  const routines = loadRoutines();
  const idx = routines.findIndex((r) => r.id === id);
  if (idx === -1) return;
  if (updates.name !== undefined) routines[idx].name = updates.name;
  if (updates.steps !== undefined) routines[idx].steps = updates.steps;
  routines[idx].updatedAt = new Date().toISOString();
  saveRoutines(routines);
  syncUpdateRoutine(id, updates).catch(() => {});
}

export function deleteRoutine(id: string): void {
  const routines = loadRoutines().filter((r) => r.id !== id);
  saveRoutines(routines);
  syncDeleteRoutine(id).catch(() => {});
}
