/**
 * Spaced Repetition End-to-End Test
 * Tests the SM-2 algorithm and database operations
 */

import { calculateSM2, DRUM_PATTERNS, QUALITY_RATINGS } from './app/drum/_lib/spacedRepetition';

// Test colors
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
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
// SM-2 ALGORITHM TESTS
// ============================================================================
section('SM-2 Algorithm - Core Logic');

// Test 1: First correct response (quality 3-5)
const first = calculateSM2(4, 0, 2.5, 1);
test('First correct: interval = 1 day', first.newInterval === 1);
test('First correct: repetitions = 1', first.newRepetitions === 1);
test('First correct: ease factor adjusted', first.newEaseFactor >= 1.3 && first.newEaseFactor <= 3.0);

// Test 2: Second correct response
const second = calculateSM2(4, 1, 2.5, 1);
test('Second correct: interval = 6 days', second.newInterval === 6);
test('Second correct: repetitions = 2', second.newRepetitions === 2);

// Test 3: Third+ correct response (uses ease factor)
const third = calculateSM2(4, 2, 2.5, 6);
test('Third correct: interval > 6 days', third.newInterval > 6);
test('Third correct: interval calculated with EF', third.newInterval === Math.round(6 * 2.5)); // 15

// Test 4: Incorrect response resets progress
const incorrect = calculateSM2(2, 5, 2.5, 30);
test('Incorrect: resets repetitions to 0', incorrect.newRepetitions === 0);
test('Incorrect: resets interval to 1 day', incorrect.newInterval === 1);
test('Incorrect: ease factor decreases', incorrect.newEaseFactor < 2.5);

// Test 5: Perfect score (5) improves ease factor
const perfect = calculateSM2(5, 1, 2.5, 6);
test('Perfect score: ease factor increases', perfect.newEaseFactor > 2.5);

// Test 6: Minimum ease factor (1.3)
const difficult = calculateSM2(0, 0, 1.3, 1);
test('Minimum ease factor enforced (1.3)', difficult.newEaseFactor >= 1.3);

// Test 7: Quality clamping
const highQuality = calculateSM2(10, 0, 2.5, 1); // Should clamp to 5
test('Quality clamped to max 5', highQuality.newRepetitions === 1); // 5 is correct, so rep++
const lowQuality = calculateSM2(-5, 0, 2.5, 1); // Should clamp to 0
test('Quality clamped to min 0', lowQuality.newRepetitions === 0); // 0 is incorrect, reset

// ============================================================================
// INTERVAL PROGRESSION TEST
// ============================================================================
section('SM-2 Algorithm - Long-term Progression');

// Simulate learning a pattern with consistent quality 4 responses
let rep = 0;
let ef = 2.5;
let interval = 1;
const intervals: number[] = [];

for (let i = 0; i < 10; i++) {
  const result = calculateSM2(4, rep, ef, interval);
  rep = result.newRepetitions;
  ef = result.newEaseFactor;
  interval = result.newInterval;
  intervals.push(interval);
}

console.log('Interval progression (10 correct q=4 reviews):', intervals.join(' → '));
test('Intervals increase over time', intervals[9] > intervals[0]);
test('Final interval > 30 days', intervals[9] > 30, `Got ${intervals[9]}`);

// ============================================================================
// PATTERN DEFINITIONS TEST
// ============================================================================
section('Pattern Library - Structure');

test('Has drum patterns defined', DRUM_PATTERNS.length > 0);
test('Has at least 10 patterns', DRUM_PATTERNS.length >= 10, `Got ${DRUM_PATTERNS.length}`);

// Check pattern structure
const firstPattern = DRUM_PATTERNS[0];
test('Patterns have id', typeof firstPattern.id === 'string');
test('Patterns have name', typeof firstPattern.name === 'string');
test('Patterns have module number', typeof firstPattern.module === 'number');
test('Patterns have description', typeof firstPattern.description === 'string');

// Check all patterns have unique IDs
const ids = DRUM_PATTERNS.map(p => p.id);
const uniqueIds = new Set(ids);
test('All pattern IDs are unique', ids.length === uniqueIds.size);

// Check modules are valid
const modules = DRUM_PATTERNS.map(p => p.module);
test('All modules are 1-4', modules.every(m => m >= 1 && m <= 4));

// ============================================================================
// QUALITY RATINGS TEST
// ============================================================================
section('Quality Ratings - Structure');

test('Has quality ratings defined', QUALITY_RATINGS.length === 6);
test('Quality values are 0-5', QUALITY_RATINGS.every(r => r.value >= 0 && r.value <= 5));
test('All ratings have labels', QUALITY_RATINGS.every(r => r.label && r.description && r.emoji));

// ============================================================================
// EDGE CASES
// ============================================================================
section('Edge Cases');

// Very high ease factor
const highEF = calculateSM2(5, 10, 3.0, 100);
test('High EF calculation works', highEF.newInterval > 100);

// Very long interval
const longInterval = calculateSM2(4, 50, 2.5, 365);
test('Long interval calculation works', longInterval.newInterval > 0);

// ============================================================================
// SUMMARY
// ============================================================================
section('Summary');

console.log(`\nTotal: ${passCount + failCount} tests`);
console.log(`${green}Passed: ${passCount}${reset}`);
console.log(`${red}Failed: ${failCount}${reset}`);

if (failCount > 0) {
  process.exit(1);
}
