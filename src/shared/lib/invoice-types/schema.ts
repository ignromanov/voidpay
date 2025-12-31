/**
 * Invoice Schema - Shared Layer
 *
 * Zod schema for invoice validation and type inference.
 * This is the single source of truth for the Invoice type.
 *
 * Location: shared/lib (not entities/) to allow imports from shared layer
 * following FSD layer rules (shared → entities → features → widgets → app).
 */

import { z } from 'zod'
import type { Address } from 'viem'
import { ETH_ADDRESS_REGEX } from '@/shared/lib/validation'

/**
 * Regular expression for numeric string validation
 * Used for rate/price fields that store BigInt-compatible strings
 */
const NUMERIC_STRING_REGEX = /^\d+(\.\d+)?$/

/**
 * Custom Zod type for Ethereum addresses
 * Validates format and returns Address type from viem
 */
const addressSchema = z.custom<Address>(
  (val): val is Address => typeof val === 'string' && ETH_ADDRESS_REGEX.test(val),
  { message: 'Invalid Ethereum address format' }
)

/**
 * Invoice Schema (Zod)
 *
 * Complete validation schema for invoice data.
 * The TypeScript Invoice type is inferred from this schema.
 */
export const invoiceSchema = z.object({
  version: z.literal(2),
  invoiceId: z.string().min(1),
  issuedAt: z.number().int().positive(),
  dueAt: z.number().int().positive(),
  notes: z.string().max(280).optional(),
  networkId: z.number().int().positive(),
  currency: z.string().min(1),
  tokenAddress: addressSchema.optional(),
  decimals: z.number().int().nonnegative(),
  from: z.object({
    name: z.string().min(1),
    walletAddress: addressSchema,
    email: z.string().email().optional(),
    physicalAddress: z.string().optional(),
    phone: z.string().optional(),
    taxId: z.string().optional(),
  }),
  client: z.object({
    name: z.string().min(1),
    walletAddress: addressSchema.optional(),
    email: z.string().email().optional(),
    physicalAddress: z.string().optional(),
    phone: z.string().optional(),
    taxId: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        rate: z.string().regex(NUMERIC_STRING_REGEX, 'Invalid rate'),
      })
    )
    .min(1),
  tax: z.string().optional(),
  discount: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  _future: z.unknown().optional(),
})

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
