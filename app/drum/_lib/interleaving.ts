/**
 * Interleaving / Random Drill Generator
 * 
 * WHY INTERLEAVING WORKS (Desirable Difficulties):
 * 
 * "Blocked" practice feels productive but deceives.
 * You play the same pattern 20 times, get smoother by rep 15—
 * but that smoothness is SHORT-TERM FLUENCY, not durable learning.
 * 
 * "Interleaved" practice feels harder. Switching patterns mid-session
 * forces your brain to RECONSTRUCT the motor program each time.
 * This reconstruction is where real learning happens.
 * 
 * The stumbles during interleaved practice ARE the learning.
 * Embrace the difficulty. It's building something that lasts.
 * 
 * References:
 * - Rohrer & Taylor (2007): Interleaving vs. Blocked Practice
 * - Bjork & Bjork: "Desirable Difficulties" framework
 * - Schmidt & Lee: Motor Learning and Performance
 */

export type Pattern = {
  id: string;
  name: string;
  syllables: string;
  notation: string;
  category: "basic" | "groove" | "fill" | "rudiment";
  difficulty: 1 | 2 | 3; // 1 = easy, 3 = hard
};

export type PatternWithWeight = Pattern & {
  weight: number; // Higher = more likely to appear (for weakness targeting)
};

export type InterleavedSequence = {
  patterns: PatternWithWeight[];
  currentIndex: number;
  tempoVariations: number[]; // BPM offset for each pattern (-5 to +5)
  mode: "random" | "weighted";
};

export type SessionLog = {
  patternId: string;
  timestamp: string;
  rating: "smooth" | "okay" | "struggled";
  tempo: number;
};

// Core pattern library
export const PATTERN_LIBRARY: Pattern[] = [
  // Basic patterns (difficulty 1)
  {
    id: "quarters",
    name: "Quarter Notes",
    syllables: "Du   Du   Du   Du",
    notation: "1    2    3    4",
    category: "basic",
    difficulty: 1,
  },
  {
    id: "eighths",
    name: "Eighth Notes",
    syllables: "Du-De Du-De Du-De Du-De",
    notation: "1 & 2 & 3 & 4 &",
    category: "basic",
    difficulty: 1,
  },
  
  // Rudiments (difficulty 2-3)
  {
    id: "singles",
    name: "Single Stroke Roll",
    syllables: "R-L-R-L R-L-R-L",
    notation: "R L R L R L R L",
    category: "rudiment",
    difficulty: 1,
  },
  {
    id: "doubles",
    name: "Double Stroke Roll",
    syllables: "R-R-L-L R-R-L-L",
    notation: "R R L L R R L L",
    category: "rudiment",
    difficulty: 2,
  },
  {
    id: "paradiddle",
    name: "Paradiddle",
    syllables: "R-L-R-R L-R-L-L",
    notation: "R L R R  L R L L",
    category: "rudiment",
    difficulty: 2,
  },
  {
    id: "paradiddle-diddle",
    name: "Paradiddle-Diddle",
    syllables: "R-L-R-R-L-L",
    notation: "R L R R L L",
    category: "rudiment",
    difficulty: 3,
  },
  {
    id: "flam",
    name: "Flam",
    syllables: "lR  rL  lR  rL",
    notation: "grace+R  grace+L",
    category: "rudiment",
    difficulty: 2,
  },
  {
    id: "drag",
    name: "Drag",
    syllables: "llR  rrL  llR  rrL",
    notation: "ll-R  rr-L",
    category: "rudiment",
    difficulty: 3,
  },
  
  // Groove patterns (difficulty 2)
  {
    id: "basic-rock",
    name: "Basic Rock",
    syllables: "Boom Chack Boom-Boom Chack",
    notation: "K    S    K-K       S",
    category: "groove",
    difficulty: 2,
  },
  {
    id: "rock-steady",
    name: "Rock Steady",
    syllables: "Tss-Boom Tss-Chack Tss-Boom Tss-Chack",
    notation: "H-K  H-S  H-K  H-S",
    category: "groove",
    difficulty: 2,
  },
  
  // Fills (difficulty 3)
  {
    id: "fill-basic",
    name: "Basic Fill",
    syllables: "Snare Snare Tom Tom",
    notation: "S  S  T  T",
    category: "fill",
    difficulty: 2,
  },
  {
    id: "fill-sixteenth",
    name: "Sixteenth Fill",
    syllables: "Du-Ta-De-Ta all the way down",
    notation: "S-S-S-S T-T-T-T F-F-F-F",
    category: "fill",
    difficulty: 3,
  },
];

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Weighted random selection
 * Higher weight = more likely to be chosen
 */
function weightedRandomSelect<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  
  return items[items.length - 1];
}

/**
 * Calculate weakness weights from session logs
 * Patterns you struggled with get higher weights
 */
export function calculateWeaknessWeights(
  patterns: Pattern[],
  sessionLogs: SessionLog[],
  lookbackDays: number = 7
): PatternWithWeight[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - lookbackDays);
  
  const recentLogs = sessionLogs.filter(
    (log) => new Date(log.timestamp) >= cutoff
  );
  
  // Count struggles per pattern
  const struggleCount = new Map<string, { struggled: number; total: number }>();
  
  for (const log of recentLogs) {
    const existing = struggleCount.get(log.patternId) || { struggled: 0, total: 0 };
    existing.total += 1;
    if (log.rating === "struggled") existing.struggled += 1;
    struggleCount.set(log.patternId, existing);
  }
  
  return patterns.map((pattern) => {
    const stats = struggleCount.get(pattern.id);
    let weight = 1; // Base weight
    
    if (stats && stats.total > 0) {
      // Higher struggle ratio = higher weight
      const struggleRatio = stats.struggled / stats.total;
      weight = 1 + struggleRatio * 2; // Range: 1-3
    } else {
      // Never practiced = moderate weight (encourage exploration)
      weight = 1.5;
    }
    
    return { ...pattern, weight };
  });
}

