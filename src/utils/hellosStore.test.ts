import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getHellosSnapshot,
  incrementHellos,
  setHellos,
  subscribeHellos,
} from './hellosStore.ts';

test('hellosStore manages counts and notifies subscribers', () => {
  setHellos(100);
  assert.equal(getHellosSnapshot(), 100);

  let notified = 0;
  const unsubscribe = subscribeHellos(() => {
    notified += 1;
  });

  const nextCount = incrementHellos(1);
  assert.equal(nextCount, 101);
  assert.equal(getHellosSnapshot(), 101);
  assert.equal(notified, 1);

  incrementHellos(5);
  assert.equal(getHellosSnapshot(), 106);
  assert.equal(notified, 2);

  unsubscribe();
  incrementHellos(1);
  assert.equal(notified, 2); // Unsubscribed, counter not incremented
});
