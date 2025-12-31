/**
 * Slices Index
 *
 * Central export point for all store slices.
 */

export { createDraftSlice, type DraftSlice } from './draftSlice'
export { createTemplateSlice, type TemplateSlice } from './templateSlice'
export { createHistorySlice, type HistorySlice } from './historySlice'
export { createPreferencesSlice, type PreferencesSlice } from './preferencesSlice'
export { createIdCounterSlice, type IdCounterSlice } from './idCounterSlice'
export { createUtilitySlice, type UtilitySlice } from './utilitySlice'
export { createUiSlice, type UiSlice } from './uiSlice'
export type { CreatorStore } from './types'
