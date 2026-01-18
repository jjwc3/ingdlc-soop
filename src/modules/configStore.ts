import {writable} from 'svelte/store';

export interface AppConfig {
  mujisung: {
    enabled: 0 | 1 | 2,
    list: string[][],
    custom: string[],
    fromChat: string[],
    exception: string[]
  },
  capture: {
    enabled: 0 | 1 | 2
  },
  checkLawAlert: {
    enabled: 0 | 1
  },
  download: {
    enabled: 0 | 1 | 2
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
    custom: [],
    fromChat: [],
    exception: ["규칙", "채팅금지"]
  },
  capture: {
    enabled: 2,
  },
  checkLawAlert: {
    enabled: 1,
  },
  download: {
    enabled: 2,
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

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.config) {
    const nextConfig = changes.config.newValue as AppConfig;
    configStore.update(current => {
      if (JSON.stringify(current) !== JSON.stringify(nextConfig)) {
        return nextConfig;
      }
      return current;
    });
  }
});

export const resetConfig = async () => {
  try {
    configStore.set({...initialConfig});
  } catch (e) {
    console.error(e);
  }
};