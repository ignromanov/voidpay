# VoidPay - Architecture Summary

**Pattern**: Feature-Sliced Design (FSD)
**Framework**: Next.js 15+ App Router
**Last Updated**: 2025-11-28 (v1.13.0 - UI stack: Radix + CVA + Framer Motion)

## Project Structure (FSD Layers)

```
src/
├── app/                     # Layer 1: Routing & Entry Points
│   ├── layout.tsx           # Global providers (Wagmi, TanStack Query)
│   ├── page.tsx             # Landing page (/)
│   ├── create/page.tsx      # Invoice editor (/create)
│   ├── pay/page.tsx         # Payment view (/pay?d=...)
│   └── api/rpc/route.ts     # Edge API proxy for RPC calls
│
├── page-compositions/       # Layer 2: Page Assembly (NOT Next.js Pages Router)
│   ├── landing/             # Marketing page composition
│   ├── editor/              # Create app composition
│   └── payment/             # Pay view composition
│
├── widgets/                 # Layer 3: Self-contained UI Blocks
│   ├── app-shell/           # Global layout (Header, Footer, AmbientBackground)
│   ├── invoice-paper/       # Visual invoice representation (A4 aspect ratio)
│   ├── invoice-editor/      # Form with validation (line items, metadata)
│   ├── payment-terminal/    # Web3 interaction card (Connect, Pay, Status)
│   └── history-drawer/      # Slide-over panel with local history
│
├── features/                # Layer 4: User Actions
│   ├── invoice-codec/       # URL encoding/decoding (lz-string)
│   ├── generate-link/       # Form → JSON → LZ-String → URL
│   ├── wallet-connect/      # Wagmi connectors
│   ├── network-switch/      # Chain switching logic
│   └── payment-status/      # Blockchain polling (Alchemy Transfers API)
│
├── entities/                # Layer 5: Business Logic & State
│   ├── invoice/             # Schema, types, Zustand store (drafts)
│   ├── token/               # ERC20 logic, decimals, token lists
│   └── network/             # Chain configs, theme maps, RPC endpoints
│
└── shared/                  # Layer 6: Reusable Primitives
    ├── ui/                  # UI primitives (Radix wrappers, CVA components)
    │   └── primitives/      # Radix Dialog, Select, Popover with custom styles
    ├── lib/                 # Utilities (cn, formatters, compression)
    │   ├── compression/     # lz-string wrapper
    │   ├── binary-codec/    # Binary codec (P1.42 - experimental)
    │   └── test-utils/      # Test helpers
    └── config/              # Constants, env vars, network configs
```

## Routing & Page Logic

### Landing Page (`/`)
- **Purpose**: Marketing, SEO, Trust signals
- **SEO**: Indexed (only public-facing page)
- **Components**: Hero section, Feature grid, GitHub link
- **CTA**: "Start Invoicing" → `/create`

### Invoice Editor (`/create`)
- **Purpose**: Invoice creation tool
- **SEO**: Noindex (private workspace)
- **State**: `useCreatorStore` (Zustand + LocalStorage persist)
- **Layout**: 
  - Desktop: Split view (50% form / 50% preview)
  - Mobile: Tabs (Edit | Preview)
- **Action**: "Generate Link" opens Success Modal (QR + Copy)

### Payment View (`/pay?d=...`)
- **Purpose**: Invoice display + Payment execution
- **SEO**: Noindex (dynamic content)
- **State**: Hydrated from URL params (read-only)
- **Visual**: Ambient background changes per network (Arbitrum blue, Optimism red, etc.)
- **Layout**: 
  - InvoicePaper component (visual document)
  - PaymentTerminal widget (floating controls)

## Data Flow

### Creator Flow
1. User inputs data → `widgets/invoice-editor`
2. Store update → `entities/invoice/model/store.ts` (draft)
3. Reactive preview → `widgets/invoice-paper` (subscribed to store)
4. Generate link:
   - `features/generate-link` reads draft from store
   - Compress via `shared/lib/compression` (lz-string)
   - Create URL: `voidpay.xyz/pay?d=<compressed>`
   - Save metadata to history (LocalStorage)

