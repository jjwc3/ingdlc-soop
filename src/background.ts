/**
 * Service worker: side panel opening, file downloads, m3u8 sniffing, and the
 * one-shot storage migration below.
 */

import { CONFIG_KEY, type AppConfig } from '@/modules/config';

/**
 * Moves the unbounded lists out of the single `config` key and into one key per
 * concern. Older versions stored `mujisung.list` / `mujisung.custom` /
 * `mujisung.fromChat` / `blockUser.list` / `autoUp.custom` inside `config`;
 * without this the user's collected and blocked lists would silently vanish on
 * update. Runs once per update, and deletes the migrated fields afterwards so a
 * later run is a no-op.
 */
const MIGRATIONS: { from: [string, string]; to: string }[] = [
  { from: ['mujisung', 'list'], to: 'mujisung:list' },
  { from: ['mujisung', 'custom'], to: 'mujisung:custom' },
  { from: ['mujisung', 'fromChat'], to: 'mujisung:fromChat' },
  { from: ['blockUser', 'list'], to: 'block:users' },
  { from: ['autoUp', 'custom'], to: 'autoUp:custom' },
];

async function migrateListsOutOfConfig() {
  try {
    const stored = await chrome.storage.local.get(CONFIG_KEY);
    const config = stored?.[CONFIG_KEY] as
      | (Partial<AppConfig> & Record<string, Record<string, unknown>>)
      | undefined;
    if (!config) return;

    const writes: Record<string, unknown> = {};
    let changed = false;

    for (const { from, to } of MIGRATIONS) {
      const [group, field] = from;
      const value = config[group]?.[field];
      if (!Array.isArray(value)) continue;

      // 이미 새 키가 있으면 그쪽이 최신이다. 값은 덮어쓰지 않고 필드만 지운다.
      const existing = await chrome.storage.local.get(to);
      if (!(to in existing)) writes[to] = value;

      delete config[group][field];
      changed = true;
    }

    if (!changed) return;
    writes[CONFIG_KEY] = config;
    await chrome.storage.local.set(writes);
  } catch (e) {
    console.error(e);
  }
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'update' || details.reason === 'install') {
    void migrateListsOutOfConfig();
  }
});

let vodAvailable = false;
let vodTitle = '';
let vodURL = '';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'INGDLC_SIDE' && sender.tab?.id) {
    chrome.sidePanel
      .open({ tabId: sender.tab.id })
      .catch((err) => console.error(err));
  }
  if (message.action === 'INGDLC_DOWNLOAD_FILE') {
    chrome.downloads
      .download({
        url: message.payload.url,
        filename: message.payload.filename,
        saveAs: false,
      })
      .catch((err) => console.error(err));
  }
  if (message.action === 'INGDLC_OS') {
    chrome.runtime.getPlatformInfo((info) => {
      sendResponse(info.os);
    });
    return true;
  }
  if (message.action === 'INGDLC_DOWNLOAD_VOD') {
    vodAvailable = true;
    vodURL = message.payload.vodURL;
    vodTitle = message.payload.vodTitle;
    if (sender.tab?.id) {
      chrome.sidePanel
        .open({ tabId: sender.tab.id })
        .catch((e) => console.error(e));
    }
    setTimeout(() => {
      vodAvailable = false;
    }, 3000);
  }
  if (message.action === 'INGDLC_SIDE_DL_REQ') {
    if (vodAvailable) {
      sendResponse({ url: vodURL, title: vodTitle });
      vodAvailable = false;
    }
  }
});

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (
      details.url.includes('sooplive') &&
      details.url.includes('.smil/manifest.m3u8')
    ) {
      chrome.tabs
        .sendMessage(details.tabId, { action: 'INGDLC_VOD', url: details.url })
        .catch(() => {});
    }
    return undefined;
  },
  {
    urls: ['https://*.sooplive.com/*'],
    types: ['xmlhttprequest', 'ping'],
  },
);
