/**
 * History Slice
 *
 * Manages invoice creation history.
 * Handles history CRUD operations and duplicating history entries as drafts.
 */

import { v4 as uuidv4 } from 'uuid'
import type { StateCreator } from 'zustand'
import { invoiceItemsToLineItems, type DraftState } from '@/entities/invoice'
import type { CreationHistoryEntry } from '../types'
import type { CreatorStore } from './types'

/**
 * History Slice State
 */
export interface HistorySlice {
  /** Creation history (auto-pruned at 100 entries) */
  history: CreationHistoryEntry[]

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
 * Create default line item
 */
function createDefaultLineItem() {
  return {
    id: uuidv4(),
    description: '',
    quantity: 1,
    rate: '0',
  }
}

/**
 * Create History Slice
 */
export const createHistorySlice: StateCreator<CreatorStore, [], [], HistorySlice> = (set, get) => ({
  // ========== State ==========
  history: [],

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
})
