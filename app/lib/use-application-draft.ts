'use client';
import {useEffect, useState} from 'react';
type Fields = Record<string, string | boolean>;
const MAX_AGE = 24 * 60 * 60 * 1000;

// Tab-scoped storage: survives reloads without retaining an application indefinitely.
export function useApplicationDraft(key: string, data: Fields, step: number, done: boolean,
  restore: (data: Fields, step: number) => void, maxStep: number) {
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const draft = JSON.parse(raw);
        if (typeof draft.savedAt === 'number' && Date.now() - draft.savedAt < MAX_AGE &&
          draft.data && typeof draft.data === 'object' && !Array.isArray(draft.data) &&
          Object.values(draft.data).every(v => typeof v === 'string' || typeof v === 'boolean') &&
          Number.isInteger(draft.step) && draft.step >= 0 && draft.step <= maxStep) {
          restore(draft.data, draft.step);
          setRestored(true);
        } else sessionStorage.removeItem(key);
      }
    } catch { setUnavailable(true); }
    setReady(true);
    // Restore once on mount; the changing form values must not trigger restoration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try {
      if (done) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, JSON.stringify({data, step, savedAt: Date.now()}));
    } catch { setUnavailable(true); }
  }, [key, ready, data, step, done]);
  return {ready, unavailable, restored};
}
