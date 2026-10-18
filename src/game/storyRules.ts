/**
 * Pure helper functions for the scroll-driven Story Section.
 * Decoupled from React for deterministic unit testing.
 */

export interface StoryChapterData {
  index: number;
  stamp: string;
  title: string;
  caption: string;
  ghostWord: string;
  tag: string;
}

export const STORY_CHAPTERS: StoryChapterData[] = [
  {
    index: 0,
    stamp: '01 / 04',
    title: 'THE ATTIC',
    caption: 'Born at 3 a.m. in a dusty attic.',
    ghostWord: '3AM',
    tag: '— SCENE 01 : DUSK',
  },
  {
    index: 1,
    stamp: '02 / 04',
    title: 'THE HANDSHAKE',
    caption: 'A dial-up handshake sparked through the wires.',
    ghostWord: 'SPARK',
    tag: '— SCENE 02 : TWILIGHT',
  },
  {
    index: 2,
    stamp: '03 / 04',
    title: 'FIRST HELLO',
    caption: 'Carrying little hellos into the night.',
    ghostWord: 'FLY',
    tag: '— SCENE 03 : MIDNIGHT',
  },
  {
    index: 3,
    stamp: '04 / 04',
    title: 'GLOWING TOWN',
    caption: 'Every sleeping window woke with a warm hello.',
    ghostWord: 'GLOW',
    tag: '— SCENE 04 : DEEP NIGHT',
  },
];

export function getStoryChapter(progress: number): StoryChapterData {
  const clamped = Math.max(0, Math.min(0.999, progress));
  const idx = Math.floor(clamped * 4);
  return STORY_CHAPTERS[idx] || STORY_CHAPTERS[0];
}

/**
 * Calculates parametric point along the telephone wire bezier curve:
 * P0=(20, 260), P1=(140, 310), P2=(260, 310), P3=(380, 260)
 */
export function getWirePointParametric(t: number): { x: number; y: number } {
  const clampedT = Math.max(0, Math.min(1, t));
  const u = 1 - clampedT;
  const tt = clampedT * clampedT;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * clampedT;

  const p0 = { x: 20, y: 260 };
  const p1 = { x: 140, y: 310 };
  const p2 = { x: 260, y: 310 };
  const p3 = { x: 380, y: 260 };

  const x = uuu * p0.x + 3 * uu * clampedT * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
  const y = uuu * p0.y + 3 * uu * clampedT * p1.y + 3 * u * tt * p2.y + ttt * p3.y;

  return { x, y };
}

/**
 * Determines whether a given window index should be illuminated
 * based on chapter 4 progress (0 to 1).
 */
export function isWindowIlluminated(
  windowIndex: number,
  totalWindows: number,
  progress: number
): boolean {
  if (totalWindows <= 0) return false;
  const threshold = (windowIndex + 0.3) / totalWindows;
  return progress >= threshold;
}
