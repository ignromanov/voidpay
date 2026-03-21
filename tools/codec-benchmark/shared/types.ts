export interface Party {
  name: string
  walletAddress: string
  email?: string
  phone?: string
  physicalAddress?: string
  taxId?: string
}

export interface ClientParty {
  name: string
  walletAddress?: string
  email?: string
  phone?: string
  physicalAddress?: string
  taxId?: string
}

export interface LineItem {
  description: string
  quantity: number
  rate: string // BigInt string in atomic units
}

export interface Invoice {
  invoiceId: string
  issuedAt: number // unix seconds
  dueAt: number // unix seconds
  notes?: string
  networkId: number
  currency: string
  tokenAddress?: string
  decimals: number
  from: Party
  client: ClientParty
  items: LineItem[]
  tax?: string
  discount?: string
  total: string // BigInt string in atomic units
  magicDust?: string // BigInt string in atomic units
}

export interface InvoiceSchemaV1 {
  v: 1
  id: string
  iss: number
  due: number
  nt?: string
  net: number
  cur: string
  t?: string
  dec: number
  f: { n: string; a: string; e?: string; ads?: string; ph?: string }
  c: { n: string; a?: string; e?: string; ads?: string; ph?: string }
  it: Array<{ d: string; q: string | number; r: string }>
  tax?: string
  dsc?: string
}

export function toSchemaV1(invoice: Invoice): InvoiceSchemaV1 {
  const result: InvoiceSchemaV1 = {
    v: 1,
    id: invoice.invoiceId,
    iss: invoice.issuedAt,
    due: invoice.dueAt,
    net: invoice.networkId,
    cur: invoice.currency,
    dec: invoice.decimals,
    f: {
      n: invoice.from.name,
      a: invoice.from.walletAddress,
    },
    c: {
      n: invoice.client.name,
    },
    it: invoice.items.map(item => ({
      d: item.description,
      q: item.quantity,
      r: item.rate,
    })),
  }
  // Optional fields — only set if present
  if (invoice.notes) result.nt = invoice.notes
  if (invoice.tokenAddress) result.t = invoice.tokenAddress
  if (invoice.from.email) result.f.e = invoice.from.email
  if (invoice.from.physicalAddress) result.f.ads = invoice.from.physicalAddress
  if (invoice.from.phone) result.f.ph = invoice.from.phone
  if (invoice.client.walletAddress) result.c.a = invoice.client.walletAddress
  if (invoice.client.email) result.c.e = invoice.client.email
  if (invoice.client.physicalAddress) result.c.ads = invoice.client.physicalAddress
  if (invoice.client.phone) result.c.ph = invoice.client.phone
  if (invoice.tax) result.tax = invoice.tax
  if (invoice.discount) result.dsc = invoice.discount
  return result
}

export interface CodecInfo {
  name: string
  version: string
  date: string
  description: string
  commit: string
  encoding: string
  compression: string
  browserCompatible: boolean
}

export interface CodecModule {
  info: CodecInfo
  encode: (invoice: Invoice) => string
}
