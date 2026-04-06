/**
 * Demo invoice data for landing page rotation
 * Feature: 012-landing-page
 *
 * All fields of Invoice are populated to demonstrate full functionality.
 * Each demo showcases a different invoice status and payment state.
 *
 * IMPORTANT: createHash is computed at build time (SSG).
 * encodeInvoice runs during `next build`, not on client.
 * Dates are computed relative to build time so demos stay fresh.
 */

import { encodeInvoice, generateSalt, deriveMagicDust } from '@/features/invoice-codec'
import { addMagicDust } from '@/shared/lib/amount-utils'
import type { Invoice } from '@/shared/lib/invoice-types'
import type { InvoiceStatus } from '@/widgets/invoice-paper/types'

/** Demo-only type for landing page invoice rotation */
interface DemoInvoice {
  invoiceId: string
  invoiceUrl: string
  createdAt: string
  status: InvoiceStatus
  txHash?: string
  txHashValidated?: boolean
  data: Invoice
  createHash: string
}

const DAY = 86400
const NOW = Math.floor(Date.now() / 1000)

/** ISO 8601 string from unix timestamp */
function isoDate(ts: number): string {
  return new Date(ts * 1000).toISOString()
}

/**
 * Raw demo data without computed hashes.
 * Dates are relative to build time to stay fresh across deployments.
 */
