/**
 * Export/Import API Contract
 *
 * This file defines the public API for data export/import functionality.
 */

import type { ExportDataV1 } from './data-model'

export interface ExportOptions {
  /**
   * Include creator store data (drafts, templates, history, preferences)
   * @default true
   */
  includeCreator?: boolean

  /**
   * Include payer store data (receipts)
   * @default true
   */
  includePayer?: boolean

  /**
   * Pretty-print JSON output
   * @default false
   */
  prettyPrint?: boolean
}

export interface ImportOptions {
  /**
   * Merge with existing data (true) or replace (false)
   * @default false (replace)
   */
  merge?: boolean

  /**
   * Skip confirmation prompts (use with caution)
   * @default false
   */
  skipConfirmation?: boolean
}

export interface ImportResult {
  success: boolean
  message: string
  errors?: string[]

  // Statistics
  stats?: {
    draftsImported: number
    templatesImported: number
    historyImported: number
    receiptsImported: number
  }
}

export interface ExportImportAPI {
  /**
   * Export data to JSON
   * @param options - Export options
   * @returns JSON string
   */
  exportData: (options?: ExportOptions) => string

  /**
   * Download export data as JSON file
   * @param options - Export options
   * @param filename - Custom filename (optional, auto-generated if not provided)
   */
  downloadExport: (options?: ExportOptions, filename?: string) => void

  /**
   * Import data from JSON string
   * @param jsonData - JSON string to import
   * @param options - Import options
   * @returns Import result
   */
  importData: (jsonData: string, options?: ImportOptions) => Promise<ImportResult>

  /**
   * Import data from file
   * @param file - File object to import
   * @param options - Import options
   * @returns Import result
   */
  importFromFile: (file: File, options?: ImportOptions) => Promise<ImportResult>

  /**
   * Validate export data structure
   * @param jsonData - JSON string to validate
   * @returns Validation result
   */
  validateExportData: (jsonData: string) => {
    valid: boolean
    version?: number
    errors?: string[]
  }

  /**
   * Get export file size estimate
   * @param options - Export options
   * @returns Size in bytes
   */
  getExportSize: (options?: ExportOptions) => number
}

/**
 * Generate default export filename
 * Format: voidpay-backup-YYYY-MM-DD.json
 */
export function generateExportFilename(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `voidpay-backup-${year}-${month}-${day}.json`
}

/**
 * Validate export data schema version
 * @param data - Parsed export data
 * @returns True if version is supported
 */
export function isSupportedVersion(data: unknown): data is ExportDataV1 {
  if (!data || typeof data !== 'object') {
    return false
  }

  const exportData = data as Record<string, unknown>
  return (
    exportData.version === 1 &&
    'exportedAt' in exportData &&
    'creator' in exportData &&
    'payer' in exportData
  )
}
