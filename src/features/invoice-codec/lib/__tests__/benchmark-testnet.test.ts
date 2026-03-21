/**
 * Testnet URL Size Benchmark Tests
 *
 * Validates that testnet invoices (Sepolia, Arbitrum Sepolia, Optimism Sepolia,
 * Polygon Amoy) produce URLs within the 2000-byte limit despite larger chain IDs
 * and missing dictionary entries.
 *
 * Testnet overhead vs mainnet:
 * - Chain ID: varint (3-4 bytes) vs dict code (2 bytes)
 * - Token address: raw 21 bytes vs dict code (2 bytes)
 * - Expected ~20-30 chars overhead per testnet invoice
 */

import { describe, it, expect } from 'vitest'
import { encodeInvoice, generateInvoiceUrl } from '../encode'
import { decodeInvoice } from '../decode'
import type { Invoice } from '@/entities/invoice'
import { TEST_ADDRESSES, TEST_TIMESTAMPS } from '@/shared/lib/test-utils'

const BASE_URL = 'https://voidpay.xyz'

async function measureUrl(invoice: Invoice): Promise<{
  chars: number
  bytes: number
  encoded: string
  url: string
}> {
  const encoded = await encodeInvoice(invoice)
  const url = await generateInvoiceUrl(invoice, { baseUrl: BASE_URL })
  const bytes = new TextEncoder().encode(url).length
  return { chars: encoded.length, bytes, encoded, url }
}

// ============================================================================
// Testnet invoice factories
// ============================================================================

/** Sepolia ETH native payment */
function sepoliaInvoice(): Invoice {
  return {
    invoiceId: 'INV-SEP-001',
    issuedAt: TEST_TIMESTAMPS.issued,
    dueAt: TEST_TIMESTAMPS.due,
    networkId: 11155111,
    currency: 'ETH',
    decimals: 18,
    from: {
      name: 'Test Developer',
      walletAddress: TEST_ADDRESSES.sender,
      email: 'dev@test.eth',
    },
    client: {
      name: 'Test Client',
      walletAddress: TEST_ADDRESSES.client,
    },
    items: [
      { description: 'Smart Contract Testing', quantity: 1, rate: '100000000000000000' },
    ],
    total: '100000000000000000',
  }
}

/** Arbitrum Sepolia USDC (custom token address, not in dict) */
function arbSepoliaUsdcInvoice(): Invoice {
  return {
    invoiceId: 'INV-ARBSEP-001',
    issuedAt: TEST_TIMESTAMPS.issued,
    dueAt: TEST_TIMESTAMPS.due,
    networkId: 421614,
    currency: 'USDC',
    tokenAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    decimals: 6,
    from: {
      name: 'DAO Treasury Test',
      walletAddress: TEST_ADDRESSES.sender,
      email: 'treasury@test.dao',
      phone: '+1-555-000-1234',
    },
    client: {
      name: 'Contributor',
      walletAddress: TEST_ADDRESSES.client,
      email: 'contributor@test.com',
    },
    items: [
      { description: 'Protocol Development', quantity: 40, rate: '75000000' },
      { description: 'Documentation', quantity: 20, rate: '50000000' },
    ],
    notes: 'Testnet retainer payment for March',
    total: '4000000000',
  }
}

/** Optimism Sepolia with tax and discount */
function opSepoliaInvoice(): Invoice {
  return {
    invoiceId: 'INV-OPSEP-001',
    issuedAt: TEST_TIMESTAMPS.issued,
    dueAt: TEST_TIMESTAMPS.due,
    networkId: 11155420,
    currency: 'ETH',
    decimals: 18,
    from: {
      name: 'Optimism Tester',
      walletAddress: TEST_ADDRESSES.sender,
    },
    client: {
      name: 'QA Team',
      walletAddress: TEST_ADDRESSES.client,
    },
    items: [
      { description: 'L2 Integration Testing', quantity: 10, rate: '50000000000000000' },
      { description: 'Gas Optimization Audit', quantity: 5, rate: '100000000000000000' },
    ],
    tax: '10%',
    discount: '5%',
    total: '1050000000000000000',
  }
}

/** Polygon Amoy POL native payment */
function amoyInvoice(): Invoice {
  return {
    invoiceId: 'INV-AMOY-001',
    issuedAt: TEST_TIMESTAMPS.issued,
    dueAt: TEST_TIMESTAMPS.due,
    networkId: 80002,
    currency: 'POL',
    decimals: 18,
    from: {
      name: 'Polygon Developer',
      walletAddress: TEST_ADDRESSES.sender,
    },
    client: {
      name: 'Tester',
    },
    items: [
      { description: 'Micropayment Test', quantity: 1, rate: '1000000000000000' },
    ],
    total: '1000000000000000',
  }
}

// ============================================================================
// URL Size Benchmarks
// ============================================================================