/**
 * Generate tempo variations for contextual interference
 * Slight tempo changes between reps force re-adaptation
 */
function generateTempoVariations(count: number, maxVariation: number = 5): number[] {
  return Array.from({ length: count }, () => 
    Math.floor(Math.random() * (maxVariation * 2 + 1)) - maxVariation
  );
}

/**
 * Generate an interleaved sequence of patterns
 */
export function generateInterleavedSequence(
  patterns: Pattern[],
  sessionLogs: SessionLog[] = [],
  options: {
    sequenceLength?: number;
    mode?: "random" | "weighted";
    tempoVariation?: boolean;
    maxTempoVariation?: number;
  } = {}
): InterleavedSequence {
  const {
    sequenceLength = 12,
    mode = "random",
    tempoVariation = true,
    maxTempoVariation = 5,
  } = options;
  
  if (patterns.length === 0) {
    throw new Error("No patterns provided");
  }
  
  let patternsWithWeight: PatternWithWeight[];
  let sequencePatterns: PatternWithWeight[];
  
  if (mode === "weighted") {
    patternsWithWeight = calculateWeaknessWeights(patterns, sessionLogs);
    sequencePatterns = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      sequencePatterns.push(weightedRandomSelect(patternsWithWeight));
    }
  } else {
    // Pure random: shuffle and repeat as needed
    patternsWithWeight = patterns.map((p) => ({ ...p, weight: 1 }));
    const shuffled = shuffleArray(patternsWithWeight);
    sequencePatterns = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      sequencePatterns.push(shuffled[i % shuffled.length]);
    }
    
    // Shuffle again to avoid predictable repeats
    sequencePatterns = shuffleArray(sequencePatterns);
  }
  
  const tempoVariations = tempoVariation
    ? generateTempoVariations(sequenceLength, maxTempoVariation)
    : Array(sequenceLength).fill(0);
  
  return {
    patterns: sequencePatterns,
    currentIndex: 0,
    tempoVariations,
    mode,
  };
}

/**
 * Advance to the next pattern in the sequence
 */
export function advanceSequence(sequence: InterleavedSequence): InterleavedSequence {
  return {
    ...sequence,
    currentIndex: Math.min(sequence.currentIndex + 1, sequence.patterns.length - 1),
  };
}

/**
 * Get the current pattern and next pattern (for preview)
 */
export function getCurrentAndNext(sequence: InterleavedSequence): {
  current: PatternWithWeight;
  next: PatternWithWeight | null;
  tempoOffset: number;
  progress: { current: number; total: number };
} {
  const current = sequence.patterns[sequence.currentIndex];
  const next = sequence.currentIndex < sequence.patterns.length - 1
    ? sequence.patterns[sequence.currentIndex + 1]
    : null;
  const tempoOffset = sequence.tempoVariations[sequence.currentIndex];
  
  return {
    current,
    next,
    tempoOffset,
    progress: {
      current: sequence.currentIndex + 1,
      total: sequence.patterns.length,
    },
  };
}

/**
 * Check if sequence is complete
 */
export function isSequenceComplete(sequence: InterleavedSequence): boolean {
  return sequence.currentIndex >= sequence.patterns.length - 1;
}

/**
 * Filter patterns by category
 */
export function filterPatterns(
  patterns: Pattern[],
  categories: Pattern["category"][]
): Pattern[] {
  if (categories.length === 0) return patterns;
  return patterns.filter((p) => categories.includes(p.category));
}

/**
 * Filter patterns by difficulty
 */
export function filterByDifficulty(
  patterns: Pattern[],
  maxDifficulty: 1 | 2 | 3
): Pattern[] {
  return patterns.filter((p) => p.difficulty <= maxDifficulty);
}

// Storage keys
const INTERLEAVE_LOGS_KEY = "drum_interleave_logs";

/**
 * Save a session log entry
 */
export function saveSessionLog(log: SessionLog): void {
  if (typeof window === "undefined") return;
  
  const existing = loadSessionLogs();
  existing.push(log);
  
  // Keep only last 100 logs
  const trimmed = existing.slice(-100);
  localStorage.setItem(INTERLEAVE_LOGS_KEY, JSON.stringify(trimmed));
}

/**
 * Load session logs
 */
export function loadSessionLogs(): SessionLog[] {
  if (typeof window === "undefined") return [];
  
  try {
    const raw = localStorage.getItem(INTERLEAVE_LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SessionLog[];
  } catch {
    return [];
  }
}

/**
 * Get weakness report for display
 */
export function getWeaknessReport(
  patterns: Pattern[],
  sessionLogs: SessionLog[]
): { pattern: Pattern; struggleRatio: number; sessions: number }[] {
  const weighted = calculateWeaknessWeights(patterns, sessionLogs);
  
  return weighted
    .map((p) => {
      const logs = sessionLogs.filter((l) => l.patternId === p.id);
      const struggled = logs.filter((l) => l.rating === "struggled").length;
      return {
        pattern: p,
        struggleRatio: logs.length > 0 ? struggled / logs.length : 0,
        sessions: logs.length,
      };
    })
    .filter((r) => r.sessions > 0)
    .sort((a, b) => b.struggleRatio - a.struggleRatio);
}
