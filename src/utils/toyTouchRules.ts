/**
 * Pure gesture detection and state calculation rules for Pinglet Touch Toy
 */

export interface TouchSample {
  x: number;
  y: number;
  time: number;
}

export type ToyGestureType = 'poke' | 'tickle' | 'pet' | 'tap';

export type ToyReaction =
  | 'idle'
  | 'poked'
  | 'stop_it'
  | 'tickled'
  | 'out_of_breath'
  | 'petting'
  | 'munching'
  | 'sugar_rush'
  | 'yawn'
  | 'sleeping'
  | 'startled';

/**
 * Head zone: upper ~48% of the character.
 */
export function isHeadZone(normY: number): boolean {
  return normY < 0.48;
}

/**
 * Belly zone: lower ~52% of the character.
 */
export function isBellyZone(normY: number): boolean {
  return normY >= 0.48;
}

/**
 * Classifies a gesture sequence based on duration, travel distance, and direction reversals.
 */
export function detectGesture(
  samples: TouchSample[],
  isHead: boolean,
  durationMs: number
): ToyGestureType {
  if (!samples || samples.length === 0) return 'tap';

  const start = samples[0];
  const end = samples[samples.length - 1];
  const totalDx = Math.abs(end.x - start.x);
  const totalDy = Math.abs(end.y - start.y);
  const totalDist = Math.sqrt(totalDx * totalDx + totalDy * totalDy);

  // 1. Pet: circular slow drag or long press on head
  if (isHead) {
    if (durationMs > 380 && (totalDist < 60 || samples.length > 5)) {
      return 'pet';
    }
  }

  // 2. Tickle: rapid side-to-side reversals on belly
  if (!isHead && samples.length >= 4) {
    let reversals = 0;
    let lastDirection = 0;
    for (let i = 1; i < samples.length; i++) {
      const dx = samples[i].x - samples[i - 1].x;
      if (Math.abs(dx) > 3) {
        const dir = dx > 0 ? 1 : -1;
        if (lastDirection !== 0 && dir !== lastDirection) {
          reversals++;
        }
        lastDirection = dir;
      }
    }
    if (reversals >= 2 && durationMs < 1200) {
      return 'tickle';
    }
  }

  // 3. Short tap/poke
  if (durationMs < 350 && totalDist < 25) {
    return isHead ? 'tap' : 'poke';
  }

  return 'tap';
}

/**
 * Blush multiplier based on active reaction and poke frequency.
 * Returns 1.0 (normal) up to 2.4 (super flustered/deep blush).
 */
export function calculateBlushMultiplier(
  reaction: ToyReaction,
  rapidPokeCount: number
): number {
  if (reaction === 'stop_it') return 2.4;
  if (reaction === 'petting') return 1.85;
  if (reaction === 'tickled' || reaction === 'out_of_breath') return 1.95;
  if (reaction === 'sugar_rush') return 2.1;
  if (reaction === 'poked') {
    return Math.min(2.2, 1.0 + rapidPokeCount * 0.35);
  }
  return 1.0;
}

/**
 * Returns true if feeding this candy reaches or exceeds 5 candies (triggering sugar rush).
 */
export function shouldTriggerSugarRush(currentCandiesCount: number): boolean {
  return currentCandiesCount >= 5;
}
