/**
 * Static Invoice Fixtures for Tests
 *
 * Centralized test data with proper type safety.
 * Use these fixtures instead of creating inline test data.
 *
 * @example
 * import { TEST_INVOICES, TEST_ADDRESSES, TEST_PARTIES } from '@/shared/lib/test-utils'
 */

import type { Invoice } from '@/entities/invoice'
import type { Address } from 'viem'

// ============================================================================
// ADDRESSES
// ============================================================================

/**
 * Valid Ethereum addresses for testing.
 * All addresses are properly checksummed and typed as Address.
 */
export const TEST_ADDRESSES = {
  // Standard test addresses
  sender: '0x1234567890123456789012345678901234567890' as Address,
  client: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address,
  generic: '0x1111111111111111111111111111111111111111' as Address,

  // Token addresses (Ethereum mainnet)
  usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address,
  usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address,
  dai: '0x6B175474E89094C44Da98b954EesDeAC495271d0F' as Address,
} as const

// ============================================================================
// PARTY INFO
// ============================================================================

/**
 * Test party information (from/client sections).
 */
export const TEST_PARTIES = {
  sender: {
    full: {
      name: 'Acme Development LLC',
      walletAddress: TEST_ADDRESSES.sender,
      email: 'billing@acme.dev',
      physicalAddress: '123 Tech Street\nSan Francisco, CA 94105',
      phone: '+1-555-123-4567',
    },
    minimal: {
      name: 'Freelancer',
      walletAddress: TEST_ADDRESSES.generic,
    },
  },
  client: {
    full: {
      name: 'Client Corporation',
      walletAddress: TEST_ADDRESSES.client,
      email: 'accounts@client.com',
      physicalAddress: '456 Business Ave\nNew York, NY 10001',
      phone: '+1-555-987-6543',
    },
    minimal: {
      name: 'Client',
    },
    withoutWallet: {
      name: 'Client Name',
      email: 'client@example.com',
      physicalAddress: '123 Street\nCity, Country',
    },
  },
} as const

// ============================================================================
// LINE ITEMS
// ============================================================================

/**
 * Test line items for invoices.
 */
export const TEST_LINE_ITEMS = {
  development: [
    { description: 'Frontend Development', quantity: 40, rate: '150000000' }, // $150/hr * 40 hrs
    { description: 'Backend API Development', quantity: 60, rate: '175000000' }, // $175/hr * 60 hrs
    { description: 'Code Review & QA', quantity: 10, rate: '125000000' }, // $125/hr * 10 hrs
  ],
  consulting: [{ description: 'Consulting', quantity: 1, rate: '1000000000000000000' }], // 1 MATIC
  single: [{ description: 'Single Item', quantity: 1, rate: '1000000' }],
  various: [
    { description: 'Integer quantity', quantity: 100, rate: '1000000' },
    { description: 'Float quantity', quantity: 50.5, rate: '2000000' },
    { description: 'Large rate', quantity: 1, rate: '999999999999999999' }, // Near BigInt max
  ],
} as const

// ============================================================================
// TIMESTAMPS
// ============================================================================

/**
 * Test timestamps (Unix seconds).
 */
export const TEST_TIMESTAMPS = {
  issued: 1704067200, // 2024-01-01T00:00:00Z
  due: 1706745600, // 2024-02-01T00:00:00Z
} as const

// ============================================================================
// FULL INVOICES
// ============================================================================

/**
 * Complete test invoices for various scenarios.
 */
