import { z } from 'zod'
import { InvoiceSchemaV1 } from '../model/schema'
import { ETH_ADDRESS_REGEX } from '@/shared/lib/validation'
import { NUMERIC_STRING_REGEX } from './constants'

// Re-export for backwards compatibility
export { ETH_ADDRESS_REGEX } from '@/shared/lib/validation'

export const invoiceSchema = z.object({
  v: z.literal(1),
  id: z.string().min(1),
  iss: z.number().int().positive(),
  due: z.number().int().positive(),
  nt: z.string().max(280).optional(),
  net: z.number().int().positive(),
  cur: z.string().min(1),
  t: z.string().regex(ETH_ADDRESS_REGEX, 'Invalid token address').optional(),
  dec: z.number().int().nonnegative(),
  f: z.object({
    n: z.string().min(1),
    a: z.string().regex(ETH_ADDRESS_REGEX, 'Invalid sender address'),
    e: z.string().email().optional(),
    ads: z.string().optional(),
    ph: z.string().optional(),
  }),
  c: z.object({
    n: z.string().min(1),
    a: z.string().regex(ETH_ADDRESS_REGEX, 'Invalid client address').optional(),
    e: z.string().email().optional(),
    ads: z.string().optional(),
    ph: z.string().optional(),
  }),
  it: z
    .array(
      z.object({
        d: z.string().min(1),
        q: z.union([z.string().regex(NUMERIC_STRING_REGEX), z.number().positive()]),
        r: z.string().regex(NUMERIC_STRING_REGEX, 'Invalid rate'),
      })
    )
    .min(1),
  tax: z.string().optional(),
  dsc: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  _future: z.unknown().optional(),
})

// Verify that the Zod schema matches the TypeScript interface
// This is a type-level check
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type InvoiceSchemaCheck = z.infer<typeof invoiceSchema> extends InvoiceSchemaV1 ? true : false
