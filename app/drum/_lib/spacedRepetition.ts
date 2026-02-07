/**
 * Spaced Repetition System for Drum Patterns
 * 
 * SM-2 Algorithm Implementation
 * The body remembers what the mind forgets.
 * Return to each pattern at just the right moment—
 * not too soon, not too late.
 */

import { getSupabaseClient } from "./supabaseClient";

// Pattern definitions - the vocabulary of rhythm
export const DRUM_PATTERNS = [
  // Module 1: Clean Sound
  { id: "unison-strikes", name: "Unison Strikes", module: 1, description: "All limbs land as one voice" },
  { id: "single-strokes", name: "Single Strokes", module: 1, description: "Alternating hands, even tone" },
  { id: "rebound-control", name: "Rebound Control", module: 1, description: "Let the stick do the work" },
  
  // Module 2: Internal Clock
  { id: "quarter-pulse", name: "Quarter Note Pulse", module: 2, description: "The heartbeat of time" },
  { id: "gap-drill-easy", name: "Gap Drill (Easy)", module: 2, description: "8 on, 4 off—hold the silence" },
  { id: "gap-drill-hard", name: "Gap Drill (Hard)", module: 2, description: "4 on, 8 off—project through the void" },
  { id: "offbeat-click", name: "Off-Beat Click", module: 2, description: "Feel the spaces between" },
  
  // Module 3: Vocabulary
  { id: "singles", name: "Single Stroke Roll", module: 3, description: "RLRL—the foundation" },
  { id: "doubles", name: "Double Stroke Roll", module: 3, description: "RRLL—bounce, don't muscle" },
  { id: "paradiddle", name: "Paradiddle", module: 3, description: "RLRR LRLL—accent the first" },
  { id: "basic-rock", name: "Basic Rock Beat", module: 3, description: "Kick-hat-snare-hat" },
  { id: "three-way-flow", name: "3-Way Flow", module: 3, description: "Singles → Doubles → Paradiddles" },
  
  // Module 4: The Audit
  { id: "flam-detection", name: "Flam Detection", module: 4, description: "One sound or two?" },
  { id: "spacing-audit", name: "Spacing Audit", module: 4, description: "Every gap identical" },
  { id: "volume-audit", name: "Volume Audit", module: 4, description: "Consistent dynamics throughout" },
] as const;

export type PatternId = typeof DRUM_PATTERNS[number]["id"];

export type PatternMemory = {
  id: string;
  user_id: string;
  pattern_id: string;
  ease_factor: number;
  interval_days: number;
  next_review_date: string;
  repetitions: number;
  last_quality: number | null;
  last_practiced_at: string | null;
  created_at: string;
};

export type PatternWithMemory = {
  pattern: typeof DRUM_PATTERNS[number];
  memory: PatternMemory | null;
  isDue: boolean;
  daysUntilDue: number;
};

/**
 * SM-2 Algorithm Implementation
 * 
 * Quality ratings:
 * 5 - Perfect response, no hesitation
 * 4 - Correct response after brief hesitation  
 * 3 - Correct response with some difficulty
 * 2 - Incorrect response, but remembered upon seeing answer
 * 1 - Incorrect response, barely remembered
 * 0 - Complete blackout
 */
export function calculateSM2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  intervalDays: number
): { newRepetitions: number; newEaseFactor: number; newInterval: number } {
  // Clamp quality to valid range
  quality = Math.max(0, Math.min(5, Math.round(quality)));
  
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;
  let newInterval = intervalDays;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(intervalDays * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response - reset to beginning
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update ease factor (minimum 1.3)
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);

  return {
    newRepetitions,
    newEaseFactor,
    newInterval,
  };
}

/**
 * Get patterns due for review today
 */
export async function getPatternsDueForReview(userId: string): Promise<PatternWithMemory[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const today = new Date().toISOString().slice(0, 10);

  // Fetch all pattern memories for this user
  const { data: memories, error } = await supabase
    .from("drum_pattern_memory")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[SR] Error fetching pattern memories:", error.message);
    return [];
  }

  const memoryMap = new Map<string, PatternMemory>();
  for (const m of memories ?? []) {
    memoryMap.set(m.pattern_id, m as PatternMemory);
  }

  // Build list with due status
  return DRUM_PATTERNS.map((pattern) => {
    const memory = memoryMap.get(pattern.id) ?? null;
    const nextReview = memory?.next_review_date ?? today;
    const isDue = nextReview <= today;
    const daysUntilDue = memory 
      ? Math.ceil((new Date(nextReview).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      pattern,
      memory,
      isDue: memory ? isDue : true, // New patterns are always due
      daysUntilDue: Math.max(0, daysUntilDue),
    };
  });
}

