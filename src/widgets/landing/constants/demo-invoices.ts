/**
 * Demo invoice data for landing page rotation
 * Feature: 012-landing-page
 *
 * All fields of Invoice are populated to demonstrate full functionality.
 * Each demo showcases a different invoice status and payment state.
 *
 * IMPORTANT: createHash is computed at build time (SSG).
 * encodeInvoice runs during `next build`, not on client.
 */

import { encodeInvoice } from '@/features/invoice-codec'
import type { RichInvoice } from '@/entities/invoice'

const BASE_TIMESTAMP = 1704067200 // 2024-01-01 00:00:00 UTC

/**
 * Raw demo data without computed hashes
 */
const RAW_DEMO_INVOICES: Omit<RichInvoice, 'createHash'>[] = [
  // --- Ethereum (1) - Smart Contract Audit [PAID + VALIDATED] ---
  {
    invoiceId: 'eth-inv-001',
    invoiceUrl:
      'https://voidpay.xyz/pay?d=N4IgZglgNgpgziAXKADgQwE4GMAWBaEaRGBNAGhDQwDsVcQBrAeQCUQBfAXUJKpAGNEyACYB7FABsALgDVaYgJoCSLdgE8+AwcNESpMuUq59BQkWvlSZauPIBMzNBizsGLMxxQAVB',
    createdAt: '2024-01-01T12:00:00.000Z',
    status: 'paid',
    txHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abc1',
    txHashValidated: true,
    data: {
      version: 2,
      invoiceId: 'eth-inv-001',
      issuedAt: BASE_TIMESTAMP,
      dueAt: BASE_TIMESTAMP + 86400 * 14,
      notes: 'Audit report pending final sign-off. Payment due upon delivery.',
      networkId: 1,
      currency: 'ETH',
      decimals: 18,
      from: {
        name: 'EtherScale Solutions',
        walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        email: 'billing@etherscale.io',
        physicalAddress: '548 Market St, Suite 23000\nSan Francisco, CA 94104\nUSA',
        phone: '+1 415 555 0142',
        taxId: 'US 12-3456789',
      },
      client: {
        name: 'DeFi Frontiers DAO',
        walletAddress: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
        email: 'treasury@defifrontiers.xyz',
        physicalAddress: 'c/o Legal Entity\n123 Blockchain Ave\nZug, Switzerland',
        phone: '+41 41 555 0198',
        taxId: 'CHE-123.456.789',
      },
      items: [
        // ETH has 18 decimals: 0.125 ETH = 125000000000000000 atomic units
        { description: 'Smart Contract Security Audit (40 hours)', quantity: 40, rate: '125000000000000000' },
        { description: 'Gas Optimization Consulting (8 hours)', quantity: 8, rate: '100000000000000000' },
      ],
      tax: '0',
      discount: '5%',
    },
  },
  // --- Arbitrum (42161) - Game Asset Design [PENDING] ---
  {
    invoiceId: 'arb-inv-001',
    invoiceUrl:
      'https://voidpay.xyz/pay?d=N4IgZglgNgpgziAXKADgQwE4GMAWBaEaRGBNAGhDQwDsVcQBrAeQCUQBfAXUJKpAGNEyACYB7FABsALgDVaYgJoCSLdgE8+AwcNESpMuUq59BQkWvlSZauPIBMzNBizsGLMxxQAVC',
    createdAt: '2024-01-03T09:30:00.000Z',
    status: 'pending',
    data: {
      version: 2,
      invoiceId: 'arb-inv-001',
      issuedAt: BASE_TIMESTAMP + 86400 * 2,
      dueAt: BASE_TIMESTAMP + 86400 * 32,
      notes: 'Final delivery includes source files and commercial license.',
      networkId: 42161,
      currency: 'USDC',
      tokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
      from: {
        name: 'L2 Design Studio',
        walletAddress: '0x3B5c26914569BdF2c8D4e27f0701831F41028751',
        email: 'invoices@l2design.studio',
        physicalAddress: '789 Creative Blvd, Unit 4\nAustin, TX 78701\nUSA',
        phone: '+1 512 555 0177',
      },
      client: {
        name: 'ArbGaming Inc.',
        walletAddress: '0x99283928B108B736021319727B2B4dD600021c2B',
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
      tax: '8',
      discount: '200000000', // $200 in atomic units
    },
  },
  // --- Optimism (10) - Public Goods Grant [PAID + NOT VALIDATED] ---
  {
    invoiceId: 'opt-inv-001',
    invoiceUrl:
      'https://voidpay.xyz/pay?d=N4IgZglgNgpgziAXKADgQwE4GMAWBaEaRGBNAGhDQwDsVcQBrAeQCUQBfAXUJKpAGNEyACYB7FABsALgDVaYgJoCSLdgE8+AwcNESpMuUq59BQkWvlSZauPIBMzNBizsGLMxxQAVD',
    createdAt: '2024-01-06T14:15:00.000Z',
    status: 'paid',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    txHashValidated: false, // Shows warning indicator
    data: {
      version: 2,
      invoiceId: 'opt-inv-001',
      issuedAt: BASE_TIMESTAMP + 86400 * 5,
      dueAt: BASE_TIMESTAMP + 86400 * 35,
      notes: 'Thank you for supporting public goods. Milestone 1 of 3.',
      networkId: 10,
      currency: 'OP',
      tokenAddress: '0x4200000000000000000000000000000000000042',
      decimals: 18,
      from: {
        name: 'Optimistic Builders Collective',
        walletAddress: '0x4200000000000000000000000000000000000006',
        email: 'grants@optimisticbuilders.org',
        physicalAddress: '1 Public Goods Way\nOptimism City, OP 10001\nDecentralized',
        phone: '+1 800 OPT GOOD',
        taxId: 'US 55-1234567',
      },
      client: {
        name: 'RetroPGF Foundation',
        walletAddress: '0x2501c477D0A35545a387Aa4A3EEe4292A9a8B3F0',
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
      tax: '0',
      discount: '0',
    },
  },
  // --- Polygon (137) - Data Analytics Service [OVERDUE] ---
  {
    invoiceId: 'poly-inv-001',
    invoiceUrl:
      'https://voidpay.xyz/pay?d=N4IgZglgNgpgziAXKADgQwE4GMAWBaEaRGBNAGhDQwDsVcQBrAeQCUQBfAXUJKpAGNEyACYB7FABsALgDVaYgJoCSLdgE8+AwcNESpMuUq59BQkWvlSZauPIBMzNBizsGLMxxQAVE',
    createdAt: '2024-01-02T16:45:00.000Z',
    status: 'overdue',
    data: {
      version: 2,
      invoiceId: 'poly-inv-001',
      issuedAt: BASE_TIMESTAMP + 86400 * 1,
      dueAt: BASE_TIMESTAMP + 86400 * 15,
      notes: 'Q1 2024 subscription. Auto-renewal unless cancelled 7 days prior.',
      networkId: 137,
      currency: 'USDC',
      tokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      decimals: 6,
      from: {
        name: 'PolyMarket Analytics Ltd.',
        walletAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        email: 'billing@polymarketanalytics.com',
        physicalAddress: '42 Data Center Road\nMumbai, Maharashtra 400001\nIndia',
        phone: '+91 22 5555 0456',
        taxId: 'IN GSTIN29ABCDE1234F1Z5',
      },
      client: {
        name: 'Prediction Protocol DAO',
        walletAddress: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
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
      tax: '18',
      discount: '10',
    },
  },
]

/**
 * Demo invoices with pre-computed createHash for /create page navigation
 * Hash is computed at module load time (build time for SSG)
 */
export const DEMO_INVOICES: RichInvoice[] = RAW_DEMO_INVOICES.map((invoice) => {
  try {
    return {
      ...invoice,
      createHash: encodeInvoice(invoice.data),
    }
  } catch (error) {
    // Graceful degradation: button won't work but page loads
    console.error('[DEMO_INVOICES] Failed to encode:', invoice.invoiceId, error)
    return {
      ...invoice,
      createHash: '',
    }
  }
})

export const ROTATION_INTERVAL_MS = 60_000 // 60 seconds for viewing animations
