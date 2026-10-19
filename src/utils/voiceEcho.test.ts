import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeRms,
  calibrateThreshold,
  shouldStartRecording,
  shouldStopRecording,
  clampPlaybackRate,
  normalizePeak,
} from './voiceEcho.ts';

test('computeRms calculates accurate root mean square', () => {
  assert.equal(computeRms(new Float32Array(0)), 0);

  // Constant DC buffer
  const constBuf = new Float32Array([0.5, 0.5, 0.5, 0.5]);
  assert.equal(Math.round(computeRms(constBuf) * 100) / 100, 0.5);

  // Alternating positive and negative
  const altBuf = new Float32Array([0.2, -0.2, 0.2, -0.2]);
  assert.equal(Math.round(computeRms(altBuf) * 100) / 100, 0.2);

  // Pure silence
  const zeroBuf = new Float32Array(100);
  assert.equal(computeRms(zeroBuf), 0);
});

test('calibrateThreshold establishes sound sensitivity bounds', () => {
  // Empty returns default safe baseline
  assert.equal(calibrateThreshold([]), 0.025);

  // Very quiet ambient room should clamp to minimum 0.015
  const quietAmbience = [0.001, 0.002, 0.0015, 0.002];
  const quietCal = calibrateThreshold(quietAmbience);
  assert.ok(quietCal >= 0.015);

  // Loud background noise calibrated above ambient
  const noisyAmbience = [0.08, 0.12, 0.09, 0.11];
  const noisyCal = calibrateThreshold(noisyAmbience, 2.0);
  assert.ok(noisyCal > 0.15);
  assert.ok(noisyCal <= 0.35);
});

test('shouldStartRecording gates speech trigger on threshold and duration', () => {
  const threshold = 0.05;

  // Below threshold
  assert.equal(shouldStartRecording(0.02, threshold, 120, 80), false);

  // Above threshold but under 80ms duration
  assert.equal(shouldStartRecording(0.08, threshold, 40, 80), false);

  // Above threshold AND sustained for >= 80ms
  assert.equal(shouldStartRecording(0.08, threshold, 80, 80), true);
  assert.equal(shouldStartRecording(0.12, threshold, 160, 80), true);
});

test('shouldStopRecording cuts off on silence or 6s max', () => {
  const threshold = 0.05;

  // Still active voice, no silence: keep going
  assert.equal(shouldStopRecording(0.08, threshold, 0, 6000, 1500), false);

  // Brief pause (<600ms): keep going
  assert.equal(shouldStopRecording(0.01, threshold, 350, 6000, 1500), false);

  // Silence reached 600ms after sufficient recording (>250ms): stop!
  assert.equal(shouldStopRecording(0.01, threshold, 600, 6000, 1200), true);
  assert.equal(shouldStopRecording(0.01, threshold, 650, 6000, 1200), true);

  // Silence >= 600ms but total duration < 250ms: don't stop yet
  assert.equal(shouldStopRecording(0.01, threshold, 600, 6000, 180), false);

  // Max recording duration exceeded (6000ms): stop immediately!
  assert.equal(shouldStopRecording(0.08, threshold, 0, 6000, 6000), true);
  assert.equal(shouldStopRecording(0.08, threshold, 0, 6000, 6050), true);
});

test('clampPlaybackRate keeps voice in squeaky sweet-spot [1.4, 2.0]', () => {
  assert.equal(clampPlaybackRate(1.7), 1.7);
  assert.equal(clampPlaybackRate(0.8), 1.4);
  assert.equal(clampPlaybackRate(2.8), 2.0);
  assert.equal(clampPlaybackRate(Number.NaN), 1.7);
});

test('normalizePeak scales amplitude safely with headroom', () => {
  // Empty
  assert.equal(normalizePeak(new Float32Array(0)).length, 0);

  // Normal signal
  const input = new Float32Array([0.1, -0.4, 0.2]);
  const normalized = normalizePeak(input, 0.8);
  // Max input is 0.4 -> 0.4 * 2 = 0.8
  assert.equal(Math.round(normalized[1] * 10) / 10, -0.8);
  assert.equal(Math.round(normalized[0] * 10) / 10, 0.2);

  // Pure silence should not explode
  const zero = new Float32Array([0, 0, 0]);
  const zeroNorm = normalizePeak(zero, 0.95);
  assert.equal(zeroNorm[0], 0);
  assert.equal(zeroNorm[1], 0);
});
