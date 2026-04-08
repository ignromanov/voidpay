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
import { findTokenForNetwork } from '@/entities/network'
import { nowUnix, daysFromNowUnix } from '@/shared/lib/date-time'
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

  /**
   * Replace the entire draft with external data (hash decode, template load).
   * Atomic: creates clean draft, converts items, strips computed `total`.
   */
  replaceDraft: (data: PartialInvoice) => void

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
 * Create default draft with preferences
 */
function createDefaultDraft(
  draftId: string,
  invoiceId: string,
  preferences: UserPreferences
): DraftState {
  const networkId = preferences.defaultNetworkId ?? 42161
  const defaultToken = findTokenForNetwork(networkId, preferences.defaultCurrency ?? 'USDC')

  return {
    meta: {
      draftId,
      lastModified: new Date().toISOString(),
    },
    data: {
      invoiceId,
      issuedAt: nowUnix(),
      dueAt: daysFromNowUnix(30), // Default: 30 days from now
      networkId,
      currency: defaultToken?.symbol ?? 'USDC',
      decimals: defaultToken?.decimals ?? 6,
      ...(defaultToken?.address && { tokenAddress: defaultToken.address }),
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
 * Strip `id` from LineItems → plain invoice items for draft.data.items
 */
function toInvoiceItems(items: LineItem[]) {
  return items.map(({ description, quantity, rate }) => ({
    description,
    quantity,
    rate,
  }))
}

/**
 * Build updated draft state when items change.
 *
 * Clears stale pre-calculated `total` — it was baked with specific items/decimals
 * and becomes invalid whenever items are added, removed, or modified.
 */
function draftWithItems(draft: DraftState, invoiceItems: ReturnType<typeof toInvoiceItems>): DraftState {
  return {
    ...draft,
    meta: {
      ...draft.meta,
      lastModified: new Date().toISOString(),
    },
    data: {
      ...draft.data,
      items: invoiceItems,
      total: undefined,
    },
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

      // For native tokens (ETH, POL), the decoded invoice has no tokenAddress key.
      // Spread won't override existing tokenAddress if the key is absent,
      // so we explicitly clear it when currency is set but tokenAddress is not.
      const tokenOverride =
        data.currency && !('tokenAddress' in data)
          ? { tokenAddress: undefined }
          : {}

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
            data: { ...newDraft.data, ...data, ...tokenOverride },
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
            ...tokenOverride,
            // Deep merge party objects to preserve fields not in the partial update
            // (e.g., walletAddress when sync only sends name)
            ...(data.from && {
              from: { ...currentDraft.data.from, ...data.from } as typeof currentDraft.data.from,
            }),
            ...(data.client && {
              client: { ...currentDraft.data.client, ...data.client } as typeof currentDraft.data.client,
            }),
          },
        },
        lineItems: newLineItems,
      }
    })
  },

  clearDraft: () => {
    set({ activeDraft: null, lineItems: [], draftSyncStatus: 'idle' })
  },

  createNewDraft: () => {
    const draftId = uuidv4()
    const state = get()
    // Reuse current invoiceId if draft exists (Reset doesn't consume the ID)
    // Counter only advances when a link is generated (in generateAndTrackInvoice)
    const invoiceId = state.activeDraft?.data?.invoiceId ?? state.generateNextInvoiceId()

    const newDraft = createDefaultDraft(draftId, invoiceId, state.preferences)

    set({
      activeDraft: newDraft,
      lineItems: [createDefaultLineItem()],
      draftSyncStatus: 'idle',
    })

    return draftId
  },

  replaceDraft: (data) => {
    const lineItems = data.items
      ? invoiceItemsToLineItems(data.items)
      : [createDefaultLineItem()]

    set({
      activeDraft: {
        meta: {
          draftId: uuidv4(),
          lastModified: new Date().toISOString(),
        },
        data: {
          ...data,
          total: undefined,
        },
      },
      lineItems,
      draftSyncStatus: 'idle',
    })
  },

  // ========== Line Items Management ==========

  updateLineItems: (items) => {
    set((state) => {
      if (!state.activeDraft) return { lineItems: items }
      return {
        lineItems: items,
        activeDraft: draftWithItems(state.activeDraft, toInvoiceItems(items)),
      }
    })
  },

  addLineItem: () => {
    set((state) => {
      const newItems = [...state.lineItems, createDefaultLineItem()]
      if (!state.activeDraft) return { lineItems: newItems }
      return {
        lineItems: newItems,
        activeDraft: draftWithItems(state.activeDraft, toInvoiceItems(newItems)),
      }
    })
  },

  removeLineItem: (id) => {
    set((state) => {
      const newItems = state.lineItems.filter((item) => item.id !== id)
      if (!state.activeDraft) return { lineItems: newItems }
      return {
        lineItems: newItems,
        activeDraft: draftWithItems(state.activeDraft, toInvoiceItems(newItems)),
      }
    })
  },

  updateLineItem: (id, updates) => {
    set((state) => {
      const newItems = state.lineItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
      if (!state.activeDraft) return { lineItems: newItems }
      return {
        lineItems: newItems,
        activeDraft: draftWithItems(state.activeDraft, toInvoiceItems(newItems)),
      }
    })
  },
})
