import { hmac } from '@noble/hashes/hmac'
import { sha256 } from '@noble/hashes/sha256'
import type { Invoice } from './types.js'

const FIXED_SALT = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
const derived = hmac(sha256, FIXED_SALT, new TextEncoder().encode('magic_dust'))
const num =
  (((derived[0]! << 24) | (derived[1]! << 16) | (derived[2]! << 8) | derived[3]!) >>> 0)
const DUST = (num % 999) + 1 // 1-999

// Helper: compute total = sum(qty * rate) + magicDust
function total(items: { quantity: number; rate: string }[]): string {
  let sum = 0n
  for (const item of items) sum += BigInt(item.quantity) * BigInt(item.rate)
  return String(sum + BigInt(DUST))
}

const MAGIC_DUST = String(DUST)

const FROM_WALLET = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const CLIENT_WALLET = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const scenario1Items = [{ description: 'Dev Services', quantity: 1, rate: '500000000000000000' }]
const scenario2Items = [
  { description: 'UI Design', quantity: 1, rate: '150000000' },
  { description: 'Backend Development', quantity: 1, rate: '200000000' },
]
const scenario3Items = [
  { description: 'Smart Contract Audit', quantity: 1, rate: '500000000' },
  { description: 'Frontend Integration', quantity: 2, rate: '150000000' },
  { description: 'Documentation', quantity: 1, rate: '75000000' },
]
const scenario4Items = [
  { description: 'Landing page design and implementation work', quantity: 1, rate: '200000000' },
  { description: 'Payment gateway integration with Stripe API', quantity: 1, rate: '300000000' },
  { description: 'User authentication system with OAuth 2.0', quantity: 1, rate: '250000000' },
  { description: 'Database schema design and migration scripts', quantity: 1, rate: '150000000' },
  { description: 'Comprehensive end-to-end testing suite setup', quantity: 1, rate: '100000000' },
]
const scenario5Items = [
  { description: 'Token swap integration', quantity: 1, rate: '1000000000000000000' },
  { description: 'Liquidity pool setup', quantity: 1, rate: '2000000000000000000' },
]
const scenario6Items = [
  { description: 'Treasury transfer', quantity: 1, rate: '100000000000000000000' },
]
const scenario7Items = [
  { description: 'Quarterly retainer', quantity: 1, rate: '500000000000000000' },
]
const scenario8Items = [
  { description: 'Разработка интерфейса', quantity: 1, rate: '200000000' },
  { description: 'Тестирование и отладка', quantity: 1, rate: '100000000' },
]

const NOTES_280 =
  'Payment for smart contract development and security audit services rendered in Q4 2025. This invoice covers the complete frontend redesign, backend API optimization, and comprehensive testing suite. All deliverables have been reviewed and approved by the project manager. Net 30 terms apply per our agreement.'

export const TEST_INVOICES: { name: string; invoice: Invoice }[] = [
  {
    name: 'Minimal',
    invoice: {
      invoiceId: 'INV-001',
      issuedAt: 1700000000,
      dueAt: 1702592000,
      networkId: 1,
      currency: 'ETH',
      decimals: 18,
      from: { name: 'Alice', walletAddress: FROM_WALLET },
      client: { name: 'Bob' },
      items: scenario1Items,
      total: total(scenario1Items),
      magicDust: MAGIC_DUST,
    },
  },
  {
    name: 'Standard USDC',
    invoice: {
      invoiceId: 'INV-002',
      issuedAt: 1700000000,
      dueAt: 1702592000,
      networkId: 1,
      currency: 'USDC',
      decimals: 6,
      tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      from: { name: 'Alice Studio', walletAddress: FROM_WALLET, email: 'alice@studio.com' },
      client: { name: 'Bob Corp', email: 'bob@corp.io' },
      items: scenario2Items,
      total: total(scenario2Items),
      magicDust: MAGIC_DUST,
    },
  },
  {
    name: 'Full',
    invoice: {
      invoiceId: 'INV-003',
      issuedAt: 1700000000,
      dueAt: 1702592000,
      networkId: 137,
      currency: 'USDC',
      decimals: 6,
      tokenAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      notes: NOTES_280,
      tax: '10%',
      discount: '5%',
      from: {
        name: 'Alice Web3 Studio LLC',
        walletAddress: FROM_WALLET,
        email: 'billing@alicestudio.com',
        phone: '+1-555-0123',
        physicalAddress: '123 Blockchain Ave, Suite 456, San Francisco, CA 94105',
        taxId: 'US-12-3456789',
      },
      client: {
        name: 'Bob Enterprises Inc',
        walletAddress: CLIENT_WALLET,
        email: 'accounts@bobenterprises.io',
        phone: '+44-20-7946-0958',
        physicalAddress: '456 DeFi Street, Floor 12, London EC2A 1NT, UK',
        taxId: 'GB-987654321',
      },
      items: scenario3Items,
      total: total(scenario3Items),
      magicDust: MAGIC_DUST,
    },
  },
  {
    name: 'Multi-item',
    invoice: {
      invoiceId: 'INV-004',
      issuedAt: 1700000000,
      dueAt: 1702592000,
      networkId: 42161,
      currency: 'USDC',
      decimals: 6,
      tokenAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      notes: 'Milestone 2 delivery — all features implemented and tested',
      from: { name: 'Dev Agency', walletAddress: FROM_WALLET, email: 'invoices@devagency.xyz' },
      client: { name: 'DeFi Protocol DAO' },
      items: scenario4Items,
      total: total(scenario4Items),
      magicDust: MAGIC_DUST,
    },
  },
  {
    name: 'Unknown token',
    invoice: {
      invoiceId: 'INV-005',
      issuedAt: 1700000000,
      dueAt: 1702592000,
      networkId: 10,
      currency: 'CUSTOM',
      decimals: 18,
      tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
      from: { name: 'Alice', walletAddress: FROM_WALLET },
      client: { name: 'Charlie', email: 'charlie@dao.xyz' },
      items: scenario5Items,
      total: total(scenario5Items),
      magicDust: MAGIC_DUST,
    },
  },
  {
    name: 'Large amounts',
    invoice: {
      invoiceId: 'INV-006',
      issuedAt: 1700000000,
      dueAt: 1702592000,
      networkId: 1,
      currency: 'ETH',
      decimals: 18,
      from: { name: 'Whale', walletAddress: FROM_WALLET },
      client: { name: 'Treasury' },
      items: scenario6Items,
      total: total(scenario6Items),
      magicDust: MAGIC_DUST,
    },
  },
  {
    name: 'Short notes',
    invoice: {
      invoiceId: 'INV-007',
      issuedAt: 1700000000,
      dueAt: 1702592000,
      networkId: 137,
      currency: 'MATIC',
      decimals: 18,
      notes: 'Payment for Q4',
      from: { name: 'Freelancer', walletAddress: FROM_WALLET },
      client: { name: 'Client' },
      items: scenario7Items,
      total: total(scenario7Items),
      magicDust: MAGIC_DUST,
    },
  },
  {
    name: 'Unicode',
    invoice: {
      invoiceId: 'INV-008',
      issuedAt: 1700000000,
      dueAt: 1702592000,
      networkId: 1,
      currency: 'USDC',
      decimals: 6,
      tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      notes: 'Оплата за разработку 🚀 Ready to ship!',
      from: { name: 'Студия Кода', walletAddress: FROM_WALLET },
      client: { name: 'Компания ООО' },
      items: scenario8Items,
      total: total(scenario8Items),
      magicDust: MAGIC_DUST,
    },
  },
]
