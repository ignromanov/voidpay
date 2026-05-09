/**
 * Demo invoice data — single source of truth for all scenes.
 *
 * Shape matches PartialInvoice from @/shared/lib/invoice-types so it drops
 * directly into real FSD components (InvoicePaper, PaperTotals, etc.).
 *
 * Values align with creative-brief.md §2:
 *   - From:      Alex
 *   - Line item: UI Design
 *   - Amount:    250.000042 USDC  (250 + Magic Dust 0.000042)
 *   - Network:   Arbitrum (chainId 42161)
 *   - USDC decimals: 6
 *
 * Magic Dust: 42 atomic units (0.000042 USDC) encoded into `magicDust` and
 * baked into `total`. Matches the value highlighted in Scene 5.
 *
 * Recipient address: 0x7a250d56… — same truncated prefix that appears as
 * raw-address chaos in Scene 1 (narrative callback).
 */

import type { Address } from 'viem'
import type { Invoice } from '@/shared/lib/invoice-types'

export const DEMO_FROM_ADDRESS =
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' as Address

// Canonical Arbitrum USDC contract
export const DEMO_TOKEN_ADDRESS =
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Address

export const DEMO_NETWORK_ID = 42161 // Arbitrum One
export const DEMO_CURRENCY = 'USDC'
export const DEMO_DECIMALS = 6

/** 250.000000 USDC in 6-decimal atomic units */
const SUBTOTAL_ATOMIC = '250000000'
/** Magic Dust: 42 micro-USDC = 0.000042 USDC */
export const DEMO_MAGIC_DUST_ATOMIC = '42'
/** Composite total: 250.000042 USDC in atomic units */
export const DEMO_TOTAL_ATOMIC = '250000042'

/** Human-readable total string (for captions / chyrons) */
export const DEMO_TOTAL_DISPLAY = '250.000042'

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
  invoiceId: 'VP-0001',
  issuedAt: ISSUED_AT,
  dueAt: DUE_AT,
  networkId: DEMO_NETWORK_ID,
  currency: DEMO_CURRENCY,
  tokenAddress: DEMO_TOKEN_ADDRESS,
  decimals: DEMO_DECIMALS,
  from: {
    name: 'Alex',
    walletAddress: DEMO_FROM_ADDRESS,
  },
  client: {
    name: 'Acme Corp',
  },
  items: [
    {
      description: 'UI Design',
      quantity: 1,
      rate: SUBTOTAL_ATOMIC,
    },
  ],
  total: DEMO_TOTAL_ATOMIC,
  magicDust: DEMO_MAGIC_DUST_ATOMIC,
}
