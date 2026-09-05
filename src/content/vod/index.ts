/**
 * VOD / catch page buttons (download / capture / audio compressor).
 *
 * Top frame only. The anchor differs per page type — catch pages render a
 * `.share` button, regular VOD pages a `.subscribe` one — and the app is
 * mounted into that anchor's parent, right before the anchor itself.
 */

import { mount } from 'svelte';

import { waitForElement } from '@/lib/wait-for-element';

import App from './App.svelte';

async function init() {
  const anchorSelector = location.href.includes('catch')
    ? '.share'
    : '.subscribe';
  const targetElement = await waitForElement(anchorSelector);

  if (!targetElement?.parentElement) return;
  if (document.querySelector('[data-ingdlc-root="vod"]')) return;

  const container = document.createElement('div');
  container.dataset.ingdlcRoot = 'vod';
  container.style.display = 'contents';

  targetElement.before(container);

  mount(App, { target: container });
}

void init();
