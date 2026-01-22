/**
 * Draft Slice
 *
 * Manages active draft state and line items.
 * Handles draft CRUD operations and line item operations.
 */

import { v4 as uuidv4 } from 'uuid'
import type { StateCreator } from 'zustand'
import type { Address } from 'viem'
import {
  invoiceItemsToLineItems,
  type PartialInvoice,
  type DraftState,
  type LineItem,
} from '@/entities/invoice'
import type { UserPreferences } from '../types'
import type { CreatorStore } from './types'

/**
 * Sync status for draft updates (used by Live Preview badge)
 * - idle: No pending changes
 * - syncing: Changes are being debounced (user is typing)
 * - synced: Changes have been written to store/localStorage
 */
export type DraftSyncStatus = 'idle' | 'syncing' | 'synced'

/**
 * Draft Slice State
 */
export interface DraftSlice {
  /** Active draft (single in-progress invoice) */
  activeDraft: DraftState | null

  /** Line items for current draft (separate for UI with ids for React keys) */
  lineItems: LineItem[]

  /** Sync status for Live Preview badge feedback */
  draftSyncStatus: DraftSyncStatus

  // ========== Sync Status ==========

  /**
   * Set draft sync status (called by useDebouncedDraftUpdate hook)
   */
  setDraftSyncStatus: (status: DraftSyncStatus) => void

  // ========== Draft Management ==========

  /**
   * Update the active draft data (debounced in UI layer)
   */
  updateDraft: (data: PartialInvoice) => void

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
}

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
      networkId: preferences.defaultNetworkId ?? 42161, // Default: Arbitrum
      currency: preferences.defaultCurrency ?? 'USDC',
      decimals: 6, // Default for USDC
      from: {
        name: preferences.defaultSenderName ?? '',
        walletAddress: preferences.defaultSenderWallet as Address,
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
    rate: '',
  }
}

/**
 * Create Draft Slice
 */
export const createDraftSlice: StateCreator<CreatorStore, [], [], DraftSlice> = (set, get) => ({
  // ========== State ==========
  activeDraft: null,
  lineItems: [],
  draftSyncStatus: 'idle',

  // ========== Sync Status ==========

  setDraftSyncStatus: (status) => {
    set({ draftSyncStatus: status })
  },

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
})
