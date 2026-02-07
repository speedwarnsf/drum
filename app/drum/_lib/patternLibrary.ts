/**
 * Drum Pattern Library
 * 
 * A comprehensive collection of drum patterns for practice and reference.
 * Each pattern includes syllables for vocalization (Gordon Method), 
 * notation for visual reference, and metadata for categorization.
 * 
 * Pattern Notation Key:
 * K = Kick/Bass drum
 * S = Snare drum  
 * H = Hi-hat (closed)
 * O = Hi-hat (open)
 * R = Ride cymbal
 * C = Crash cymbal
 * T = Tom (high/mid/low specified in context)
 * F = Floor tom
 * - = Rest/silence
 * () = Ghost note (soft/subtle)
 * 
 * Sticking Notation:
 * R = Right hand
 * L = Left hand
 * r = Right hand ghost note
 * l = Left hand ghost note
 * 
 * Time Feel:
 * (straight) = Even subdivisions
 * (swing) = Triplet-based feel
 * (shuffle) = Swung eighth notes
 */

export type DrumPattern = {
  id: string;
  name: string;
  category: "basic" | "rock" | "funk" | "jazz" | "latin" | "shuffle" | "modern" | "rudiment" | "fill";
  difficulty: 1 | 2 | 3 | 4 | 5; // 1 = foundational, 5 = expert
  syllables: string;
  notation: string;
  sticking?: string; // For rudiments and hand patterns
  bars: number;
  timeSignature: string;
  bpm: {
    min: number;
    target: number;
    max: number;
  };
  feel: "straight" | "swing" | "shuffle";
  description: string;
  tips: string[];
  prerequisites?: string[]; // Pattern IDs that should be learned first
  variations?: string[]; // Related pattern IDs
};

