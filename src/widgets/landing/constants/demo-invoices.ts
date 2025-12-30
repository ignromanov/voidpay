/**
 * Demo invoice data for landing page rotation
 * Feature: 012-landing-page
 *
 * All fields of InvoiceSchemaV1 are populated to demonstrate full functionality.
 * Each demo showcases a different invoice status and payment state.
 * Uses ViewedInvoice type from store for consistency.
 */

import type { ViewedInvoice } from '@/entities/invoice'

const BASE_TIMESTAMP = 1704067200 // 2024-01-01 00:00:00 UTC

export const DEMO_INVOICES: ViewedInvoice[] = [
  // --- Ethereum (1) - Smart Contract Audit [PAID + VALIDATED] ---
  {
    invoiceId: 'eth-inv-001',
    invoiceUrl:
      'https://voidpay.xyz/pay?d=N4IgZglgNgpgziAXKADgQwE4GMAWBaEaRGBNAGhDQwDsVcQBrAeQCUQBfAXUJKpAGNEyACYB7FABsALgDVaYgJoCSLdgE8+AwcNESpMuUq59BQkWvlSZauPIBMzNBizsGLMxxQAVB',
    viewedAt: '2024-01-01T12:00:00.000Z',
    status: 'paid',
    txHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abc1',
    txHashValidated: true,
    data: {
      v: 1,
      id: 'eth-inv-001',
      iss: BASE_TIMESTAMP,
      due: BASE_TIMESTAMP + 86400 * 14,
      nt: 'Audit report pending final sign-off. Payment due upon delivery.',
      net: 1,
      cur: 'ETH',
      dec: 18,
      f: {
        n: 'EtherScale Solutions',
        a: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        e: 'billing@etherscale.io',
        ads: '548 Market St, Suite 23000\nSan Francisco, CA 94104\nUSA',
        ph: '+1 415 555 0142',
      },
      c: {
        n: 'DeFi Frontiers DAO',
        a: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
        e: 'treasury@defifrontiers.xyz',
        ads: 'c/o Legal Entity\n123 Blockchain Ave\nZug, Switzerland',
        ph: '+41 41 555 0198',
      },
      it: [
        { d: 'Smart Contract Security Audit (40 hours)', q: 40, r: '0.125' },
        { d: 'Gas Optimization Consulting (8 hours)', q: 8, r: '0.1' },
      ],
      tax: '0',
      dsc: '5%',
    },
  },
  // --- Arbitrum (42161) - Game Asset Design [PENDING] ---
  {
    invoiceId: 'arb-inv-001',
    invoiceUrl:
      'https://voidpay.xyz/pay?d=N4IgZglgNgpgziAXKADgQwE4GMAWBaEaRGBNAGhDQwDsVcQBrAeQCUQBfAXUJKpAGNEyACYB7FABsALgDVaYgJoCSLdgE8+AwcNESpMuUq59BQkWvlSZauPIBMzNBizsGLMxxQAVC',
    viewedAt: '2024-01-03T09:30:00.000Z',
    status: 'pending',
    data: {
      v: 1,
      id: 'arb-inv-001',
      iss: BASE_TIMESTAMP + 86400 * 2,
      due: BASE_TIMESTAMP + 86400 * 32,
      nt: 'Final delivery includes source files and commercial license.',
      net: 42161,
      cur: 'USDC',
      t: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      dec: 6,
      f: {
        n: 'L2 Design Studio',
        a: '0x3B5c26914569BdF2c8D4e27f0701831F41028751',
        e: 'invoices@l2design.studio',
        ads: '789 Creative Blvd, Unit 4\nAustin, TX 78701\nUSA',
        ph: '+1 512 555 0177',
      },
      c: {
        n: 'ArbGaming Inc.',
        a: '0x99283928B108B736021319727B2B4dD600021c2B',
        e: 'payments@arbgaming.io',
        ads: '456 Gaming Tower, Floor 12\nSingapore 018956',
        ph: '+65 6555 0234',
      },
      it: [
        { d: 'Character Sprite Set (10 animations)', q: 1, r: '1200' },
        { d: 'UI Animation Pack (menus, buttons)', q: 1, r: '800' },
        { d: 'Sound Effects Integration', q: 1, r: '400' },
      ],
      tax: '8%',
      dsc: '200',
    },
  },
  // --- Optimism (10) - Public Goods Grant [PAID + NOT VALIDATED] ---
  {
    invoiceId: 'opt-inv-001',
    invoiceUrl:
      'https://voidpay.xyz/pay?d=N4IgZglgNgpgziAXKADgQwE4GMAWBaEaRGBNAGhDQwDsVcQBrAeQCUQBfAXUJKpAGNEyACYB7FABsALgDVaYgJoCSLdgE8+AwcNESpMuUq59BQkWvlSZauPIBMzNBizsGLMxxQAVD',
    viewedAt: '2024-01-06T14:15:00.000Z',
    status: 'paid',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    txHashValidated: false, // Shows warning indicator
    data: {
      v: 1,
      id: 'opt-inv-001',
      iss: BASE_TIMESTAMP + 86400 * 5,
      due: BASE_TIMESTAMP + 86400 * 35,
      nt: 'Thank you for supporting public goods. Milestone 1 of 3.',
      net: 10,
      cur: 'OP',
      t: '0x4200000000000000000000000000000000000042',
      dec: 18,
      f: {
        n: 'Optimistic Builders Collective',
        a: '0x4200000000000000000000000000000000000006',
        e: 'grants@optimisticbuilders.org',
        ads: '1 Public Goods Way\nOptimism City, OP 10001\nDecentralized',
        ph: '+1 800 OPT GOOD',
      },
      c: {
        n: 'RetroPGF Foundation',
        a: '0x2501c477D0A35545a387Aa4A3EEe4292A9a8B3F0',
        e: 'disbursements@retropgf.eth',
        ads: 'Optimism Foundation\n123 Collective Drive\nRemote',
        ph: '+1 888 555 0100',
      },
      it: [
        { d: 'Public Goods Infrastructure Grant - Phase 1', q: 1, r: '15000' },
        { d: 'Community Tooling Development', q: 1, r: '8000' },
        { d: 'Documentation & Onboarding', q: 1, r: '2000' },
      ],
      tax: '0',
      dsc: '0',
    },
  },
  // --- Polygon (137) - Data Analytics Service [OVERDUE] ---
  {
    invoiceId: 'poly-inv-001',
    invoiceUrl:
      'https://voidpay.xyz/pay?d=N4IgZglgNgpgziAXKADgQwE4GMAWBaEaRGBNAGhDQwDsVcQBrAeQCUQBfAXUJKpAGNEyACYB7FABsALgDVaYgJoCSLdgE8+AwcNESpMuUq59BQkWvlSZauPIBMzNBizsGLMxxQAVE',
    viewedAt: '2024-01-02T16:45:00.000Z',
    status: 'overdue',
    data: {
      v: 1,
      id: 'poly-inv-001',
      iss: BASE_TIMESTAMP + 86400 * 1,
      due: BASE_TIMESTAMP + 86400 * 15,
      nt: 'Q1 2024 subscription. Auto-renewal unless cancelled 7 days prior.',
      net: 137,
      cur: 'USDC',
      t: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      dec: 6,
      f: {
        n: 'PolyMarket Analytics Ltd.',
        a: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        e: 'billing@polymarketanalytics.com',
        ads: '42 Data Center Road\nMumbai, Maharashtra 400001\nIndia',
        ph: '+91 22 5555 0456',
      },
      c: {
        n: 'Prediction Protocol DAO',
        a: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
        e: 'finance@predictiondao.io',
        ads: 'DAO Multisig\nGlobal Decentralized Network',
        ph: '+44 20 5555 0789',
      },
      it: [
        { d: 'Market Data Feed - Premium Tier (Q1)', q: 3, r: '1500' },
        { d: 'API Access - Unlimited Calls', q: 1, r: '500' },
        { d: 'Custom Dashboard Setup', q: 1, r: '750' },
      ],
      tax: '18%',
      dsc: '10%',
    },
  },
]

export const ROTATION_INTERVAL_MS = 60_000 // 60 seconds for viewing animations
