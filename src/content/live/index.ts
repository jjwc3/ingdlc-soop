/**
 * Live-page toolbar (mujisung / capture / audio compressor) and chat filtering.
 *
 * Top frame only. The player toolbar is rendered asynchronously, so the mount
 * waits for `.game_point` and inserts the root right after it; `display:
 * contents` keeps the injected wrapper out of the page's own flex layout.
 */

import { mount } from 'svelte';

import { waitForElement } from '@/lib/wait-for-element';

import App from './App.svelte';
import '../content.css';

async function init() {
  const targetAnchor = await waitForElement('.game_point');
  if (!targetAnchor) return;
  if (document.querySelector('[data-ingdlc-root="live"]')) return;

  const container = document.createElement('div');
  container.dataset.ingdlcRoot = 'live';
  container.style.display = 'contents';

  targetAnchor.after(container);

  mount(App, { target: container });
}

void init();
