/**
 * Settings shape, defaults, and a one-shot read.
 *
 * Deliberately free of any svelte import so that non-UI contexts — the service
 * worker, and any future content entry point that only needs to check a flag —
 * can read settings without pulling the svelte store runtime into their bundle.
 * The reactive wrapper lives in `configStore.ts`.
 *
 * Unbounded lists (mujisung/block/autoUp) are NOT here: they live in their own
 * storage keys, see `listStore.ts`.
 */

export interface AppConfig {
  /** 도배 도우미 */
  mujisung: {
    /** 0=off, 1=단축키, 2=단축키+버튼 */
    enabled: 0 | 1 | 2;
    /** 채팅에서 자동 수집할 때 무시할 문구 */
    exception: string[];
  };
  capture: { enabled: 0 | 1 | 2 };
  /** 캡쳐 최초 사용 시 저작권 고지. 동의하면 0으로 내려간다. */
  checkLawAlert: { enabled: 0 | 1 };
  download: { enabled: 0 | 1 | 2 };
  reload: { enabled: 0 | 1 };
  audioComp: { enabled: 0 | 1 | 2 };
  /** 0=off, 1=팬·구독자만, 2=구독자만 */
  blockGrade: { enabled: 0 | 1 | 2 };
}

export const CONFIG_KEY = 'config';

export const initialConfig: AppConfig = {
  mujisung: {
    enabled: 2,
    exception: ['규칙', '채팅금지'],
  },
  capture: {
    enabled: 2,
  },
  checkLawAlert: {
    enabled: 1,
  },
  download: {
    enabled: 2,
  },
  reload: {
    enabled: 1,
  },
  audioComp: {
    enabled: 2,
  },
  blockGrade: {
    enabled: 0,
  },
};

/**
 * One-shot read for contexts that do not need reactivity.
 *
 * This module deliberately avoids importing svelte so entry points stay small.
 */
export const readConfig = async (): Promise<AppConfig> => {
  try {
    const data = await chrome.storage.local.get(CONFIG_KEY);
    const saved = (data?.[CONFIG_KEY] ?? {}) as Partial<AppConfig>;
    return { ...initialConfig, ...saved };
  } catch (e) {
    console.error(e);
    return { ...initialConfig };
  }
};
