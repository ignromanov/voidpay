export interface InvoiceSchemaV1 {
  /** Schema Version (Fixed: 1) */
  v: 1
  /** Invoice ID (UUID or unique string) */
  id: string
  /** Issue Date (Unix Timestamp in seconds) */
  iss: number
  /** Due Date (Unix Timestamp in seconds) */
  due: number
  /** Notes (Max 280 chars) */
  nt?: string | undefined
  /** Network Chain ID (e.g., 1, 137) */
  net: number
  /** Currency Symbol (e.g., "USDC", "ETH") */
  cur: string
  /** Token Address (Optional, undefined for native) */
  t?: string | undefined
  /** Token Decimals (Required for precision) */
  dec: number
  /** Sender Info */
  f: {
    /** Name */
    n: string
    /** Wallet Address */
    a: string
    /** Email (Optional) */
    e?: string | undefined
    /** Physical Address (Optional, multi-line allowed) */
    ads?: string | undefined
    /** Phone (Optional) */
    ph?: string | undefined
  }
  /** Client Info */
  c: {
    /** Name */
    n: string
    /** Wallet Address (Optional) */
    a?: string | undefined
    /** Email (Optional) */
    e?: string | undefined
    /** Physical Address (Optional, multi-line allowed) */
    ads?: string | undefined
    /** Phone (Optional) */
    ph?: string | undefined
  }
  /** Line Items */
  it: Array<{
    /** Description */
    d: string
    /** Quantity (BigInt string or number) */
    q: string | number
    /** Rate/Price (BigInt string) */
    r: string
  }>
  /** Tax Rate (Percentage string e.g. "10%" or Fixed Amount string) */
  tax?: string | undefined
  /** Discount (Percentage string e.g. "10%" or Fixed Amount string) */
  dsc?: string | undefined
  /** Reserved: Metadata (Extensibility) */
  meta?: Record<string, unknown> | undefined
  /** Reserved: Future use */
  _future?: unknown
}