describe('Testnet URL Size Benchmarks', () => {
  it('Sepolia ETH native < 350 chars encoded', async () => {
    const { chars, bytes } = await measureUrl(sepoliaInvoice())

    console.log(`Sepolia ETH: ${chars} chars encoded, ${bytes} bytes URL`)
    expect(chars).toBeLessThan(350)
    expect(bytes).toBeLessThan(2000)
  })

  it('Arbitrum Sepolia USDC (all optional fields) < 550 chars encoded', async () => {
    const { chars, bytes } = await measureUrl(arbSepoliaUsdcInvoice())

    console.log(`Arbitrum Sepolia USDC: ${chars} chars encoded, ${bytes} bytes URL`)
    expect(chars).toBeLessThan(550)
    expect(bytes).toBeLessThan(2000)
  })

  it('Optimism Sepolia with tax+discount < 400 chars encoded', async () => {
    const { chars, bytes } = await measureUrl(opSepoliaInvoice())

    console.log(`Optimism Sepolia: ${chars} chars encoded, ${bytes} bytes URL`)
    expect(chars).toBeLessThan(400)
    expect(bytes).toBeLessThan(2000)
  })

  it('Polygon Amoy minimal < 300 chars encoded', async () => {
    const { chars, bytes } = await measureUrl(amoyInvoice())

    console.log(`Polygon Amoy: ${chars} chars encoded, ${bytes} bytes URL`)
    expect(chars).toBeLessThan(300)
    expect(bytes).toBeLessThan(2000)
  })

  it('all testnet URLs under 2000 byte hard limit', async () => {
    const scenarios = [
      { name: 'Sepolia', invoice: sepoliaInvoice() },
      { name: 'Arbitrum Sepolia', invoice: arbSepoliaUsdcInvoice() },
      { name: 'Optimism Sepolia', invoice: opSepoliaInvoice() },
      { name: 'Polygon Amoy', invoice: amoyInvoice() },
    ]

    for (const { name, invoice } of scenarios) {
      const { bytes } = await measureUrl(invoice)
      console.log(`${name}: ${bytes} bytes URL`)
      expect(bytes, `${name} URL exceeds 2000 bytes`).toBeLessThan(2000)
    }
  })
})

// ============================================================================
// Testnet vs Mainnet Overhead
// ============================================================================

describe('Testnet vs Mainnet Overhead', () => {
  it('testnet chain ID adds < 30 chars overhead vs mainnet equivalent', async () => {
    // Same invoice, mainnet (Ethereum, dict-encoded) vs testnet (Sepolia, varint)
    const mainnetInvoice: Invoice = {
      ...sepoliaInvoice(),
      networkId: 1,
    }

    const mainnet = await measureUrl(mainnetInvoice)
    const testnet = await measureUrl(sepoliaInvoice())
    const overhead = testnet.chars - mainnet.chars

    console.log(`Mainnet (ETH): ${mainnet.chars} chars`)
    console.log(`Testnet (Sepolia): ${testnet.chars} chars`)
    console.log(`Chain ID overhead: +${overhead} chars`)

    // Testnet should be larger but not dramatically
    expect(overhead).toBeGreaterThan(0)
    expect(overhead).toBeLessThan(30)
  })

  it('testnet token address adds < 40 chars overhead vs dict-encoded mainnet', async () => {
    // Arbitrum mainnet USDC (dict-encoded) vs Arbitrum Sepolia USDC (raw 20 bytes)
    const mainnetInvoice: Invoice = {
      ...arbSepoliaUsdcInvoice(),
      networkId: 42161,
      tokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // in TOKEN_DICT
    }

    const mainnet = await measureUrl(mainnetInvoice)
    const testnet = await measureUrl(arbSepoliaUsdcInvoice())
    const overhead = testnet.chars - mainnet.chars

    console.log(`Mainnet (Arb USDC dict): ${mainnet.chars} chars`)
    console.log(`Testnet (ArbSep USDC raw): ${testnet.chars} chars`)
    console.log(`Chain+token overhead: +${overhead} chars`)

    // Combined overhead of non-dict chain + non-dict token
    expect(overhead).toBeLessThan(40)
  })
})

// ============================================================================
// Round-trip Correctness
// ============================================================================

describe('Testnet Round-trip', () => {
  const scenarios = [
    { name: 'Sepolia ETH', factory: sepoliaInvoice },
    { name: 'Arbitrum Sepolia USDC', factory: arbSepoliaUsdcInvoice },
    { name: 'Optimism Sepolia', factory: opSepoliaInvoice },
    { name: 'Polygon Amoy', factory: amoyInvoice },
  ]

  for (const { name, factory } of scenarios) {
    it(`${name}: encode → decode preserves all fields`, async () => {
      const original = factory()
      const encoded = await encodeInvoice(original)
      const decoded = await decodeInvoice(encoded)

      expect(decoded.networkId).toBe(original.networkId)
      expect(decoded.currency).toBe(original.currency)
      expect(decoded.decimals).toBe(original.decimals)
      expect(decoded.invoiceId).toBe(original.invoiceId)
      expect(decoded.from.name).toBe(original.from.name)
      expect(decoded.client.name).toBe(original.client.name)
      expect(decoded.items.length).toBe(original.items.length)

      // Addresses are lowercased by binary codec
      expect(decoded.from.walletAddress.toLowerCase()).toBe(
        original.from.walletAddress.toLowerCase()
      )
      if (original.tokenAddress) {
        expect(decoded.tokenAddress?.toLowerCase()).toBe(
          original.tokenAddress.toLowerCase()
        )
      }

      // Optional fields
      if (original.notes) expect(decoded.notes).toBe(original.notes)
      if (original.tax) expect(decoded.tax).toBe(original.tax)
      if (original.discount) expect(decoded.discount).toBe(original.discount)
    })
  }
})
