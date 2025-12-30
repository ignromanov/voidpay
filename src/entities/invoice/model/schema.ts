export interface Invoice {
  /** Schema Version (Fixed: 2) */
  version: 2
  /** Invoice ID (UUID or unique string) */
  invoiceId: string
  /** Issue Date (Unix Timestamp in seconds) */
  issuedAt: number
  /** Due Date (Unix Timestamp in seconds) */
  dueAt: number
  /** Notes (Max 280 chars) */
  notes?: string | undefined
  /** Network Chain ID (e.g., 1, 137) */
  networkId: number
  /** Currency Symbol (e.g., "USDC", "ETH") */
  currency: string
  /** Token Address (Optional, undefined for native) */
  tokenAddress?: string | undefined
  /** Token Decimals (Required for precision) */
  decimals: number
  /** Sender Info */
  from: {
    /** Name */
    name: string
    /** Wallet Address */
    walletAddress: string
    /** Email (Optional) */
    email?: string | undefined
    /** Physical Address (Optional, multi-line allowed) */
    physicalAddress?: string | undefined
    /** Phone (Optional) */
    phone?: string | undefined
    /** Tax ID (Optional) */
    taxId?: string | undefined
  }
  /** Client Info */
  client: {
    /** Name */
    name: string
    /** Wallet Address (Optional) */
    walletAddress?: string | undefined
    /** Email (Optional) */
    email?: string | undefined
    /** Physical Address (Optional, multi-line allowed) */
    physicalAddress?: string | undefined
    /** Phone (Optional) */
    phone?: string | undefined
    /** Tax ID (Optional) */
    taxId?: string | undefined
  }
  /** Line Items */
  items: Array<{
    /** Description */
    description: string
    /** Quantity (BigInt string or number) */
    quantity: string | number
    /** Rate/Price (BigInt string) */
    rate: string
  }>
  /** Tax Rate (Percentage string e.g. "10%" or Fixed Amount string) */
  tax?: string | undefined
  /** Discount (Percentage string e.g. "10%" or Fixed Amount string) */
  discount?: string | undefined
  /** Reserved: Metadata (Extensibility) */
  meta?: Record<string, unknown> | undefined
  /** Reserved: Future use */
  _future?: unknown
}
