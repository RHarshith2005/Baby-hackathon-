import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPacketCaught,
  calculateCatchScore,
  determineGameMood,
  createPacketData,
} from './packetRules.ts';

test('isPacketCaught returns true when packet is within hitzone and x bounds', () => {
  const packetIn = { x: 50, y: 80 };
  const caught = isPacketCaught(packetIn, 50, 18, 75, 92);
  assert.equal(caught, true);

  const packetLeft = { x: 42, y: 80 };
  assert.equal(isPacketCaught(packetLeft, 50, 18), true);

  const packetTooFarLeft = { x: 39, y: 80 };
  assert.equal(isPacketCaught(packetTooFarLeft, 50, 18), false);

  const packetTooHigh = { x: 50, y: 60 };
  assert.equal(isPacketCaught(packetTooHigh, 50, 18), false);

  const packetTooLow = { x: 50, y: 95 };
  assert.equal(isPacketCaught(packetTooLow, 50, 18), false);
});

test('calculateCatchScore applies combo multipliers for streaks', () => {
  // First catch: streak = 0 -> streak becomes 1, no multiplier (1.0x)
  const r1 = calculateCatchScore(0, 0, 10);
  assert.equal(r1.score, 10);
  assert.equal(r1.streak, 1);
  assert.equal(r1.earned, 10);

  // Streak 5 -> multiplier = 1 + floor(5/5)*0.5 = 1.5x
  const r2 = calculateCatchScore(100, 5, 20);
  assert.equal(r2.earned, 30);
  assert.equal(r2.score, 130);
  assert.equal(r2.streak, 6);

  // Negative points (bitrot) resets streak and deducts
  const r3 = calculateCatchScore(50, 8, -15);
  assert.equal(r3.score, 35);
  assert.equal(r3.streak, 0);

  // Score cannot go below 0
  const r4 = calculateCatchScore(5, 0, -20);
  assert.equal(r4.score, 0);
});

test('determineGameMood transitions correctly based on score and game state', () => {
  assert.equal(determineGameMood(0, 0, false), 'shy');
  assert.equal(determineGameMood(60, 2, false), 'excited');
  assert.equal(determineGameMood(30, 4, false), 'excited');
  assert.equal(determineGameMood(250, 0, false), 'glitchy');
  assert.equal(determineGameMood(10, 8, false), 'glitchy');
  assert.equal(determineGameMood(300, 10, true), 'sleepy');
});

test('createPacketData generates valid packet specs', () => {
  const p1 = createPacketData(3, 1, 0);
  assert.ok(p1.id.startsWith('pkt-'));
  assert.ok(p1.x >= 0 && p1.x <= 100);
  assert.ok(p1.speed > 0);
  assert.ok(['hello', 'ping', 'sparkle', 'bitrot'].includes(p1.type));
});
