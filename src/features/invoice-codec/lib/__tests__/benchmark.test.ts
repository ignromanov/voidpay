/**
 * URL Size Benchmark Tests
 *
 * Validates that the codec v1 rewrite (Brotli + Base64url + mantissa encoding)
 * produces URLs within acceptable size limits for QR readability and
 * cross-browser compatibility.
 *
 * Target: < 2000 bytes total URL, with specific per-scenario targets.
 */

import { describe, it, expect } from 'vitest'
import { encodeInvoice, generateInvoiceUrl } from '../encode'
import type { Invoice } from '@/entities/invoice'
import { TEST_INVOICES } from '@/shared/lib/test-utils'

async function measureUrl(invoice: Invoice): Promise<{ chars: number; bytes: number; encoded: string }> {
  const encoded = await encodeInvoice(invoice)
  const url = await generateInvoiceUrl(invoice, { baseUrl: 'https://voidpay.xyz' })
  const bytes = new TextEncoder().encode(url).length
  return { chars: encoded.length, bytes, encoded }
}

describe('URL Size Benchmarks', () => {
  it('minimal invoice (Polygon MATIC) < 300 chars encoded', async () => {
    const invoice = TEST_INVOICES.minimal()
    const { chars, bytes } = await measureUrl(invoice)

    console.log(`Minimal invoice: ${chars} chars encoded, ${bytes} bytes URL`)
    expect(chars).toBeLessThan(300)
    expect(bytes).toBeLessThan(2000)
  })

  it('full USDC invoice (Ethereum, all optional fields) < 600 chars encoded', async () => {
    const invoice = TEST_INVOICES.full()
    const { chars, bytes } = await measureUrl(invoice)

    // Full invoice includes email, phone, address for both parties + tax + discount + notes
    console.log(`Full USDC invoice: ${chars} chars encoded, ${bytes} bytes URL`)
    expect(chars).toBeLessThan(600)
    expect(bytes).toBeLessThan(2000)
  })

  it('ETH native payment < 420 chars encoded', async () => {
    const invoice: Invoice = {
      invoiceId: 'INV-ETH-001',
      issuedAt: 1704067200,
      dueAt: 1706745600,
      networkId: 1,
      currency: 'ETH',
      decimals: 18,
      from: {
        name: 'Ethereum Freelancer',
        walletAddress: '0x1234567890123456789012345678901234567890',
        email: 'dev@example.com',
      },
      client: {
        name: 'Client Corp',
        walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      },
      items: [
        { description: 'Smart Contract Development', quantity: 1, rate: '1500000000000000000' },
        { description: 'Security Audit', quantity: 1, rate: '500000000000000000' },
      ],
      total: '2000000000000000000',
    }

    const { chars, bytes } = await measureUrl(invoice)

    console.log(`ETH native invoice: ${chars} chars encoded, ${bytes} bytes URL`)
    expect(chars).toBeLessThan(420)
    expect(bytes).toBeLessThan(2000)
  })

  it('Arbitrum USDC with all optional fields < 500 chars', async () => {
    const invoice: Invoice = {
      invoiceId: 'INV-ARB-001',
      issuedAt: 1704067200,
      dueAt: 1706745600,
      networkId: 42161,
      currency: 'USDC',
      tokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
      from: {
        name: 'DAO Treasury',
        walletAddress: '0x1234567890123456789012345678901234567890',
        email: 'treasury@dao.eth',
        phone: '+1-555-000-1234',
      },
      client: {
        name: 'Contributor',
        walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        email: 'contributor@gmail.com',
      },
      items: [
        { description: 'Protocol Development', quantity: 160, rate: '75000000' },
        { description: 'Documentation', quantity: 40, rate: '50000000' },
      ],
      notes: 'Monthly retainer payment for March 2024',
      tax: '0%',
      total: '14000000000',
    }

    const { chars, bytes } = await measureUrl(invoice)

    console.log(`Arbitrum USDC (all fields): ${chars} chars encoded, ${bytes} bytes URL`)
    expect(chars).toBeLessThan(500)
    expect(bytes).toBeLessThan(2000)
  })

  it('5 line items invoice stays under 600 chars', async () => {
    const invoice: Invoice = {
      invoiceId: 'INV-MULTI-001',
      issuedAt: 1704067200,
      dueAt: 1706745600,
      networkId: 10, // Optimism
      currency: 'USDC',
      tokenAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      decimals: 6,
      from: {
        name: 'Full Service Agency',
        walletAddress: '0x1234567890123456789012345678901234567890',
      },
      client: {
        name: 'Enterprise Client',
      },
      items: [
        { description: 'UI Design', quantity: 20, rate: '100000000' },
        { description: 'Frontend Development', quantity: 40, rate: '150000000' },
        { description: 'Backend Development', quantity: 60, rate: '175000000' },
        { description: 'Testing & QA', quantity: 15, rate: '120000000' },
        { description: 'Project Management', quantity: 10, rate: '130000000' },
      ],
      total: '22100000000',
    }

    const { chars, bytes } = await measureUrl(invoice)

    console.log(`5-item invoice: ${chars} chars encoded, ${bytes} bytes URL`)
    expect(chars).toBeLessThan(600)
    expect(bytes).toBeLessThan(2000)
  })

  it('mantissa encoding saves bytes for round amounts', async () => {
    // 1 ETH = 10^18 wei — should compress well with mantissa+zeros
    const roundInvoice: Invoice = {
      invoiceId: 'INV-ROUND',
      issuedAt: 1704067200,
      dueAt: 1706745600,
      networkId: 1,
      currency: 'ETH',
      decimals: 18,
      from: { name: 'Sender', walletAddress: '0x1234567890123456789012345678901234567890' },
      client: { name: 'Client' },
      items: [{ description: 'Service', quantity: 1, rate: '1000000000000000000' }],
      total: '1000000000000000000',
    }

    // Non-round amount (many significant digits)
    const oddInvoice: Invoice = {
      ...roundInvoice,
      invoiceId: 'INV-ODD',
      items: [{ description: 'Service', quantity: 1, rate: '1234567890123456789' }],
      total: '1234567890123456789',
    }

    const round = await measureUrl(roundInvoice)
    const odd = await measureUrl(oddInvoice)

    console.log(`Round amount (10^18): ${round.chars} chars`)
    console.log(`Odd amount (1234...789): ${odd.chars} chars`)

    // Round amounts should be noticeably shorter due to mantissa encoding
    expect(round.chars).toBeLessThan(odd.chars)
  })

  it('all URLs stay under 2000 byte hard limit', async () => {
    const scenarios = [
      { name: 'minimal', invoice: TEST_INVOICES.minimal() },
      { name: 'full', invoice: TEST_INVOICES.full() },
      { name: 'unicode', invoice: TEST_INVOICES.unicode() },
      { name: 'japaneseUnicode', invoice: TEST_INVOICES.japaneseUnicode() },
    ]

    for (const { name, invoice } of scenarios) {
      const { bytes } = await measureUrl(invoice)
      console.log(`${name}: ${bytes} bytes URL`)
      expect(bytes, `${name} URL exceeds 2000 bytes`).toBeLessThan(2000)
    }
  })
})
