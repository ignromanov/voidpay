/**
 * Creator Store
 *
 * Zustand store for invoice creator state management.
 * Manages drafts, templates, history, preferences, and ID counter.
 *
 * Storage: Browser LocalStorage via Zustand persist middleware
 * Key: voidpay:creator
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import {
  invoiceItemsToLineItems,
  type Invoice,
  type DraftState,
  type LineItem,
} from '@/entities/invoice'
import type { Address } from 'viem'
import type {
  CreatorStoreV1,
  InvoiceTemplate,
  CreationHistoryEntry,
  UserPreferences,
} from './types'
import { CREATOR_STORE_KEY } from '@/shared/config'

/**
 * Store Actions Interface
 */
interface CreatorStoreActions {
  // ========== Draft Management ==========

  /**
   * Update the active draft data (debounced in UI layer)
   */
  updateDraft: (data: Partial<Invoice>) => void

  /**
   * Clear the active draft (called after URL generation)
   */
  clearDraft: () => void

  /**
   * Create a new empty draft with default values from preferences
   */
  createNewDraft: () => string

  // ========== Line Items Management ==========

  /**
   * Update line items (separate from draft for UI)
   */
  updateLineItems: (items: LineItem[]) => void

  /**
   * Add a new empty line item
   */
  addLineItem: () => void

  /**
   * Remove a line item by id
   */
  removeLineItem: (id: string) => void

  /**
   * Update a single line item
   */
  updateLineItem: (id: string, updates: Partial<Omit<LineItem, 'id'>>) => void

  // ========== Template Management ==========

  /**
   * Save the active draft as a template
   */
  saveAsTemplate: (name?: string) => string

  /**
   * Load a template into the active draft
   */
  loadTemplate: (templateId: string) => void

  /**
   * Delete a template
   */
  deleteTemplate: (templateId: string) => void

  // ========== History Management ==========

  /**
   * Add a new history entry (called after invoice URL generation)
   */
  addHistoryEntry: (entry: Omit<CreationHistoryEntry, 'entryId' | 'createdAt'>) => void

  /**
   * Delete a history entry
   */
  deleteHistoryEntry: (entryId: string) => void

  /**
   * Duplicate a history entry as a new draft
   */
  duplicateHistoryEntry: (entryId: string) => string

  /**
   * Manually trigger history pruning (auto-called when > 100 entries)
   */
  pruneHistory: () => void

  // ========== Preferences Management ==========

  /**
   * Update user preferences
   */
  updatePreferences: (prefs: Partial<UserPreferences>) => void

  /**
   * Reset preferences to defaults (empty)
   */
  resetPreferences: () => void

  // ========== Invoice ID Counter ==========

  /**
   * Generate the next invoice ID and increment counter
   */
  generateNextInvoiceId: () => string

  /**
   * Update the ID counter prefix
   */
  updateIdPrefix: (prefix: string) => void

  /**
   * Reset the counter to a specific value
   */
  resetCounter: (value: number) => void

  // ========== Utility ==========

  /**
   * Clear all data
   */
  clearAllData: () => void
}

/**
 * Complete Store Type
 */
type CreatorStore = CreatorStoreV1 & CreatorStoreActions

/**
 * Get current Unix timestamp in seconds
 */
