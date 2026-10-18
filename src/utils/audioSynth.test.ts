import test from 'node:test';
import assert from 'node:assert/strict';
import { PENTATONIC_SCALE, LULLABY_SEQUENCE, getMidiFrequency } from './audioSynth.ts';

test('PENTATONIC_SCALE frequencies are ordered and accurate', () => {
  assert.ok(PENTATONIC_SCALE.C4 > 260 && PENTATONIC_SCALE.C4 < 262);
  assert.ok(PENTATONIC_SCALE.E4 > PENTATONIC_SCALE.D4);
  assert.ok(PENTATONIC_SCALE.G4 > PENTATONIC_SCALE.E4);
  assert.ok(PENTATONIC_SCALE.C5 > PENTATONIC_SCALE.A4);
});

test('LULLABY_SEQUENCE contains valid notes and positive durations', () => {
  assert.ok(LULLABY_SEQUENCE.length > 8);
  for (const item of LULLABY_SEQUENCE) {
    assert.ok(PENTATONIC_SCALE[item.note] !== undefined);
    assert.ok(item.dur > 0);
    assert.ok(item.rest >= 0);
  }
});

test('getMidiFrequency calculates 440Hz for A4 (offset 0) and 880Hz for +12', () => {
  assert.equal(Math.round(getMidiFrequency(0)), 440);
  assert.equal(Math.round(getMidiFrequency(12)), 880);
  assert.equal(Math.round(getMidiFrequency(-12)), 220);
});
