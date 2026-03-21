/**
 * Script to generate pre-encoded hashes for demo invoices
 * Run: npx tsx scripts/generate-demo-hashes.ts
 */

import { getDemoInvoices } from '../src/widgets/landing/constants/demo-invoices'

console.log('// Pre-generated hashes for demo invoices:')
console.log('// Add createHash field to each demo invoice in demo-invoices.ts')
console.log('')

const invoices = await getDemoInvoices()
invoices.forEach((invoice) => {
  console.log(`// ${invoice.invoiceId}`)
  console.log(`createHash: '${invoice.createHash}',`)
  console.log('')
})
