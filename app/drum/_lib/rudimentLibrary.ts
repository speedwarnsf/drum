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

  // ROLL RUDIMENTS (continued)
  'triple-stroke-roll': {
    id: 'triple-stroke-roll',
    name: 'Triple Stroke Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.083 },
        { hand: 'R', accent: 'normal', timing: 0.083, duration: 0.083 },
        { hand: 'R', accent: 'normal', timing: 0.167, duration: 0.083 },
        { hand: 'L', accent: 'normal', timing: 0.25, duration: 0.083 },
        { hand: 'L', accent: 'normal', timing: 0.333, duration: 0.083 },
        { hand: 'L', accent: 'normal', timing: 0.417, duration: 0.083 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 140, target: 100 },
      difficulty: 3,
      stickingPattern: 'RRRLLL',
      description: 'Three controlled strokes per hand',
    },
    variations: [],
    practiceNotes: ['Use wrist for first stroke, fingers for second and third', 'Keep all three strokes even in volume', 'Practice slowly at first'],
    commonMistakes: ['Third stroke too quiet', 'Uneven spacing between strokes', 'Rushing the triple'],
    prerequisites: ['double-stroke-roll'],
    nextRudiments: [],
    pfa: true,
  },

  'five-stroke-roll': {
    id: 'five-stroke-roll',
    name: 'Five Stroke Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.125, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.25, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.375, duration: 0.125 },
        { hand: 'R', accent: 'accent', timing: 0.5, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 140, target: 100 },
      difficulty: 2,
      stickingPattern: 'RRLLR',
      description: 'Two doubles and an accented single',
    },
    variations: [],
    practiceNotes: ['Accent the last note clearly', 'Keep the doubles even', 'Practice starting on both hands'],
    commonMistakes: ['Rushing the doubles', 'Weak accent on the fifth stroke', 'Uneven doubles'],
    prerequisites: ['double-stroke-roll'],
    nextRudiments: ['six-stroke-roll', 'seven-stroke-roll'],
    pfa: true,
  },

  'six-stroke-roll': {
    id: 'six-stroke-roll',
    name: 'Six Stroke Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.167 },
        { hand: 'L', accent: 'normal', timing: 0.167, duration: 0.167 },
        { hand: 'L', accent: 'normal', timing: 0.333, duration: 0.167 },
        { hand: 'R', accent: 'normal', timing: 0.5, duration: 0.167 },
        { hand: 'R', accent: 'normal', timing: 0.667, duration: 0.167 },
        { hand: 'L', accent: 'accent', timing: 0.833, duration: 0.167 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 130, target: 90 },
      difficulty: 3,
      stickingPattern: 'RLLRRL',
      description: 'Accented singles bookending two doubles',
    },
    variations: [],
    practiceNotes: ['Accent first and last notes', 'Keep doubles quiet and even', 'Practice as triplets'],
    commonMistakes: ['Missing the accents', 'Uneven doubles', 'Wrong grouping feel'],
    prerequisites: ['five-stroke-roll'],
    nextRudiments: ['seven-stroke-roll'],
    pfa: true,
  },

  'seven-stroke-roll': {
    id: 'seven-stroke-roll',
    name: 'Seven Stroke Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.125, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.25, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.375, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.5, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.625, duration: 0.125 },
        { hand: 'L', accent: 'accent', timing: 0.75, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 130, target: 90 },
      difficulty: 3,
      stickingPattern: 'RRLLRRL',
      description: 'Three doubles and an accented single',
    },
    variations: [],
    practiceNotes: ['Keep all doubles even', 'Accent the final note clearly', 'Practice at slow tempos first'],
    commonMistakes: ['Rushing through the doubles', 'Uneven hand-to-hand transitions', 'Weak final accent'],
    prerequisites: ['five-stroke-roll'],
    nextRudiments: ['nine-stroke-roll'],
    pfa: true,
  },

  'nine-stroke-roll': {
    id: 'nine-stroke-roll',
    name: 'Nine Stroke Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.1 },
        { hand: 'R', accent: 'normal', timing: 0.1, duration: 0.1 },
        { hand: 'L', accent: 'normal', timing: 0.2, duration: 0.1 },
        { hand: 'L', accent: 'normal', timing: 0.3, duration: 0.1 },
        { hand: 'R', accent: 'normal', timing: 0.4, duration: 0.1 },
        { hand: 'R', accent: 'normal', timing: 0.5, duration: 0.1 },
        { hand: 'L', accent: 'normal', timing: 0.6, duration: 0.1 },
        { hand: 'L', accent: 'normal', timing: 0.7, duration: 0.1 },
        { hand: 'R', accent: 'accent', timing: 0.8, duration: 0.2 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 120, target: 80 },
      difficulty: 3,
      stickingPattern: 'RRLLRRLLR',
      description: 'Four doubles and an accented single',
    },
    variations: [],
    practiceNotes: ['Maintain even doubles throughout', 'Focus on smooth hand transitions', 'Strong final accent'],
    commonMistakes: ['Losing evenness in the middle', 'Rushing', 'Inconsistent double quality'],
    prerequisites: ['seven-stroke-roll'],
    nextRudiments: ['ten-stroke-roll'],
    pfa: true,
  },

  'ten-stroke-roll': {
    id: 'ten-stroke-roll',
    name: 'Ten Stroke Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.09 },
        { hand: 'R', accent: 'normal', timing: 0.09, duration: 0.09 },
        { hand: 'L', accent: 'normal', timing: 0.18, duration: 0.09 },
        { hand: 'L', accent: 'normal', timing: 0.27, duration: 0.09 },
        { hand: 'R', accent: 'normal', timing: 0.36, duration: 0.09 },
        { hand: 'R', accent: 'normal', timing: 0.45, duration: 0.09 },
        { hand: 'L', accent: 'normal', timing: 0.54, duration: 0.09 },
        { hand: 'L', accent: 'normal', timing: 0.63, duration: 0.09 },
        { hand: 'R', accent: 'accent', timing: 0.72, duration: 0.14 },
        { hand: 'L', accent: 'accent', timing: 0.86, duration: 0.14 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 120, target: 80 },
      difficulty: 3,
      stickingPattern: 'RRLLRRLLRL',
      description: 'Four doubles and two accented singles',
    },
    variations: [],
    practiceNotes: ['Even doubles leading to strong accented singles', 'Practice the transition from doubles to singles'],
    commonMistakes: ['Uneven doubles', 'Weak accents at the end', 'Rushing'],
    prerequisites: ['nine-stroke-roll'],
    nextRudiments: ['eleven-stroke-roll'],
    pfa: true,
  },

  'eleven-stroke-roll': {
    id: 'eleven-stroke-roll',
    name: 'Eleven Stroke Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.08 },
        { hand: 'R', accent: 'normal', timing: 0.08, duration: 0.08 },
        { hand: 'L', accent: 'normal', timing: 0.16, duration: 0.08 },
        { hand: 'L', accent: 'normal', timing: 0.24, duration: 0.08 },
        { hand: 'R', accent: 'normal', timing: 0.32, duration: 0.08 },
        { hand: 'R', accent: 'normal', timing: 0.4, duration: 0.08 },
        { hand: 'L', accent: 'normal', timing: 0.48, duration: 0.08 },
        { hand: 'L', accent: 'normal', timing: 0.56, duration: 0.08 },
        { hand: 'R', accent: 'normal', timing: 0.64, duration: 0.08 },
        { hand: 'R', accent: 'normal', timing: 0.72, duration: 0.08 },
        { hand: 'L', accent: 'accent', timing: 0.8, duration: 0.2 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 110, target: 75 },
      difficulty: 3,
      stickingPattern: 'RRLLRRLLRRL',
      description: 'Five doubles and an accented single',
    },
    variations: [],
    practiceNotes: ['Maintain consistent double quality', 'Strong final accent', 'Practice slowly'],
    commonMistakes: ['Doubles become uneven at speed', 'Rushing the roll', 'Weak ending'],
    prerequisites: ['nine-stroke-roll'],
    nextRudiments: ['thirteen-stroke-roll'],
    pfa: true,
  },

  'thirteen-stroke-roll': {
    id: 'thirteen-stroke-roll',
    name: 'Thirteen Stroke Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.07 },
        { hand: 'R', accent: 'normal', timing: 0.07, duration: 0.07 },
        { hand: 'L', accent: 'normal', timing: 0.14, duration: 0.07 },
        { hand: 'L', accent: 'normal', timing: 0.21, duration: 0.07 },
        { hand: 'R', accent: 'normal', timing: 0.28, duration: 0.07 },
        { hand: 'R', accent: 'normal', timing: 0.35, duration: 0.07 },
        { hand: 'L', accent: 'normal', timing: 0.42, duration: 0.07 },
        { hand: 'L', accent: 'normal', timing: 0.49, duration: 0.07 },
        { hand: 'R', accent: 'normal', timing: 0.56, duration: 0.07 },
        { hand: 'R', accent: 'normal', timing: 0.63, duration: 0.07 },
        { hand: 'L', accent: 'normal', timing: 0.7, duration: 0.07 },
        { hand: 'L', accent: 'normal', timing: 0.77, duration: 0.07 },
        { hand: 'R', accent: 'accent', timing: 0.84, duration: 0.16 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 110, target: 75 },
      difficulty: 3,
      stickingPattern: 'RRLLRRLLRRLLR',
      description: 'Six doubles and an accented single',
    },
    variations: [],
    practiceNotes: ['Focus on even doubles throughout', 'Build speed gradually', 'Strong ending accent'],
    commonMistakes: ['Losing control in the middle', 'Uneven doubles', 'Rushing to the accent'],
    prerequisites: ['eleven-stroke-roll'],
    nextRudiments: ['fifteen-stroke-roll'],
    pfa: true,
  },

  'fifteen-stroke-roll': {
    id: 'fifteen-stroke-roll',
    name: 'Fifteen Stroke Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.06 },
        { hand: 'R', accent: 'normal', timing: 0.06, duration: 0.06 },
        { hand: 'L', accent: 'normal', timing: 0.12, duration: 0.06 },
        { hand: 'L', accent: 'normal', timing: 0.18, duration: 0.06 },
        { hand: 'R', accent: 'normal', timing: 0.24, duration: 0.06 },
        { hand: 'R', accent: 'normal', timing: 0.3, duration: 0.06 },
        { hand: 'L', accent: 'normal', timing: 0.36, duration: 0.06 },
        { hand: 'L', accent: 'normal', timing: 0.42, duration: 0.06 },
        { hand: 'R', accent: 'normal', timing: 0.48, duration: 0.06 },
        { hand: 'R', accent: 'normal', timing: 0.54, duration: 0.06 },
        { hand: 'L', accent: 'normal', timing: 0.6, duration: 0.06 },
        { hand: 'L', accent: 'normal', timing: 0.66, duration: 0.06 },
        { hand: 'R', accent: 'normal', timing: 0.72, duration: 0.06 },
        { hand: 'R', accent: 'normal', timing: 0.78, duration: 0.06 },
        { hand: 'L', accent: 'accent', timing: 0.84, duration: 0.16 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 100, target: 70 },
      difficulty: 4,
      stickingPattern: 'RRLLRRLLRRLLRRL',
      description: 'Seven doubles and an accented single',
    },
    variations: [],
    practiceNotes: ['The longest common roll — patience is key', 'Keep doubles perfectly even', 'Strong ending'],
    commonMistakes: ['Losing tempo in the middle', 'Uneven dynamics', 'Rushing'],
    prerequisites: ['thirteen-stroke-roll'],
    nextRudiments: ['seventeen-stroke-roll'],
    pfa: true,
  },

  'seventeen-stroke-roll': {
    id: 'seventeen-stroke-roll',
    name: 'Seventeen Stroke Roll',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.055 },
        { hand: 'R', accent: 'normal', timing: 0.055, duration: 0.055 },
        { hand: 'L', accent: 'normal', timing: 0.11, duration: 0.055 },
        { hand: 'L', accent: 'normal', timing: 0.165, duration: 0.055 },
        { hand: 'R', accent: 'normal', timing: 0.22, duration: 0.055 },
        { hand: 'R', accent: 'normal', timing: 0.275, duration: 0.055 },
        { hand: 'L', accent: 'normal', timing: 0.33, duration: 0.055 },
        { hand: 'L', accent: 'normal', timing: 0.385, duration: 0.055 },
        { hand: 'R', accent: 'normal', timing: 0.44, duration: 0.055 },
        { hand: 'R', accent: 'normal', timing: 0.495, duration: 0.055 },
        { hand: 'L', accent: 'normal', timing: 0.55, duration: 0.055 },
        { hand: 'L', accent: 'normal', timing: 0.605, duration: 0.055 },
        { hand: 'R', accent: 'normal', timing: 0.66, duration: 0.055 },
        { hand: 'R', accent: 'normal', timing: 0.715, duration: 0.055 },
        { hand: 'L', accent: 'normal', timing: 0.77, duration: 0.055 },
        { hand: 'L', accent: 'normal', timing: 0.825, duration: 0.055 },
        { hand: 'R', accent: 'accent', timing: 0.88, duration: 0.12 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 40, max: 100, target: 65 },
      difficulty: 4,
      stickingPattern: 'RRLLRRLLRRLLRRLLR',
      description: 'Eight doubles and an accented single',
    },
    variations: [],
    practiceNotes: ['Extended roll requiring great control', 'Focus on consistency throughout', 'Practice with metronome'],
    commonMistakes: ['Tension buildup', 'Speeding up through the roll', 'Uneven dynamics'],
    prerequisites: ['fifteen-stroke-roll'],
    nextRudiments: [],
    pfa: true,
  },

  // SINGLE STROKE RUDIMENTS (continued)
  'single-stroke-four': {
    id: 'single-stroke-four',
    name: 'Single Stroke Four',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.167 },
        { hand: 'L', accent: 'normal', timing: 0.167, duration: 0.167 },
        { hand: 'R', accent: 'normal', timing: 0.333, duration: 0.167 },
        { hand: 'L', accent: 'normal', timing: 0.5, duration: 0.167 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 160, target: 110 },
      difficulty: 2,
      stickingPattern: 'RLRL (as triplets)',
      description: 'Four alternating singles grouped as triplets with accent',
    },
    variations: [],
    practiceNotes: ['Accent the first note of each group', 'Practice as triplet groupings', 'Alternate leading hand'],
    commonMistakes: ['Not feeling the triplet grouping', 'Uneven strokes', 'Missing the accent'],
    prerequisites: ['single-stroke-roll'],
    nextRudiments: ['single-stroke-seven'],
    pfa: true,
  },

  'single-stroke-seven': {
    id: 'single-stroke-seven',
    name: 'Single Stroke Seven',
    category: 'rolls',
    pattern: {
      notes: [
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.125, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.25, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.375, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.5, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.625, duration: 0.125 },
        { hand: 'R', accent: 'accent', timing: 0.75, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 150, target: 100 },
      difficulty: 2,
      stickingPattern: 'RLRLRLR',
      description: 'Seven alternating singles with accents',
    },
    variations: [],
    practiceNotes: ['Accent first and last strokes', 'Keep middle strokes even and relaxed', 'Practice both hand leads'],
    commonMistakes: ['Rushing through the seven strokes', 'Uneven dynamics', 'Losing count'],
    prerequisites: ['single-stroke-four'],
    nextRudiments: [],
    pfa: true,
  },

  // PARADIDDLE RUDIMENTS (continued)
  'triple-paradiddle': {
    id: 'triple-paradiddle',
    name: 'Triple Paradiddle',
    category: 'paradiddles',
    pattern: {
      notes: [
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.125, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.25, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.375, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.5, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.625, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.75, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.875, duration: 0.125 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 120, target: 85 },
      difficulty: 3,
      stickingPattern: 'RLRLRLRR',
      description: 'Six singles followed by a double',
    },
    variations: [],
    practiceNotes: ['Accent the first note', 'Keep singles smooth', 'Double should flow naturally'],
    commonMistakes: ['Losing the accent', 'Choppy transition to the double', 'Uneven spacing'],
    prerequisites: ['double-paradiddle'],
    nextRudiments: ['paradiddlediddle'],
    pfa: true,
  },

  'paradiddlediddle': {
    id: 'paradiddlediddle',
    name: 'Single Paradiddle-diddle',
    category: 'paradiddles',
    pattern: {
      notes: [
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.167 },
        { hand: 'L', accent: 'normal', timing: 0.167, duration: 0.167 },
        { hand: 'R', accent: 'normal', timing: 0.333, duration: 0.167 },
        { hand: 'R', accent: 'normal', timing: 0.5, duration: 0.167 },
        { hand: 'L', accent: 'normal', timing: 0.667, duration: 0.167 },
        { hand: 'L', accent: 'normal', timing: 0.833, duration: 0.167 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 130, target: 90 },
      difficulty: 3,
      stickingPattern: 'RLRRLL',
      description: 'Single paradiddle with an extra diddle',
    },
    variations: [],
    practiceNotes: ['Accent the first note', 'Both doubles should be even', 'Great for 6/8 time'],
    commonMistakes: ['Uneven doubles', 'Losing the accent pattern', 'Wrong grouping feel'],
    prerequisites: ['single-paradiddle'],
    nextRudiments: [],
    pfa: true,
  },

  // FLAM RUDIMENTS (continued)
  'flam-tap': {
    id: 'flam-tap',
    name: 'Flam Tap',
    category: 'flams',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.25 },
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.25 },
        { hand: 'R', accent: 'normal', timing: 0.25, duration: 0.25 },
        { hand: 'R', accent: 'ghost', timing: 0.48, duration: 0.25 },
        { hand: 'L', accent: 'accent', timing: 0.5, duration: 0.25 },
        { hand: 'L', accent: 'normal', timing: 0.75, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 120, target: 85 },
      difficulty: 3,
      stickingPattern: 'lRR rLL',
      description: 'Flam followed by a tap on the same hand',
    },
    variations: [],
    practiceNotes: ['Keep the tap at a lower volume than the flam', 'Grace note should be tight', 'Practice alternating hands'],
    commonMistakes: ['Tap too loud', 'Grace note too separated', 'Uneven flams between hands'],
    prerequisites: ['flam'],
    nextRudiments: ['flamacue'],
    pfa: true,
  },

  'flamacue': {
    id: 'flamacue',
    name: 'Flamacue',
    category: 'flams',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.2 },
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.2 },
        { hand: 'L', accent: 'normal', timing: 0.2, duration: 0.2 },
        { hand: 'R', accent: 'normal', timing: 0.4, duration: 0.2 },
        { hand: 'L', accent: 'accent', timing: 0.6, duration: 0.2 },
        { hand: 'R', accent: 'ghost', timing: 0.78, duration: 0.2 },
        { hand: 'L', accent: 'accent', timing: 0.8, duration: 0.2 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 110, target: 80 },
      difficulty: 4,
      stickingPattern: 'lRLR(L) rL',
      description: 'A flam pattern with accent on beat 4 and ending flam',
    },
    variations: [],
    practiceNotes: ['Two accents per measure', 'Keep grace notes tight', 'Practice the accent pattern separately'],
    commonMistakes: ['Missing the accent on beat 4', 'Sloppy grace notes', 'Rushing'],
    prerequisites: ['flam-accent', 'flam-tap'],
    nextRudiments: [],
    pfa: true,
  },

  'flam-paradiddle': {
    id: 'flam-paradiddle',
    name: 'Flam Paradiddle',
    category: 'flams',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.25 },
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.25 },
        { hand: 'L', accent: 'normal', timing: 0.25, duration: 0.25 },
        { hand: 'R', accent: 'normal', timing: 0.5, duration: 0.25 },
        { hand: 'R', accent: 'normal', timing: 0.75, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 120, target: 80 },
      difficulty: 3,
      stickingPattern: 'lR L RR',
      description: 'Flam followed by a paradiddle pattern',
    },
    variations: [],
    practiceNotes: ['Combine flam technique with paradiddle sticking', 'Accent the flam clearly', 'Keep the diddle even'],
    commonMistakes: ['Sloppy flam', 'Uneven double at the end', 'Rushing after the flam'],
    prerequisites: ['flam', 'single-paradiddle'],
    nextRudiments: ['flammed-mill'],
    pfa: true,
  },

  'flammed-mill': {
    id: 'flammed-mill',
    name: 'Flammed Mill',
    category: 'flams',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.25 },
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.25 },
        { hand: 'R', accent: 'normal', timing: 0.25, duration: 0.25 },
        { hand: 'L', accent: 'normal', timing: 0.5, duration: 0.25 },
        { hand: 'R', accent: 'normal', timing: 0.75, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 110, target: 75 },
      difficulty: 4,
      stickingPattern: 'lRRLR',
      description: 'Flam with inverted double stroke pattern',
    },
    variations: [],
    practiceNotes: ['The double follows the flam immediately', 'Keep grace note tight', 'Practice slowly for coordination'],
    commonMistakes: ['Double after flam is uneven', 'Grace note too loud', 'Losing the pattern flow'],
    prerequisites: ['flam-tap', 'single-paradiddle'],
    nextRudiments: [],
    pfa: true,
  },

  'flam-drag': {
    id: 'flam-drag',
    name: 'Flam Drag',
    category: 'flams',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.25 },
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.25 },
        { hand: 'L', accent: 'normal', timing: 0.25, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.375, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.5, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 110, target: 75 },
      difficulty: 4,
      stickingPattern: 'lR llR',
      description: 'Flam followed by a drag (double grace note) into a tap',
    },
    variations: [],
    practiceNotes: ['Combine flam and drag techniques', 'Keep drag notes light', 'Practice the two ornaments separately first'],
    commonMistakes: ['Drag too heavy', 'Flam too open', 'Rushing through the ornaments'],
    prerequisites: ['flam', 'drag'],
    nextRudiments: [],
    pfa: true,
  },

  'pataflafla': {
    id: 'pataflafla',
    name: 'Pataflafla',
    category: 'flams',
    pattern: {
      notes: [
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.25 },
        { hand: 'L', accent: 'normal', timing: 0.25, duration: 0.25 },
        { hand: 'R', accent: 'ghost', timing: 0.48, duration: 0.25 },
        { hand: 'L', accent: 'accent', timing: 0.5, duration: 0.25 },
        { hand: 'L', accent: 'ghost', timing: 0.73, duration: 0.25 },
        { hand: 'R', accent: 'accent', timing: 0.75, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 110, target: 75 },
      difficulty: 4,
      stickingPattern: 'RL rL lR',
      description: 'Alternating taps with two flams',
    },
    variations: [],
    practiceNotes: ['Two flams in succession', 'Keep taps between flams even', 'Practice flam-to-flam transitions'],
    commonMistakes: ['Flams become sloppy at speed', 'Uneven taps', 'Grace notes too loud'],
    prerequisites: ['flam-tap'],
    nextRudiments: [],
    pfa: true,
  },

  'swiss-army-triplet': {
    id: 'swiss-army-triplet',
    name: 'Swiss Army Triplet',
    category: 'flams',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.333 },
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.333 },
        { hand: 'R', accent: 'normal', timing: 0.333, duration: 0.333 },
        { hand: 'L', accent: 'normal', timing: 0.667, duration: 0.333 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 120, target: 80 },
      difficulty: 4,
      stickingPattern: 'lRRL',
      description: 'Flam followed by triplet sticking pattern',
    },
    variations: [],
    practiceNotes: ['Feel as triplets', 'Tight flam on beat one', 'Keep the triplet even'],
    commonMistakes: ['Not feeling the triplet', 'Sloppy flam', 'Uneven triplet spacing'],
    prerequisites: ['flam-accent'],
    nextRudiments: [],
    pfa: true,
  },

  'inverted-flam-tap': {
    id: 'inverted-flam-tap',
    name: 'Inverted Flam Tap',
    category: 'flams',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.25 },
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.25 },
        { hand: 'R', accent: 'normal', timing: 0.25, duration: 0.25 },
        { hand: 'L', accent: 'ghost', timing: 0.48, duration: 0.25 },
        { hand: 'R', accent: 'accent', timing: 0.5, duration: 0.25 },
        { hand: 'L', accent: 'normal', timing: 0.75, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 110, target: 75 },
      difficulty: 4,
      stickingPattern: 'lRR lRL',
      description: 'Flam taps with inverted sticking',
    },
    variations: [],
    practiceNotes: ['Focus on the inverted sticking', 'Keep flams consistent', 'Practice slowly'],
    commonMistakes: ['Confusing sticking order', 'Inconsistent flams', 'Rushing'],
    prerequisites: ['flam-tap'],
    nextRudiments: [],
    pfa: true,
  },

  // DRAG RUDIMENTS
  'drag': {
    id: 'drag',
    name: 'Drag (Ruff)',
    category: 'drags',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.04, duration: 0.125 },
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.125 },
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 120, target: 80 },
      difficulty: 2,
      stickingPattern: 'llR',
      description: 'Two grace notes (drag) followed by an accented note',
    },
    variations: [],
    practiceNotes: ['Grace notes should be very quiet and close together', 'The accent should be strong', 'Practice on both hands'],
    commonMistakes: ['Grace notes too loud', 'Too much space before accent', 'Uncontrolled bounce'],
    prerequisites: ['double-stroke-roll'],
    nextRudiments: ['single-drag-tap', 'double-drag-tap'],
    pfa: true,
  },

  'single-drag-tap': {
    id: 'single-drag-tap',
    name: 'Single Drag Tap',
    category: 'drags',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.04, duration: 0.125 },
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.125 },
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.25 },
        { hand: 'L', accent: 'normal', timing: 0.5, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 60, max: 120, target: 85 },
      difficulty: 3,
      stickingPattern: 'llR L',
      description: 'Drag followed by tap on opposite hand',
    },
    variations: [],
    practiceNotes: ['Keep drag grace notes light', 'Even spacing between accent and tap', 'Practice both hand leads'],
    commonMistakes: ['Drag too heavy', 'Tap too close to accent', 'Uneven hand volumes'],
    prerequisites: ['drag'],
    nextRudiments: ['double-drag-tap'],
    pfa: true,
  },

  'double-drag-tap': {
    id: 'double-drag-tap',
    name: 'Double Drag Tap',
    category: 'drags',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.04, duration: 0.125 },
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.125 },
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.2 },
        { hand: 'R', accent: 'ghost', timing: 0.18, duration: 0.125 },
        { hand: 'R', accent: 'ghost', timing: 0.2, duration: 0.125 },
        { hand: 'L', accent: 'accent', timing: 0.4, duration: 0.2 },
        { hand: 'R', accent: 'normal', timing: 0.6, duration: 0.2 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 110, target: 75 },
      difficulty: 3,
      stickingPattern: 'llR rrL R',
      description: 'Two drags followed by a tap',
    },
    variations: [],
    practiceNotes: ['Two consecutive drags alternating hands', 'Keep all grace notes light', 'Final tap should be mezzo-forte'],
    commonMistakes: ['Grace notes too heavy', 'Second drag rushed', 'Losing control of the sticking'],
    prerequisites: ['single-drag-tap'],
    nextRudiments: ['lesson-25'],
    pfa: true,
  },

  'lesson-25': {
    id: 'lesson-25',
    name: 'Lesson 25',
    category: 'drags',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.04, duration: 0.125 },
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.125 },
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.333 },
        { hand: 'L', accent: 'normal', timing: 0.333, duration: 0.333 },
        { hand: 'R', accent: 'normal', timing: 0.667, duration: 0.333 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 110, target: 80 },
      difficulty: 3,
      stickingPattern: 'llRLR',
      description: 'Drag followed by two alternating singles in triplet feel',
    },
    variations: [],
    practiceNotes: ['Feel as triplets', 'Drag grace notes should be soft', 'Practice at various tempos'],
    commonMistakes: ['Not feeling the triplet rhythm', 'Drag too heavy', 'Uneven singles after drag'],
    prerequisites: ['drag', 'single-stroke-roll'],
    nextRudiments: [],
    pfa: true,
  },

  'single-dragadiddle': {
    id: 'single-dragadiddle',
    name: 'Single Dragadiddle',
    category: 'drags',
    pattern: {
      notes: [
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.25 },
        { hand: 'R', accent: 'ghost', timing: 0.23, duration: 0.125 },
        { hand: 'R', accent: 'ghost', timing: 0.25, duration: 0.125 },
        { hand: 'L', accent: 'accent', timing: 0.5, duration: 0.25 },
        { hand: 'L', accent: 'normal', timing: 0.75, duration: 0.25 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 110, target: 80 },
      difficulty: 4,
      stickingPattern: 'R rrL L',
      description: 'Single stroke, drag, accent, and a tap',
    },
    variations: [],
    practiceNotes: ['Combine drag and paradiddle concepts', 'Keep the drag light', 'Practice both hand leads'],
    commonMistakes: ['Drag too prominent', 'Losing the paradiddle feel', 'Uneven spacing'],
    prerequisites: ['drag', 'single-paradiddle'],
    nextRudiments: [],
    pfa: true,
  },

  'drag-paradiddle-1': {
    id: 'drag-paradiddle-1',
    name: 'Drag Paradiddle #1',
    category: 'drags',
    pattern: {
      notes: [
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.2 },
        { hand: 'L', accent: 'ghost', timing: 0.18, duration: 0.1 },
        { hand: 'L', accent: 'ghost', timing: 0.2, duration: 0.1 },
        { hand: 'R', accent: 'normal', timing: 0.4, duration: 0.2 },
        { hand: 'L', accent: 'normal', timing: 0.6, duration: 0.2 },
        { hand: 'R', accent: 'normal', timing: 0.8, duration: 0.1 },
        { hand: 'R', accent: 'normal', timing: 0.9, duration: 0.1 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 110, target: 75 },
      difficulty: 4,
      stickingPattern: 'R llRLRR',
      description: 'Accent, drag, and paradiddle combined',
    },
    variations: [],
    practiceNotes: ['Accent the first note', 'Keep drag grace notes quiet', 'Double at end should be even'],
    commonMistakes: ['Drag overwhelms the pattern', 'Missing the accent', 'Uneven double'],
    prerequisites: ['drag', 'single-paradiddle'],
    nextRudiments: ['drag-paradiddle-2'],
    pfa: true,
  },

  'drag-paradiddle-2': {
    id: 'drag-paradiddle-2',
    name: 'Drag Paradiddle #2',
    category: 'drags',
    pattern: {
      notes: [
        { hand: 'R', accent: 'accent', timing: 0, duration: 0.167 },
        { hand: 'L', accent: 'ghost', timing: 0.14, duration: 0.08 },
        { hand: 'L', accent: 'ghost', timing: 0.167, duration: 0.08 },
        { hand: 'R', accent: 'normal', timing: 0.333, duration: 0.167 },
        { hand: 'L', accent: 'normal', timing: 0.5, duration: 0.167 },
        { hand: 'R', accent: 'normal', timing: 0.667, duration: 0.167 },
        { hand: 'L', accent: 'normal', timing: 0.833, duration: 0.083 },
        { hand: 'L', accent: 'normal', timing: 0.917, duration: 0.083 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 100, target: 70 },
      difficulty: 4,
      stickingPattern: 'R llRLRLL',
      description: 'Extended drag paradiddle with two doubles',
    },
    variations: [],
    practiceNotes: ['More complex than #1', 'Focus on the double at the end', 'Keep drag consistent'],
    commonMistakes: ['Getting lost in the pattern', 'Drag too heavy', 'Second double rushed'],
    prerequisites: ['drag-paradiddle-1'],
    nextRudiments: [],
    pfa: true,
  },

  // RATAMACUE RUDIMENTS
  'single-ratamacue': {
    id: 'single-ratamacue',
    name: 'Single Ratamacue',
    category: 'ratamacues',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.04, duration: 0.125 },
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.333 },
        { hand: 'L', accent: 'normal', timing: 0.333, duration: 0.333 },
        { hand: 'R', accent: 'accent', timing: 0.667, duration: 0.333 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 120, target: 80 },
      difficulty: 3,
      stickingPattern: 'llRLR',
      description: 'Drag followed by triplet singles with accent on the last note',
    },
    variations: [],
    practiceNotes: ['Feel as triplets', 'Accent the last note', 'Drag should be soft and quick'],
    commonMistakes: ['Drag too heavy', 'Missing the final accent', 'Not feeling the triplet'],
    prerequisites: ['drag', 'single-stroke-roll'],
    nextRudiments: ['double-ratamacue', 'triple-ratamacue'],
    pfa: true,
  },

  'double-ratamacue': {
    id: 'double-ratamacue',
    name: 'Double Ratamacue',
    category: 'ratamacues',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.04, duration: 0.1 },
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.1 },
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.167 },
        { hand: 'L', accent: 'normal', timing: 0.167, duration: 0.167 },
        { hand: 'R', accent: 'ghost', timing: 0.31, duration: 0.1 },
        { hand: 'R', accent: 'ghost', timing: 0.333, duration: 0.1 },
        { hand: 'L', accent: 'normal', timing: 0.5, duration: 0.167 },
        { hand: 'R', accent: 'normal', timing: 0.667, duration: 0.167 },
        { hand: 'L', accent: 'accent', timing: 0.833, duration: 0.167 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 50, max: 110, target: 75 },
      difficulty: 4,
      stickingPattern: 'llRL rrLRL',
      description: 'Two drags with triplet singles and final accent',
    },
    variations: [],
    practiceNotes: ['Two drags in succession', 'Keep triplet feel throughout', 'Strong final accent'],
    commonMistakes: ['Drags too heavy', 'Losing triplet feel', 'Weak ending accent'],
    prerequisites: ['single-ratamacue'],
    nextRudiments: ['triple-ratamacue'],
    pfa: true,
  },

  'triple-ratamacue': {
    id: 'triple-ratamacue',
    name: 'Triple Ratamacue',
    category: 'ratamacues',
    pattern: {
      notes: [
        { hand: 'L', accent: 'ghost', timing: -0.04, duration: 0.08 },
        { hand: 'L', accent: 'ghost', timing: -0.02, duration: 0.08 },
        { hand: 'R', accent: 'normal', timing: 0, duration: 0.125 },
        { hand: 'L', accent: 'normal', timing: 0.125, duration: 0.125 },
        { hand: 'R', accent: 'ghost', timing: 0.23, duration: 0.08 },
        { hand: 'R', accent: 'ghost', timing: 0.25, duration: 0.08 },
        { hand: 'L', accent: 'normal', timing: 0.375, duration: 0.125 },
        { hand: 'R', accent: 'normal', timing: 0.5, duration: 0.125 },
        { hand: 'L', accent: 'ghost', timing: 0.6, duration: 0.08 },
        { hand: 'L', accent: 'ghost', timing: 0.625, duration: 0.08 },
        { hand: 'R', accent: 'normal', timing: 0.75, duration: 0.125 },
        { hand: 'L', accent: 'accent', timing: 0.875, duration: 0.125 },
      ],
      timeSignature: [4, 4],
      suggestedTempo: { min: 40, max: 100, target: 65 },
      difficulty: 5,
      stickingPattern: 'llRL rrLR llRL',
      description: 'Three drags with alternating singles and final accent',
    },
    variations: [],
    practiceNotes: ['The most complex ratamacue', 'Practice each drag transition separately', 'Build speed very gradually'],
    commonMistakes: ['Getting lost in the pattern', 'Drags become uncontrolled', 'Losing the triplet feel'],
    prerequisites: ['double-ratamacue'],
    nextRudiments: [],
    pfa: true,
  },

  // DIDDLE RUDIMENTS
  'single-stroke-roll-4-variant': {
    id: 'single-stroke-roll-4-variant',
    name: 'Long Roll (Double Stroke Open)',
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
      stickingPattern: 'RRLLRRLL (open)',
      description: 'Open double stroke roll — the foundation of all rolls',
    },
    variations: [],
    practiceNotes: ['Start open (slow) and gradually close', 'Each stroke should be even', 'The basis for all measured rolls'],
    commonMistakes: ['Second stroke too quiet', 'Uneven spacing', 'Tension in the hands'],
    prerequisites: ['double-stroke-roll'],
    nextRudiments: ['five-stroke-roll'],
    pfa: true,
  },
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