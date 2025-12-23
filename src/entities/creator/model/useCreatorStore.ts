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
import type {
  CreatorStoreV1,
  InvoiceDraft,
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
   * Update the active draft (debounced in UI layer)
   */
  updateDraft: (draft: Partial<InvoiceDraft>) => void

  /**
   * Clear the active draft (called after URL generation)
   */
  clearDraft: () => void

  /**
   * Create a new empty draft with default values from preferences
   */
  createNewDraft: () => string

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
 * Initial state
 */
const initialState: CreatorStoreV1 = {
  version: 1,
  activeDraft: null,
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
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrate = (persistedState: any, version: number): CreatorStoreV1 => {
  // Version 0 (no version) → Version 1
  if (version === 0 || !persistedState.version) {
    return {
      ...persistedState,
      version: 1,
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

      updateDraft: (draft) => {
        set((state) => {
          const currentDraft = state.activeDraft

          // If no active draft, create a new one
          if (!currentDraft) {
            const newDraft: InvoiceDraft = {
              draftId: uuidv4(),
              lastModified: new Date().toISOString(),
              invoiceId: '',
              issueDate: '',
              dueDate: '',
              chainId: state.preferences.defaultChainId || 1,
              currencySymbol: state.preferences.defaultCurrency || 'USDC',
              decimals: 6,
              sender: {
                name: state.preferences.defaultSenderName || '',
                wallet: state.preferences.defaultSenderWallet || '',
                ...(state.preferences.defaultSenderEmail && {
                  email: state.preferences.defaultSenderEmail,
                }),
                ...(state.preferences.defaultSenderAddress && {
                  address: state.preferences.defaultSenderAddress,
                }),
              },
              recipient: {
                name: '',
              },
              lineItems: [],
              taxRate: state.preferences.defaultTaxRate || '0',
              discountAmount: '0',
              ...draft,
            }

            return { activeDraft: newDraft }
          }

          // Update existing draft
          return {
            activeDraft: {
              ...currentDraft,
              ...draft,
              lastModified: new Date().toISOString(),
            },
          }
        })
      },

      clearDraft: () => {
        set({ activeDraft: null })
      },

      createNewDraft: () => {
        const draftId = uuidv4()
        const state = get()

        const newDraft: InvoiceDraft = {
          draftId,
          lastModified: new Date().toISOString(),
          invoiceId: state.generateNextInvoiceId(),
          issueDate: new Date().toISOString().split('T')[0] || '',
          dueDate: '',
          chainId: state.preferences.defaultChainId || 1,
          currencySymbol: state.preferences.defaultCurrency || 'USDC',
          decimals: 6,
          sender: {
            name: state.preferences.defaultSenderName || '',
            wallet: state.preferences.defaultSenderWallet || '',
            ...(state.preferences.defaultSenderEmail && {
              email: state.preferences.defaultSenderEmail,
            }),
            ...(state.preferences.defaultSenderAddress && {
              address: state.preferences.defaultSenderAddress,
            }),
          },
          recipient: {
            name: '',
          },
          lineItems: [
            {
              id: uuidv4(),
              description: '',
              quantity: 1,
              rate: '0',
            },
          ],
          taxRate: state.preferences.defaultTaxRate || '0',
          discountAmount: '0',
        }

        set({ activeDraft: newDraft })
        return draftId
      },

      // ========== Template Management ==========

      saveAsTemplate: (name) => {
        const state = get()
        const { activeDraft } = state

        if (!activeDraft) {
          throw new Error('No active draft to save as template')
        }

        const templateId = uuidv4()

        // Auto-generate name if not provided
        const templateName =
          name ||
          `${activeDraft.recipient.name || 'Untitled'} - ${activeDraft.issueDate || new Date().toISOString().split('T')[0]}`

        const template: InvoiceTemplate = {
          templateId,
          name: templateName,
          createdAt: new Date().toISOString(),
          invoiceData: {
            invoiceId: activeDraft.invoiceId,
            issueDate: activeDraft.issueDate,
            dueDate: activeDraft.dueDate,
            ...(activeDraft.notes && { notes: activeDraft.notes }),
            chainId: activeDraft.chainId,
            currencySymbol: activeDraft.currencySymbol,
            ...(activeDraft.tokenAddress && { tokenAddress: activeDraft.tokenAddress }),
            decimals: activeDraft.decimals,
            sender: activeDraft.sender,
            recipient: activeDraft.recipient,
            lineItems: activeDraft.lineItems,
            taxRate: activeDraft.taxRate,
            discountAmount: activeDraft.discountAmount,
          },
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

        const newDraft: InvoiceDraft = {
          draftId: uuidv4(),
          lastModified: new Date().toISOString(),
          ...template.invoiceData,
        }

        set({ activeDraft: newDraft })
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
        // Note: We don't have full invoice data in history, so this is a simplified version
        const draftId = uuidv4()

        const newDraft: InvoiceDraft = {
          draftId,
          lastModified: new Date().toISOString(),
          invoiceId: entry.invoiceId,
          issueDate: new Date().toISOString().split('T')[0] || '',
          dueDate: '',
          chainId: state.preferences.defaultChainId || 1,
          currencySymbol: state.preferences.defaultCurrency || 'USDC',
          decimals: 6,
          sender: {
            name: state.preferences.defaultSenderName || '',
            wallet: state.preferences.defaultSenderWallet || '',
            ...(state.preferences.defaultSenderEmail && {
              email: state.preferences.defaultSenderEmail,
            }),
            ...(state.preferences.defaultSenderAddress && {
              address: state.preferences.defaultSenderAddress,
            }),
          },
          recipient: {
            name: entry.recipientName,
          },
          lineItems: [
            {
              id: uuidv4(),
              description: '',
              quantity: 1,
              rate: '0',
            },
          ],
          taxRate: state.preferences.defaultTaxRate || '0',
          discountAmount: '0',
        }

        set({ activeDraft: newDraft })
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
        templates: state.templates,
        history: state.history,
        preferences: state.preferences,
        idCounter: state.idCounter,
      }),
    }
  )
)