const RAW_DEMO_INVOICES: Omit<DemoInvoice, 'createHash'>[] = [
  // --- Ethereum (1) - Smart Contract Audit [PAID + VALIDATED] ---
  {
    invoiceId: 'INV-2026-042',
    invoiceUrl: 'https://voidpay.xyz/pay#demo-eth',
    createdAt: isoDate(NOW - 7 * DAY),
    status: 'paid',
    txHash: '0x7a3f1d8e92b4c56f0a1e3d7b8c9f2a4d6e8b0c1d3f5a7e9b2c4d6f8a0e1c3d5f',
    txHashValidated: true,
    data: {
      invoiceId: 'INV-2026-042',
      issuedAt: NOW - 7 * DAY,
      dueAt: NOW + 7 * DAY,
      notes: 'Audit report pending final sign-off. Payment due upon delivery.',
      networkId: 1,
      currency: 'ETH',
      decimals: 18,
      from: {
        name: 'EtherScale Solutions',
        walletAddress: '0x5aFe000000000000000000000000000000000001',
        email: 'billing@etherscale.io',
        physicalAddress: '548 Market St, Suite 23000\nSan Francisco, CA 94104\nUSA',
        phone: '+1 415 555 0142',
        taxId: 'US 12-3456789',
      },
      client: {
        name: 'DeFi Frontiers DAO',
        walletAddress: '0xbeeF000000000000000000000000000000000002',
        email: 'treasury@defifrontiers.xyz',
        physicalAddress: 'c/o Legal Entity\n123 Blockchain Ave\nZug, Switzerland',
        phone: '+41 41 555 0198',
        taxId: 'CHE-123.456.789',
      },
      items: [
        // ETH has 18 decimals: 0.125 ETH = 125000000000000000 atomic units
        { description: 'Smart Contract Security Audit', quantity: 40, rate: '125000000000000000' },
        { description: 'Gas Optimization Consulting (8 hours)', quantity: 8, rate: '100000000000000000' },
      ],
      discount: '5%',
      total: '5510000000000000000',
    },
  },
  // --- Arbitrum (42161) - Game Asset Design [PENDING] ---
  {
    invoiceId: 'INV-2026-087',
    invoiceUrl: 'https://voidpay.xyz/pay#demo-arb',
    createdAt: isoDate(NOW - 2 * DAY),
    status: 'pending',
    data: {
      invoiceId: 'INV-2026-087',
      issuedAt: NOW - 2 * DAY,
      dueAt: NOW + 28 * DAY,
      notes: 'Final delivery includes source files and commercial license.',
      networkId: 42161,
      currency: 'USDC',
      tokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
      from: {
        name: 'L2 Design Studio',
        walletAddress: '0xcAFe000000000000000000000000000000000003',
        email: 'invoices@l2design.studio',
        physicalAddress: '789 Creative Blvd, Unit 4\nAustin, TX 78701\nUSA',
        phone: '+1 512 555 0177',
      },
      client: {
        name: 'ArbGaming Inc.',
        walletAddress: '0xFaCE000000000000000000000000000000000004',
        email: 'payments@arbgaming.io',
        physicalAddress: '456 Gaming Tower, Floor 12\nSingapore 018956',
        phone: '+65 6555 0234',
      },
      items: [
        // USDC has 6 decimals: $1200 = 1200000000 atomic units
        { description: 'Character Sprite Set (10 animations)', quantity: 1, rate: '1200000000' },
        { description: 'UI Animation Pack (menus, buttons)', quantity: 1, rate: '800000000' },
        { description: 'Sound Effects Integration', quantity: 1, rate: '400000000' },
      ],
      tax: '8%',
      discount: '5%',
      total: '2472000000',
    },
  },
  // --- Optimism (10) - Public Goods Grant [PAID + NOT VALIDATED] ---
  {
    invoiceId: 'INV-2026-135',
    invoiceUrl: 'https://voidpay.xyz/pay#demo-op',
    createdAt: isoDate(NOW - 5 * DAY),
    status: 'paid',
    txHash: '0xb2e4f6a8d0c1e3f5a7b9d1f3e5a7c9d1f3e5a7b9d1f3e5a7c9d1f3e5a7b9d1f3',
    txHashValidated: false, // Shows warning indicator
    data: {
      invoiceId: 'INV-2026-135',
      issuedAt: NOW - 5 * DAY,
      dueAt: NOW + 25 * DAY,
      notes: 'Thank you for supporting public goods. Milestone 1 of 3.',
      networkId: 10,
      currency: 'OP',
      tokenAddress: '0x4200000000000000000000000000000000000042',
      decimals: 18,
      from: {
        name: 'Optimistic Builders Collective',
        walletAddress: '0xBABe000000000000000000000000000000000005',
        email: 'grants@optimisticbuilders.org',
        physicalAddress: '1 Public Goods Way\nOptimism City, OP 10001\nDecentralized',
        phone: '+1 800 555 0100',
        taxId: 'US 55-1234567',
      },
      client: {
        name: 'RetroPGF Foundation',
        walletAddress: '0xC0DE000000000000000000000000000000000006',
        email: 'disbursements@retropgf.eth',
        physicalAddress: 'Optimism Foundation\n123 Collective Drive\nRemote',
        phone: '+1 888 555 0100',
      },
      items: [
        // OP has 18 decimals: 15000 OP = 15000000000000000000000 atomic units
        { description: 'Public Goods Infrastructure Grant - Phase 1', quantity: 1, rate: '15000000000000000000000' },
        { description: 'Community Tooling Development', quantity: 1, rate: '8000000000000000000000' },
        { description: 'Documentation & Onboarding', quantity: 1, rate: '2000000000000000000000' },
      ],
      total: '25000000000000000000000',
    },
  },
  // --- Base (8453) - Smart Wallet Integration [PENDING] ---
  {
    invoiceId: 'INV-2026-217',
    invoiceUrl: 'https://voidpay.xyz/pay#demo-base',
    createdAt: isoDate(NOW - 3 * DAY),
    status: 'pending',
    data: {
      invoiceId: 'INV-2026-217',
      issuedAt: NOW - 3 * DAY,
      dueAt: NOW + 14 * DAY,
      notes: 'Passkey wallet integration for mobile dApp. Milestone 2 of 4.',
      networkId: 8453,
      currency: 'USDC',
      tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      decimals: 6,
      from: {
        name: 'Base Builders Co.',
        walletAddress: '0xdEaD000000000000000000000000000000000009',
        email: 'team@basebuilders.xyz',
        physicalAddress: '100 Innovation Drive\nSan Francisco, CA 94105\nUSA',
        phone: '+1 628 555 0321',
      },
      client: {
        name: 'Onchain Commerce DAO',
        walletAddress: '0xFeed000000000000000000000000000000000010',
        email: 'finance@onchaincommerce.xyz',
        physicalAddress: '42 Web3 Street\nBrooklyn, NY 11201\nUSA',
        phone: '+1 718 555 0456',
        taxId: 'US 98-7654321',
      },
      items: [
        // USDC has 6 decimals: $3500 = 3500000000 atomic units
        { description: 'Smart Wallet SDK Integration', quantity: 1, rate: '3500000000' },
        { description: 'Passkey Authentication Module', quantity: 1, rate: '2800000000' },
        { description: 'User Onboarding Flow Design', quantity: 1, rate: '1200000000' },
      ],
      tax: '5%',
      total: '7875000000',
    },
  },
  // --- Polygon (137) - Data Analytics Service [OVERDUE] ---
  // Note: status is set explicitly for landing page display.
  // dueAt is in the future so duplicated invoices aren't immediately overdue.
  {
    invoiceId: 'INV-2026-198',
    invoiceUrl: 'https://voidpay.xyz/pay#demo-poly',
    createdAt: isoDate(NOW - 14 * DAY),
    status: 'overdue',
    data: {
      invoiceId: 'INV-2026-198',
      issuedAt: NOW - 14 * DAY,
      dueAt: NOW + 16 * DAY,
      notes: 'Q1 2026 subscription. Auto-renewal unless cancelled 7 days prior.',
      networkId: 137,
      currency: 'USDC',
      tokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      decimals: 6,
      from: {
        name: 'PolyMarket Analytics Ltd.',
        walletAddress: '0xf00D000000000000000000000000000000000007',
        email: 'billing@polymarketanalytics.com',
        physicalAddress: '42 Data Center Road\nMumbai, Maharashtra 400001\nIndia',
        phone: '+91 22 5555 0456',
        taxId: 'IN GSTIN29ABCDE1234F1Z5',
      },
      client: {
        name: 'Prediction Protocol DAO',
        walletAddress: '0xfEED000000000000000000000000000000000008',
        email: 'finance@predictiondao.io',
        physicalAddress: 'DAO Multisig\nGlobal Decentralized Network',
        phone: '+44 20 5555 0789',
        taxId: 'GB 123456789',
      },
      items: [
        // USDC has 6 decimals: $1500 = 1500000000 atomic units
        { description: 'Market Data Feed - Premium Tier (Q1)', quantity: 3, rate: '1500000000' },
        { description: 'API Access - Unlimited Calls', quantity: 1, rate: '500000000' },
        { description: 'Custom Dashboard Setup', quantity: 1, rate: '750000000' },
      ],
      tax: '18%',
      discount: '10%',
      total: '6210000000',
    },
  },
]

/**
 * Demo invoices with pre-computed createHash for /create page navigation.
 * Each demo gets a deterministic salt → magicDust linkage so the dust badge
 * shows correctly when decoded on /pay.
 */
export async function getDemoInvoices(): Promise<DemoInvoice[]> {
  return Promise.all(
    RAW_DEMO_INVOICES.map(async (invoice) => {
      try {
        // Generate salt and derive dust deterministically
        const salt = generateSalt()
        const dust = deriveMagicDust(salt)
        const totalWithDust = addMagicDust(invoice.data.total!, dust)
        const dataWithDust: Invoice = {
          ...invoice.data,
          total: totalWithDust,
          magicDust: dust.toString(),
        }
        return {
          ...invoice,
          data: dataWithDust,
          createHash: await encodeInvoice(dataWithDust, salt),
        }
      } catch (error) {
        // Graceful degradation: button won't work but page loads
        console.error('[DEMO_INVOICES] Failed to encode:', invoice.invoiceId, error)
        return {
          ...invoice,
          createHash: '',
        }
      }
    }),
  )
}

export const ROTATION_INTERVAL_MS = 60_000 // 60 seconds for viewing animations
