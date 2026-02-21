/**
 * Cloud Sync - thin layer for persisting localStorage data to Supabase.
 * All functions are fire-and-forget (return promises but callers can ignore).
 * Falls back silently when not authenticated.
 */

import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabaseClient";

let cachedUser: User | null = null;
let authChecked = false;

async function getUser(): Promise<User | null> {
  if (authChecked) return cachedUser;
  const sb = getSupabaseClient();
  if (!sb) { authChecked = true; return null; }
  const { data } = await sb.auth.getUser();
  cachedUser = data.user ?? null;
  authChecked = true;
  return cachedUser;
}

export function resetAuthCache(): void {
  cachedUser = null;
  authChecked = false;
}

// Cast to any to bypass outdated generated types for new tables
function sb(): any { return getSupabaseClient(); }

// ── Practice Log ──

export async function syncPracticeEntry(entry: {
  rudimentId: string; date: string; durationSeconds: number;
  bpm: number; accuracy?: number; notes?: string;
}): Promise<void> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return;
  await client.from("drum_practice_log").insert({
    user_id: user.id,
    rudiment_id: entry.rudimentId,
    date: entry.date,
    duration_seconds: entry.durationSeconds,
    bpm: entry.bpm,
    accuracy: entry.accuracy ?? null,
    notes: entry.notes ?? null,
  });
}

export async function fetchPracticeLog(): Promise<Array<{
  rudimentId: string; date: string; durationSeconds: number;
  bpm: number; accuracy?: number; notes?: string;
}> | null> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return null;
  const { data, error } = await client
    .from("drum_practice_log")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (error || !data) return null;
  return data.map((r: any) => ({
    rudimentId: r.rudiment_id,
    date: r.date,
    durationSeconds: r.duration_seconds,
    bpm: r.bpm,
    accuracy: r.accuracy ?? undefined,
    notes: r.notes ?? undefined,
  }));
}

// ── Tempo Goals ──

export async function syncTempoGoal(rudimentId: string, targetBpm: number): Promise<void> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return;
  await client.from("drum_tempo_goals").upsert({
    user_id: user.id,
    rudiment_id: rudimentId,
    target_bpm: targetBpm,
    achieved_at: null,
  }, { onConflict: "user_id,rudiment_id" });
}

export async function syncGoalAchieved(rudimentId: string): Promise<void> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return;
  await client.from("drum_tempo_goals")
    .update({ achieved_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("rudiment_id", rudimentId);
}

export async function syncRemoveGoal(rudimentId: string): Promise<void> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return;
  await client.from("drum_tempo_goals")
    .delete()
    .eq("user_id", user.id)
    .eq("rudiment_id", rudimentId);
}

export async function fetchTempoGoals(): Promise<Array<{
  rudimentId: string; targetBpm: number; createdAt: string; achievedAt: string | null;
}> | null> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return null;
  const { data, error } = await client
    .from("drum_tempo_goals")
    .select("*")
    .eq("user_id", user.id);
  if (error || !data) return null;
  return data.map((r: any) => ({
    rudimentId: r.rudiment_id,
    targetBpm: r.target_bpm,
    createdAt: r.created_at,
    achievedAt: r.achieved_at,
  }));
}

// ── Tempo Progress ──

export async function syncTempoProgress(rudimentId: string, date: string, bpm: number): Promise<void> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return;
  await client.from("drum_tempo_progress").upsert({
    user_id: user.id,
    rudiment_id: rudimentId,
    date,
    bpm,
  }, { onConflict: "user_id,rudiment_id,date" });
}

export async function fetchTempoProgress(rudimentId: string): Promise<Array<{
  rudimentId: string; date: string; bpm: number;
}> | null> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return null;
  const { data, error } = await client
    .from("drum_tempo_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("rudiment_id", rudimentId)
    .order("date", { ascending: true });
  if (error || !data) return null;
  return data.map((r: any) => ({
    rudimentId: r.rudiment_id,
    date: r.date,
    bpm: r.bpm,
  }));
}

// ── Reflections ──

export async function syncReflection(sessionId: string, entry: {
  stop: string; start: string; continue: string; minutePaper?: string;
}): Promise<void> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return;
  await client.from("drum_reflections").insert({
    user_id: user.id,
    session_id: sessionId,
    stop: entry.stop || null,
    start: entry.start || null,
    continue_text: entry.continue || null,
    minute_paper: entry.minutePaper || null,
  });
}

