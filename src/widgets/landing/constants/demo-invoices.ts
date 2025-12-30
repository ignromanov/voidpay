/**
 * Demo invoice data for landing page rotation
 * Feature: 012-landing-page
 *
 * Each demo showcases different optional field combinations:
 * - ETH: Full profile (all fields) - shows complete invoice
 * - ARB: Minimal profile (email only) - shows lean freelancer invoice
 * - OP: Mixed (email, phone, taxId) - shows DAO/nonprofit style
 * - POLY: Mixed (address, taxId) - shows B2B international style
 *
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
        { description: 'Smart Contract Security Audit (40 hours)', quantity: 40, rate: '0.125' },
        { description: 'Gas Optimization Consulting (8 hours)', quantity: 8, rate: '0.1' },
      ],
      tax: '0',
      discount: '5%',
    },
  },
  // --- Arbitrum (42161) - Game Asset Design [PENDING] ---
  // Minimal profile: freelancer with just email, client with just wallet
  {
    invoiceId: 'arb-inv-001',
    invoiceUrl:
      'https://voidpay.xyz/pay?d=N4IgZglgNgpgziAXKADgQwE4GMAWBaEaRGBNAGhDQwDsVcQBrAeQCUQBfAXUJKpAGNEyACYB7FABsALgDVaYgJoCSLdgE8+AwcNESpMuUq59BQkWvlSZauPIBMzNBizsGLMxxQAVC',
    viewedAt: '2024-01-03T09:30:00.000Z',
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
        // Minimal: no phone, address, taxId
      },
      client: {
        name: 'ArbGaming Inc.',
        walletAddress: '0x99283928B108B736021319727B2B4dD600021c2B',
        // Minimal: no email, phone, address, taxId
      },
      items: [
        { description: 'Character Sprite Set (10 animations)', quantity: 1, rate: '1200' },
        { description: 'UI Animation Pack (menus, buttons)', quantity: 1, rate: '800' },
        { description: 'Sound Effects Integration', quantity: 1, rate: '400' },
      ],
      tax: '8%',
      discount: '200',
    },
  },
  // --- Optimism (10) - Public Goods Grant [PAID + NOT VALIDATED] ---
  // DAO style: email + phone + taxId (no physical address)
  {
    invoiceId: 'opt-inv-001',
    invoiceUrl:
      'https://voidpay.xyz/pay?d=N4IgZglgNgpgziAXKADgQwE4GMAWBaEaRGBNAGhDQwDsVcQBrAeQCUQBfAXUJKpAGNEyACYB7FABsALgDVaYgJoCSLdgE8+AwcNESpMuUq59BQkWvlSZauPIBMzNBizsGLMxxQAVD',
    viewedAt: '2024-01-06T14:15:00.000Z',
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
        phone: '+1 800 OPT GOOD',
        taxId: 'US 55-1234567',
        // DAO style: no physical address
      },
      client: {
        name: 'RetroPGF Foundation',
        email: 'disbursements@retropgf.eth',
        physicalAddress: 'Optimism Foundation\n123 Collective Drive\nRemote',
        // Foundation: email + address, no phone/taxId/wallet
      },
      items: [
        { description: 'Public Goods Infrastructure Grant - Phase 1', quantity: 1, rate: '15000' },
        { description: 'Community Tooling Development', quantity: 1, rate: '8000' },
        { description: 'Documentation & Onboarding', quantity: 1, rate: '2000' },
      ],
      tax: '0',
      discount: '0',
    },
  },
  // --- Polygon (137) - Data Analytics Service [OVERDUE] ---
  // B2B international: address + taxId (no email/phone)
  {
    invoiceId: 'poly-inv-001',
    invoiceUrl:
      'https://voidpay.xyz/pay?d=N4IgZglgNgpgziAXKADgQwE4GMAWBaEaRGBNAGhDQwDsVcQBrAeQCUQBfAXUJKpAGNEyACYB7FABsALgDVaYgJoCSLdgE8+AwcNESpMuUq59BQkWvlSZauPIBMzNBizsGLMxxQAVE',
    viewedAt: '2024-01-02T16:45:00.000Z',
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
        physicalAddress: '42 Data Center Road\nMumbai, Maharashtra 400001\nIndia',
        taxId: 'IN GSTIN29ABCDE1234F1Z5',
        // B2B formal: address + taxId, no email/phone
      },
      client: {
        name: 'Prediction Protocol DAO',
        walletAddress: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
        phone: '+44 20 5555 0789',
        taxId: 'GB 123456789',
        // Client: phone + taxId + wallet, no email/address
      },
      items: [
        { description: 'Market Data Feed - Premium Tier (Q1)', quantity: 3, rate: '1500' },
        { description: 'API Access - Unlimited Calls', quantity: 1, rate: '500' },
        { description: 'Custom Dashboard Setup', quantity: 1, rate: '750' },
      ],
      tax: '18%',
      discount: '10%',
    },
  },
]

export const ROTATION_INTERVAL_MS = 60_000 // 60 seconds for viewing animations
