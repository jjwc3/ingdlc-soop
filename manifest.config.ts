import { defineManifest } from '@crxjs/vite-plugin';

import pkg from './package.json';

export default defineManifest( {
  manifest_version: 3,
  name: 'INGDLC for SOOP',
  version: pkg.version,
  icons: {
    16: 'public/ingdlc-soop-icon-16.png',
    48: 'public/ingdlc-soop-icon-48.png',
    128: 'public/ingdlc-soop-icon-128.png',
  },
  action: {
    default_icon: {
      16: 'public/ingdlc-soop-icon-16.png',
      32: 'public/ingdlc-soop-icon-32.png',
    },
    default_popup: 'src/popup/index.html',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  content_scripts: [
    {
      js: [ 'src/content/live/index.ts' ],
      matches: [ 'https://play.sooplive.com/*' ],
    },
    {
      js: [ 'src/content/vod/index.ts' ],
      matches: [ 'https://vod.sooplive.com/*' ],
    },
  ],
  permissions: [ 'sidePanel', 'storage', 'downloads', 'webRequest' ],
  web_accessible_resources: [
    {
      resources: [ 'src/assets/*.png', 'src/assets/*.svg' ],
      matches: [ '<all_urls>' ],
    },
  ],
  host_permissions: [ 'https://*.sooplive.com/*' ],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
} );
