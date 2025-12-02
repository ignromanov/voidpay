/**
 * Demo invoice data for landing page rotation
 * Feature: 012-landing-page
 */

import type { DemoInvoice } from '../types'

export const DEMO_INVOICES: DemoInvoice[] = [
  {
    id: 'demo-eth-001',
    network: 'ethereum',
    recipient: '0x1234...abcd',
    amount: '0.5',
    token: 'ETH',
    description: 'Web Development Services',
    items: [
      { description: 'Frontend Development', quantity: 40, unitPrice: '0.01' },
      { description: 'Smart Contract Audit', quantity: 1, unitPrice: '0.1' },
    ],
  },
  {
    id: 'demo-arb-001',
    network: 'arbitrum',
    recipient: '0x5678...efgh',
    amount: '500',
    token: 'USDC',
    description: 'Design Consultation',
    items: [
      { description: 'UI/UX Design Review', quantity: 10, unitPrice: '25' },
      { description: 'Brand Guidelines', quantity: 1, unitPrice: '250' },
    ],
  },
  {
    id: 'demo-op-001',
    network: 'optimism',
    recipient: '0x9abc...ijkl',
    amount: '1000',
    token: 'USDC',
    description: 'Marketing Campaign',
    items: [
      { description: 'Social Media Management', quantity: 1, unitPrice: '400' },
      { description: 'Content Creation', quantity: 12, unitPrice: '50' },
    ],
  },
  {
    id: 'demo-poly-001',
    network: 'polygon',
    recipient: '0xdef0...mnop',
    amount: '750',
    token: 'USDC',
    description: 'API Integration',
    items: [
      { description: 'REST API Development', quantity: 15, unitPrice: '30' },
      { description: 'Documentation', quantity: 1, unitPrice: '300' },
    ],
  },
]

export const ROTATION_INTERVAL_MS = 15_000 // 15 seconds for better comprehension
