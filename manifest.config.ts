import { defineManifest } from '@crxjs/vite-plugin';

import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: 'INGDLC for SOOP',
  description: 'SOOP(숲) 부가 기능 (INGDLC)',
  version: pkg.version,
  icons: {
    16: 'ingdlc-soop-icon-16.png',
    48: 'ingdlc-soop-icon-48.png',
    128: 'ingdlc-soop-icon-128.png',
  },
  action: {
    default_icon: {
      16: 'ingdlc-soop-icon-16.png',
      32: 'ingdlc-soop-icon-32.png',
    },
    default_popup: 'src/popup/index.html',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  content_scripts: [
    // 라이브 툴바 · 채팅 필터. 플레이어와 채팅 영역이 그려진 뒤 마운트하므로
    // run_at 기본값(document_idle)으로 충분하고, 상단 프레임에서만 동작하면 된다.
    {
      matches: ['https://play.sooplive.com/*'],
      js: ['src/content/live/index.ts'],
    },
    // VOD·catch 페이지 다운로드/캡쳐/음량 버튼. 마찬가지로 상단 프레임 · 기본 시점.
    {
      matches: ['https://vod.sooplive.com/*'],
      js: ['src/content/vod/index.ts'],
    },
  ],
  permissions: ['sidePanel', 'storage', 'downloads', 'webRequest'],
  web_accessible_resources: [
    {
      resources: ['src/assets/*.png', 'src/assets/*.svg'],
      matches: ['<all_urls>'],
    },
  ],
  host_permissions: ['https://*.sooplive.com/*'],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
});
