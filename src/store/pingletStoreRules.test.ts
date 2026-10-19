import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCareDecay,
  applyCareActivity,
  checkStampsToAward,
  formatVisitorGreeting,
  encodeLullabyPattern,
  decodeLullabyPattern,
  PASSPORT_STAMPS,
  type CareStats,
} from './pingletStoreRules.ts';

test('PASSPORT_STAMPS contains exactly 10 distinct stamps', () => {
  assert.equal(PASSPORT_STAMPS.length, 10);
  const ids = new Set(PASSPORT_STAMPS.map((s) => s.id));
  assert.equal(ids.size, 10);
  assert.ok(PASSPORT_STAMPS.some((s) => s.id === 'secret_finder' && s.isSecret));
});

test('computeCareDecay clamps stats between floor 15 and ceiling 100', () => {
  const base: CareStats = { tummy: 90, cozy: 85, joy: 95 };

  // 0ms decay
  const zero = computeCareDecay(base, 0);
  assert.deepEqual(zero, base);

  // 15 minutes (900,000ms) = 6 decay points
  const decayed = computeCareDecay(base, 900 * 1000);
  assert.ok(decayed.tummy < base.tummy);
  assert.ok(decayed.cozy < base.cozy);
  assert.ok(decayed.joy < base.joy);

  // Extreme time (10 days) should never drop below floor of 15
  const extreme = computeCareDecay(base, 10 * 24 * 3600 * 1000);
  assert.equal(extreme.tummy, 15);
  assert.equal(extreme.cozy, 15);
  assert.equal(extreme.joy, 15);
});

test('applyCareActivity increases relevant stats safely', () => {
  const low: CareStats = { tummy: 20, cozy: 20, joy: 20 };

  const fed = applyCareActivity(low, 'feed');
  assert.equal(fed.tummy, 40);

  const pet = applyCareActivity(low, 'pet');
  assert.equal(pet.joy, 30);
  assert.equal(pet.cozy, 26);

  const tickled = applyCareActivity(low, 'tickle');
  assert.equal(tickled.joy, 28);
  assert.equal(tickled.cozy, 17); // -3 floor respected
});

test('checkStampsToAward detects newly unlocked stamps without duplicates', () => {
  // Fresh state
  const s1 = checkStampsToAward('talked', []);
  assert.deepEqual(s1, ['first_hello']);

  // Already unlocked
  const s2 = checkStampsToAward('talked', ['first_hello']);
  assert.deepEqual(s2, []);

  // Score threshold for packet_pro
  const scoreLow = checkStampsToAward('playedRound', [], { score: 120 });
  assert.deepEqual(scoreLow, []);

  const scoreHigh = checkStampsToAward('playedRound', [], { score: 170 });
  assert.deepEqual(scoreHigh, ['packet_pro']);
});

test('formatVisitorGreeting differentiates first visit from return visitor', () => {
  const stats: CareStats = { tummy: 80, cozy: 80, joy: 80 };
  const first = formatVisitorGreeting(null, Date.now(), stats, 0, 4042);
  assert.equal(first.isFirstVisit, true);
  assert.ok(first.title.includes('baby ghost'));

  const returning = formatVisitorGreeting(Date.now() - 3600000, Date.now(), stats, 100, 4042);
  assert.equal(returning.isFirstVisit, false);
  assert.equal(returning.title, "You're back!");
});

test('encodeLullabyPattern and decodeLullabyPattern roundtrip correctly', () => {
  const emptyGrid: boolean[][] = Array.from({ length: 6 }, () => Array(8).fill(false));
  emptyGrid[0][0] = true;
  emptyGrid[2][4] = true;
  emptyGrid[5][7] = true;

  const encoded = encodeLullabyPattern(emptyGrid, 120);
  assert.ok(encoded.startsWith('lullaby='));

  const decoded = decodeLullabyPattern(encoded);
  assert.ok(decoded !== null);
  assert.equal(decoded.tempo, 120);
  assert.equal(decoded.grid[0][0], true);
  assert.equal(decoded.grid[2][4], true);
  assert.equal(decoded.grid[5][7], true);
  assert.equal(decoded.grid[1][1], false);
});
