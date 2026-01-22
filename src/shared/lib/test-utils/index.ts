/**
 * Test Utilities
 *
 * @module shared/lib/test-utils
 */

// Invoice fixtures
export {
  TEST_ADDRESSES,
  TEST_PARTIES,
  TEST_LINE_ITEMS,
  TEST_TIMESTAMPS,
  TEST_INVOICES,
  normalizeInvoiceAddresses,
  createLargeInvoice,
} from './invoice-fixtures'

export { generateRandomInvoice, generateRandomInvoices } from './invoice-generator'

// Render utilities
export * from './render'

// Web3 mocks
export * from './wagmi-mock'
export * from './rpc-mocks'

// Test helpers
export * from './query-client'
export * from './fetch-spy'

// User events
export { default as userEvent } from '@testing-library/user-event'
