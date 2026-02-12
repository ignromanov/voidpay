/**
 * Invoice Schema - Shared Layer
 *
 * Zod schema for invoice validation and type inference.
 * This is the single source of truth for the Invoice type.
 *
 * Exports two schemas:
 * - invoiceSchema: Strict validation for final invoice generation
 * - invoiceFormSchema: Lenient validation for draft editing (all fields optional)
 *
 * Location: shared/lib (not entities/) to allow imports from shared layer
 * following FSD layer rules (shared → entities → features → widgets → app).
 */

import { z } from 'zod'
import type { Address } from 'viem'
import { ETH_ADDRESS_REGEX } from '@/shared/lib/validation'
import { FIELD_LIMITS } from './limits'

/**
 * Regular expression for atomic units validation
 * Rate/amount fields store integers in atomic units (no decimals)
 * Example: "150000000" for $150.00 USDC (6 decimals)
 */
const ATOMIC_UNITS_REGEX = /^\d+$/

/**
 * Custom Zod type for Ethereum addresses
 * Validates format and returns Address type from viem
 */
const addressSchema = z.custom<Address>(
  (val): val is Address => typeof val === 'string' && ETH_ADDRESS_REGEX.test(val),
  { message: 'Invalid Ethereum address format' }
)

/**
 * Lenient address validation for form inputs
 * Returns string type, validates only if non-empty
 */
const formAddressSchema = z
  .string()
  .refine((val) => !val || ETH_ADDRESS_REGEX.test(val), 'Invalid wallet address')
  .optional()

/**
 * Lenient email validation for form inputs
 * Validates only if non-empty
 */
const formEmailSchema = (maxLength: number) =>
  z
    .string()
    .max(maxLength)
    .refine((val) => !val || z.string().email().safeParse(val).success, 'Invalid email')
    .optional()

/**
 * Invoice Schema (Zod)
 *
 * Complete validation schema for invoice data.
 * The TypeScript Invoice type is inferred from this schema.
 */
export const invoiceSchema = z.object({
  version: z.literal(2),
  invoiceId: z.string().min(1).max(FIELD_LIMITS.invoiceId),
  issuedAt: z.number().int().positive(),
  dueAt: z.number().int().positive(),
  notes: z.string().max(FIELD_LIMITS.notes).optional(),
  networkId: z.number().int().positive(),
  currency: z.string().min(1).max(FIELD_LIMITS.currency),
  tokenAddress: addressSchema.optional(),
  decimals: z.number().int().min(0).max(FIELD_LIMITS.maxDecimals),
  from: z.object({
    name: z.string().min(1).max(FIELD_LIMITS.name),
    walletAddress: addressSchema,
    email: z.string().email().max(FIELD_LIMITS.email).optional(),
    physicalAddress: z.string().max(FIELD_LIMITS.address).optional(),
    phone: z.string().max(FIELD_LIMITS.phone).optional(),
    taxId: z.string().max(FIELD_LIMITS.taxId).optional(),
  }),
  client: z.object({
    name: z.string().min(1).max(FIELD_LIMITS.name),
    walletAddress: addressSchema.optional(),
    email: z.string().email().max(FIELD_LIMITS.email).optional(),
    physicalAddress: z.string().max(FIELD_LIMITS.address).optional(),
    phone: z.string().max(FIELD_LIMITS.phone).optional(),
    taxId: z.string().max(FIELD_LIMITS.taxId).optional(),
  }),
  items: z
    .array(
      z.object({
        description: z.string().min(1).max(FIELD_LIMITS.description),
        quantity: z.number().positive(),
        rate: z.string().regex(ATOMIC_UNITS_REGEX, 'Rate must be atomic units (integer)'),
      })
    )
    .min(1)
    .max(FIELD_LIMITS.maxItems),
  tax: z
    .string()
    .refine((val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 100), 'Tax must be 0-100%')
    .optional(),
  discount: z
    .string()
    .refine(
      (val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 100),
      'Discount must be 0-100%'
    )
    .optional(),
  /** Pre-calculated total in atomic units (includes Magic Dust if enabled) */
  total: z.string().regex(ATOMIC_UNITS_REGEX, 'Total must be atomic units').optional(),
  /** Magic Dust amount in atomic units (1-999 for unique payment ID) */
  magicDust: z.string().regex(ATOMIC_UNITS_REGEX, 'Magic Dust must be atomic units').optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  _future: z.unknown().optional(),
}).refine(
  (data) => data.dueAt >= data.issuedAt,
  { message: 'Due date must be on or after issue date', path: ['dueAt'] }
)

/**
 * Invoice Type - Inferred from Zod schema
 *
 * This ensures the Zod schema is the single source of truth.
 * Any changes to the schema automatically update the TypeScript type.
 */
export type Invoice = z.infer<typeof invoiceSchema>

/**
 * Type-level check to ensure schema inference works correctly
 * This will cause a TypeScript error if the schema doesn't match expectations
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type InvoiceSchemaCheck = Invoice extends {
  version: 2
  invoiceId: string
  issuedAt: number
  dueAt: number
  networkId: number
  currency: string
  decimals: number
  from: { name: string; walletAddress: Address }
  client: { name: string }
  items: Array<{ description: string; quantity: number; rate: string }>
}
  ? true
  : never

// ============================================================================
// FORM SCHEMA (Lenient)
// ============================================================================

/**
 * Form Party Schema - Lenient validation for party sections (from/client)
 * All fields optional during draft editing
 */
const formPartySchema = z
  .object({
    name: z.string().max(FIELD_LIMITS.name).optional(),
    walletAddress: formAddressSchema,
    email: formEmailSchema(FIELD_LIMITS.email),
    physicalAddress: z.string().max(FIELD_LIMITS.address).optional(),
    phone: z.string().max(FIELD_LIMITS.phone).optional(),
    taxId: z.string().max(FIELD_LIMITS.taxId).optional(),
  })
  .optional()

/**
 * Invoice Form Schema (Lenient)
 *
 * Used for draft editing with react-hook-form.
 * All fields are optional to allow incremental form completion.
 * Strict validation (invoiceSchema) is applied only when generating the final invoice.
 *
 * Key differences from invoiceSchema:
 * - All fields optional (no required minimums)
 * - Address fields are strings (not viem Address type)
 * - No items array (handled separately by useFieldArray)
 * - Simpler tax/discount validation
 */
export const invoiceFormSchema = z.object({
  invoiceId: z.string().max(FIELD_LIMITS.invoiceId).optional(),
  issuedAt: z.number().int().positive().optional(),
  dueAt: z.number().int().positive().optional(),
  notes: z.string().max(FIELD_LIMITS.notes).optional(),
  networkId: z.number().int().positive().optional(),
  currency: z.string().max(FIELD_LIMITS.currency).optional(),
  tokenAddress: formAddressSchema,
  decimals: z.number().int().min(0).max(FIELD_LIMITS.maxDecimals).optional(),
  tax: z
    .string()
    .refine((val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 100), 'Tax must be 0-100%')
    .optional(),
  discount: z
    .string()
    .refine(
      (val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 100),
      'Discount must be 0-100%'
    )
    .optional(),
  from: formPartySchema,
  client: formPartySchema,
})

/**
 * Invoice Form Values - Type inferred from form schema
 * Used by react-hook-form for type-safe form handling
 */
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>
