/**
 * Script to generate pre-encoded hashes for demo invoices
 * Run: npx tsx scripts/generate-demo-hashes.ts
 */

import { encodeInvoice } from '../src/features/invoice-codec/lib/encode'
import { DEMO_INVOICES } from '../src/widgets/landing/constants/demo-invoices'

console.log('// Pre-generated hashes for demo invoices:')
console.log('// Add createHash field to each demo invoice in demo-invoices.ts')
console.log('')

DEMO_INVOICES.forEach((invoice) => {
  const hash = encodeInvoice(invoice.data)
  console.log(`// ${invoice.invoiceId}`)
  console.log(`createHash: '${hash}',`)
  console.log('')
})
