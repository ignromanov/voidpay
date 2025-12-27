/**
 * Demo invoice data for landing page rotation
 * Feature: 012-landing-page
 */

import type { InvoiceSchemaV1 } from '@/entities/invoice'

const BASE_TIMESTAMP = 1704067200 // 2024-01-01 00:00:00 UTC

export const DEMO_INVOICES: InvoiceSchemaV1[] = [
  // --- Ethereum (1) ---
  {
    v: 1,
    id: 'eth-inv-001',
    iss: BASE_TIMESTAMP,
    due: BASE_TIMESTAMP + 86400 * 14,
    net: 1,
    cur: 'ETH',
    dec: 18,
    f: {
      n: 'EtherScale Solutions',
      a: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      e: 'billing@etherscale.io',
    },
    c: {
      n: 'DeFi Frontiers DAO',
      a: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    },
    it: [
      { d: 'Smart Contract Audit - Core Protocol', q: 1, r: '1.5' },
      { d: 'Gas Optimization Report', q: 1, r: '0.3' },
    ],
    nt: 'Audit report pending final sign-off.',
  },
  // --- Arbitrum (1) ---
  {
    v: 1,
    id: 'arb-inv-001',
    iss: BASE_TIMESTAMP + 86400 * 2,
    due: BASE_TIMESTAMP + 86400 * 32,
    net: 42161,
    cur: 'USDC',
    t: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    dec: 6,
    f: {
      n: 'L2 Design Studio',
      a: '0x3B5c26914569BdF2c8D4e27f0701831F41028751',
    },
    c: {
      n: 'ArbGaming Inc.',
      a: '0x99283928B108B736021319727B2B4dD600021c2B',
    },
    it: [
      { d: 'Game UI Assets Pack', q: 1, r: '2500' },
      { d: 'Character Sprites Animation', q: 5, r: '400' },
    ],
  },
  // --- Optimism (1) ---
  {
    v: 1,
    id: 'opt-inv-001',
    iss: BASE_TIMESTAMP + 86400 * 5,
    due: BASE_TIMESTAMP + 86400 * 35,
    net: 10,
    cur: 'OP',
    t: '0x4200000000000000000000000000000000000042',
    dec: 18,
    f: {
      n: 'Optimistic Builders',
      a: '0xF301272719278918239281230000000000000001',
    },
    c: {
      n: 'RetroPGF Round 3',
      a: '0x8888888888888888888888888888888888888888',
    },
    it: [{ d: 'Community Grant Milestone 1', q: 1, r: '5000' }],
    nt: 'Thank you for supporting public goods.',
  },
  // --- Polygon (1) ---
  {
    v: 1,
    id: 'poly-inv-001',
    iss: BASE_TIMESTAMP + 86400 * 1,
    due: BASE_TIMESTAMP + 86400 * 15,
    net: 137,
    cur: 'USDC',
    t: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    dec: 6,
    f: {
      n: 'PolyMarket Analytics',
      a: '0x1111222233334444555566667777888899990000',
    },
    c: {
      n: 'Prediction V2 Launch',
      a: '0x0000999988887777666655554444333322221111',
    },
    it: [{ d: 'Market Data Feed - Q1', q: 3, r: '1500' }],
  },
]

export const ROTATION_INTERVAL_MS = 30_000 // 30 seconds for viewing animations
