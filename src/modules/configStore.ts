import {writable} from 'svelte/store';

export interface AppConfig {
  mujisung: {
    enabled: 0 | 1 | 2,
    list: string[][],
    custom: string[],
    exception: string[]
  },
  capture: {
    enabled: 0 | 1 | 2
  },
  checkLawAlert: {
    enabled: 0 | 1
  },
  path: {
    path: string,
    os: 0 | 1
  },
  autoUp: {
    custom: string[]
  },
  reload: {
    enabled: 0 | 1
  },
  audioComp: {
    enabled: 0 | 1 | 2
  },
  blockUser: {
    list: string[]
  },
  blockGrade: {
    enabled: 0 | 1
  }
}

const initialConfig: AppConfig = {
  mujisung: {
    enabled: 2,
    list: [],
    custom: ["⬛⬛⬛도배 리스트", "⬛⬛⬛리스트 추가는 확장 프로그램에서"],
    exception: ["규칙", "채팅금지", "가능입니다", "푸숑"]
  },
  capture: {
    enabled: 2,
  },
  checkLawAlert: {
    enabled: 1,
  },
  path: {
    path: "",
    os: 0,
  },
  autoUp: {
    custom: ["nanajam"]
  },
  reload: {
    enabled: 1
  },
  audioComp: {
    enabled: 2
  },
  blockUser: {
    list: [""]
  },
  blockGrade: {
    enabled: 0
  }
}

export const configStore = writable<AppConfig>(initialConfig);

let saveTimeout: number;
configStore.subscribe((value) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = window.setTimeout(async () => {
    try {
      await chrome.storage.local.set({config: value});
    } catch (e) {
      console.error(e);
    }
  }, 300);
});

export const loadConfig = async () => {
  try {
    const data = await chrome.storage.local.get("config");
    if (data && data.config) {
      const saved = data.config as Partial<AppConfig>;
      configStore.update(current => ({...current, ...saved}));
    }
  } catch (e) {
    console.error(e);
  }
};

export const resetConfig = async () => {
  try {
    configStore.set({...initialConfig});
  } catch (e) {
    console.error(e);
  }
};