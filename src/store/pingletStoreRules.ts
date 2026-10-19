/**
 * Pure helper functions and rules for Pinglet Pocket-Pet, Passport Stamps,
 * Visitor Greeting, and Lullaby Hash Encoding.
 */

export interface CareStats {
  tummy: number; // 15..100
  cozy: number;  // 15..100
  joy: number;   // 15..100
}

export type TrackEventName =
  | 'poked'
  | 'tickled'
  | 'petted'
  | 'fed'
  | 'talked'
  | 'playedRound'
  | 'pinnedWish'
  | 'switchedNight'
  | 'storyFinished'
  | 'foundEgg'
  | 'madeCard';

export type StampId =
  | 'first_hello'
  | 'belly_boop'
  | 'giggle_fit'
  | 'purr'
  | 'sweet_tooth'
  | 'night_owl'
  | 'packet_pro'
  | 'wish_writer'
  | 'story_walker'
  | 'secret_finder';

export interface StampMeta {
  id: StampId;
  name: string;
  hint: string;
  color: string;
  icon: string;
  isSecret?: boolean;
}

export const PASSPORT_STAMPS: StampMeta[] = [
  { id: 'first_hello', name: 'First Hello', hint: 'Say hello or talk to Pinglet', color: '#9FF3D3', icon: '💌' },
  { id: 'belly_boop', name: 'Belly Boop', hint: 'Poke Pinglet in the tummy', color: '#FFC9A8', icon: '👉' },
  { id: 'giggle_fit', name: 'Giggle Fit', hint: 'Tickle Pinglet with a drag', color: '#FFF0B3', icon: '✨' },
  { id: 'purr', name: 'Purr Time', hint: 'Gently pet Pinglet on the head', color: '#B9A7FF', icon: '🐾' },
  { id: 'sweet_tooth', name: 'Sweet Tooth', hint: 'Feed Pinglet a candy star', color: '#FF9EC7', icon: '🍬' },
  { id: 'night_owl', name: 'Night Owl', hint: 'Switch to sleepy night mood', color: '#523B8A', icon: '🌙' },
  { id: 'packet_pro', name: 'Packet Pro', hint: 'Score 150+ in Catch Packets', color: '#9FF3D3', icon: '🏆' },
  { id: 'wish_writer', name: 'Wish Writer', hint: 'Pin a note on the Wish Wall', color: '#FFC9A8', icon: '🏷️' },
  { id: 'story_walker', name: 'Story Walker', hint: 'Journey through the 3 a.m. story', color: '#2D1B48', icon: '📖' },
  { id: 'secret_finder', name: 'Secret Finder', hint: 'Find the 3:00 a.m. modem secret', color: '#E86FA0', icon: '🔑', isSecret: true },
];

const FLOOR_STAT = 15;
const CEIL_STAT = 100;

/**
 * PURE HELPER: Decays care stats based on elapsed time since last visit.
 * Every 5 minutes (300,000ms) decays ~2 points. Minimum floor is 15.
 */
export function computeCareDecay(stats: CareStats, elapsedMs: number): CareStats {
  if (elapsedMs <= 0 || Number.isNaN(elapsedMs)) {
    return { ...stats };
  }

  // 1 point per 150 seconds (~2.5 mins)
  const decayPoints = Math.floor(elapsedMs / (150 * 1000));
  if (decayPoints <= 0) return { ...stats };

  return {
    tummy: Math.max(FLOOR_STAT, Math.min(CEIL_STAT, stats.tummy - decayPoints)),
    cozy: Math.max(FLOOR_STAT, Math.min(CEIL_STAT, stats.cozy - Math.floor(decayPoints * 0.8))),
    joy: Math.max(FLOOR_STAT, Math.min(CEIL_STAT, stats.joy - Math.floor(decayPoints * 0.9))),
  };
}

/**
 * PURE HELPER: Applies activities to care stats.
 */
export function applyCareActivity(
  stats: CareStats,
  activity: 'feed' | 'pet' | 'tickle' | 'poke' | 'lullaby'
): CareStats {
  const next = { ...stats };
  switch (activity) {
    case 'feed':
      next.tummy = Math.min(CEIL_STAT, next.tummy + 20);
      next.joy = Math.min(CEIL_STAT, next.joy + 4);
      break;
    case 'pet':
      next.joy = Math.min(CEIL_STAT, next.joy + 10);
      next.cozy = Math.min(CEIL_STAT, next.cozy + 6);
      break;
    case 'tickle':
      next.joy = Math.min(CEIL_STAT, next.joy + 8);
      next.cozy = Math.max(FLOOR_STAT, next.cozy - 3);
      break;
    case 'poke':
      next.joy = Math.min(CEIL_STAT, next.joy + 2);
      break;
    case 'lullaby':
      next.cozy = Math.min(CEIL_STAT, next.cozy + 12);
      next.joy = Math.min(CEIL_STAT, next.joy + 4);
      break;
  }
  return next;
}

