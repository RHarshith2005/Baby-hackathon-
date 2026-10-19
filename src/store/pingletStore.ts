import { useSyncExternalStore } from 'react';
import {
  type CareStats,
  type StampId,
  type TrackEventName,
  computeCareDecay,
  applyCareActivity,
  checkStampsToAward,
  formatVisitorGreeting,
} from './pingletStoreRules';
import { audioSystem } from '../utils/audioSynth';

const STORAGE_KEY = 'pinglet_companion_store_v1';

export interface PingletState {
  careStats: CareStats;
  collectedStamps: StampId[];
  lastVisitTime: number | null;
  currentVisitTime: number;
  newlyAwardedStamp: StampId | null;
  greeting: { title: string; subtitle: string; isFirstVisit: boolean };
}

const DEFAULT_STATE: PingletState = {
  careStats: { tummy: 75, cozy: 80, joy: 85 },
  collectedStamps: [],
  lastVisitTime: null,
  currentVisitTime: Date.now(),
  newlyAwardedStamp: null,
  greeting: {
    title: 'A tiny baby ghost says hello!',
    subtitle: 'Born at 3:00 a.m. in a forgotten attic computer.',
    isFirstVisit: true,
  },
};

let currentState: PingletState = (() => {
  const now = Date.now();
  if (typeof window === 'undefined') return { ...DEFAULT_STATE, currentVisitTime: now };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initGreeting = formatVisitorGreeting(null, now, DEFAULT_STATE.careStats, 0, 4042);
      return { ...DEFAULT_STATE, currentVisitTime: now, greeting: initGreeting };
    }
    const parsed = JSON.parse(raw);
    const prevLastVisit = typeof parsed.lastVisitTime === 'number' ? parsed.lastVisitTime : null;
    const baseStats: CareStats = parsed.careStats || DEFAULT_STATE.careStats;
    const decayedStats = prevLastVisit ? computeCareDecay(baseStats, now - prevLastVisit) : baseStats;
    const stamps: StampId[] = Array.isArray(parsed.collectedStamps) ? parsed.collectedStamps : [];
    const greeting = formatVisitorGreeting(prevLastVisit, now, decayedStats, 0, 4042);

    return {
      careStats: decayedStats,
      collectedStamps: stamps,
      lastVisitTime: prevLastVisit,
      currentVisitTime: now,
      newlyAwardedStamp: null,
      greeting,
    };
  } catch {
    return { ...DEFAULT_STATE, currentVisitTime: now };
  }
})();

const listeners = new Set<() => void>();

function emitChange() {
  saveToStorage();
  listeners.forEach((listener) => listener());
}

function saveToStorage() {
  if (typeof window === 'undefined') return;
  try {
    const dataToSave = {
      careStats: currentState.careStats,
      collectedStamps: currentState.collectedStamps,
      lastVisitTime: currentState.currentVisitTime,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch {}
}

export function subscribePingletStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPingletSnapshot(): PingletState {
  return currentState;
}

export function usePingletStore(): PingletState {
  return useSyncExternalStore(subscribePingletStore, getPingletSnapshot, () => DEFAULT_STATE);
}

/**
 * Trigger subtle device haptics where supported (15ms to 40ms).
 * Strictly feature-detected and neutralized under prefers-reduced-motion.
 */
export function triggerHaptic(durationMs: number = 25) {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') return;

  try {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    navigator.vibrate(Math.max(15, Math.min(40, durationMs)));
  } catch {}
}

/**
 * Dispatches an event to the companion store.
 * Awards new stamps, triggers non-blocking toasts & sounds.
 */
export function trackEvent(name: TrackEventName, data?: { score?: number }) {
  const newStamps = checkStampsToAward(name, currentState.collectedStamps, data);

  let updatedStamps = currentState.collectedStamps;
  let toastStamp: StampId | null = currentState.newlyAwardedStamp;

  if (newStamps.length > 0) {
    updatedStamps = [...currentState.collectedStamps, ...newStamps];
    toastStamp = newStamps[0]; // Show toast for the latest stamp

    // Stamp pop sound
    audioSystem.playTone(880, 0.08, 'triangle');
    setTimeout(() => {
      audioSystem.playTone(1318.5, 0.14, 'sine');
    }, 90);
  }

  // Also apply care meter activity if relevant
  let updatedCare = currentState.careStats;
  if (name === 'fed') {
    updatedCare = applyCareActivity(updatedCare, 'feed');
    triggerHaptic(30);
  } else if (name === 'petted') {
    updatedCare = applyCareActivity(updatedCare, 'pet');
    triggerHaptic(20);
  } else if (name === 'tickled') {
    updatedCare = applyCareActivity(updatedCare, 'tickle');
    triggerHaptic(35);
  } else if (name === 'poked') {
    updatedCare = applyCareActivity(updatedCare, 'poke');
    triggerHaptic(15);
  }

  currentState = {
    ...currentState,
    collectedStamps: updatedStamps,
    careStats: updatedCare,
    newlyAwardedStamp: toastStamp,
  };

  emitChange();
}

/**
 * Apply a care activity directly (e.g. from buttons or lullaby).
 */
export function applyCare(activity: 'feed' | 'pet' | 'tickle' | 'poke' | 'lullaby') {
  const nextCare = applyCareActivity(currentState.careStats, activity);
  currentState = {
    ...currentState,
    careStats: nextCare,
  };
  emitChange();
}

export function dismissNewStampToast() {
  if (!currentState.newlyAwardedStamp) return;
  currentState = {
    ...currentState,
    newlyAwardedStamp: null,
  };
  emitChange();
}

export function resetPinglet() {
  currentState = {
    ...DEFAULT_STATE,
    currentVisitTime: Date.now(),
    lastVisitTime: null,
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  emitChange();
}
