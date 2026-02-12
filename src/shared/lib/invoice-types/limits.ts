/**
 * Invoice Field Limits
 *
 * Single source of truth for all field length restrictions.
 * Designed to fit within ~2000 byte URL limit after gzip compression.
 *
 * Used by:
 * - invoiceSchema (strict validation)
 * - invoiceFormSchema (lenient draft validation)
 * - UI components (maxLength attributes)
 */
export const FIELD_LIMITS = {
  /** Invoice ID, e.g., "INV-2024-001234" */
  invoiceId: 50,

  /** Company/person names */
  name: 100,

  /** Standard email length */
  email: 100,

  /** International phone format with spaces */
  phone: 30,

  /** Multi-line physical address */
  address: 200,

  /** Tax IDs vary by country */
  taxId: 50,

  /** Twitter-like brevity for notes */
  notes: 280,

  /** Token symbols (USDC, WETH, etc.) */
  currency: 10,

  /** Line item description */
  description: 200,

  /** Maximum line items per invoice */
  maxItems: 5,

  /** Maximum token decimals (ERC-20 standard) */
  maxDecimals: 18,

  // ═══════════════════════════════════════════════════════════════
  // Financial Limits
  // ═══════════════════════════════════════════════════════════════

  /** Price/rate per item (string for BigInt). e.g., "999999999999.999999" */
  rate: 24,

  /** Maximum quantity per line item */
  maxQuantity: 99999,

  /** Percentage fields (tax/discount). e.g., "100.00" */
  percentage: 6,
} as const

export type FieldLimits = typeof FIELD_LIMITS
