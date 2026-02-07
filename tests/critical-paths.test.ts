/**
 * Critical Path Tests for Repo Drum
 * 
 * Tests the most important functionality:
 * 1. Spaced repetition algorithm (SM-2)
 * 2. Pattern library structure
 * 3. Progression system
 * 4. Audiation syllables
 */

// Test colors
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const cyan = '\x1b[36m';
const reset = '\x1b[0m';

let passCount = 0;
let failCount = 0;

function test(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`${green}✓${reset} ${name}`);
    passCount++;
  } else {
    console.log(`${red}✗${reset} ${name}${detail ? ` - ${detail}` : ''}`);
    failCount++;
  }
}

function section(name: string) {
  console.log(`\n${yellow}━━━ ${name} ━━━${reset}\n`);
}

// ============================================================================
// SPACED REPETITION TESTS (from test-spaced-repetition.ts)
// ============================================================================

import { 
  calculateSM2, 
  DRUM_PATTERNS, 
  QUALITY_RATINGS,
  SIMPLE_RATINGS 
} from '../app/drum/_lib/spacedRepetition';

function testSM2Algorithm() {
  section('SM-2 Algorithm');
  
  // First correct response
  const first = calculateSM2(4, 0, 2.5, 1);
  test('First correct: interval = 1', first.newInterval === 1);
  test('First correct: repetitions = 1', first.newRepetitions === 1);
  test('First correct: ease factor in range', first.newEaseFactor >= 1.3 && first.newEaseFactor <= 3.0);
  
  // Second correct response
  const second = calculateSM2(4, 1, 2.5, 1);
  test('Second correct: interval = 6', second.newInterval === 6);
  test('Second correct: repetitions = 2', second.newRepetitions === 2);
  
  // Incorrect response resets
  const incorrect = calculateSM2(2, 5, 2.5, 30);
  test('Incorrect: resets repetitions', incorrect.newRepetitions === 0);
  test('Incorrect: resets interval to 1', incorrect.newInterval === 1);
  
  // Perfect score improves ease
  const perfect = calculateSM2(5, 1, 2.5, 6);
  test('Perfect score: ease factor increases', perfect.newEaseFactor > 2.5);
  
  // Minimum ease factor
  const difficult = calculateSM2(0, 0, 1.3, 1);
  test('Minimum ease factor enforced', difficult.newEaseFactor >= 1.3);
}

function testPatternLibrary() {
  section('Pattern Library');
  
  test('Has patterns defined', DRUM_PATTERNS.length > 0);
  test('Has sufficient patterns', DRUM_PATTERNS.length >= 10, `Got ${DRUM_PATTERNS.length}`);
  
  // Check structure
  const pattern = DRUM_PATTERNS[0];
  test('Patterns have id', typeof pattern.id === 'string');
  test('Patterns have name', typeof pattern.name === 'string');
  test('Patterns have module', typeof pattern.module === 'number');
  test('Patterns have description', typeof pattern.description === 'string');
  
  // Unique IDs
  const ids = DRUM_PATTERNS.map(p => p.id);
  test('All IDs unique', new Set(ids).size === ids.length);
  
  // Valid modules
  test('All modules 1-4', DRUM_PATTERNS.every(p => p.module >= 1 && p.module <= 4));
  
  // Module coverage
  const modules = new Set(DRUM_PATTERNS.map(p => p.module));
  test('Has Module 1 patterns', modules.has(1));
  test('Has Module 2 patterns', modules.has(2));
  test('Has Module 3 patterns', modules.has(3));
  test('Has Module 4 patterns', modules.has(4));
}

function testQualityRatings() {
  section('Quality Rating System');
  
  test('Has 6 quality ratings', QUALITY_RATINGS.length === 6);
  test('Ratings have values 0-5', QUALITY_RATINGS.every(r => r.value >= 0 && r.value <= 5));
  test('All have labels', QUALITY_RATINGS.every(r => r.label && r.description && r.emoji));
  
  // Simple ratings for UI
  test('Has simple ratings', SIMPLE_RATINGS.length >= 2);
  test('Simple ratings have quality values', SIMPLE_RATINGS.every(r => typeof r.quality === 'number'));
  test('Simple ratings have labels', SIMPLE_RATINGS.every(r => r.label && r.emoji));
}

// ============================================================================
// PATTERN LIBRARY TESTS
// ============================================================================

import { DRUM_PATTERNS as PATTERNS, getPatternsByDifficulty, getPatternsByCategory, getRecommendedPatterns } from '../app/drum/_lib/patternLibrary';

