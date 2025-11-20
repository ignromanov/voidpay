/**
 * Creator Store API Contract
 * 
 * This file defines the public API for useCreatorStore.
 * All components should interact with the store through these methods only.
 */

import type { InvoiceDraft, InvoiceTemplate, CreationHistoryEntry, UserPreferences, InvoiceIDCounter } from './data-model'

export interface CreatorStoreState {
  // State
  version: 1
  activeDraft: InvoiceDraft | null
  templates: InvoiceTemplate[]
  history: CreationHistoryEntry[]
  preferences: UserPreferences
  idCounter: InvoiceIDCounter
}

export interface CreatorStoreActions {
  // Draft Management
  
  /**
   * Update the active draft (debounced 500ms)
   * @param draft - Partial draft data to merge with current draft
   */
  updateDraft: (draft: Partial<InvoiceDraft>) => void
  
  /**
   * Clear the active draft (called after URL generation)
   */
  clearDraft: () => void
  
  /**
   * Create a new empty draft with default values from preferences
   * @returns The new draft ID
   */
  createNewDraft: () => string
  
  // Template Management
  
  /**
   * Save the active draft as a template
   * @param name - Template name (optional, auto-generated if not provided)
   * @returns The new template ID
   */
  saveAsTemplate: (name?: string) => string
  
  /**
   * Load a template into the active draft
   * @param templateId - Template ID to load
   * @param confirmOverwrite - If true, skip confirmation for overwriting active draft
   */
  loadTemplate: (templateId: string, confirmOverwrite?: boolean) => void
  
  /**
   * Delete a template
   * @param templateId - Template ID to delete
   */
  deleteTemplate: (templateId: string) => void
  
  /**
   * Get all templates sorted by creation date (newest first)
   */
  getTemplates: () => InvoiceTemplate[]
  
  // History Management
  
  /**
   * Add a new history entry (called after invoice URL generation)
   * @param entry - History entry data
   */
  addHistoryEntry: (entry: Omit<CreationHistoryEntry, 'entryId' | 'createdAt'>) => void
  
  /**
   * Delete a history entry
   * @param entryId - Entry ID to delete
   */
  deleteHistoryEntry: (entryId: string) => void
  
  /**
   * Duplicate a history entry as a new draft
   * @param entryId - Entry ID to duplicate
   * @returns The new draft ID
   */
  duplicateHistoryEntry: (entryId: string) => string
  
  /**
   * Search/filter history entries
   * @param query - Search query (matches invoiceId, recipientName, totalAmount)
   * @returns Filtered history entries
   */
  searchHistory: (query: string) => CreationHistoryEntry[]
  
  /**
   * Get all history entries sorted by creation date (newest first)
   */
  getHistory: () => CreationHistoryEntry[]
  
  /**
   * Manually trigger history pruning (auto-called when > 100 entries)
   */
  pruneHistory: () => void
  
  // Preferences Management
  
  /**
   * Update user preferences
   * @param prefs - Partial preferences to merge
   */
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  
  /**
   * Reset preferences to defaults (empty)
   */
  resetPreferences: () => void
  
  // Invoice ID Counter
  
  /**
   * Generate the next invoice ID and increment counter
   * @returns The generated invoice ID (e.g., "INV-001")
   */
  generateNextInvoiceId: () => string
  
  /**
   * Update the ID counter prefix
   * @param prefix - New prefix (e.g., "ACME")
   */
  updateIdPrefix: (prefix: string) => void
  
  /**
   * Reset the counter to a specific value
   * @param value - New counter value (must be >= 1)
   */
  resetCounter: (value: number) => void
  
  // Utility
  
  /**
   * Clear all data (with confirmation)
   */
  clearAllData: () => void
  
  /**
   * Get current LocalStorage usage estimate
   * @returns Size in bytes
   */
  getStorageSize: () => number
  
  /**
   * Check if storage quota is near limit (> 80%)
   * @returns True if near limit
   */
  isStorageNearLimit: () => boolean
}

export type CreatorStore = CreatorStoreState & CreatorStoreActions

/**
 * Hook to access the creator store
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
export declare function useCreatorStore<T>(selector: (state: CreatorStore) => T): T
