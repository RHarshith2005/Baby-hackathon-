/**
 * Core game mechanics and state transitions for "Catch the Packets".
 * Pure functions decoupled from React and Three.js for deterministic testing.
 */

export type PingletMood = 'shy' | 'excited' | 'sleepy' | 'glitchy';

export interface Packet {
  id: string;
  x: number; // 0 to 100 percentage of lane width
  y: number; // 0 to 100 percentage from top to bottom
  speed: number;
  type: 'hello' | 'ping' | 'sparkle' | 'bitrot';
  points: number;
  label: string;
  glowColor: string;
}

export interface PlayerCatchState {
  playerX: number; // 0 to 100 percentage
  playerWidth: number; // hit width in percentage
  score: number;
  streak: number;
  bestScore: number;
  missed: number;
  mood: PingletMood;
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
 * Calculates updated score and streak multiplier.
 */
export function calculateCatchScore(
  currentScore: number,
  currentStreak: number,
  points: number
): { score: number; streak: number; earned: number } {
  if (points <= 0) {
    // Bad packet (e.g., bitrot) resets streak and deducts
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
    return 'glitchy'; // hyper-speed attic 3am mode!
  }
  if (score >= 60 || streak >= 3) {
    return 'excited';
  }
  return 'shy';
}

/**
 * Generates packet specifications based on wave/time progression.
 */
export function createPacketData(
  seed: number,
  idCounter: number,
  timeSec: number
): Packet {
  const lanePositions = [15, 30, 48, 65, 82];
  const chosenX = lanePositions[Math.abs(seed) % lanePositions.length];
  
  // Base speed scales gently with time
  const baseSpeed = 18 + Math.min(22, timeSec * 0.5);

  const roll = (seed * 17 + idCounter * 31) % 100;
  if (roll < 55) {
    return {
      id: `pkt-${idCounter}`,
      x: chosenX,
      y: 0,
      speed: baseSpeed,
      type: 'hello',
      points: 10,
      label: 'HELLO.TXT',
      glowColor: '#9FF3D3',
    };
  } else if (roll < 80) {
    return {
      id: `pkt-${idCounter}`,
      x: chosenX,
      y: 0,
      speed: baseSpeed * 1.15,
      type: 'ping',
      points: 25,
      label: 'PING 56K',
      glowColor: '#B9A7FF',
    };
  } else if (roll < 92) {
    return {
      id: `pkt-${idCounter}`,
      x: chosenX,
      y: 0,
      speed: baseSpeed * 1.3,
      type: 'sparkle',
      points: 50,
      label: 'UNSENT KISS',
      glowColor: '#FFB088',
    };
  } else {
    return {
      id: `pkt-${idCounter}`,
      x: chosenX,
      y: 0,
      speed: baseSpeed * 0.9,
      type: 'bitrot',
      points: -15,
      label: 'BIT-ROT',
      glowColor: '#FF6B6B',
    };
  }
}
