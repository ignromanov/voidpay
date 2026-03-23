/**
 * Slice Types
 *
 * Type definitions for combining all slices into the complete CreatorStore.
 */

import type { DraftSlice } from './draftSlice'
import type { TemplateSlice } from './templateSlice'
import type { PreferencesSlice } from './preferencesSlice'
import type { IdCounterSlice } from './idCounterSlice'
import type { UtilitySlice } from './utilitySlice'
import type { UiSlice } from './uiSlice'

/**
 * Combined Creator Store Type
 *
 * This type represents the complete store state by combining all slices.
 * Each slice contributes its state and actions to the final store.
 *
 * Note: UiSlice state is transient and excluded from persistence.
 * Note: HistorySlice removed — history now lives in TrackedInvoiceStore.
 */
export type CreatorStore = DraftSlice &
  TemplateSlice &
  PreferencesSlice &
  IdCounterSlice &
  UtilitySlice &
  UiSlice & {
    /** Schema version for persistence */
    version: 1
  }
