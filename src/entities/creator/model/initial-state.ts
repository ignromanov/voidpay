/**
 * Creator Store — Canonical Initial State
 *
 * Single source of truth for the persisted fields reset.
 * Used by:
 *   - useCreatorStore: migrate() fallback on data corruption
 *   - utilitySlice: clearAllData() action
 *
 * Must match the fields listed in `partialize` (useCreatorStore.ts).
 */

import type { CreatorStore } from './slices/types'

export const CREATOR_INITIAL_STATE: Pick<
  CreatorStore,
  'version' | 'activeDraft' | 'lineItems' | 'templates' | 'preferences' | 'idCounter'
> = {
  version: 1,
  activeDraft: null,
  lineItems: [],
  templates: [],
  preferences: {},
  idCounter: {
    currentValue: 1,
    prefix: 'INV',
  },
} as const