### Payer Flow
1. URL parse → `/pay` receives `?d=...` param
2. Decode → `shared/lib/compression` (lz-string decompression)
3. Validate → Check schema version (`v: 1`)
4. Render → Pass data to `InvoicePaper` + `PaymentTerminal`
5. Web3 check → `features/payment-status` polls blockchain (Alchemy Transfers API)

## Invoice Schema (v1) - LOCKED

```typescript
interface InvoiceSchemaV1 {
  v: 1;                    // Version (REQUIRED)
  id: string;              // Invoice ID (INV-001)
  iss: string;             // Issue date (ISO 8601)
  due: string;             // Due date
  nt?: string;             // Notes (max 280 chars - HARD LIMIT)
  net: number;             // Chain ID (1, 10, 42161, 137)
  cur: string;             // Currency symbol (ETH, USDC)
  t?: string;              // Token address (undefined = native)
  dec: number;             // Decimals (BAKED IN - no RPC dependency)
  f: {                     // From (invoice creator)
    n: string;             // Name
    w?: string;            // Wallet address (optional)
    e?: string;            // Email (optional)
    a?: string;            // Physical address (optional)
  };
  c: {                     // Client (payer)
    n: string;             // Name
    w?: string;            // Wallet address (optional for verification)
    e?: string;            // Email (optional)
    a?: string;            // Physical address (optional)
  };
  it: Array<{              // Line items
    d: string;             // Description
    q: number;             // Quantity
    r: string;             // Rate (stored as string for precision)
  }>;
  tax: string;             // Tax rate (e.g., "10" = 10%)
  dsc: string;             // Discount (e.g., "50" = $50)
  _reserved1?: any;        // Future extensibility
  _reserved2?: any;
  _reserved3?: any;
  _reserved4?: any;
  _reserved5?: any;
}
```

**URL Constraints**:
- Max compressed length: 2000 bytes
- Notes field: 280 chars (enforced in UI)
- Generation blocked if URL exceeds limit

## Key Architectural Decisions

### 1. URL State Model
- **Decision**: Encode ALL invoice data in URL parameters
- **Rationale**: Enables stateless architecture, no backend required
- **Implementation**: `lz-string` LZW compression (45-60% compression ratio)
- **Tradeoff**: URL length limits invoice complexity (2-3 line items typical)

### 2. Schema Versioning
- **Decision**: Immutable schema versions (v1 parser never changes)
- **Rationale**: Backward compatibility (old URLs work forever)
- **Implementation**: Migration adapters convert old schemas to new at runtime
- **Future**: Binary codec (P1.42) for 45-50% smaller URLs (5-7 line items)

### 3. RPC Proxy Pattern
- **Decision**: Edge Function at `/api/rpc` proxies all blockchain calls
- **Rationale**: Protects RPC keys from client-side exposure
- **Implementation**: 
  - Next.js Edge Runtime
  - Automatic failover (Alchemy → Infra)
  - Rate limiting (100 req/min per IP via Vercel KV)
- **Security**: Allowlisted RPC methods, CORS validation, NO telemetry

### 4. Magic Dust Verification
- **Decision**: Add random micro-amount to each invoice (0.000001-0.000999)
- **Rationale**: Provides unique payment identifier without backend
- **Implementation**: 
  - Crypto-secure randomness (Web Crypto API)
  - Exact matching (NO fuzzy tolerance)
  - Display: "Pretty Print" (1,000.00) + "Exact" (1,000.000042)

### 5. LocalStorage State
- **Decision**: Store user data exclusively in browser LocalStorage
- **Rationale**: Privacy-first (Constitutional Principle II)
- **Implementation**: 
  - `useCreatorStore`: Drafts, history, settings
  - `usePayerStore`: Receipts, transaction hashes
  - Export/Import functionality for data portability

