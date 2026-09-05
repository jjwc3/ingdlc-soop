/**
 * Blocked chat nicknames, in their own `block:users` key.
 *
 * The live content script appends to this from a context menu while the side
 * panel edits it as a list; a shared `config` blob would let one overwrite the
 * other's write.
 */

import { createListStore } from './listStore';

export const blockUserStore = createListStore<string>('block:users', [], 5_000);
