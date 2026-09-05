/**
 * Factory for a list that lives in its own chrome.storage.local key.
 *
 * The original build kept every setting AND every collected list in the single
 * `config` key. That means flipping one toggle rewrites the whole blob, and two
 * contexts (popup, side panel, content script) saving at the same time silently
 * clobber each other's lists. One key per concern removes both problems.
 *
 * Each store: reads once on creation, keeps the value in memory, and writes
 * back on a debounce. Writes are suppressed until that first read lands, so a
 * newly mounted context can never overwrite stored data with its defaults.
 * chrome.storage.local caps at 10MB total, so lists are trimmed to `max`
 * entries (oldest first) rather than growing without bound.
 */

import { writable, type Writable } from 'svelte/store';

const WRITE_DEBOUNCE_MS = 500;

export interface ListStore<T> extends Writable<T[]> {
  /** 저장소에서 1회 읽어 store에 반영한다. 여러 번 불러도 한 번만 읽는다. */
  load: () => Promise<void>;
  /** 초기값으로 되돌리고 즉시 저장한다. */
  reset: () => Promise<void>;
}

export function createListStore<T>(
  key: string,
  initial: T[] = [],
  max = 50_000,
): ListStore<T> {
  const store = writable<T[]>([...initial]);

  let loaded = false;
  let loading: Promise<void> | null = null;
  let writeTimer: ReturnType<typeof setTimeout> | undefined;
  /** onChanged로 되돌아온 자기 자신의 쓰기를 무시하기 위한 표시 */
  let lastWritten: string | null = null;

  const trim = (value: T[]) => (value.length > max ? value.slice(-max) : value);

  const flush = (value: T[]) => {
    lastWritten = JSON.stringify(value);
    chrome.storage.local.set({ [key]: value }).catch((e) => console.error(e));
  };

  store.subscribe((value) => {
    if (!loaded) return;
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(() => flush(value), WRITE_DEBOUNCE_MS);
  });

  const load = () => {
    if (loading) return loading;
    loading = (async () => {
      try {
        const data = await chrome.storage.local.get(key);
        const saved = data?.[key];
        if (Array.isArray(saved)) store.set(trim(saved as T[]));
      } catch (e) {
        console.error(e);
      } finally {
        loaded = true;
      }
    })();
    return loading;
  };

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes[key]) return;
    const next = changes[key].newValue;
    if (!Array.isArray(next)) return;
    const serialized = JSON.stringify(next);
    if (serialized === lastWritten) return;
    loaded = true;
    store.set(next as T[]);
  });

  const reset = async () => {
    loaded = true;
    store.set([...initial]);
    if (writeTimer) clearTimeout(writeTimer);
    flush([...initial]);
  };

  return {
    subscribe: store.subscribe,
    set: (value: T[]) => store.set(trim(value)),
    update: (fn: (value: T[]) => T[]) => store.update((v) => trim(fn(v))),
    load,
    reset,
  };
}
