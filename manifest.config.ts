import {defineManifest} from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  "background": {
    "service_worker": "src/background.ts",
    "type": "module"
  },
  content_scripts: [
    {
      js: ['src/content/live/index.ts'],
      matches: ['https://play.sooplive.co.kr/*'],
    },
    {
      js: ['src/content/vod/index.ts'],
      matches: ['https://vod.sooplive.co.kr/*']
    }
  ],
  permissions: [
    'sidePanel',
    'contentSettings',
    'storage',
    'downloads',
    'tabs'
  ],
  "web_accessible_resources": [
    {
      "resources": ["src/assets/*.png", "src/assets/*.svg"],
      "matches": ["<all_urls>"]
    }
  ],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
})
