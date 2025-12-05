# Quickstart: URL State Codec

## Installation

```bash
npm install lz-string zod big.js
```

## Usage

### Encoding an Invoice

```typescript
import { encodeInvoice } from '@/features/invoice-codec'
import { InvoiceSchemaV1 } from '@/entities/invoice/model/schema'

const invoice: InvoiceSchemaV1 = {
  v: 1,
  id: 'inv_123',
  iss: 1732070000,
  due: 1732674800,
  net: 1,
  cur: 'USDC',
  dec: 6,
  f: { n: 'Alice', a: '0x123...' },
  c: { n: 'Bob' },
  it: [{ d: 'Service', q: 1, r: '100000000' }], // 100 USDC
}

try {
  const url = encodeInvoice(invoice)
  console.log('Shareable URL:', url)
} catch (error) {
  console.error('Encoding failed:', error.message)
}
```

### Decoding a URL

```typescript
import { decodeInvoice } from '@/features/invoice-codec'

// Extract 'd' param from URL
const searchParams = new URLSearchParams(window.location.search)
const compressedData = searchParams.get('d')

if (compressedData) {
  try {
    const invoice = decodeInvoice(compressedData)
    console.log('Invoice Data:', invoice)
  } catch (error) {
    console.error('Invalid invoice URL:', error.message)
  }
}
```
