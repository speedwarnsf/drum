/**
 * Comprehensive drum rudiment library with notation and practice guidance
 */

export type Hand = 'R' | 'L';
export type Accent = 'accent' | 'ghost' | 'normal';

export type RudimentNote = {
  hand: Hand;
  accent: Accent;
  timing: number; // Position within the measure (0-1)
  duration: number; // Note duration as fraction of beat
};

export type RudimentPattern = {
  notes: RudimentNote[];
  timeSignature: [number, number]; // [numerator, denominator]
  suggestedTempo: { min: number; max: number; target: number };
  difficulty: 1 | 2 | 3 | 4 | 5;
  stickingPattern: string; // Visual representation like "RLRLRLRL"
  description: string;
};

export type Rudiment = {
  id: string;
  name: string;
  category: 'rolls' | 'diddles' | 'flams' | 'drags' | 'paradiddles' | 'ratamacues' | 'combinations';
  pattern: RudimentPattern;
  variations: RudimentPattern[];
  practiceNotes: string[];
  videoReference?: string;
  audioExample?: string;
  commonMistakes: string[];
  prerequisites: string[]; // IDs of rudiments to learn first
  nextRudiments: string[]; // IDs of rudiments to learn next
  pfa: boolean; // Percussive Arts Society's 40 Essential Rudiments
};

