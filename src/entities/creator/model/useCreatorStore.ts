/**
 * Creator Store
 *
 * Zustand store for invoice creator state management.
 * Manages drafts, templates, history, preferences, and ID counter.
 *
 * Storage: Browser LocalStorage via Zustand persist middleware
 * Key: voidpay:creator
 *
 * Architecture: Composed from focused slices for better organization.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CREATOR_STORE_KEY } from '@/shared/config'
import {
  createDraftSlice,
  createTemplateSlice,
  createHistorySlice,
  createPreferencesSlice,
  createIdCounterSlice,
  createUtilitySlice,
  type CreatorStore,
} from './slices'

/**
 * Initial state
 */
const initialState = {
  version: 1 as const,
  activeDraft: null,
  lineItems: [],
  templates: [],
  history: [],
  preferences: {},
  idCounter: {
    currentValue: 1,
    prefix: 'INV',
  },
}

/**
 * Migration function for future schema versions
 * Wrapped in try-catch for robustness against corrupted localStorage
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrate = (persistedState: any, version: number): Partial<CreatorStore> => {
  try {
    return migrateInternal(persistedState, version)
  } catch (error) {
    console.error('[CreatorStore] Migration failed, resetting to initial state:', error)
    return initialState
  }
}

// Migration helper - inline uuid v4 generator for migration only
// Using crypto.randomUUID() instead of uuid package to avoid require()
const generateMigrationId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrateInternal = (persistedState: any, version: number): Partial<CreatorStore> => {
  // Version 0 (no version) -> Version 1
  if (version === 0 || !persistedState.version) {
    // Migrate from old InvoiceDraft format to new DraftState format
    const oldDraft = persistedState.activeDraft

    let newDraft = null
    let lineItems: Array<{ id: string; description: string; quantity: number; rate: string }> = []

    if (oldDraft) {
      // Extract line items with ids
      lineItems = (oldDraft.lineItems ?? []).map(
        (item: { id?: string; description: string; quantity: number; rate: string }) => ({
          id: item.id ?? generateMigrationId(),
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        })
      )

      // Get current Unix timestamp in seconds
      const nowUnix = () => Math.floor(Date.now() / 1000)
      const daysFromNowUnix = (days: number) => nowUnix() + days * 24 * 60 * 60

      // Convert dates from ISO to Unix timestamps
      const issuedAt = oldDraft.issueDate
        ? Math.floor(new Date(oldDraft.issueDate).getTime() / 1000)
        : nowUnix()

      const dueAt = oldDraft.dueDate
        ? Math.floor(new Date(oldDraft.dueDate).getTime() / 1000)
        : daysFromNowUnix(30)

      newDraft = {
        meta: {
          draftId: oldDraft.draftId ?? generateMigrationId(),
          lastModified: oldDraft.lastModified ?? new Date().toISOString(),
        },
        data: {
          version: 2,
          invoiceId: oldDraft.invoiceId ?? '',
          issuedAt,
          dueAt,
          networkId: oldDraft.chainId ?? 1,
          currency: oldDraft.currencySymbol ?? 'USDC',
          tokenAddress: oldDraft.tokenAddress,
          decimals: oldDraft.decimals ?? 6,
          from: {
            name: oldDraft.sender?.name ?? '',
            walletAddress: oldDraft.sender?.wallet ?? '',
            ...(oldDraft.sender?.email && { email: oldDraft.sender.email }),
            ...(oldDraft.sender?.address && { physicalAddress: oldDraft.sender.address }),
          },
          client: {
            name: oldDraft.recipient?.name ?? '',
            ...(oldDraft.recipient?.wallet && { walletAddress: oldDraft.recipient.wallet }),
            ...(oldDraft.recipient?.email && { email: oldDraft.recipient.email }),
            ...(oldDraft.recipient?.address && { physicalAddress: oldDraft.recipient.address }),
          },
          items: lineItems.map(({ description, quantity, rate }) => ({
            description,
            quantity,
            rate,
          })),
          ...(oldDraft.taxRate && oldDraft.taxRate !== '0' && { tax: oldDraft.taxRate }),
          ...(oldDraft.discountAmount &&
            oldDraft.discountAmount !== '0' && { discount: oldDraft.discountAmount }),
          ...(oldDraft.notes && { notes: oldDraft.notes }),
        },
      }
    }

    // Migrate preferences
    const oldPrefs = persistedState.preferences ?? {}
    const newPrefs: Record<string, unknown> = {
      ...oldPrefs,
      // Rename defaultChainId to defaultNetworkId if it exists
      ...(oldPrefs.defaultChainId && { defaultNetworkId: oldPrefs.defaultChainId }),
    }
    // Remove old key
    delete newPrefs.defaultChainId

    return {
      ...persistedState,
      version: 1,
      activeDraft: newDraft,
      lineItems,
      preferences: newPrefs,
    }
  }

  // Future migrations go here
  // if (version === 1) {
  //   return { ...persistedState, version: 2, newField: defaultValue }
  // }

  return persistedState
}

/**
 * useCreatorStore Hook
 *
 * Composed from multiple slices for better organization:
 * - draftSlice: Draft and line items management
 * - templateSlice: Template CRUD operations
 * - historySlice: History CRUD operations
 * - preferencesSlice: User preferences
 * - idCounterSlice: Invoice ID generation
 * - utilitySlice: Global utility actions
 *
 * @example
 * // Select specific state
 * const activeDraft = useCreatorStore((s) => s.activeDraft)
 *
 * @example
 * // Select action
 * const updateDraft = useCreatorStore((s) => s.updateDraft)
 *
 * @example
 * // Select multiple values
 * const { activeDraft, updateDraft } = useCreatorStore((s) => ({
 *   activeDraft: s.activeDraft,
 *   updateDraft: s.updateDraft,
 * }))
 */
export const useCreatorStore = create<CreatorStore>()(
  persist(
    (...a) => ({
      // ========== State ==========
      version: 1,

      // ========== Slices ==========
      ...createDraftSlice(...a),
      ...createTemplateSlice(...a),
      ...createHistorySlice(...a),
      ...createPreferencesSlice(...a),
      ...createIdCounterSlice(...a),
      ...createUtilitySlice(...a),
    }),
    {
      name: CREATOR_STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate,
      // Partialize to exclude computed fields if needed
      partialize: (state) => ({
        version: state.version,
        activeDraft: state.activeDraft,
        lineItems: state.lineItems,
        templates: state.templates,
        history: state.history,
        preferences: state.preferences,
        idCounter: state.idCounter,
      }),
    }
  )
)