export const TEST_INVOICES = {
  /**
   * Full invoice with all optional fields populated.
   * Use for complete round-trip tests and snapshot tests.
   */
  full: (): Invoice => ({
    version: 2,
    invoiceId: 'INV-2024-001',
    issuedAt: TEST_TIMESTAMPS.issued,
    dueAt: TEST_TIMESTAMPS.due,
    notes: 'Payment for web development services',
    networkId: 1, // Ethereum mainnet
    currency: 'USDC',
    tokenAddress: TEST_ADDRESSES.usdc,
    decimals: 6,
    from: TEST_PARTIES.sender.full,
    client: TEST_PARTIES.client.full,
    items: [...TEST_LINE_ITEMS.development],
    tax: '8.5%',
    discount: '5%',
  }),

  /**
   * Minimal invoice with only required fields.
   * Use for minimal round-trip tests.
   */
  minimal: (): Invoice => ({
    version: 2,
    invoiceId: 'INV-MIN-001',
    issuedAt: TEST_TIMESTAMPS.issued,
    dueAt: TEST_TIMESTAMPS.due,
    networkId: 137, // Polygon
    currency: 'MATIC',
    decimals: 18, // Native token
    from: TEST_PARTIES.sender.minimal,
    client: TEST_PARTIES.client.minimal,
    items: [...TEST_LINE_ITEMS.consulting],
  }),

  /**
   * Invoice with unicode characters in text fields.
   * Use for internationalization tests.
   */
  unicode: (): Invoice => ({
    version: 2,
    invoiceId: 'INV-UNICODE-001',
    issuedAt: TEST_TIMESTAMPS.issued,
    dueAt: TEST_TIMESTAMPS.due,
    networkId: 137,
    currency: 'MATIC',
    decimals: 18,
    notes: 'Payment for services - Paiement pour services 支付服务费 🚀',
    from: {
      name: 'Développeur Фрилансер 开发者',
      walletAddress: TEST_ADDRESSES.generic,
    },
    client: {
      name: 'Client 顧客 Клиент',
    },
    items: [...TEST_LINE_ITEMS.consulting],
  }),

  /**
   * Invoice with various quantity formats.
   * Use for numeric edge case tests.
   */
  variousQuantities: (): Invoice => ({
    version: 2,
    invoiceId: 'INV-VAR-001',
    issuedAt: TEST_TIMESTAMPS.issued,
    dueAt: TEST_TIMESTAMPS.due,
    networkId: 137,
    currency: 'MATIC',
    decimals: 18,
    from: TEST_PARTIES.sender.minimal,
    client: TEST_PARTIES.client.minimal,
    items: [...TEST_LINE_ITEMS.various],
  }),

  /**
   * Invoice with Japanese unicode for byte size testing.
   * Use for URL byte size calculations.
   */
  japaneseUnicode: (): Invoice => ({
    version: 2,
    invoiceId: 'INV-JP-001',
    issuedAt: TEST_TIMESTAMPS.issued,
    dueAt: TEST_TIMESTAMPS.due,
    networkId: 137,
    currency: 'MATIC',
    decimals: 18,
    notes: '日本語テキスト',
    from: {
      name: '山田太郎',
      walletAddress: TEST_ADDRESSES.generic,
    },
    client: TEST_PARTIES.client.minimal,
    items: [...TEST_LINE_ITEMS.consulting],
  }),
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalizes addresses to lowercase for comparison.
 * Binary codec returns lowercase addresses, so use this for equality checks.
 */
export function normalizeInvoiceAddresses(inv: Invoice): Invoice {
  return {
    ...inv,
    tokenAddress: inv.tokenAddress?.toLowerCase() as Address | undefined,
    from: {
      ...inv.from,
      walletAddress: inv.from.walletAddress.toLowerCase() as Address,
    },
    client: {
      ...inv.client,
      walletAddress: inv.client.walletAddress?.toLowerCase() as Address | undefined,
    },
  }
}

/**
 * Creates a large invoice for URL size limit tests.
 * Uses random data to prevent compression from being too efficient.
 */
export function createLargeInvoice(): Invoice {
  const randomString = (len: number) =>
    Array.from({ length: len }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('')

  return {
    ...TEST_INVOICES.full(),
    notes: randomString(280), // Max notes length
    items: Array(100)
      .fill(null)
      .map((_, i) => ({
        description: randomString(50) + i, // Random + unique to prevent compression
        quantity: Math.random() * 1000,
        rate: String(Math.floor(Math.random() * 1e18)),
      })),
  }
}