// The 40 Essential Rudiments from PAS
export const ESSENTIAL_RUDIMENTS: Record<string, Rudiment> = {
  // ROLL RUDIMENTS
  'single-stroke-roll': {
    id: 'single-stroke-roll',
    name: 'Single Stroke Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.25 },
        { hand: 'L', accent: 'normal', timing: 0.25, duration: 0.25 },
        { hand: 'R', accent: 'normal', timing: 0.5, duration: 0.25 },
        { hand: 'L', accent: 'normal', timing: 0.75, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 180, target: 120 },
      difficulty: 1,
      stickingPattern: 'RLRL',
      description: 'Alternating single strokes between hands',
    },
    variations: [],
    practiceNotes: [
      'Start slow and focus on even spacing',
      'Keep wrists relaxed and use finger control',
      'Each hand should produce the same volume and tone',
      'Practice with a metronome to develop steady tempo',
    ],
    commonMistakes: [
      'Rushing the tempo',
      'Uneven stick heights',
      'Tension in wrists or forearms',
      'Different volumes between hands',
    ],
    prerequisites: [],
    nextRudiments: ['multiple-bounce-roll', 'double-stroke-roll'],
    pfa: true,
  },

  'multiple-bounce-roll': {
    id: 'multiple-bounce-roll',
    name: 'Multiple Bounce Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.5 },
        { hand: 'L', accent: 'accent', timing: 0.5, duration: 0.5 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 140, target: 100 },
      difficulty: 2,
      stickingPattern: 'RrrLll (multiple bounces)',
      description: 'Multiple bounces per hand creating a sustained roll',
    },
    variations: [],
    practiceNotes: [
      'Control the bounce with finger pressure',
      'Start with 3-4 bounces per hand',
      'Keep the roll even and smooth',
      'Practice the "buzz" sound',
    ],
    commonMistakes: [
      'Too much wrist motion',
      'Uncontrolled bounces',
      'Gaps in the roll',
      'Different tones between hands',
    ],
    prerequisites: ['single-stroke-roll'],
    nextRudiments: ['long-roll', 'five-stroke-roll'],
    pfa: true,
  },

  'double-stroke-roll': {
    id: 'double-stroke-roll',
    name: 'Double Stroke Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.125, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.25, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.375, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.5, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.625, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.75, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.875, duration: 0.125 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 160, target: 110 },
      difficulty: 2,
      stickingPattern: 'RRLL',
      description: 'Two controlled strokes per hand',
    },
    variations: [
      {
        notes: [
          { hand: 'R', accent: 'accent', timing: 0, duration: 0.125 },
          { hand: 'R', accent: 'normal', timing: 0.125, duration: 0.125 },
          { hand: 'L', accent: 'accent', timing: 0.25, duration: 0.125 },
          { hand: 'L', accent: 'normal', timing: 0.375, duration: 0.125 },
        ],
        timeSignature: [4, 4],
        suggestedTempo: { min: 60, max: 160, target: 110 },
        difficulty: 3,
        stickingPattern: 'RrLl (accented)',
        description: 'Double stroke roll with accents on first note of each hand',
      },
    ],
    practiceNotes: [
      'Use wrist motion for the first stroke, finger control for the second',
      'Keep both strokes at the same volume',
      'Practice slowly to develop muscle memory',
      'Focus on clean releases between hand changes',
    ],
    commonMistakes: [
      'Second stroke is too quiet',
      'Rushing the double strokes',
      'Inconsistent hand-to-hand spacing',
      'Using only wrist for both strokes',
    ],
    prerequisites: ['single-stroke-roll'],
    nextRudiments: ['triple-stroke-roll', 'five-stroke-roll'],
    pfa: true,
  },

  // PARADIDDLE RUDIMENTS
  'single-paradiddle': {
    id: 'single-paradiddle',
    name: 'Single Paradiddle',
    category: 'paradiddles',
    pattern: {
      notes: [
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.25 },
        { hand: 'L', accent: 'normal', timing: 0.25, duration: 0.25 },
        { hand: 'R', accent: 'normal', timing: 0.5, duration: 0.25 },
        { hand: 'R', accent: 'normal', timing: 0.75, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 150, target: 100 },
      difficulty: 2,
      stickingPattern: 'RLRR',
      description: 'Single stroke followed by double stroke',
    },
    variations: [
      {
        notes: [
          { hand: 'L', accent: 'accent', timing: 0, duration: 0.25 },
          { hand: 'R', accent: 'normal', timing: 0.25, duration: 0.25 },
          { hand: 'L', accent: 'normal', timing: 0.5, duration: 0.25 },
          { hand: 'L', accent: 'normal', timing: 0.75, duration: 0.25 },
        ],
        timeSignature: [4, 4],
        suggestedTempo: { min: 60, max: 150, target: 100 },
        difficulty: 2,
        stickingPattern: 'LRLL',
        description: 'Single paradiddle starting with left hand',
      },
    ],
    practiceNotes: [
      'Accent the first note clearly',
      'Keep the double stroke even and controlled',
      'Practice both right-hand and left-hand lead versions',
      'Focus on smooth transitions between single and double strokes',
    ],
    commonMistakes: [
      'Not accenting the first note enough',
      'Rushing the double stroke',
      'Uneven volumes in the double stroke',
      'Stiff wrist motion',
    ],
    prerequisites: ['single-stroke-roll', 'double-stroke-roll'],
    nextRudiments: ['double-paradiddle', 'triple-paradiddle'],
    pfa: true,
  },

  'double-paradiddle': {
    id: 'double-paradiddle',
    name: 'Double Paradiddle',
    category: 'paradiddles',
    pattern: {
      notes: [
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.167 },
        { hand: 'L', accent: 'normal', timing: 0.167, duration: 0.167 },
        { hand: 'R', accent: 'normal', timing: 0.333, duration: 0.167 },
        { hand: 'L', accent: 'normal', timing: 0.5, duration: 0.167 },
        { hand: 'R', accent: 'normal', timing: 0.667, duration: 0.167 },
        { hand: 'R', accent: 'normal', timing: 0.833, duration: 0.167 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 130, target: 90 },
      difficulty: 3,
      stickingPattern: 'RLRLRR',
      description: 'Four singles followed by one double stroke',
    },
    variations: [],
    practiceNotes: [
      'Emphasize the accent on the first note',
      'Keep singles even and relaxed',
      'The double stroke should flow naturally from the singles',
      'Practice in groupings of six notes',
    ],
    commonMistakes: [
      'Not enough accent on first note',
      'Speeding up through the single strokes',
      'Choppy transition to the double stroke',
      'Uneven timing in the six-note grouping',
    ],
    prerequisites: ['single-paradiddle', 'single-stroke-roll'],
    nextRudiments: ['triple-paradiddle', 'paradiddlediddle'],
    pfa: true,
  },

  // FLAM RUDIMENTS
  'flam': {
    id: 'flam',
    name: 'Flam',
    category: 'flams',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.25 }, // Grace note slightly before
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 120, target: 80 },
      difficulty: 2,
      stickingPattern: 'lR (grace note + accent)',
      description: 'Grace note followed immediately by accented note',
    },
    variations: [
      {
        notes: [
          { hand: 'R', accent: 'ghost', timing: -0.02, duration: 0.25 },
          { hand: 'L', accent: 'accent', timing: 0, duration: 0.25 },
        ],
        timeSignature: [4, 4],
        suggestedTempo: { min: 60, max: 120, target: 80 },
        difficulty: 2,
        stickingPattern: 'rL (right grace note)',
        description: 'Flam with right hand grace note',
      },
    ],
    practiceNotes: [
      'Grace note should be very close to the accent, not a separate beat',
      'Keep grace note soft and accent strong',
      'Both sticks should strike almost simultaneously',
      'Practice alternating which hand plays the grace note',
    ],
    commonMistakes: [
      'Grace note too loud or too late',
      'Too much separation between grace note and accent',
      'Inconsistent grace note timing',
      'Not enough volume difference between grace and accent',
    ],
    prerequisites: ['single-stroke-roll'],
    nextRudiments: ['flam-accent', 'flamacue', 'flam-tap'],
    pfa: true,
  },

  'flam-accent': {
    id: 'flam-accent',
    name: 'Flam Accent',
    category: 'flams',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.333 },
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.333 },
        { hand: 'L', accent: 'normal', timing: 0.333, duration: 0.333 },
        { hand: 'R', accent: 'normal', timing: 0.667, duration: 0.333 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 120, target: 90 },
      difficulty: 3,
      stickingPattern: 'lRLR',
      description: 'Flam followed by two single strokes',
    },
    variations: [],
    practiceNotes: [
      'Keep the flam tight and controlled',
      'Single strokes after the flam should be even',
      'Practice with both right and left hand leading',
      'Focus on smooth transitions from flam to singles',
    ],
    commonMistakes: [
      'Rushing after the flam',
      'Uneven single strokes',
      'Inconsistent flam timing',
      'Not enough accent on the flam',
    ],
    prerequisites: ['flam', 'single-stroke-roll'],
    nextRudiments: ['flamacue', 'swiss-army-triplet'],
    pfa: true,
  },

  // More rudiments can be added here...
  // This is a comprehensive start with the most essential ones
};

