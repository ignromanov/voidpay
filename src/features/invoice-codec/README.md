# Invoice Codec

Binary URL encoding for stateless invoices.

## Overview

All invoice data lives in the URL hash fragment, which is never sent to the server.

```
https://voidpay.xyz/pay#<Base64url(TLV v1 payload)>
```

Format specification (header, TLV types, dictionaries, compression): [`docs/codec-v1-format.md`](../../../docs/codec-v1-format.md).

## Pipeline

Invoice -> TLV records (`lib/tlv-map.ts`, chain/app dictionaries) -> canonical sort -> whole-payload Brotli (`brotli-wasm`) -> Base64url.

- `src/features/invoice-codec/lib/` — invoice-specific mapping, encode/decode, security, EIP-712, OG preview
- `src/shared/lib/tlv-codec/` — generic primitives: TLV reader/writer, varint, canonical ordering, Base64url, Brotli compression

Encode and decode are async because Brotli runs in WASM.

## Usage

```typescript
import { generateInvoiceUrl, decodeInvoice } from '@/features/invoice-codec'

const url = await generateInvoiceUrl(invoice) // https://voidpay.xyz/pay#...
const decoded = await decodeInvoice(window.location.hash.slice(1))
```

## API

| Function                      | Description                                   |
| ----------------------------- | --------------------------------------------- |
| `generateInvoiceUrl(invoice)` | Full URL with hash fragment (2000-byte limit) |
| `encodeInvoice(invoice)`      | Encoded hash string only                      |
| `decodeInvoice(hash)`         | Hash -> validated Invoice                     |
| `parseInvoiceHash(hash)`      | Result-style wrapper around decode            |
| `encodeOGPreview(invoice)`    | Optional `?og=` social card metadata          |
| `decodeOGPreview(str)`        | Parse OG metadata                             |

OG format: `id_amount_currency_network[_from][_due]`.

## Versioning

Codec version is the low 7 bits of header byte 1 (currently `0x01`); the high bit flags Brotli compression. Format is locked: old URLs must keep decoding.
