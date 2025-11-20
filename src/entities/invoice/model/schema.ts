export interface InvoiceSchemaV1 {
  /** Schema Version (Fixed: 1) */
  v: 1;
  /** Invoice ID (UUID or unique string) */
  id: string;
  /** Issue Date (Unix Timestamp in seconds) */
  iss: number;
  /** Due Date (Unix Timestamp in seconds) */
  due: number;
  /** Notes (Max 280 chars) */
  nt?: string;
  /** Network Chain ID (e.g., 1, 137) */
  net: number;
  /** Currency Symbol (e.g., "USDC", "ETH") */
  cur: string;
  /** Token Address (Optional, undefined for native) */
  t?: string;
  /** Token Decimals (Required for precision) */
  dec: number;
  /** Sender Info */
  f: {
    /** Name */
    n: string;
    /** Wallet Address */
    a: string;
    /** Email (Optional) */
    e?: string;
    /** Physical Address (Optional, multi-line allowed) */
    ads?: string;
    /** Phone (Optional) */
    ph?: string;
  };
  /** Client Info */
  c: {
    /** Name */
    n: string;
    /** Wallet Address (Optional) */
    a?: string;
    /** Email (Optional) */
    e?: string;
    /** Physical Address (Optional, multi-line allowed) */
    ads?: string;
    /** Phone (Optional) */
    ph?: string;
  };
  /** Line Items */
  it: Array<{
    /** Description */
    d: string;
    /** Quantity (BigInt string or number) */
    q: string | number;
    /** Rate/Price (BigInt string) */
    r: string;
  }>;
  /** Tax Rate (Percentage string e.g. "10%" or Fixed Amount string) */
  tax?: string;
  /** Discount (Percentage string e.g. "10%" or Fixed Amount string) */
  dsc?: string;
  /** Reserved: Metadata (Extensibility) */
  meta?: Record<string, unknown>;
  /** Reserved: Future use */
  _future?: unknown;
}
