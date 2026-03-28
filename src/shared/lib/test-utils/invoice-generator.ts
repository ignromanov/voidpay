/**
 * Random Invoice Generator
 *
 * Generates random invoices for testing and demonstration purposes.
 */

import type { Invoice } from '@/shared/lib/invoice-types'
import type { Address } from 'viem'

/**
 * Generates a random UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generates a random Ethereum address
 */
function generateAddress(): Address {
  const chars = '0123456789abcdef'
  let address = '0x'
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)]
  }
  return address as Address
}

/**
 * Random item from array
 */
function randomItem<T>(arr: T[]): T {
  const item = arr[Math.floor(Math.random() * arr.length)]
  if (item === undefined) {
    throw new Error('Array is empty or invalid index')
  }
  return item
}

/**
 * Random number between min and max
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Random boolean with given probability (default 50%)
 */
function randomBool(probability = 0.5): boolean {
  return Math.random() < probability
}

/**
 * Sample data for realistic invoices
 */
const SAMPLE_DATA = {
  senderNames: [
    'Acme Corp',
    'TechStart Inc',
    'Digital Solutions LLC',
    'BlockChain Ventures',
    'Web3 Consulting',
    'Crypto Advisory Group',
  ],
  clientNames: [
    'GlobalTech Industries',
    'Innovation Labs',
    'Smart Contracts Co',
    'Decentralized Systems',
    'Future Finance',
    'Digital Assets Fund',
  ],
  emails: ['info@example.com', 'contact@company.io', 'hello@startup.xyz', 'admin@business.com'],
  addresses: [
    '123 Main Street\nSan Francisco, CA 94105\nUSA',
    '456 Tech Avenue\nNew York, NY 10001\nUSA',
    '789 Innovation Blvd\nAustin, TX 78701\nUSA',
  ],
  phones: ['+1-555-0100', '+1-555-0200', '+1-555-0300'],
  itemDescriptions: [
    'Web Development Services',
    'Smart Contract Audit',
    'Blockchain Consulting',
    'UI/UX Design',
    'Technical Documentation',
    'System Integration',
    'DevOps Services',
    'Security Assessment',
  ],
  /** Network-aware tokens: each chain has its own correct addresses */
  networks: [
    {
      id: 1, tokens: [
        { symbol: 'ETH', decimals: 18, address: undefined },
        { symbol: 'USDC', decimals: 6, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address },
        { symbol: 'USDT', decimals: 6, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address },
        { symbol: 'DAI', decimals: 18, address: '0x6B175474E89094C44Da98b954EeDeAC495271d0F' as Address },
      ],
    },
    {
      id: 42161, tokens: [
        { symbol: 'ETH', decimals: 18, address: undefined },
        { symbol: 'USDC', decimals: 6, address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Address },
        { symbol: 'USDT', decimals: 6, address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' as Address },
        { symbol: 'DAI', decimals: 18, address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' as Address },
      ],
    },
    {
      id: 10, tokens: [
        { symbol: 'ETH', decimals: 18, address: undefined },
        { symbol: 'USDC', decimals: 6, address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as Address },
        { symbol: 'USDT', decimals: 6, address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58' as Address },
        { symbol: 'DAI', decimals: 18, address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' as Address },
      ],
    },
    {
      id: 137, tokens: [
        { symbol: 'POL', decimals: 18, address: undefined },
        { symbol: 'USDC', decimals: 6, address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as Address },
        { symbol: 'USDT', decimals: 6, address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as Address },
        { symbol: 'DAI', decimals: 18, address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' as Address },
      ],
    },
  ],
}

/**
 * Generates a random invoice with realistic data
 */
export function generateRandomInvoice(): Invoice {
  const network = randomItem(SAMPLE_DATA.networks)
  const currency = randomItem(network.tokens)

  // Generate timestamps
  const now = Math.floor(Date.now() / 1000)
  const iss = now - randomInt(0, 7 * 24 * 60 * 60) // Up to 7 days ago
  const due = iss + randomInt(7, 60) * 24 * 60 * 60 // 7-60 days from issue

  // Generate line items (1-5 items)
  const itemCount = randomInt(1, 5)
  const it = Array.from({ length: itemCount }, () => {
    const qty = randomInt(1, 100)
    const rate = (randomInt(10, 5000) * Math.pow(10, currency.decimals)).toString()

    return {
      description: randomItem(SAMPLE_DATA.itemDescriptions),
      quantity: qty,
      rate: rate,
    }
  })

  // Optional fields (70% chance each)
  const includeNotes = randomBool(0.7)
  const includeTax = randomBool(0.7)
  const includeDiscount = randomBool(0.3)

  const includeSenderEmail = randomBool(0.8)
  const includeSenderAddress = randomBool(0.6)
  const includeSenderPhone = randomBool(0.6)

  const includeClientWallet = randomBool(0.5)
  const includeClientEmail = randomBool(0.7)
  const includeClientAddress = randomBool(0.5)
  const includeClientPhone = randomBool(0.4)

  const invoice: Invoice = {
    invoiceId: generateUUID(),
    issuedAt: iss,
    dueAt: due,
    notes: includeNotes
      ? 'Payment due within ' +
        randomInt(7, 30) +
        ' days. Please include invoice number in transaction memo.'
      : undefined,
    networkId: network.id,
    currency: currency.symbol,
    tokenAddress: currency.address,
    decimals: currency.decimals,
    from: {
      name: randomItem(SAMPLE_DATA.senderNames),
      walletAddress: generateAddress(),
      email: includeSenderEmail ? randomItem(SAMPLE_DATA.emails) : undefined,
      physicalAddress: includeSenderAddress ? randomItem(SAMPLE_DATA.addresses) : undefined,
      phone: includeSenderPhone ? randomItem(SAMPLE_DATA.phones) : undefined,
    },
    client: {
      name: randomItem(SAMPLE_DATA.clientNames),
      walletAddress: includeClientWallet ? generateAddress() : undefined,
      email: includeClientEmail ? randomItem(SAMPLE_DATA.emails) : undefined,
      physicalAddress: includeClientAddress ? randomItem(SAMPLE_DATA.addresses) : undefined,
      phone: includeClientPhone ? randomItem(SAMPLE_DATA.phones) : undefined,
    },
    items: it,
    tax: includeTax ? randomInt(5, 25) + '%' : undefined,
    discount: includeDiscount ? randomInt(5, 20) + '%' : undefined,
    total: String(randomInt(100000, 999999999)),
  }

  return invoice
}

/**
 * Generates multiple random invoices
 */
export function generateRandomInvoices(count: number): Invoice[] {
  return Array.from({ length: count }, () => generateRandomInvoice())
}