// Practice progression system
export class RudimentProgression {
  private completedRudiments: Set<string> = new Set();
  private currentLevel: number = 1;
  private skillAssessments: Map<string, number> = new Map(); // rudimentId -> skill level (1-5)

  constructor() {
    this.loadProgress();
  }

  private loadProgress(): void {
    try {
      const saved = localStorage.getItem('drum-rudiment-progress');
      if (saved) {
        const data = JSON.parse(saved);
        this.completedRudiments = new Set(data.completed || []);
        this.currentLevel = data.level || 1;
        this.skillAssessments = new Map(data.skills || []);
      }
    } catch (error) {
      console.warn('Could not load rudiment progress:', error);
    }
  }

  private saveProgress(): void {
    try {
      const data = {
        completed: Array.from(this.completedRudiments),
        level: this.currentLevel,
        skills: Array.from(this.skillAssessments.entries()),
      };
      localStorage.setItem('drum-rudiment-progress', JSON.stringify(data));
    } catch (error) {
      console.warn('Could not save rudiment progress:', error);
    }
  }

  markCompleted(rudimentId: string, skillLevel: number = 3): void {
    this.completedRudiments.add(rudimentId);
    this.skillAssessments.set(rudimentId, skillLevel);
    this.updateLevel();
    this.saveProgress();
  }

  private updateLevel(): void {
    const completedCount = this.completedRudiments.size;
    this.currentLevel = Math.min(5, Math.floor(completedCount / 8) + 1);
  }

  getAvailableRudiments(): Rudiment[] {
    return Object.values(ESSENTIAL_RUDIMENTS).filter(rudiment => {
      // Check if prerequisites are met
      return rudiment.prerequisites.every(prereqId => 
        this.completedRudiments.has(prereqId)
      );
    });
  }

  getRecommendedRudiments(count: number = 3): Rudiment[] {
    const available = this.getAvailableRudiments();
    const uncompleted = available.filter(r => !this.completedRudiments.has(r.id));
    
    // Sort by difficulty and return top recommendations
    return uncompleted
      .sort((a, b) => a.pattern.difficulty - b.pattern.difficulty)
      .slice(0, count);
  }

  getProgressStats(): {
    totalRudiments: number;
    completedRudiments: number;
    currentLevel: number;
    nextLevelProgress: number;
  } {
    const total = Object.keys(ESSENTIAL_RUDIMENTS).length;
    const completed = this.completedRudiments.size;
    const rudientsForNextLevel = (this.currentLevel * 8);
    const progressToNext = Math.min(100, (completed / rudientsForNextLevel) * 100);

    return {
      totalRudiments: total,
      completedRudiments: completed,
      currentLevel: this.currentLevel,
      nextLevelProgress: progressToNext,
    };
  }

  getRudimentById(id: string): Rudiment | null {
    return ESSENTIAL_RUDIMENTS[id] || null;
  }

  getSkillLevel(rudimentId: string): number {
    return this.skillAssessments.get(rudimentId) || 0;
  }

  isCompleted(rudimentId: string): boolean {
    return this.completedRudiments.has(rudimentId);
  }

  reset(): void {
    this.completedRudiments.clear();
    this.skillAssessments.clear();
    this.currentLevel = 1;
    this.saveProgress();
  }
}

// Practice session generator
export function generateRudimentPracticeSession(
  progression: RudimentProgression,
  durationMinutes: number = 20,
  focusArea?: 'rolls' | 'paradiddles' | 'flams' | 'mixed'
): {
  warmUp: Rudiment[];
  main: Rudiment[];
  review: Rudiment[];
  totalEstimatedTime: number;
} {
  const recommended = progression.getRecommendedRudiments(6);
  const allRudiments = Object.values(ESSENTIAL_RUDIMENTS);
  
  let filteredRudiments = recommended;
  if (focusArea && focusArea !== 'mixed') {
    filteredRudiments = recommended.filter(r => r.category === focusArea);
  }

  // Warm-up: Easy, completed rudiments
  const warmUp = allRudiments
    .filter(r => progression.isCompleted(r.id) && r.pattern.difficulty <= 2)
    .slice(0, 2);

  // Main practice: New and challenging rudiments
  const main = filteredRudiments.slice(0, 3);

  // Review: Recently completed rudiments
  const recentlyCompleted = Array.from(progression['completedRudiments'])
    .map(id => ESSENTIAL_RUDIMENTS[id])
    .filter(Boolean)
    .slice(-3);

  return {
    warmUp,
    main,
    review: recentlyCompleted,
    totalEstimatedTime: durationMinutes,
  };
}