import { z } from 'zod'
import type { Address } from 'viem'
import type { Invoice } from '../model/schema'
import { ETH_ADDRESS_REGEX } from '@/shared/lib/validation'
import { NUMERIC_STRING_REGEX } from './constants'

// Re-export for backwards compatibility
export { ETH_ADDRESS_REGEX } from '@/shared/lib/validation'

/**
 * Custom Zod type for Ethereum addresses
 * Validates format and returns Address type from viem
 */
const addressSchema = z.custom<Address>(
  (val): val is Address => typeof val === 'string' && ETH_ADDRESS_REGEX.test(val),
  { message: 'Invalid Ethereum address format' }
)

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
        quantity: z.union([z.string().regex(NUMERIC_STRING_REGEX), z.number().positive()]),
        rate: z.string().regex(NUMERIC_STRING_REGEX, 'Invalid rate'),
      })
    )
    .min(1),
  tax: z.string().optional(),
  discount: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  _future: z.unknown().optional(),
})

// Verify that the Zod schema matches the TypeScript interface
// This is a type-level check
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type InvoiceSchemaCheck = z.infer<typeof invoiceSchema> extends Invoice ? true : false
