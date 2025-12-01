# System Patterns

**Last Updated**: 2025-12-01
**Pattern**: Feature-Sliced Design (FSD)
**Framework**: Next.js 15+ App Router

## Project Structure (FSD Layers)

```
src/
├── app/                     # Layer 1: Routing
│   ├── layout.tsx           # Global providers (Wagmi, TanStack Query)
│   ├── page.tsx             # Landing (/)
│   ├── create/page.tsx      # Editor (/create)
│   ├── pay/page.tsx         # Payment (/pay?d=...)
│   └── api/rpc/route.ts     # Edge API proxy
│
├── page-compositions/       # Layer 2: Page Assembly
│   ├── landing/
│   ├── editor/
│   └── payment/
│
├── widgets/                 # Layer 3: UI Blocks
│   ├── app-shell/           # Header, Footer, AmbientBackground
│   ├── invoice-paper/       # A4 visual (1:1.414 ratio)
│   ├── invoice-editor/      # Form with validation
│   └── payment-terminal/    # Web3 interaction card
│
├── features/                # Layer 4: User Actions
│   ├── invoice-codec/       # URL encoding/decoding
│   ├── generate-link/       # Form → URL
│   ├── wallet-connect/      # Wagmi connectors
│   └── payment-status/      # Blockchain polling
│
├── entities/                # Layer 5: Business Logic
│   ├── invoice/             # Schema, types, Zustand store
│   ├── token/               # ERC20, decimals, token lists
│   └── network/             # Chain configs, RPC endpoints
│
└── shared/                  # Layer 6: Primitives
    ├── ui/                  # Radix + CVA components
    ├── lib/                 # Utilities (cn, compression)
    └── config/              # Constants, env vars
```

## Routing

| Route        | Purpose           | SEO     |
| ------------ | ----------------- | ------- |
| `/`          | Marketing landing | Indexed |
| `/create`    | Invoice editor    | Noindex |
| `/pay?d=...` | Payment view      | Noindex |

## Key Architectural Decisions

### 1. URL State Model

- ALL invoice data in URL parameters
- `lz-string` LZW compression (45-60% ratio)
- Max 2000 bytes, 2-3 line items typical

### 2. Schema Versioning

- Immutable v1 parser (never changes)
- Migration adapters for old → new
- Binary codec planned (P1.42) for 45-50% smaller URLs

### 3. RPC Proxy Pattern

- Edge Function at `/api/rpc`
- Automatic failover (Alchemy → Infura)
- Rate limiting (100 req/min per IP)
- NO telemetry

### 4. Magic Dust Verification

- Random micro-amount (0.000001-0.000999)
- Exact matching only (NO fuzzy tolerance)
- Display: "Pretty" (1,000.00) + "Exact" (1,000.000042)

### 5. Hybrid Theme Strategy

- **Desk** (controls): zinc-950 dark
- **Paper** (invoice): white, A4 ratio 1:1.414
- Network-specific ambient glow

## Invoice Schema v1 (LOCKED)

```typescript
interface InvoiceSchemaV1 {
  v: 1;           // Version
  id: string;     // INV-001
  iss: string;    // Issue date (ISO)
  due: string;    // Due date
  nt?: string;    // Notes (max 280)
  net: number;    // Chain ID
  cur: string;    // Currency symbol
  t?: string;     // Token address
  dec: number;    // Decimals (BAKED IN)
  f: {...};       // From (name, wallet)
  c: {...};       // Client (name, wallet?)
  it: [...];      // Line items
  tax: string;    // Tax rate
  dsc: string;    // Discount
}
```

## Data Flow

### Creator Flow

```
User input → widgets/invoice-editor
         → entities/invoice/store (draft)
         → widgets/invoice-paper (preview)
         → features/generate-link
         → shared/lib/compression
         → URL: voidpay.xyz/pay?d=<compressed>
```

### Payer Flow

```
URL ?d=... → shared/lib/compression (decode)
          → Schema validation (v: 1)
          → InvoicePaper + PaymentTerminal
          → features/payment-status (poll)
```

## Network Themes

| Network  | Gradient                       |
| -------- | ------------------------------ |
| Ethereum | Violet (#7C3AED → #A78BFA)     |
| Arbitrum | Blue/Cyan (#3B82F6 → #06B6D4)  |
| Optimism | Red/Orange (#EF4444 → #F97316) |
| Polygon  | Purple (#A855F7 → #C084FC)     |