function testExtendedPatternLibrary() {
  section('Extended Pattern Library');
  
  if (!PATTERNS) {
    console.log(`${cyan}Extended pattern library not loaded${reset}`);
    return;
  }
  
  test('Has extended patterns', PATTERNS.length > 0);
  test('Has 20+ patterns', PATTERNS.length >= 20, `Got ${PATTERNS.length}`);
  
  // Check pattern structure
  const pattern = PATTERNS[0];
  test('Has id', typeof pattern.id === 'string');
  test('Has name', typeof pattern.name === 'string');
  test('Has category', typeof pattern.category === 'string');
  test('Has difficulty', typeof pattern.difficulty === 'number');
  test('Has syllables', typeof pattern.syllables === 'string');
  
  // Categories
  const categories = new Set(PATTERNS.map(p => p.category));
  test('Has multiple categories', categories.size >= 5, `Got ${categories.size}`);
  
  // Difficulty levels
  const difficulties = new Set(PATTERNS.map(p => p.difficulty));
  test('Has multiple difficulty levels', difficulties.size >= 3);
  
  // Test getPatternsByDifficulty
  if (getPatternsByDifficulty) {
    const level1 = getPatternsByDifficulty(1);
    test('getPatternsByDifficulty works', level1.length > 0);
    test('Returns correct difficulty', level1.every(p => p.difficulty === 1));
  }
  
  // Test getPatternsByCategory
  if (getPatternsByCategory) {
    const rockPatterns = getPatternsByCategory('rock');
    test('getPatternsByCategory works', rockPatterns.length >= 0);
  }
  
  // Test getRecommendedPatterns
  if (getRecommendedPatterns) {
    const recommended = getRecommendedPatterns('beginner', ['quarters']);
    test('getRecommendedPatterns works', Array.isArray(recommended));
  }
}

// ============================================================================
// INTERVAL PROGRESSION TESTS
// ============================================================================

function testIntervalProgression() {
  section('Learning Progression');
  
  // Simulate consistent good practice
  let rep = 0;
  let ef = 2.5;
  let interval = 1;
  const intervals: number[] = [];
  
  for (let i = 0; i < 8; i++) {
    const result = calculateSM2(4, rep, ef, interval);
    rep = result.newRepetitions;
    ef = result.newEaseFactor;
    interval = result.newInterval;
    intervals.push(interval);
  }
  
  test('Intervals increase over time', intervals[7] > intervals[0]);
  test('Week 1: daily review', intervals[0] === 1);
  test('Week 2: ~weekly review', intervals[1] === 6);
  test('Long-term: monthly+', intervals[7] > 30, `Got ${intervals[7]} days`);
  
  // Test struggling student pattern
  let struggleRep = 0;
  let struggleEf = 2.5;
  let struggleInt = 1;
  
  // Good, good, bad pattern
  const result1 = calculateSM2(4, struggleRep, struggleEf, struggleInt);  // Good
  struggleRep = result1.newRepetitions;
  struggleEf = result1.newEaseFactor;
  struggleInt = result1.newInterval;
  
  const result2 = calculateSM2(4, struggleRep, struggleEf, struggleInt);  // Good
  struggleRep = result2.newRepetitions;
  const efBeforeFailure = result2.newEaseFactor;  // Save ease factor before failure
  struggleInt = result2.newInterval;
  
  const result3 = calculateSM2(2, struggleRep, efBeforeFailure, struggleInt);  // Bad - reset
  
  test('Incorrect response resets progress', result3.newRepetitions === 0);
  test('Incorrect response resets to day 1', result3.newInterval === 1);
  test('Ease factor decreases on failure', result3.newEaseFactor < efBeforeFailure);
}

// ============================================================================
// EDGE CASES
// ============================================================================

function testEdgeCases() {
  section('Edge Cases');
  
  // Very high ease factor
  const highEf = calculateSM2(5, 10, 3.0, 100);
  test('High EF works', highEf.newInterval > 100);
  
  // Quality clamping
  const highQ = calculateSM2(10, 0, 2.5, 1);  // Should clamp to 5
  test('Quality clamped to max 5', highQ.newRepetitions === 1);
  
  const lowQ = calculateSM2(-5, 0, 2.5, 1);  // Should clamp to 0
  test('Quality clamped to min 0', lowQ.newRepetitions === 0);
  
  // Very long intervals
  const longInt = calculateSM2(4, 50, 2.5, 365);
  test('Long intervals handled', longInt.newInterval > 0);
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

function runAllTests() {
  console.log(`${cyan}Repo Drum Critical Path Tests${reset}\n`);
  console.log('='.repeat(50));
  
  try {
    testSM2Algorithm();
    testPatternLibrary();
    testQualityRatings();
    testExtendedPatternLibrary();
    testIntervalProgression();
    testEdgeCases();
  } catch (error: any) {
    console.log(`\n${red}Test error: ${error.message}${reset}`);
    failCount++;
  }
  
  section('Summary');
  console.log(`\nTotal: ${passCount + failCount} tests`);
  console.log(`${green}Passed: ${passCount}${reset}`);
  console.log(`${red}Failed: ${failCount}${reset}`);
  
  if (failCount > 0) {
    process.exit(1);
  }
}

runAllTests();