export const DRUM_PATTERNS: DrumPattern[] = [
  // ========================================
  // BASIC PATTERNS - Foundation rhythms
  // ========================================
  {
    id: "quarters",
    name: "Quarter Notes",
    category: "basic",
    difficulty: 1,
    syllables: "Du   Du   Du   Du",
    notation: "1    2    3    4",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 60, target: 80, max: 120 },
    feel: "straight",
    description: "The foundation of all rhythm - one note per beat.",
    tips: [
      "Keep shoulders relaxed",
      "Match volume on each note",
      "Feel the space between beats"
    ]
  },
  {
    id: "eighths",
    name: "Eighth Notes", 
    category: "basic",
    difficulty: 1,
    syllables: "Du-De Du-De Du-De Du-De",
    notation: "1 & 2 & 3 & 4 &",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 50, target: 70, max: 100 },
    feel: "straight",
    description: "Two notes per beat - the backbone of most grooves.",
    tips: [
      "Even spacing between all notes",
      "Don't rush the & beats",
      "Practice with metronome on quarters first"
    ],
    prerequisites: ["quarters"]
  },
  {
    id: "sixteenths",
    name: "Sixteenth Notes",
    category: "basic", 
    difficulty: 2,
    syllables: "Du-Ta-De-Ta Du-Ta-De-Ta Du-Ta-De-Ta Du-Ta-De-Ta",
    notation: "1 e & a  2 e & a  3 e & a  4 e & a",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 40, target: 60, max: 80 },
    feel: "straight",
    description: "Four notes per beat - builds hand speed and subdivision feel.",
    tips: [
      "Start very slow",
      "All notes should sound identical",
      "Wrist motion, not arm motion",
      "Practice short bursts to avoid tension"
    ],
    prerequisites: ["eighths"]
  },

  // ========================================
  // ROCK PATTERNS - Essential rock grooves
  // ========================================
  {
    id: "basic-rock",
    name: "Basic Rock Beat",
    category: "rock",
    difficulty: 2,
    syllables: "Boom Chack Boom-Boom Chack",
    notation: "K    S    K-K       S",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 70, target: 90, max: 130 },
    feel: "straight",
    description: "The most universal drum pattern - kick on 1 & 3, snare on 2 & 4.",
    tips: [
      "Lock in kick and snare first",
      "Add hi-hat last",
      "Feel the backbeat on 2 and 4",
      "Start without hi-hat until coordination is solid"
    ],
    prerequisites: ["quarters"]
  },
  {
    id: "rock-eighth-hh",
    name: "Rock with Eighth Hi-Hat",
    category: "rock",
    difficulty: 3,
    syllables: "Tss-Boom Tss-Chack Tss-Boom Tss-Chack",
    notation: "H-K      H-S       H-K      H-S",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 60, target: 85, max: 120 },
    feel: "straight",
    description: "Classic rock beat with steady eighth-note hi-hat.",
    tips: [
      "Hi-hat should be consistent volume",
      "Don't let kick affect hi-hat timing",
      "Practice hi-hat alone first",
      "Keep hi-hat relaxed and controlled"
    ],
    prerequisites: ["basic-rock", "eighths"]
  },
  {
    id: "half-time-rock",
    name: "Half-Time Rock",
    category: "rock",
    difficulty: 3,
    syllables: "Boom Boom Chack Boom",
    notation: "K    K    S     K",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 60, target: 80, max: 110 },
    feel: "straight",
    description: "Slower-feeling rock pattern with snare on beat 3 only.",
    tips: [
      "Emphasize the snare on 3",
      "Feel the groove as half the speed",
      "Great for ballads and slower songs",
      "Keep kick drum present but not overpowering"
    ],
    prerequisites: ["basic-rock"]
  },

  // ========================================
  // FUNK PATTERNS - Syncopated grooves
  // ========================================
  {
    id: "basic-funk",
    name: "Basic Funk",
    category: "funk",
    difficulty: 4,
    syllables: "Boom-Tss-(ghost)-Chack Tss-Boom-(ghost)-Tss",
    notation: "K-H-(s)-S            H-K-(s)-H",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 80, target: 100, max: 120 },
    feel: "straight",
    description: "Linear funk pattern with ghost notes and syncopation.",
    tips: [
      "Ghost notes should be barely audible",
      "Focus on the pocket between kick and snare",
      "Practice without ghost notes first",
      "Emphasize beats 1 and 3"
    ],
    prerequisites: ["rock-eighth-hh"]
  },
  {
    id: "ghost-note-funk",
    name: "Ghost Note Funk",
    category: "funk",
    difficulty: 4,
    syllables: "Boom-(ghost)-(ghost)-Chack (ghost)-Boom-(ghost)-(ghost)",
    notation: "K-(s)-(s)-S           (s)-K-(s)-(s)",
    bars: 1,
    timeSignature: "4/4", 
    bpm: { min: 70, target: 90, max: 110 },
    feel: "straight",
    description: "Classic funk groove emphasizing ghost note texture.",
    tips: [
      "Ghost notes create the groove texture",
      "Main notes should pop out clearly",
      "Practice ghost notes as separate exercise",
      "Feel the 16th note grid underneath"
    ],
    prerequisites: ["basic-funk", "sixteenths"]
  },

  // ========================================
  // SHUFFLE & SWING PATTERNS
  // ========================================
  {
    id: "blues-shuffle",
    name: "Blues Shuffle",
    category: "shuffle",
    difficulty: 3,
    syllables: "Boom-Boom-rest Chack-rest-Boom",
    notation: "K-K--         S--K         (shuffle)",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 70, target: 90, max: 120 },
    feel: "shuffle",
    description: "Classic blues shuffle with swung eighth notes.",
    tips: [
      "Feel the triplet subdivision",
      "Emphasize beats 1 and 3 with kick",
      "Snare on 2 should have authority", 
      "Practice counting triplets: 1-trip-let, 2-trip-let"
    ],
    prerequisites: ["basic-rock"]
  },
  {
    id: "texas-shuffle",
    name: "Texas Shuffle",
    category: "shuffle",
    difficulty: 3,
    syllables: "Boom-rest-Boom Chack-rest-Boom",
    notation: "K----K        S----K        (shuffle)",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 80, target: 95, max: 130 },
    feel: "shuffle", 
    description: "Driving shuffle pattern with strong kick emphasis.",
    tips: [
      "Feel the strong downbeats",
      "Leave space for the band",
      "Kick drum should drive the rhythm",
      "Common in country and southern rock"
    ],
    prerequisites: ["blues-shuffle"]
  },

  // ========================================
  // LATIN RHYTHMS - World music patterns  
  // ========================================
  {
    id: "bossa-nova",
    name: "Bossa Nova",
    category: "latin",
    difficulty: 3,
    syllables: "Boom-rest-Boom-Chack rest-Boom-rest-Chack",
    notation: "K----K-S         -K----S",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 100, target: 120, max: 140 },
    feel: "straight",
    description: "Subtle Brazilian pattern with gentle syncopation.",
    tips: [
      "Very light touch required",
      "Emphasize the cross-stick sound", 
      "Feel the gentle sway",
      "Brushes work well for authentic sound"
    ]
  },
  {
    id: "reggae-one-drop",
    name: "Reggae (One Drop)",
    category: "latin", 
    difficulty: 3,
    syllables: "rest-Boom-Chack rest-Boom-Chack",
    notation: "-K-S         -K-S",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 60, target: 75, max: 90 },
    feel: "straight",
    description: "Classic reggae pattern emphasizing beats 2 and 4.",
    tips: [
      "No kick on beat 1 - this is crucial",
      "Emphasis on 2 and 4 creates the 'drop'",
      "Rim-shot snare sound is traditional", 
      "Feel the laid-back groove"
    ]
  },

  // ========================================
  // JAZZ PATTERNS - Swing and bebop
  // ========================================
  {
    id: "jazz-swing",
    name: "Jazz Swing",
    category: "jazz",
    difficulty: 4,
    syllables: "Spang-a-lang Spang-a-lang",
    notation: "R---R-R      R---R-R      (swing)",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 100, target: 140, max: 200 },
    feel: "swing",
    description: "Classic jazz ride pattern with swung eighth notes.",
    tips: [
      "Ride cymbal should 'speak' clearly",
      "Feel the triplet underneath",
      "Accent beats 2 and 4 lightly",
      "Keep it smooth and flowing"
    ]
  },
  {
    id: "jazz-waltz",
    name: "Jazz Waltz", 
    category: "jazz",
    difficulty: 3,
    syllables: "Boom Chack Tss",
    notation: "K    S     R",
    bars: 1,
    timeSignature: "3/4",
    bpm: { min: 80, target: 110, max: 160 },
    feel: "swing",
    description: "Three-beat jazz pattern with elegant simplicity.",
    tips: [
      "Feel in 3, not as 3 groups of 1",
      "Beat 2 snare should have authority",
      "Ride cymbal keeps the flow",
      "Common in jazz ballads"
    ]
  },

  // ========================================
  // RUDIMENTS - Essential sticking patterns
  // ========================================
  {
    id: "single-stroke-roll",
    name: "Single Stroke Roll",
    category: "rudiment",
    difficulty: 2,
    syllables: "Du-De Du-De Du-De Du-De",
    notation: "R L R L R L R L",
    sticking: "R L R L R L R L",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 40, target: 80, max: 120 },
    feel: "straight",
    description: "Alternating hands - the foundation of all drumming.",
    tips: [
      "Matching volume between hands is crucial",
      "Relaxed motion, let sticks rebound",
      "Start slow and build speed gradually",
      "Focus on evenness over speed"
    ]
  },
  {
    id: "double-stroke-roll",
    name: "Double Stroke Roll", 
    category: "rudiment",
    difficulty: 3,
    syllables: "Du-Du De-De Du-Du De-De",
    notation: "R R L L R R L L",
    sticking: "R R L L R R L L",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 30, target: 60, max: 100 },
    feel: "straight",
    description: "Two strokes per hand using natural stick bounce.",
    tips: [
      "Let the stick bounce naturally",
      "Don't force the second stroke",
      "Both strokes should be identical volume",
      "Wrist motion, minimal finger involvement"
    ],
    prerequisites: ["single-stroke-roll"]
  },
  {
    id: "paradiddle",
    name: "Paradiddle",
    category: "rudiment",
    difficulty: 3,
    syllables: "Du-de-du-DU De-du-de-DE",
    notation: "R L R R  L R L L",
    sticking: "R L R R  L R L L",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 40, target: 70, max: 110 },
    feel: "straight",
    description: "Single-double combination pattern.",
    tips: [
      "Accent the first note of each group",
      "Double strokes should flow naturally",
      "Practice the sticking without accents first",
      "Keep relaxed through the pattern"
    ],
    prerequisites: ["single-stroke-roll", "double-stroke-roll"]
  },
  {
    id: "flam",
    name: "Flam",
    category: "rudiment",
    difficulty: 3,
    syllables: "Ka-DU Ka-DE",
    notation: "lR    rL",
    sticking: "lR    rL",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 50, target: 80, max: 120 },
    feel: "straight",
    description: "Grace note before the main stroke.",
    tips: [
      "Grace note should be quiet, main note loud",
      "Almost simultaneous, but grace note slightly first",
      "Practice the motion slowly",
      "Don't make the grace note too early"
    ],
    prerequisites: ["single-stroke-roll"]
  },

  // ========================================
  // MODERN PATTERNS - Contemporary styles
  // ========================================
  {
    id: "trap-beat",
    name: "Trap Beat",
    category: "modern",
    difficulty: 4,
    syllables: "Boom-rest-Boom-rest Chack-rest-Boom-Boom",
    notation: "K----K--         S--K-K",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 120, target: 150, max: 180 },
    feel: "straight",
    description: "Hip-hop influenced pattern with syncopated kicks.",
    tips: [
      "Feel the 16th note subdivisions",
      "Snare has a sharp, gated sound",
      "Hi-hats often programmed, keep them tight",
      "Strong emphasis on the syncopated kicks"
    ]
  },
  {
    id: "breakbeat",
    name: "Breakbeat",
    category: "modern",
    difficulty: 4,
    syllables: "Boom-Boom-Chack-Boom rest-Boom-Chack-rest",
    notation: "K-K-S-K          -K-S-",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 110, target: 130, max: 150 },
    feel: "straight",
    description: "Syncopated pattern common in electronic music.",
    tips: [
      "Based on the famous 'Amen Break'",
      "Feel the displacement and syncopation",
      "Often sampled and looped",
      "Practice until it feels natural"
    ]
  },

  // ========================================
  // FILL PATTERNS - Transitional phrases
  // ========================================
  {
    id: "basic-tom-fill",
    name: "Basic Tom Fill",
    category: "fill",
    difficulty: 2,
    syllables: "Du-De-Du-De",
    notation: "H L H L (toms)",
    sticking: "R L R L",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 60, target: 90, max: 130 },
    feel: "straight",
    description: "Simple high-to-low tom movement.",
    tips: [
      "Move smoothly between toms",
      "Maintain steady rhythm",
      "End strongly to return to groove",
      "Practice the physical movement slowly"
    ],
    prerequisites: ["single-stroke-roll"]
  },
  {
    id: "linear-fill",
    name: "Linear Fill",
    category: "fill",
    difficulty: 4,
    syllables: "Boom-Chack-Tom-Tom",
    notation: "K-S-T-T",
    bars: 1,
    timeSignature: "4/4",
    bpm: { min: 70, target: 100, max: 140 },
    feel: "straight",
    description: "No limbs hit simultaneously - linear concept.",
    tips: [
      "Only one limb plays at a time",
      "Creates very clean, articulate sound",
      "Plan the physical movements",
      "Return to groove smoothly"
    ],
    prerequisites: ["basic-tom-fill"]
  }
];

