/**
 * Streamer ids that get an automatic UP, in their own `autoUp:custom` key.
 */

import { createListStore } from './listStore';

export const autoUpStore = createListStore<string>(
  'autoUp:custom',
  ['nanajam'],
  1_000,
);