function nowUnix(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * Get Unix timestamp for a date N days from now
 */
function daysFromNowUnix(days: number): number {
  return nowUnix() + days * 24 * 60 * 60
}

/**
 * Initial state
 */
const initialState: CreatorStoreV1 = {
  version: 1,
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
 * Create default draft with preferences
 */
function createDefaultDraft(
  draftId: string,
  invoiceId: string,
  preferences: UserPreferences
): DraftState {
  return {
    meta: {
      draftId,
      lastModified: new Date().toISOString(),
    },
    data: {
      version: 2,
      invoiceId,
      issuedAt: nowUnix(),
      dueAt: daysFromNowUnix(30), // Default: 30 days from now
      networkId: preferences.defaultNetworkId ?? 1,
      currency: preferences.defaultCurrency ?? 'USDC',
      decimals: 6, // Default for USDC
      from: {
        name: preferences.defaultSenderName ?? '',
        walletAddress: (preferences.defaultSenderWallet ??
          '0x0000000000000000000000000000000000000000') as Address,
        ...(preferences.defaultSenderEmail && { email: preferences.defaultSenderEmail }),
        ...(preferences.defaultSenderAddress && {
          physicalAddress: preferences.defaultSenderAddress,
        }),
      },
      client: {
        name: '',
      },
      items: [],
      ...(preferences.defaultTaxRate && { tax: preferences.defaultTaxRate }),
    },
  }
}

/**
 * Create default line item
 */
function createDefaultLineItem(): LineItem {
  return {
    id: uuidv4(),
    description: '',
    quantity: 1,
    rate: '0',
  }
}

/**
 * Migration function for future schema versions
 * Wrapped in try-catch for robustness against corrupted localStorage
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrate = (persistedState: any, version: number): CreatorStoreV1 => {
  try {
    return migrateInternal(persistedState, version)
  } catch (error) {
    console.error('[CreatorStore] Migration failed, resetting to initial state:', error)
    return initialState
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrateInternal = (persistedState: any, version: number): CreatorStoreV1 => {
  // Version 0 (no version) -> Version 1
  if (version === 0 || !persistedState.version) {
    // Migrate from old InvoiceDraft format to new DraftState format
    const oldDraft = persistedState.activeDraft

    let newDraft: DraftState | null = null
    let lineItems: LineItem[] = []

    if (oldDraft) {
      // Extract line items with ids
      lineItems = (oldDraft.lineItems ?? []).map(
        (item: { id?: string; description: string; quantity: number; rate: string }) => ({
          id: item.id ?? uuidv4(),
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        })
      )

      // Convert dates from ISO to Unix timestamps
      const issuedAt = oldDraft.issueDate
        ? Math.floor(new Date(oldDraft.issueDate).getTime() / 1000)
        : nowUnix()

      const dueAt = oldDraft.dueDate
        ? Math.floor(new Date(oldDraft.dueDate).getTime() / 1000)
        : daysFromNowUnix(30)

      newDraft = {
        meta: {
          draftId: oldDraft.draftId ?? uuidv4(),
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
    const newPrefs: UserPreferences = {
      ...oldPrefs,
      // Rename defaultChainId to defaultNetworkId if it exists
      ...(oldPrefs.defaultChainId && { defaultNetworkId: oldPrefs.defaultChainId }),
    }
    // Remove old key
    delete (newPrefs as Record<string, unknown>).defaultChainId

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
    (set, get) => ({
      // ========== State ==========
      ...initialState,

      // ========== Draft Management ==========

      updateDraft: (data) => {
        set((state) => {
          const currentDraft = state.activeDraft

          // If no active draft, create a new one
          if (!currentDraft) {
            const draftId = uuidv4()
            const invoiceId = state.generateNextInvoiceId()
            const newDraft = createDefaultDraft(draftId, invoiceId, state.preferences)

            // Sync lineItems if items provided (for URL hash decoding)
            const lineItems = data.items?.length
              ? invoiceItemsToLineItems(data.items)
              : [createDefaultLineItem()]

            return {
              activeDraft: {
                ...newDraft,
                data: { ...newDraft.data, ...data },
              },
              lineItems,
            }
          }

          // Update existing draft
          // Also sync lineItems if items provided
          const newLineItems = data.items?.length
            ? invoiceItemsToLineItems(data.items)
            : state.lineItems

          return {
            activeDraft: {
              meta: {
                ...currentDraft.meta,
                lastModified: new Date().toISOString(),
              },
              data: {
                ...currentDraft.data,
                ...data,
              },
            },
            lineItems: newLineItems,
          }
        })
      },

      clearDraft: () => {
        set({ activeDraft: null, lineItems: [] })
      },

      createNewDraft: () => {
        const draftId = uuidv4()
        const state = get()
        const invoiceId = state.generateNextInvoiceId()

        const newDraft = createDefaultDraft(draftId, invoiceId, state.preferences)

        set({
          activeDraft: newDraft,
          lineItems: [createDefaultLineItem()],
        })

        return draftId
      },

      // ========== Line Items Management ==========

      updateLineItems: (items) => {
        set((state) => {
          // Also sync to draft.data.items (without ids)
          const invoiceItems = items.map(({ description, quantity, rate }) => ({
            description,
            quantity,
            rate,
          }))

          if (!state.activeDraft) {
            return { lineItems: items }
          }

          return {
            lineItems: items,
            activeDraft: {
              ...state.activeDraft,
              meta: {
                ...state.activeDraft.meta,
                lastModified: new Date().toISOString(),
              },
              data: {
                ...state.activeDraft.data,
                items: invoiceItems,
              },
            },
          }
        })
      },

      addLineItem: () => {
        set((state) => {
          const newItem = createDefaultLineItem()
          const newItems = [...state.lineItems, newItem]

          const invoiceItems = newItems.map(({ description, quantity, rate }) => ({
            description,
            quantity,
            rate,
          }))

          if (!state.activeDraft) {
            return { lineItems: newItems }
          }

          return {
            lineItems: newItems,
            activeDraft: {
              ...state.activeDraft,
              meta: {
                ...state.activeDraft.meta,
                lastModified: new Date().toISOString(),
              },
              data: {
                ...state.activeDraft.data,
                items: invoiceItems,
              },
            },
          }
        })
      },

      removeLineItem: (id) => {
        set((state) => {
          const newItems = state.lineItems.filter((item) => item.id !== id)

          const invoiceItems = newItems.map(({ description, quantity, rate }) => ({
            description,
            quantity,
            rate,
          }))

          if (!state.activeDraft) {
            return { lineItems: newItems }
          }

          return {
            lineItems: newItems,
            activeDraft: {
              ...state.activeDraft,
              meta: {
                ...state.activeDraft.meta,
                lastModified: new Date().toISOString(),
              },
              data: {
                ...state.activeDraft.data,
                items: invoiceItems,
              },
            },
          }
        })
      },

      updateLineItem: (id, updates) => {
        set((state) => {
          const newItems = state.lineItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )

          const invoiceItems = newItems.map(({ description, quantity, rate }) => ({
            description,
            quantity,
            rate,
          }))

          if (!state.activeDraft) {
            return { lineItems: newItems }
          }

          return {
            lineItems: newItems,
            activeDraft: {
              ...state.activeDraft,
              meta: {
                ...state.activeDraft.meta,
                lastModified: new Date().toISOString(),
              },
              data: {
                ...state.activeDraft.data,
                items: invoiceItems,
              },
            },
          }
        })
      },

      // ========== Template Management ==========

      saveAsTemplate: (name) => {
        const state = get()
        const { activeDraft, lineItems } = state

        if (!activeDraft) {
          throw new Error('No active draft to save as template')
        }

        const templateId = uuidv4()

        // Get client name for auto-generated template name
        const clientName = activeDraft.data.client?.name ?? 'Untitled'
        const dateStr = activeDraft.data.issuedAt
          ? new Date(activeDraft.data.issuedAt * 1000).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]

        const templateName = name ?? `${clientName} - ${dateStr}`

        // Include line items in template data
        const templateData: Partial<Invoice> = {
          ...activeDraft.data,
          items: lineItems.map(({ description, quantity, rate }) => ({
            description,
            quantity,
            rate,
          })),
        }

        const template: InvoiceTemplate = {
          templateId,
          name: templateName,
          createdAt: new Date().toISOString(),
          invoiceData: templateData,
        }

        set((state) => ({
          templates: [...state.templates, template],
        }))

        return templateId
      },

      loadTemplate: (templateId) => {
        const state = get()
        const template = state.templates.find((t) => t.templateId === templateId)

        if (!template) {
          throw new Error(`Template ${templateId} not found`)
        }

        const draftId = uuidv4()

        // Convert template items to LineItems with ids
        const lineItems: LineItem[] = (template.invoiceData.items ?? []).map((item) => ({
          id: uuidv4(),
          description: item.description,
          quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity,
          rate: item.rate,
        }))

        const newDraft: DraftState = {
          meta: {
            draftId,
            lastModified: new Date().toISOString(),
          },
          data: {
            ...template.invoiceData,
            // Update dates to current
            issuedAt: nowUnix(),
            dueAt: daysFromNowUnix(30),
          },
        }

        set({
          activeDraft: newDraft,
          lineItems,
        })
      },

      deleteTemplate: (templateId) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.templateId !== templateId),
        }))
      },

      // ========== History Management ==========

      addHistoryEntry: (entry) => {
        const entryId = uuidv4()
        const createdAt = new Date().toISOString()

        const historyEntry: CreationHistoryEntry = {
          entryId,
          createdAt,
          ...entry,
        }

        set((state) => {
          const newHistory = [historyEntry, ...state.history]

          // Auto-prune if exceeds 100 entries
          if (newHistory.length > 100) {
            return { history: newHistory.slice(0, 100) }
          }

          return { history: newHistory }
        })
      },

      deleteHistoryEntry: (entryId) => {
        set((state) => ({
          history: state.history.filter((e) => e.entryId !== entryId),
        }))
      },

      duplicateHistoryEntry: (entryId) => {
        const state = get()
        const entry = state.history.find((e) => e.entryId === entryId)

        if (!entry) {
          throw new Error(`History entry ${entryId} not found`)
        }

        // Create a new draft from the history entry
        // Use full invoice data from history entry
        const draftId = uuidv4()

        const newDraft: DraftState = {
          meta: {
            draftId,
            lastModified: new Date().toISOString(),
          },
          data: {
            ...entry.invoice,
            // Reset dates for new invoice
            issuedAt: nowUnix(),
            dueAt: daysFromNowUnix(30),
          },
        }

        // Convert invoice items to line items with IDs
        const restoredLineItems = entry.invoice.items?.length
          ? invoiceItemsToLineItems(entry.invoice.items)
          : [createDefaultLineItem()]

        set({
          activeDraft: newDraft,
          lineItems: restoredLineItems,
        })

        return draftId
      },

      pruneHistory: () => {
        set((state) => ({
          history: state.history.slice(0, 100),
        }))
      },

      // ========== Preferences Management ==========

      updatePreferences: (prefs) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...prefs,
          },
        }))
      },

      resetPreferences: () => {
        set({ preferences: {} })
      },

      // ========== Invoice ID Counter ==========

      generateNextInvoiceId: () => {
        const state = get()
        const { idCounter } = state

        const paddedNumber = idCounter.currentValue.toString().padStart(3, '0')
        const invoiceId = `${idCounter.prefix}-${paddedNumber}`

        // Increment counter
        set((state) => ({
          idCounter: {
            ...state.idCounter,
            currentValue: state.idCounter.currentValue + 1,
          },
        }))

        return invoiceId
      },

      updateIdPrefix: (prefix) => {
        // Validate prefix (max 10 chars, alphanumeric only)
        if (prefix.length > 10 || !/^[a-zA-Z0-9]*$/.test(prefix)) {
          throw new Error('Invalid prefix: max 10 chars, alphanumeric only')
        }

        set((state) => ({
          idCounter: {
            ...state.idCounter,
            prefix: prefix || 'INV',
          },
        }))
      },

      resetCounter: (value) => {
        if (value < 1) {
          throw new Error('Counter value must be >= 1')
        }

        set((state) => ({
          idCounter: {
            ...state.idCounter,
            currentValue: value,
          },
        }))
      },

      // ========== Utility ==========

      clearAllData: () => {
        set(initialState)
      },
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
