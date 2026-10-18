/**
 * Core game mechanics, odometer formatting, and state transitions for Pinglet.
 * Pure functions decoupled from React for deterministic unit testing.
 */

export type PingletMood = 'shy' | 'excited' | 'sleepy' | 'glitchy';

export interface Packet {
  id: string;
  x: number; // 12 to 88 percentage of width
  y: number; // 0 to 100 percentage from top to bottom
  speed: number;
  type: 'hello' | 'ping' | 'sparkle' | 'bitrot';
  points: number;
  label: string;
  glowColor: string;
}

export const GAME_DURATION_SECONDS = 20;

/**
 * Formats a hit-counter number into a 6-digit padded array of digit strings for the odometer.
 */
export function formatOdometerDigits(count: number, digits: number = 6): string[] {
  const clamped = Math.max(0, Math.floor(count));
  return String(clamped).padStart(digits, '0').split('');
}

/**
 * Checks if a falling packet is within the catch hit area of Pinglet.
 */
export function isPacketCaught(
  packet: { x: number; y: number },
  playerX: number,
  playerWidth: number = 18,
  catchZoneYMin: number = 75,
  catchZoneYMax: number = 92
): boolean {
  if (packet.y < catchZoneYMin || packet.y > catchZoneYMax) {
    return false;
  }
  const halfWidth = playerWidth / 2;
  const leftBound = playerX - halfWidth;
  const rightBound = playerX + halfWidth;
  return packet.x >= leftBound && packet.x <= rightBound;
}

/**
 * Calculates updated score and streak multiplier when a packet is tapped or caught.
 */
export function calculateCatchScore(
  currentScore: number,
  currentStreak: number,
  points: number
): { score: number; streak: number; earned: number } {
  if (points <= 0) {
    const earned = points;
    const newScore = Math.max(0, currentScore + earned);
    return { score: newScore, streak: 0, earned };
  }

  const multiplier = Math.min(3, 1 + Math.floor(currentStreak / 5) * 0.5);
  const earned = Math.round(points * multiplier);
  return {
    score: currentScore + earned,
    streak: currentStreak + 1,
    earned,
  };
}

/**
 * Determines Pinglet's mood dynamically based on game progress and score.
 */
export function determineGameMood(
  score: number,
  streak: number,
  isGameOver: boolean
): PingletMood {
  if (isGameOver) {
    return 'sleepy';
  }
  if (streak >= 8 || score >= 250) {
    return 'glitchy';
  }
  if (score >= 60 || streak >= 3) {
    return 'excited';
  }
  return 'shy';
}

/**
 * Generates falling candy-envelope packet specifications.
 */
export function createPacketData(
  seed: number,
  idCounter: number,
  timeSec: number
): Packet {
  const lanePositions = [16, 32, 50, 68, 84];
  const chosenX = lanePositions[Math.abs(seed + idCounter * 3) % lanePositions.length];
  const baseSpeed = 20 + Math.min(24, timeSec * 0.8);

  const roll = Math.abs(seed * 17 + idCounter * 31) % 100;
  if (roll < 55) {
    return {
      id: `pkt-${idCounter}`,
      x: chosenX,
      y: -5,
      speed: baseSpeed,
      type: 'hello',
      points: 10,
      label: 'HELLO!',
      glowColor: '#9FF3D3',
    };
  } else if (roll < 85) {
    return {
      id: `pkt-${idCounter}`,
      x: chosenX,
      y: -5,
      speed: baseSpeed * 1.12,
      type: 'ping',
      points: 20,
      label: 'CANDY PING',
      glowColor: '#B9A7FF',
    };
  } else {
    return {
      id: `pkt-${idCounter}`,
      x: chosenX,
      y: -5,
      speed: baseSpeed * 1.25,
      type: 'sparkle',
      points: 35,
      label: 'STAR HUG',
      glowColor: '#FFF0B3',
    };
  }
}
