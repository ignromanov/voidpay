# Invoice Codec

Binary URL encoding for stateless invoices.

## Overview

All invoice data lives in the URL — no backend storage. Uses hash fragments for privacy (never sent to server).

```
https://voidpay.xyz/pay#N4IgbghgTg9g...
                       └─ Binary-compressed invoice (private)
```

## Features

- **Binary V3 codec** — pako compression, ~40% smaller than JSON+lz-string
- **Hash fragments** — data never leaves browser
- **OG previews** — optional `?og=` param for social cards (minimal metadata only)
- **Version-locked** — v1 URLs work forever (Constitution Principle IV)

## Usage

### Encode Invoice → URL

```typescript
import { generateInvoiceUrl } from '@/features/invoice-codec'
import type { Invoice } from '@/entities/invoice'

const invoice: Invoice = {
  version: 2,
  invoiceId: 'INV-001',
  issuedAt: 1732070000,
  dueAt: 1732674800,
  networkId: 1,
  currency: 'USDC',
  decimals: 6,
  from: { name: 'Alice', walletAddress: '0x123...' },
  client: { name: 'Bob' },
  items: [{ description: 'Service', quantity: 1, rate: '100.00' }],
}

const url = generateInvoiceUrl(invoice)
// → https://voidpay.xyz/pay#N4IgbghgTg9g...
```

### Decode URL → Invoice

```typescript
import { decodeInvoice } from '@/features/invoice-codec'

const hash = window.location.hash.slice(1) // Remove #
const invoice = decodeInvoice(hash)
```

## OG Previews

Optional social card metadata (doesn't expose full invoice):

```typescript
import { encodeOGPreview } from '@/features/invoice-codec'

const ogParam = encodeOGPreview(invoice)
// → "a1b2c3d4_1250.00_USDC_arb_Acme_1231"

const fullUrl = `https://voidpay.xyz/pay?og=${ogParam}#${encoded}`
```

Format: `id_amount_currency_network[_from][_due]`

## API

| Function                      | Description                 |
| ----------------------------- | --------------------------- |
| `generateInvoiceUrl(invoice)` | Full URL with hash fragment |
| `encodeInvoice(invoice)`      | Binary string only          |
| `decodeInvoice(hash)`         | Hash → validated Invoice    |
| `encodeOGPreview(invoice)`    | Minimal OG metadata         |
| `decodeOGPreview(str)`        | Parse OG metadata           |

## Constraints

| Limit     | Value      | Reason                   |
| --------- | ---------- | ------------------------ |
| URL max   | 2000 bytes | QR codes, browser safety |
| Notes max | 280 chars  | Twitter-like brevity     |

## Architecture

```
features/invoice-codec/
├── lib/
│   ├── encode.ts      # Invoice → Binary URL
│   ├── decode.ts      # Binary URL → Invoice
│   └── og-preview.ts  # Social card metadata
└── index.ts           # Public API

shared/lib/binary-codec/
├── encoder-v3.ts      # Pako + custom binary format
├── decoder-v3.ts      # Version-aware decoding
└── dictionary.ts      # Common value compression
```

## Versioning

- `version: 2` — current schema (readable field names)
- Decoder auto-detects version from binary header
- Old URLs remain valid forever