### 6. Hybrid Theme Strategy
- **Decision**: Dark app shell + Light invoice paper
- **Rationale**: Visual metaphor ("Paper on a Desk"), print/PDF fidelity
- **Implementation**: 
  - Desk (controls): Zinc-950 background
  - Paper (invoice): White background with ISO 216 (A4) aspect ratio 1:1.414
  - Network-specific ambient glow (Arbitrum blue, Optimism red)

### 7. Finalized Confirmations
- **Decision**: Wait for `finalized` block status before marking "Paid"
- **Rationale**: Protects recipients from chain reorganizations
- **Implementation**: 
  - Ethereum: ~15 min
  - Arbitrum/Optimism: ~10-15 min
  - Polygon PoS: ~30-45 min
- **UI States**: Processing → Confirming → Paid

## Design System

### App Shell Architecture
- **Header** (The Desk): Logo + Wallet Connect + Menu
- **Footer** (The Desk): Report Abuse + Legal Disclaimer
- **Invoice Card** (The Paper): Invoice data + "Powered by VoidPay" watermark
- **Separation Rationale**: Branding/Liability vs Content (Constitutional Principle XI/XII)

### Visual Physics
- **ISO 216 Compliance**: All invoice representations MUST use A4 aspect ratio (1:1.414)
- **Max Width**: `max-w-[1600px]` centered container (prevents ultrawide stretching)
- **Responsive**: Preview scales proportionally, maintains aspect ratio

### Network Themes (Ambient Glow)
- **Technique**: Absolute positioned blurred elements behind invoice
- **Colors**:
  - Ethereum/Default: Violet gradient (#7C3AED → #A78BFA)
  - Arbitrum: Blue/Cyan gradient (#3B82F6 → #06B6D4)
  - Optimism: Red/Orange gradient (#EF4444 → #F97316)
  - Polygon: Purple gradient (#A855F7 → #C084FC)
- **Specs**: `blur-3xl`, `opacity-20-30`, z-index behind paper

## Security Architecture

### Static Blocklist
- **Source**: `https://raw.githubusercontent.com/voidpay/blocklist/main/blocked-hashes.json`
- **Format**: `{ "hashes": ["sha256_1", ...], "updated": "ISO8601" }`
- **Hash Target**: SHA-256 of full URL param `?d=...` (NOT invoice contents)
- **Privacy**: Hashing prevents exposure of invoice data
- **Update**: Public Pull Requests to blocklist repository
- **UI**: Red blocking screen for flagged URLs

### Rate Limiting
- **Implementation**: Vercel KV (Redis) at `/api/rpc` edge function
- **Limit**: 100 requests/minute per IP
- **Scope**: Per-IP, not per-user (stateless)
- **Behavior**: Fail-open (if KV unavailable, allow requests)
- **Constitutional Compliance**: Transient operational data exception (Principle I)

## Performance Optimizations

### Caching Strategy
- **Static Data**: `staleTime: Infinity` (token decimals, symbols)
- **Network Data**: `staleTime: 60s` (balances, gas prices)
- **Payment Status**: `refetchInterval: 10s` (polling during confirmation)

### Code Splitting
- PDF renderer lazy-loaded (on "Download" button click)
- Wallet connectors lazy-loaded (on "Connect Wallet" click)
- QR code library lazy-loaded (on modal open)

## Testing Strategy (Pending)

- **Schema Versioning**: Snapshot tests for v1 parser (regression prevention)
- **Payment Verification**: Unit tests for Magic Dust generation/matching
- **URL Compression**: Round-trip tests (encode → decode → exact match)
- **Multi-Network**: Integration tests per network

## Critical Files

- `src/entities/invoice/model/types.ts` - Schema v1 types
- `src/features/invoice-codec/lib/codec.ts` - URL encoding/decoding
- `src/app/api/rpc/route.ts` - RPC proxy implementation
- `src/entities/invoice/model/store.ts` - Zustand creator store
- `src/widgets/app-shell/` - Global layout components
