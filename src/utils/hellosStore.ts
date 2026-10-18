/**
 * Tiny external store for hellos delivered counter.
 * Supports useSyncExternalStore to isolate re-renders strictly to the odometer.
 */

const STORAGE_KEY = 'pinglet_hellos_count';
const DEFAULT_HELLOS = 4042;

let currentHellos = DEFAULT_HELLOS;
const listeners = new Set<() => void>();

// Initialize from localStorage safely
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = Number(saved);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        currentHellos = parsed;
      }
    }
  } catch {
    // Ignore storage errors in restrictive environments
  }
}

export function getHellosSnapshot(): number {
  return currentHellos;
}

export function subscribeHellos(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function incrementHellos(amount: number = 1): number {
  currentHellos += amount;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, String(currentHellos));
    } catch {
      // Ignore storage errors
    }
  }
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Prevent listener errors from stopping others
    }
  });
  return currentHellos;
}

export function setHellos(value: number): void {
  currentHellos = Math.max(0, Math.floor(value));
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, String(currentHellos));
    } catch {
      // Ignore
    }
  }
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore
    }
  });
}
