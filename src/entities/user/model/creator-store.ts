import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { InvoiceDraft, InvoiceTemplate, CreationHistoryEntry } from '../../invoice/model/types'
import { STORAGE_KEYS } from '@/shared/config/storage-keys'

// ============================================================================
// Types
// ============================================================================

export interface UserPreferences {
  // Sender defaults
  defaultSenderName?: string
  defaultSenderWallet?: string
  defaultSenderEmail?: string
  defaultSenderAddress?: string

  // Currency defaults
  defaultCurrency?: string // e.g., "USDC"
  defaultChainId?: number // e.g., 42161 (Arbitrum)

  // Invoice defaults
  defaultTaxRate?: string // e.g., "10%"
  defaultIdPrefix?: string // e.g., "ACME" → "ACME-001"
}

export interface InvoiceIDCounter {
  currentValue: number // Current counter (starts at 1)
  prefix: string // ID prefix (default: "INV")
}

export interface CreatorStoreState {
  version: number

  // Active draft (single)
  activeDraft: InvoiceDraft | null

  // Saved templates
  templates: InvoiceTemplate[]

  // Creation history
  history: CreationHistoryEntry[]

  // User preferences
  preferences: UserPreferences

  // Auto-incrementing ID counter
  idCounter: InvoiceIDCounter
}

export interface CreatorStoreActions {
  // Draft Actions
  setDraft: (draft: InvoiceDraft | null) => void
  updateDraft: (updates: Partial<InvoiceDraft>) => void
  clearDraft: () => void

  // Template Actions
  saveTemplate: (template: InvoiceTemplate) => void
  deleteTemplate: (templateId: string) => void

  // History Actions
  addToHistory: (entry: CreationHistoryEntry) => void
  updateHistoryEntry: (entryId: string, updates: Partial<CreationHistoryEntry>) => void
  deleteHistoryEntry: (entryId: string) => void

  // Preference Actions
  updatePreferences: (updates: Partial<UserPreferences>) => void

  // ID Counter Actions
  incrementIdCounter: () => number
  setCounterPrefix: (prefix: string) => void

  // System Actions
  reset: () => void
}

type CreatorStore = CreatorStoreState & CreatorStoreActions

// ============================================================================
// Initial State
// ============================================================================

const INITIAL_STATE: CreatorStoreState = {
  version: 1,
  activeDraft: null,
  templates: [],
  history: [],
  preferences: {},
  idCounter: {
    currentValue: 0,
    prefix: 'INV',
  },
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useCreatorStore = create<CreatorStore>()(
  persist(
    immer((set) => ({
      ...INITIAL_STATE,

      // Draft Actions
      setDraft: (draft) =>
        set((state) => {
          state.activeDraft = draft
        }),

      updateDraft: (updates) =>
        set((state) => {
          if (state.activeDraft) {
            Object.assign(state.activeDraft, updates)
            state.activeDraft.lastModified = new Date().toISOString()
          }
        }),

      clearDraft: () =>
        set((state) => {
          state.activeDraft = null
        }),

      // Template Actions
      saveTemplate: (template) =>
        set((state) => {
          const index = state.templates.findIndex(
            (t: InvoiceTemplate) => t.templateId === template.templateId
          )
          if (index >= 0) {
            state.templates[index] = template
          } else {
            state.templates.push(template)
          }
        }),

      deleteTemplate: (templateId) =>
        set((state) => {
          state.templates = state.templates.filter(
            (t: InvoiceTemplate) => t.templateId !== templateId
          )
        }),

      // History Actions
      addToHistory: (entry) =>
        set((state) => {
          // Add to beginning of list
          state.history.unshift(entry)
        }),

      updateHistoryEntry: (entryId, updates) =>
        set((state) => {
          const index = state.history.findIndex((h: CreationHistoryEntry) => h.entryId === entryId)
          if (index >= 0) {
            Object.assign(state.history[index], updates)
          }
        }),

      deleteHistoryEntry: (entryId) =>
        set((state) => {
          state.history = state.history.filter((h: CreationHistoryEntry) => h.entryId !== entryId)
        }),

      // Preference Actions
      updatePreferences: (updates) =>
        set((state) => {
          Object.assign(state.preferences, updates)
        }),

      // ID Counter Actions
      incrementIdCounter: () => {
        let nextVal = 0
        set((state) => {
          state.idCounter.currentValue += 1
          nextVal = state.idCounter.currentValue
        })
        return nextVal // Return the new value for immediate use
      },

      setCounterPrefix: (prefix) =>
        set((state) => {
          state.idCounter.prefix = prefix
        }),

      // System Actions
      reset: () => set(INITIAL_STATE),
    })),
    {
      name: STORAGE_KEYS.CREATOR, // 'voidpay:creator'
      storage: createJSONStorage(() => localStorage),
      version: 1,
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
