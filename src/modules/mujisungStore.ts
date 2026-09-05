/**
 * Mujisung list storage.
 *
 * One key per concern (`mujisung:list`, `mujisung:custom`, `mujisung:fromChat`)
 * so a settings write never clobbers a list, and vice versa. `list` is the
 * remote catalogue (refetched on every panel mount, hence the low cap);
 * `custom` and `fromChat` are user/chat sourced.
 */

import { createListStore } from './listStore';

/** [type, song, text] */
export type MujisungEntry = string[];

export const mujisungListStore = createListStore<MujisungEntry>(
  'mujisung:list',
  [],
  20_000,
);

export const mujisungCustomStore = createListStore<string>(
  'mujisung:custom',
  [],
  1_000,
);

export const mujisungFromChatStore = createListStore<string>(
  'mujisung:fromChat',
  [],
  500,
);