// ── Routines ──

export async function syncCreateRoutine(name: string, steps: any[]): Promise<string | null> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return null;
  const { data } = await client.from("drum_routines").insert({
    user_id: user.id,
    name,
    steps: steps as any,
  }).select("id").single();
  return data?.id ?? null;
}

export async function syncUpdateRoutine(id: string, updates: { name?: string; steps?: any[] }): Promise<void> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return;
  const updateData: any = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.steps !== undefined) updateData.steps = updates.steps;
  await client.from("drum_routines").update(updateData).eq("id", id).eq("user_id", user.id);
}

export async function syncDeleteRoutine(id: string): Promise<void> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return;
  await client.from("drum_routines").delete().eq("id", id).eq("user_id", user.id);
}

export async function fetchRoutines(): Promise<Array<{
  id: string; name: string; createdAt: string; updatedAt: string; steps: any[];
}> | null> {
  const user = await getUser();
  const client = sb();
  if (!user || !client) return null;
  const { data, error } = await client
    .from("drum_routines")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error || !data) return null;
  return data.map((r: any) => ({
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    steps: r.steps,
  }));
}

// ══════════════════════════════════════════════════════════
// Migration: localStorage → Supabase (once per user)
// ══════════════════════════════════════════════════════════

const LS_MIGRATED = "drum_cloud_migrated";

export async function migrateLocalStorageToCloud(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(LS_MIGRATED)) return false;

  const user = await getUser();
  const client = sb();
  if (!user || !client) return false;

  try {
    // 1. Practice log
    const logRaw = localStorage.getItem("drum_practice_log");
    if (logRaw) {
      const log = JSON.parse(logRaw) as any[];
      if (log.length > 0) {
        const rows = log.map((e: any) => ({
          user_id: user.id,
          rudiment_id: e.rudimentId,
          date: e.date,
          duration_seconds: e.durationSeconds,
          bpm: e.bpm,
          accuracy: e.accuracy ?? null,
          notes: e.notes ?? null,
        }));
        for (let i = 0; i < rows.length; i += 500) {
          await client.from("drum_practice_log").insert(rows.slice(i, i + 500));
        }
      }
    }

    // 2. Tempo goals
    const goalsRaw = localStorage.getItem("drum_tempo_goals");
    if (goalsRaw) {
      const goals = JSON.parse(goalsRaw) as any[];
      if (goals.length > 0) {
        await client.from("drum_tempo_goals").upsert(
          goals.map((g: any) => ({
            user_id: user.id,
            rudiment_id: g.rudimentId,
            target_bpm: g.targetBpm,
            achieved_at: g.achievedAt || null,
          })),
          { onConflict: "user_id,rudiment_id" }
        );
      }
    }

    // 3. Tempo progress
    const progressRaw = localStorage.getItem("drum_tempo_progress");
    if (progressRaw) {
      const progress = JSON.parse(progressRaw) as any[];
      if (progress.length > 0) {
        for (let i = 0; i < progress.length; i += 500) {
          await client.from("drum_tempo_progress").upsert(
            progress.slice(i, i + 500).map((p: any) => ({
              user_id: user.id,
              rudiment_id: p.rudimentId,
              date: p.date,
              bpm: p.bpm,
            })),
            { onConflict: "user_id,rudiment_id,date" }
          );
        }
      }
    }

    // 4. Reflections
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("reflection_")) continue;
      try {
        const entry = JSON.parse(localStorage.getItem(key)!);
        await client.from("drum_reflections").insert({
          user_id: user.id,
          session_id: key.replace("reflection_", ""),
          stop: entry.stop || null,
          start: entry.start || null,
          continue_text: entry.continue || null,
          minute_paper: entry.minutePaper || null,
        });
      } catch { /* skip */ }
    }

    // 5. Routines
    const routinesRaw = localStorage.getItem("drum_practice_routines");
    if (routinesRaw) {
      const routines = JSON.parse(routinesRaw) as any[];
      if (routines.length > 0) {
        await client.from("drum_routines").insert(
          routines.map((r: any) => ({
            user_id: user.id,
            name: r.name,
            steps: r.steps,
          }))
        );
      }
    }

    localStorage.setItem(LS_MIGRATED, new Date().toISOString());
    // Migration complete
    return true;
  } catch (err) {
    console.error("[cloud-sync] Migration error:", err);
    return false;
  }
}
