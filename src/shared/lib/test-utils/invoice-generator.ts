/**
 * Random Invoice Generator
 *
 * Generates random invoices for testing and demonstration purposes.
 */

import { InvoiceSchemaV2 } from '@/entities/invoice/model/schema-v2'

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
function generateAddress(): string {
  const chars = '0123456789abcdef'
  let address = '0x'
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)]
  }
  return address
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
  currencies: [
    { symbol: 'USDC', decimals: 6, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
    { symbol: 'USDT', decimals: 6, address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
    { symbol: 'DAI', decimals: 18, address: '0x6b175474e89094c44da98b954eedeac495271d0f' },
    { symbol: 'ETH', decimals: 18, address: undefined },
  ],
  chainIds: [
    { id: 1, name: 'Ethereum' },
    { id: 42161, name: 'Arbitrum' },
    { id: 10, name: 'Optimism' },
    { id: 137, name: 'Polygon' },
  ],
}

/**
 * Generates a random invoice with realistic data
 */
export function generateRandomInvoice(): InvoiceSchemaV2 {
  const currency = randomItem(SAMPLE_DATA.currencies)
  const chainId = randomItem(SAMPLE_DATA.chainIds)

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

  const invoice: InvoiceSchemaV2 = {
    version: 2,
    invoiceId: generateUUID(),
    issuedAt: iss,
    dueAt: due,
    notes: includeNotes
      ? 'Payment due within ' +
        randomInt(7, 30) +
        ' days. Please include invoice number in transaction memo.'
      : undefined,
    networkId: chainId.id,
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
  }

  return invoice
}

/**
 * Generates multiple random invoices
 */
export function generateRandomInvoices(count: number): InvoiceSchemaV2[] {
  return Array.from({ length: count }, () => generateRandomInvoice())
}
