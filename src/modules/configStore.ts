/**
 * Reactive wrapper around the settings blob in `config`.
 *
 * Types and defaults live in `config.ts` so non-UI contexts can read settings
 * without importing svelte; this file only adds the store, the debounced write
 * and cross-context synchronisation. Lists are not part of `config` — see
 * `listStore.ts` and the domain stores built on it.
 */

import { writable } from 'svelte/store';

import { autoUpStore } from './autoUpStore';
import { blockUserStore } from './blockStore';
import { CONFIG_KEY, initialConfig, type AppConfig } from './config';
import {
  mujisungCustomStore,
  mujisungFromChatStore,
  mujisungListStore,
} from './mujisungStore';

export type { AppConfig } from './config';

const WRITE_DEBOUNCE_MS = 300;

export const configStore = writable<AppConfig>({ ...initialConfig });

/** 최초 읽기가 끝나기 전에는 저장하지 않는다 (기본값으로 덮어쓰기 방지). */
let loaded = false;
let saveTimeout: ReturnType<typeof setTimeout> | undefined;

configStore.subscribe((value) => {
  if (!loaded) return;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    chrome.storage.local
      .set({ [CONFIG_KEY]: value })
      .catch((e) => console.error(e));
  }, WRITE_DEBOUNCE_MS);
});

export const loadConfig = async () => {
  try {
    const data = await chrome.storage.local.get(CONFIG_KEY);
    const saved = data?.[CONFIG_KEY] as Partial<AppConfig> | undefined;
    if (saved) configStore.update((current) => ({ ...current, ...saved }));
  } catch (e) {
    console.error(e);
  } finally {
    loaded = true;
  }
};

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes[CONFIG_KEY]) return;
  const nextConfig = changes[CONFIG_KEY].newValue as AppConfig;
  loaded = true;
  configStore.update((current) =>
    JSON.stringify(current) !== JSON.stringify(nextConfig)
      ? nextConfig
      : current,
  );
});

const listStores = [
  mujisungListStore,
  mujisungCustomStore,
  mujisungFromChatStore,
  blockUserStore,
  autoUpStore,
];

/** 설정과 모든 리스트를 한 번에 읽는다. 진입점 onMount에서 호출한다. */
export const loadAll = async () => {
  await Promise.all([loadConfig(), ...listStores.map((s) => s.load())]);
};

/** "설정 초기화" — 설정 블롭과 모든 리스트 키를 기본값으로 되돌린다. */
export const resetConfig = async () => {
  loaded = true;
  configStore.set({ ...initialConfig });
  await Promise.all(listStores.map((s) => s.reset()));
};
