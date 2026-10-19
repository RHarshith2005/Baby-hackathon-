import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isHeadZone,
  isBellyZone,
  detectGesture,
  calculateBlushMultiplier,
  shouldTriggerSugarRush,
  type TouchSample,
} from './toyTouchRules.ts';

test('isHeadZone and isBellyZone segment character vertically', () => {
  assert.equal(isHeadZone(0.2), true);
  assert.equal(isHeadZone(0.47), true);
  assert.equal(isHeadZone(0.55), false);

  assert.equal(isBellyZone(0.2), false);
  assert.equal(isBellyZone(0.55), true);
  assert.equal(isBellyZone(0.9), true);
});

test('detectGesture classifies pet on head zone with slow drag / long press', () => {
  const headSamples: TouchSample[] = [
    { x: 100, y: 50, time: 0 },
    { x: 105, y: 52, time: 100 },
    { x: 108, y: 50, time: 200 },
    { x: 104, y: 48, time: 300 },
    { x: 100, y: 50, time: 420 },
    { x: 98, y: 51, time: 450 },
  ];
  assert.equal(detectGesture(headSamples, true, 450), 'pet');
});

test('detectGesture classifies tickle on belly with side-to-side reversals', () => {
  const bellyTickle: TouchSample[] = [
    { x: 100, y: 150, time: 0 },
    { x: 125, y: 152, time: 60 },
    { x: 95, y: 151, time: 120 },
    { x: 130, y: 153, time: 180 },
    { x: 90, y: 150, time: 240 },
  ];
  assert.equal(detectGesture(bellyTickle, false, 240), 'tickle');
});

test('detectGesture classifies quick poke on belly', () => {
  const pokeSamples: TouchSample[] = [
    { x: 100, y: 150, time: 0 },
    { x: 102, y: 151, time: 80 },
  ];
  assert.equal(detectGesture(pokeSamples, false, 80), 'poke');
});

test('calculateBlushMultiplier intensifies for stop_it, pet, and rapid pokes', () => {
  assert.equal(calculateBlushMultiplier('idle', 0), 1.0);
  assert.equal(calculateBlushMultiplier('stop_it', 0), 2.4);
  assert.equal(calculateBlushMultiplier('petting', 0), 1.85);

  const pokeBlush1 = calculateBlushMultiplier('poked', 1);
  const pokeBlush3 = calculateBlushMultiplier('poked', 3);
  assert.ok(pokeBlush3 > pokeBlush1);
  assert.ok(pokeBlush3 <= 2.2);
});

test('shouldTriggerSugarRush triggers at 5 candies', () => {
  assert.equal(shouldTriggerSugarRush(4), false);
  assert.equal(shouldTriggerSugarRush(5), true);
  assert.equal(shouldTriggerSugarRush(6), true);
});
