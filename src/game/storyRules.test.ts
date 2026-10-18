import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getStoryChapter,
  getWirePointParametric,
  isWindowIlluminated,
  STORY_CHAPTERS,
} from './storyRules.ts';

test('STORY_CHAPTERS has 4 chapters with captions under 10 words', () => {
  assert.equal(STORY_CHAPTERS.length, 4);
  for (const ch of STORY_CHAPTERS) {
    const wordCount = ch.caption.trim().split(/\s+/).length;
    assert.ok(wordCount <= 10, `Chapter ${ch.index} caption has ${wordCount} words: "${ch.caption}"`);
  }
});

test('getStoryChapter returns correct chapter across 0..1 progress', () => {
  assert.equal(getStoryChapter(0).index, 0);
  assert.equal(getStoryChapter(0.2).index, 0);
  assert.equal(getStoryChapter(0.26).index, 1);
  assert.equal(getStoryChapter(0.51).index, 2);
  assert.equal(getStoryChapter(0.85).index, 3);
  assert.equal(getStoryChapter(1).index, 3);
});

test('getWirePointParametric returns coordinates along bezier curve', () => {
  const start = getWirePointParametric(0);
  assert.equal(start.x, 20);
  assert.equal(start.y, 260);

  const mid = getWirePointParametric(0.5);
  assert.equal(mid.x, 200);
  assert.ok(mid.y > 280); // Dips down along the telephone wire catenary

  const end = getWirePointParametric(1);
  assert.equal(end.x, 380);
  assert.equal(end.y, 260);
});

test('isWindowIlluminated lights up windows sequentially', () => {
  assert.equal(isWindowIlluminated(0, 5, 0.05), false);
  assert.equal(isWindowIlluminated(0, 5, 0.25), true);
  assert.equal(isWindowIlluminated(4, 5, 0.5), false);
  assert.equal(isWindowIlluminated(4, 5, 0.95), true);
});
