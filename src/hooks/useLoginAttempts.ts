import { useCallback, useEffect, useState } from "react";
// Client-side limit on wrong-password attempts at sign-in.
// NOTE: this is a UX guard only - anyone can clear localStorage or call the
// API directly. The real protection must also exist on the backend.
export const MAX_ATTEMPTS = 5;
export const LOCKOUT_SECONDS = 5 * 60;

const STORAGE_KEY = "cc_login_attempts";

interface Entry {
  attempts: number;
  lockedUntil: number; // absolute unix-ms timestamp, 0 = not locked
}

type Store = Record<string, Entry>;

const EMPTY: Entry = { attempts: 0, lockedUntil: 0 };

const normalize = (email: string): string => email.trim().toLowerCase();

const secondsUntil = (timestamp: number): number =>
  Math.max(0, Math.round((timestamp - Date.now()) / 1000));

const readStore = (): Store => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Store;
  } catch {
    return {};
  }
};

const writeStore = (store: Store) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage unavailable (private mode etc.) - limit just won't persist
  }
};

// Returns the saved entry for this email; an expired lock counts as reset.
const getEntry = (key: string): Entry => {
  if (!key) return EMPTY;
  const entry = readStore()[key];
  if (!entry) return EMPTY;
  if (entry.lockedUntil !== 0 && entry.lockedUntil <= Date.now()) {
    clearEntry(key);
    return EMPTY;
  }
  return entry;
};

const clearEntry = (key: string) => {
  const store = readStore();
  delete store[key];
  writeStore(store);
};

export const useLoginAttempts = (email: string) => {
  const key = normalize(email);
  const [entry, setEntry] = useState<Entry>(() => getEntry(key));
  const [secondsLeft, setSecondsLeft] = useState(() =>
    secondsUntil(getEntry(key).lockedUntil),
  );

  // Email field changed -> load that email's saved state.
  useEffect(() => {
    const saved = getEntry(key);
    setEntry(saved);
    setSecondsLeft(secondsUntil(saved.lockedUntil));
  }, [key]);

  // Tick while locked. Always recomputed from the absolute timestamp, so a
  // page refresh continues the lock instead of restarting it.
  useEffect(() => {
    if (entry.lockedUntil === 0) return;
    const timer = setInterval(() => {
      const left = secondsUntil(entry.lockedUntil);
      setSecondsLeft(left);
      if (left <= 0) {
        clearEntry(key);
        setEntry(EMPTY);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [entry.lockedUntil, key]);

  const registerFailure = useCallback((): Entry => {
    const current = getEntry(key);
    const attempts = current.attempts + 1;
    const next: Entry = {
      attempts,
      lockedUntil:
        attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_SECONDS * 1000 : 0,
    };
    const store = readStore();
    store[key] = next;
    writeStore(store);
    setEntry(next);
    setSecondsLeft(secondsUntil(next.lockedUntil));
    return next;
  }, [key]);

  const registerSuccess = useCallback(() => {
    clearEntry(key);
    setEntry(EMPTY);
    setSecondsLeft(0);
  }, [key]);

  return {
    isLocked: secondsLeft > 0,
    secondsLeft,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - entry.attempts),
    hasFailures: entry.attempts > 0,
    registerFailure,
    registerSuccess,
  };
};
