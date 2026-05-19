/**
 * Demo invoice data — single source of truth for all scenes.
 *
 * Real invoice: INV-2026-203, created 2026-05-18, VoidPay treasury issuer.
 * URL is the canonical source of truth — hash fragment decodes (via @void-layer/codec)
 * to the exact same Invoice shape as DEMO_INVOICE below.
 *
 * Shape matches PartialInvoice from @/shared/lib/invoice-types so it drops
 * directly into real FSD components (InvoicePaper, PaperTotals, etc.).
 *
 * Semantics: VoidPay is the invoice ISSUER (from = gets paid).
 *   - from:      VoidPay treasury — invoice issuer, receives payment
 *   - client:    You (generic payer — walletAddress omitted)
 *   - Line item: Support VoidPay
 *   - Amount:    1.000187 USDC  (1 + Magic Dust 0.000187)
 *   - Network:   Base (chainId 8453)
 *   - USDC decimals: 6
 *
 * Magic Dust: 187 atomic units (0.000187 USDC) encoded into `magicDust` and
 * baked into `total`. Matches the value highlighted in Scene 5.
 *
 * Treasury: 0xA8A1F79C4dAa2eC25Af2C91349A6F60c5b41160E
 */

import type { Address } from 'viem'
import type { Invoice } from '@/shared/lib/invoice-types'

// VoidPay treasury — invoice issuer, receives payment
export const DEMO_TREASURY_ADDRESS =
  '0xA8A1F79C4dAa2eC25Af2C91349A6F60c5b41160E' as Address

// Canonical Base USDC contract (Circle-issued)
export const DEMO_TOKEN_ADDRESS =
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address

export const DEMO_NETWORK_ID = 8453 // Base
export const DEMO_CURRENCY = 'USDC'
export const DEMO_DECIMALS = 6

/** 1.000000 USDC in 6-decimal atomic units */
const SUBTOTAL_ATOMIC = '1000000'
/** Magic Dust: 187 micro-USDC = 0.000187 USDC — UI-generated unique value from real invoice */
export const DEMO_MAGIC_DUST_ATOMIC = '187'
/** Composite total: 1.000187 USDC in atomic units */
export const DEMO_TOTAL_ATOMIC = '1000187'

/** Human-readable total string (for captions / chyrons) */
export const DEMO_TOTAL_DISPLAY = '1.000187'

// Deterministic midnight-UTC timestamps (frame-by-frame render stability)
const ISSUED_AT = 1779062400 // 2026-05-18 00:00:00 UTC
const DUE_AT = 1810512000 // 2027-05-17 00:00:00 UTC

/**
 * Stable identifiers used to seed the real `useTrackedInvoiceStore` so that
 * the real `PaymentPanel` widget resolves a `paidAt` value for its paid-state
 * `PaidConfirmation` subcomponent. No crypto here — just a deterministic
 * placeholder so every render of Scene 5 produces the same frame.
 */
export const DEMO_CONTENT_HASH = 'demo-content-hash-scene5'
export const DEMO_CREATED_AT_ISO = new Date(ISSUED_AT * 1000).toISOString()
export const DEMO_PAID_AT_ISO = new Date((ISSUED_AT + 60) * 1000).toISOString()

/**
 * Bare invoice URL (no OG param) — what we display in BrowserChrome url pill
 * and encode in any "open invoice" surface (vs the EIP-681 QR which opens wallet).
 *
 * The hash fragment decodes (via @void-layer/codec) to the exact same Invoice
 * shape as DEMO_INVOICE below — keeps video paper === real /pay render.
 */
export const DEMO_INVOICE_URL =
  'https://voidpay.xyz/pay#VgEOAQIAKAICAAUEBGoLW60GBNO5-w4IAQYKFKih95xNqi7CWvLJE0mm9gxbQRYODAIAAQ4VAQ9TdXBwb3J0IFZvaWRQYXkAAQEGEAdWb2lkUGF5EgNZb3UUEJy64s7SGmU2NYLEFK5bqhgWDElOVi0yMDI2LTIwMxgE-4U9AB8gJStaplTQ2TANUIVHxkPTy2ojuLALtJ4E47VxguxLZF8'

/**
 * Full URL with OG-preview query param — for social sharing surfaces
 * (Twitter / Telegram / Product Hunt posts). Server reads ?og= for preview
 * card metadata; the hash still drives the actual invoice render.
 *
 * Used in: launch-tweet copy, PR description, GH release notes. NOT in video
 * frame (video uses bare DEMO_INVOICE_URL above).
 */
export const DEMO_INVOICE_URL_SHARE =
  'https://voidpay.xyz/pay?og=INV-2026-203_1.00_USDC_base_VoidPay_You_0516#VgEOAQIAKAICAAUEBGoLW60GBNO5-w4IAQYKFKih95xNqi7CWvLJE0mm9gxbQRYODAIAAQ4VAQ9TdXBwb3J0IFZvaWRQYXkAAQEGEAdWb2lkUGF5EgNZb3UUEJy64s7SGmU2NYLEFK5bqhgWDElOVi0yMDI2LTIwMxgE-4U9AB8gJStaplTQ2TANUIVHxkPTy2ojuLALtJ4E47VxguxLZF8'

export const DEMO_INVOICE: Invoice = {
  invoiceId: 'INV-2026-203',
  issuedAt: ISSUED_AT,
  dueAt: DUE_AT,
  networkId: DEMO_NETWORK_ID,
  currency: DEMO_CURRENCY,
  tokenAddress: DEMO_TOKEN_ADDRESS,
  decimals: DEMO_DECIMALS,
  from: {
    name: 'VoidPay',
    walletAddress: DEMO_TREASURY_ADDRESS, // VoidPay treasury — receives payment
  },
  client: {
    name: 'You',
    // walletAddress omitted — generic payer
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
