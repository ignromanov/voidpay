/**
 * Demo invoice data — single source of truth for all scenes.
 *
 * Shape matches PartialInvoice from @/shared/lib/invoice-types so it drops
 * directly into real FSD components (InvoicePaper, PaperTotals, etc.).
 *
 * R23-T: treasury swap — demo now pays VoidPay treasury on Base.
 *   - From:      You (neutral payer placeholder)
 *   - Line item: Support VoidPay
 *   - Amount:    1.000042 USDC  (1 + Magic Dust 0.000042)
 *   - Network:   Base (chainId 8453)
 *   - USDC decimals: 6
 *
 * Magic Dust: 42 atomic units (0.000042 USDC) encoded into `magicDust` and
 * baked into `total`. Matches the value highlighted in Scene 5.
 *
 * Recipient: VoidPay treasury 0xA8A1F79C4dAa2eC25Af2C91349A6F60c5b41160E
 */

import type { Address } from 'viem'
import type { Invoice } from '@/shared/lib/invoice-types'

// Placeholder payer address — neutral, no token holdings, not a precompile (precompiles end at 0x09)
export const DEMO_FROM_ADDRESS =
  '0x0000000000000000000000000000000000000001' as Address

// Canonical Base USDC contract (Circle-issued)
export const DEMO_TOKEN_ADDRESS =
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address

export const DEMO_NETWORK_ID = 8453 // Base
export const DEMO_CURRENCY = 'USDC'
export const DEMO_DECIMALS = 6

/** 1.000000 USDC in 6-decimal atomic units */
const SUBTOTAL_ATOMIC = '1000000'
/** Magic Dust: 42 micro-USDC = 0.000042 USDC */
export const DEMO_MAGIC_DUST_ATOMIC = '42'
/** Composite total: 1.000042 USDC in atomic units */
export const DEMO_TOTAL_ATOMIC = '1000042'

/** Human-readable total string (for captions / chyrons) */
export const DEMO_TOTAL_DISPLAY = '1.000042'

// Deterministic midnight-UTC timestamps (frame-by-frame render stability)
const ISSUED_AT = 1776470400 // 2026-04-18 00:00:00 UTC
const DUE_AT = 1777075200 // 2026-04-25 00:00:00 UTC

/**
 * Stable identifiers used to seed the real `useTrackedInvoiceStore` so that
 * the real `PaymentPanel` widget resolves a `paidAt` value for its paid-state
 * `PaidConfirmation` subcomponent. No crypto here — just a deterministic
 * placeholder so every render of Scene 5 produces the same frame.
 */
export const DEMO_CONTENT_HASH = 'demo-content-hash-scene5'
export const DEMO_CREATED_AT_ISO = new Date(ISSUED_AT * 1000).toISOString()
export const DEMO_PAID_AT_ISO = new Date((ISSUED_AT + 60) * 1000).toISOString()
export const DEMO_INVOICE_URL = 'https://voidpay.xyz/pay#demo'

export const DEMO_INVOICE: Invoice = {
  invoiceId: 'VP-DEMO-001',
  issuedAt: ISSUED_AT,
  dueAt: DUE_AT,
  networkId: DEMO_NETWORK_ID,
  currency: DEMO_CURRENCY,
  tokenAddress: DEMO_TOKEN_ADDRESS,
  decimals: DEMO_DECIMALS,
  from: {
    name: 'You',
    walletAddress: DEMO_FROM_ADDRESS,
  },
  client: {
    name: 'VoidPay',
    walletAddress: '0xA8A1F79C4dAa2eC25Af2C91349A6F60c5b41160E' as Address, // VoidPay treasury
  },
  items: [
    {
      description: 'Support VoidPay',
      quantity: 1,
      rate: SUBTOTAL_ATOMIC,
    },
  ],
  total: DEMO_TOTAL_ATOMIC,
  magicDust: DEMO_MAGIC_DUST_ATOMIC,
}
