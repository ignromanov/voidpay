// Public API for entities/creator
export { useCreatorStore } from './model/useCreatorStore'
export type { CreatorStoreV1, InvoiceIDCounter, UserPreferences } from './model/types'

// Export slice types for selective subscriptions
export type {
  DraftSlice,
  DraftSyncStatus,
  TemplateSlice,
  HistorySlice,
  PreferencesSlice,
  IdCounterSlice,
  UtilitySlice,
  CreatorStore,
} from './model/slices'