/**
 * PURE HELPER: Checks if an incoming event awards any new stamp(s).
 */
export function checkStampsToAward(
  eventName: TrackEventName,
  collectedStamps: StampId[],
  data?: { score?: number }
): StampId[] {
  const currentSet = new Set(collectedStamps);
  const newlyAwarded: StampId[] = [];

  const maybeAward = (id: StampId) => {
    if (!currentSet.has(id)) {
      newlyAwarded.push(id);
      currentSet.add(id);
    }
  };

  switch (eventName) {
    case 'talked':
      maybeAward('first_hello');
      break;
    case 'poked':
      maybeAward('belly_boop');
      break;
    case 'tickled':
      maybeAward('giggle_fit');
      break;
    case 'petted':
      maybeAward('purr');
      break;
    case 'fed':
      maybeAward('sweet_tooth');
      break;
    case 'switchedNight':
      maybeAward('night_owl');
      break;
    case 'playedRound':
      if (data?.score && data.score >= 150) {
        maybeAward('packet_pro');
      }
      break;
    case 'pinnedWish':
      maybeAward('wish_writer');
      break;
    case 'storyFinished':
      maybeAward('story_walker');
      break;
    case 'foundEgg':
      maybeAward('secret_finder');
      break;
  }

  return newlyAwarded;
}

/**
 * PURE HELPER: Format friendly visitor greeting on load.
 */
export function formatVisitorGreeting(
  lastVisitMs: number | null,
  nowMs: number,
  stats: CareStats,
  _bestScore: number,
  _hellos: number
): { title: string; subtitle: string; isFirstVisit: boolean } {
  if (!lastVisitMs || Number.isNaN(lastVisitMs)) {
    return {
      title: 'A tiny baby ghost says hello!',
      subtitle: 'Born at 3:00 a.m. in a forgotten attic computer.',
      isFirstVisit: true,
    };
  }

  const elapsedHours = (nowMs - lastVisitMs) / (3600 * 1000);
  let title = "You're back!";
  let subtitle = "I carried your hellos across the wires while you were away.";

  if (stats.tummy < 30) {
    subtitle = "I missed you, and my tummy is rumbling for a candy star!";
  } else if (stats.cozy < 30) {
    subtitle = "I was getting a little sleepy in the attic wires.";
  } else if (elapsedHours > 24) {
    title = 'Long time no see!';
    subtitle = 'All your delivered packets are still humming safely.';
  }

  return {
    title,
    subtitle,
    isFirstVisit: false,
  };
}

/**
 * PURE HELPER: Compact URL hash encoding for custom lullaby patterns.
 * 8 steps x 6 notes = 48 bits = 8 hex chars + tempo.
 */
export function encodeLullabyPattern(grid: boolean[][], tempoBpm: number): string {
  // grid: 6 rows (notes) x 8 columns (steps)
  let bitString = '';
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 8; c++) {
      bitString += grid[r]?.[c] ? '1' : '0';
    }
  }

  // Convert 48 bits to 12 hex characters
  let hex = '';
  for (let i = 0; i < bitString.length; i += 4) {
    const nibble = bitString.slice(i, i + 4);
    hex += parseInt(nibble, 2).toString(16);
  }

  const clampedTempo = Math.max(60, Math.min(220, Math.round(tempoBpm)));
  return `lullaby=${hex}&t=${clampedTempo}`;
}

/**
 * PURE HELPER: Decode URL hash into grid & tempo, strictly validated.
 */
export function decodeLullabyPattern(
  hashString: string
): { grid: boolean[][]; tempo: number } | null {
  if (!hashString) return null;
  const cleaned = hashString.startsWith('#') ? hashString.slice(1) : hashString;
  const match = cleaned.match(/lullaby=([0-9a-fA-F]{12})&t=(\d+)/);
  if (!match) return null;

  const hex = match[1];
  const tempo = parseInt(match[2], 10);
  if (Number.isNaN(tempo) || tempo < 50 || tempo > 300) return null;

  let bitString = '';
  for (let i = 0; i < hex.length; i++) {
    const val = parseInt(hex[i], 16);
    if (Number.isNaN(val)) return null;
    bitString += val.toString(2).padStart(4, '0');
  }

  if (bitString.length < 48) return null;

  const grid: boolean[][] = [];
  for (let r = 0; r < 6; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < 8; c++) {
      row.push(bitString[r * 8 + c] === '1');
    }
    grid.push(row);
  }

  return { grid, tempo: Math.max(60, Math.min(220, tempo)) };
}
