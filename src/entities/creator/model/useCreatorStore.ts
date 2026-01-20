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
  createUiSlice,
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
 *
 * Re-throws code bugs (TypeError, RangeError) to surface development issues.
 * Only catches data-related errors (corrupted localStorage, invalid schema).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrate = (persistedState: any, version: number): Partial<CreatorStore> => {
  try {
    return migrateInternal(persistedState, version)
  } catch (error) {
    // Re-throw code bugs to surface them during development
    if (error instanceof TypeError || error instanceof RangeError) {
      throw error
    }

    // Log with context for debugging data-related issues
    console.error('[CreatorStore] Migration failed:', {
      error,
      version,
      persistedStateKeys: Object.keys(persistedState ?? {}),
    })

    // Return initial state for data corruption
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
 * - uiSlice: Transient UI state (not persisted)
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
      ...createUiSlice(...a),
    }),
    {
      name: CREATOR_STORE_KEY,
      storage: createJSONStorage(() => ({
        // Note: createJSONStorage handles JSON.parse/stringify internally
        // Custom storage should return raw strings, not parsed objects
        getItem: (name) => {
          // SSR guard: localStorage is not available on server
          if (typeof window === 'undefined') return null
          try {
            return localStorage.getItem(name)
          } catch (error) {
            console.warn('[CreatorStore] Failed to read from localStorage:', error)
            return null
          }
        },
        setItem: (name, value) => {
          // SSR guard: localStorage is not available on server
          if (typeof window === 'undefined') return
          try {
            localStorage.setItem(name, value)
          } catch (error) {
            // Handle quota exceeded and other storage errors
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
              console.warn('[CreatorStore] localStorage quota exceeded. Draft auto-save disabled.')
            } else {
              console.warn('[CreatorStore] Failed to write to localStorage:', error)
            }
          }
        },
        removeItem: (name) => {
          // SSR guard: localStorage is not available on server
          if (typeof window === 'undefined') return
          try {
            localStorage.removeItem(name)
          } catch (error) {
            console.warn('[CreatorStore] Failed to remove from localStorage:', error)
          }
        },
      })),
      version: 1,
      migrate,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[CreatorStore] Failed to rehydrate store:', error)
        }
      },
      // Partialize: only persist these fields (excludes transient UI state like networkTheme)
      partialize: (state) => ({
        version: state.version,
        activeDraft: state.activeDraft,
        lineItems: state.lineItems,
        templates: state.templates,
        history: state.history,
        preferences: state.preferences,
        idCounter: state.idCounter,
        // Note: networkTheme is intentionally excluded (transient UI state)
      }),
    }
  )
)