/**
 * Record a practice session for a pattern
 */
export async function recordPatternPractice(
  userId: string,
  patternId: string,
  quality: number
): Promise<PatternMemory | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const now = new Date().toISOString();

  // Fetch existing memory
  const { data: existing } = await supabase
    .from("drum_pattern_memory")
    .select("*")
    .eq("user_id", userId)
    .eq("pattern_id", patternId)
    .maybeSingle();

  const currentMemory = existing as PatternMemory | null;

  // Calculate new SM-2 values
  const { newRepetitions, newEaseFactor, newInterval } = calculateSM2(
    quality,
    currentMemory?.repetitions ?? 0,
    currentMemory?.ease_factor ?? 2.5,
    currentMemory?.interval_days ?? 1
  );

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  const nextReview = nextReviewDate.toISOString().slice(0, 10);

  const updateData = {
    user_id: userId,
    pattern_id: patternId,
    ease_factor: newEaseFactor,
    interval_days: newInterval,
    next_review_date: nextReview,
    repetitions: newRepetitions,
    last_quality: quality,
    last_practiced_at: now,
  };

  if (currentMemory) {
    // Update existing
    const { data, error } = await supabase
      .from("drum_pattern_memory")
      .update(updateData)
      .eq("id", currentMemory.id)
      .select()
      .single();

    if (error) {
      console.error("[SR] Error updating pattern memory:", error.message);
      return null;
    }
    return data as PatternMemory;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("drum_pattern_memory")
      .insert(updateData)
      .select()
      .single();

    if (error) {
      console.error("[SR] Error inserting pattern memory:", error.message);
      return null;
    }
    return data as PatternMemory;
  }
}

/**
 * Get statistics for a user's pattern practice
 */
export async function getPatternStats(userId: string): Promise<{
  totalPatterns: number;
  learnedPatterns: number;
  dueToday: number;
  averageEase: number;
  longestInterval: number;
  streakPatterns: number; // Patterns with 3+ consecutive correct
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      totalPatterns: DRUM_PATTERNS.length,
      learnedPatterns: 0,
      dueToday: DRUM_PATTERNS.length,
      averageEase: 2.5,
      longestInterval: 0,
      streakPatterns: 0,
    };
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: memories, error } = await supabase
    .from("drum_pattern_memory")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[SR] Error fetching stats:", error.message);
    return {
      totalPatterns: DRUM_PATTERNS.length,
      learnedPatterns: 0,
      dueToday: DRUM_PATTERNS.length,
      averageEase: 2.5,
      longestInterval: 0,
      streakPatterns: 0,
    };
  }

  const mems = (memories ?? []) as PatternMemory[];
  const learnedPatterns = mems.length;
  const dueToday = mems.filter((m) => m.next_review_date <= today).length + (DRUM_PATTERNS.length - learnedPatterns);
  const averageEase = mems.length > 0 
    ? mems.reduce((sum, m) => sum + m.ease_factor, 0) / mems.length 
    : 2.5;
  const longestInterval = mems.length > 0 
    ? Math.max(...mems.map((m) => m.interval_days)) 
    : 0;
  const streakPatterns = mems.filter((m) => m.repetitions >= 3).length;

  return {
    totalPatterns: DRUM_PATTERNS.length,
    learnedPatterns,
    dueToday,
    averageEase: Math.round(averageEase * 100) / 100,
    longestInterval,
    streakPatterns,
  };
}

/**
 * Quality rating descriptions for UI
 * Icons are now icon names for the Icon component (grade0-grade5)
 */
export const QUALITY_RATINGS = [
  { value: 0, label: "Blackout", description: "Complete blank—no memory at all", icon: "grade0" },
  { value: 1, label: "Barely", description: "Struggled hard, barely got it", icon: "grade1" },
  { value: 2, label: "Wrong", description: "Made mistakes, but recognized the answer", icon: "grade2" },
  { value: 3, label: "Difficult", description: "Got it right, but required effort", icon: "grade3" },
  { value: 4, label: "Good", description: "Brief hesitation, then correct", icon: "grade4" },
  { value: 5, label: "Perfect", description: "Instant, effortless recall", icon: "grade5" },
] as const;

/**
 * Simplified 3-tier rating for casual use
 * Icons are now icon names for the Icon component
 */
export const SIMPLE_RATINGS = [
  { quality: 2, label: "Struggled", description: "Needs more work", icon: "refresh", color: "var(--ink-muted)" },
  { quality: 4, label: "Good", description: "Solid execution", icon: "thumbsUp", color: "var(--ink)" },
  { quality: 5, label: "Locked In", description: "Automatic, effortless", icon: "flame", color: "var(--ink)" },
] as const;
