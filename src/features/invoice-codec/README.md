# URL State Codec System

Stateless URL-based invoice encoding/decoding system for VoidPay.

## Features

- ✅ **Zero-Backend**: All invoice data encoded in URL
- ✅ **Compression**: LZ-based compression keeps URLs under 2000 bytes
- ✅ **Validation**: Zod schema validation for data integrity
- ✅ **Versioning**: Forward-compatible schema versioning (v1)
- ✅ **Type-Safe**: Full TypeScript support

## Installation

Dependencies are already installed in the project:
- `lz-string` - URL-safe compression
- `zod` - Runtime validation

## Configuration

Set the application URL in your environment variables (`.env.local`):

```bash
NEXT_PUBLIC_APP_URL=https://voidpay.com
```

If not set, the system will fall back to `https://voidpay.com` as the default.

## Usage

### Encoding an Invoice

```typescript
import { generateInvoiceUrl, InvoiceSchemaV1 } from '@/features/invoice-codec';

const invoice: InvoiceSchemaV1 = {
  v: 1,
  id: 'inv_123',
  iss: 1732070000,
  due: 1732674800,
  net: 1,
  cur: 'USDC',
  dec: 6,
  f: { n: 'Alice', a: '0x1234567890123456789012345678901234567890' },
  c: { n: 'Bob' },
  it: [{ d: 'Service', q: 1, r: '100000000' }]
};

try {
  const url = generateInvoiceUrl(invoice);
  console.log('Shareable URL:', url);
} catch (error) {
  console.error('Encoding failed:', error.message);
}
```

### Decoding a URL

```typescript
import { decodeInvoice } from '@/features/invoice-codec';

const searchParams = new URLSearchParams(window.location.search);
const compressedData = searchParams.get('d');

if (compressedData) {
  try {
    const invoice = decodeInvoice(compressedData);
    console.log('Invoice Data:', invoice);
  } catch (error) {
    console.error('Invalid invoice URL:', error.message);
  }
}
```

## API Reference

### `generateInvoiceUrl(invoice, baseUrl?)`

Generates a shareable URL with compressed invoice data.

- **Parameters**:
  - `invoice: InvoiceSchemaV1` - Invoice data to encode
  - `baseUrl?: string` - Optional base URL override (default: uses `NEXT_PUBLIC_APP_URL` env or `https://voidpay.com`)
- **Returns**: `string` - Full URL with compressed data (e.g., `https://voidpay.com/pay?d=...`)
- **Throws**: Error if URL exceeds 2000 bytes

### `encodeInvoice(invoice)`

Encodes invoice into compressed string (without URL wrapping).

- **Parameters**: `invoice: InvoiceSchemaV1`
- **Returns**: `string` - Compressed data string

### `decodeInvoice(compressed)`

Decodes compressed string into validated invoice object.

- **Parameters**: `compressed: string` - Compressed data from URL
- **Returns**: `InvoiceSchemaV1` - Validated invoice object
- **Throws**: Error if decompression, parsing, or validation fails

## Schema Version 1

The `InvoiceSchemaV1` interface uses abbreviated keys to minimize payload size:

```typescript
interface InvoiceSchemaV1 {
  v: 1;              // Version
  id: string;        // Invoice ID
  iss: number;       // Issue date (Unix timestamp)
  due: number;       // Due date (Unix timestamp)
  nt?: string;       // Notes (max 280 chars)
  net: number;       // Network chain ID
  cur: string;       // Currency symbol
  t?: string;        // Token address (optional)
  dec: number;       // Token decimals
  f: { ... };        // Sender info
  c: { ... };        // Client info
  it: Array<{ ... }>; // Line items
  tax?: string;      // Tax rate
  dsc?: string;      // Discount
  meta?: Record<string, unknown>; // Reserved
  _future?: unknown; // Reserved
}
```

## Validation Rules

- URL must be ≤ 2000 bytes
- Notes must be ≤ 280 characters
- Dates must be positive integers
- Addresses must be valid Ethereum addresses (0x + 40 hex chars)
- Amounts must be valid numeric strings

## Architecture

```
src/
├── entities/invoice/
│   ├── model/schema.ts       # InvoiceSchemaV1 interface
│   └── lib/validation.ts     # Zod validation schemas
├── features/invoice-codec/
│   ├── lib/
│   │   ├── encode.ts         # URL encoding logic
│   │   └── decode.ts         # URL decoding + versioning
│   └── index.ts              # Public API
└── shared/lib/compression/   # lz-string wrapper
```

## Backward Compatibility

The decoder supports version-specific parsing:

- **v1 parser is immutable** (Constitution Principle IV)
- Future versions (v2, v3) can be added without breaking v1 URLs
- Reserved fields (`meta`, `_future`) allow extensibility

## Error Handling

All functions throw descriptive errors:

```typescript
// URL too large
Error: URL size (2150 bytes) exceeds 2000 byte limit

// Invalid data
Error: Invalid invoice data: f.a: Invalid sender address

// Unsupported version
Error: Unsupported schema version: 2

// Decompression failure
Error: Failed to decompress invoice data
```

## Implementation Status

✅ **Completed Tasks**:
- T001: Dependencies installed (lz-string, zod)
- T002: Project structure created
- T003: InvoiceSchemaV1 interface
- T004: Zod validation schemas
- T005: Compression utility
- T006: URL encoding logic
- T007: URL decoding logic
- T008: Public API barrel file
- T010: Version-specific parsing
- T012: Zod validation integration
- T014: Export verification

⏭️ **Skipped** (as per user request):
- T009: Round-trip tests
- T011: Forward compatibility tests
- T013: Validation and limit tests

## Next Steps

To integrate into the application:

1. Import codec functions in invoice creation UI
2. Use `generateInvoiceUrl()` when user clicks "Share"
3. Use `decodeInvoice()` on the payment page to load invoice data
4. Add error boundaries for invalid URLs

## License

Part of the VoidPay stateless invoicing platform.
