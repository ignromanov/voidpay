/**
 * Slice Types
 *
 * Type definitions for combining all slices into the complete CreatorStore.
 */

import type { DraftSlice } from './draftSlice'
import type { TemplateSlice } from './templateSlice'
import type { HistorySlice } from './historySlice'
import type { PreferencesSlice } from './preferencesSlice'
import type { IdCounterSlice } from './idCounterSlice'
import type { UtilitySlice } from './utilitySlice'

/**
 * Combined Creator Store Type
 *
 * This type represents the complete store state by combining all slices.
 * Each slice contributes its state and actions to the final store.
 */
export type CreatorStore = DraftSlice &
  TemplateSlice &
  HistorySlice &
  PreferencesSlice &
  IdCounterSlice &
  UtilitySlice & {
    /** Schema version for persistence */
    version: 1
  }