// Helper functions for working with patterns
export function getPatternsByCategory(category: DrumPattern["category"]): DrumPattern[] {
  return DRUM_PATTERNS.filter(pattern => pattern.category === category);
}

export function getPatternsByDifficulty(difficulty: number): DrumPattern[] {
  return DRUM_PATTERNS.filter(pattern => pattern.difficulty <= difficulty);
}

export function getPatternById(id: string): DrumPattern | undefined {
  return DRUM_PATTERNS.find(pattern => pattern.id === id);
}

export function getRecommendedPatterns(
  currentLevel: "beginner" | "intermediate" | "advanced",
  completedPatterns: string[] = []
): DrumPattern[] {
  const maxDifficulty = currentLevel === "beginner" ? 2 : currentLevel === "intermediate" ? 4 : 5;
  
  return DRUM_PATTERNS
    .filter(pattern => pattern.difficulty <= maxDifficulty)
    .filter(pattern => !completedPatterns.includes(pattern.id))
    .filter(pattern => {
      // Check if prerequisites are met
      if (!pattern.prerequisites) return true;
      return pattern.prerequisites.every(prereq => completedPatterns.includes(prereq));
    })
    .sort((a, b) => a.difficulty - b.difficulty);
}

export function getPatternProgression(patternId: string): DrumPattern[] {
  const pattern = getPatternById(patternId);
  if (!pattern) return [];
  
  const progression: DrumPattern[] = [];
  
  // Add prerequisites recursively
  if (pattern.prerequisites) {
    for (const prereqId of pattern.prerequisites) {
      const prereq = getPatternById(prereqId);
      if (prereq) {
        progression.push(...getPatternProgression(prereqId));
        if (!progression.some(p => p.id === prereq.id)) {
          progression.push(prereq);
        }
      }
    }
  }
  
  // Add the pattern itself
  progression.push(pattern);
  
  // Add variations if any
  if (pattern.variations) {
    for (const variationId of pattern.variations) {
      const variation = getPatternById(variationId);
      if (variation) {
        progression.push(variation);
      }
    }
  }
  
  return progression;
}

export const PATTERN_CATEGORIES = [
  { id: "basic", name: "Basic", description: "Foundation rhythms and subdivisions" },
  { id: "rock", name: "Rock", description: "Essential rock and pop grooves" },
  { id: "funk", name: "Funk", description: "Syncopated and groove-heavy patterns" },
  { id: "shuffle", name: "Shuffle", description: "Swung and triplet-based feels" },
  { id: "latin", name: "Latin", description: "World music and Latin rhythms" },
  { id: "jazz", name: "Jazz", description: "Swing and bebop patterns" },
  { id: "modern", name: "Modern", description: "Contemporary and electronic styles" },
  { id: "rudiment", name: "Rudiments", description: "Essential sticking patterns" },
  { id: "fill", name: "Fills", description: "Transitional and accent phrases" }
] as const;