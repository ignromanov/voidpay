/**
 * Generate Link Feature Types
 *
 * Types for invoice validation and URL generation.
 */

/** Result of pre-generation invoice validation */
export interface ValidationResult {
  /** Whether invoice is valid for generation */
  isValid: boolean

  /** Validation errors by field */
  errors: ValidationError[]

  /** Estimated URL size in bytes */
  estimatedSize: number

  /** Warning if URL size is close to limit (> 1800 bytes) */
  sizeWarning?: string
}

/** Individual validation error */
export interface ValidationError {
  /** Field path (e.g., 'from.walletAddress', 'items') */
  field: string

  /** Human-readable error message */
  message: string
}

/** Options for URL generation */
export interface GenerateOptions {
  /** Include OG preview in URL (?og=...) */
  includeOG?: boolean
}
