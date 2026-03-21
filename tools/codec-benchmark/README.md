# VoidPay Codec Benchmark

Compares encoded URL lengths across 6 historical versions of VoidPay's invoice codec.

## Usage

```bash
pnpm install --ignore-workspace
node_modules/.bin/tsx benchmark.ts
```

Outputs: console table + `demo.html` (open in browser).

## Codec Versions

| Version | Compression | Encoding | Era |
|---------|------------|----------|-----|
| v0 | lz-string | URL-encoded JSON | 2025-11 |
| v1 | None | Base62 | 2025-12 |
| v2 | None (flags + dicts) | Base62 | 2025-12 |
| v3 | DEFLATE (pako) | Base62 | 2025-12 |
| v4 | DEFLATE (pako) | Base62 | 2026-03 |
| v5 | Brotli (node:zlib) | Base64url | 2026-03 |

## Test Scenarios

8 hardcoded invoices covering: minimal, typical USDC, full fields, multi-item,
unknown tokens, large amounts, short text, and Unicode.
