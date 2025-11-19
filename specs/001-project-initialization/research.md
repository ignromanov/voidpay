# Research: VoidPay Project Initialization

**Feature**: 001-project-initialization
**Date**: 2025-11-19
**Phase**: 0 (Outline & Research)

## Overview

This document consolidates research findings for initializing the VoidPay project with Next.js 14+, TypeScript, Web3 stack, and Feature-Sliced Design architecture. All technology choices are locked by the constitution, so research focuses on best practices and optimal configuration patterns.

---

## 1. Next.js 14+ App Router Configuration

### Decision: Use App Router with Edge Runtime for RPC Proxy

**Rationale**:

- App Router is the current Next.js paradigm (Pages Router is legacy)
- Edge Runtime provides global distribution and <50ms cold starts for RPC proxy
- Server Components enable zero-JS landing page for optimal SEO
- Metadata API simplifies route-specific SEO configuration (noindex for /create, /pay)

**Best Practices**:

- Use `app/layout.tsx` for global providers (RainbowKit, TanStack Query)
- Use Server Components by default, Client Components (`'use client'`) only when needed (state, effects, Web3)
- Use `generateMetadata()` for dynamic SEO (though MVP has static metadata)
- Use `export const runtime = 'edge'` for RPC proxy route (app/api/rpc/route.ts)

**Alternatives Considered**:

- Pages Router - Rejected (legacy, worse DX)
- Node.js runtime for API routes - Rejected (slower cold starts, unnecessary for stateless proxy)

**References**:

- Next.js 14 App Router docs: https://nextjs.org/docs/app
- Edge Runtime: https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes

---

## 2. TypeScript Strict Mode Configuration

### Decision: Enable All Strict Flags + Additional Safety Rules

**Rationale**:

- Financial application requires maximum type safety (irreversible crypto transactions)
- Strict mode catches decimal/precision errors at compile time
- `noUncheckedIndexedAccess` prevents undefined array access bugs
- `exactOptionalPropertyTypes` prevents `undefined` vs `missing` confusion

**Recommended tsconfig.json**:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Best Practices**:

- Use branded types for addresses, amounts (prevents mixing different units)
- Use `as const` for network configs (immutable, exact types)
- Avoid `any` - use `unknown` and type guards instead

**Alternatives Considered**:

- Standard strict mode only - Rejected (insufficient safety for financial app)
- Relaxed mode for faster development - Rejected (violates constitution philosophy)

**References**:

- TypeScript strict mode: https://www.typescriptlang.org/tsconfig#strict
- Financial app type safety: https://effectivetypescript.com/

---

## 3. Wagmi v2 + Viem Configuration with Dual RPC Providers

### Decision: Network-Specific Dual Provider Configuration (Alchemy Primary, Infura Fallback)

**Rationale**:

- Wagmi v2 + Viem is constitutional requirement (replaces deprecated ethers.js patterns)
- Alchemy provides Transfers API for payment verification (used in future features)
- Infura provides 99.9% SLA and better rate limits for free tier
- Each network needs separate endpoint configuration (not shared API keys)
- Automatic failover built into Wagmi config (no manual retry logic needed)

**Best Practices**:

```typescript
import { createConfig, http } from 'wagmi'
import { mainnet, arbitrum, optimism, polygon } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, arbitrum, optimism, polygon],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_ETH_URL, {
      batch: true,
      retryCount: 3,
      timeout: 10_000,
    }),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_ARB_URL),
    [optimism.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_OPT_URL),
    [polygon.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_POLY_URL),
  },
})
```

**Fallback Configuration** (for RPC proxy, not Wagmi):

- Server-side proxy detects Alchemy failure (429, 5xx)
- Automatically retries with Infura endpoint for same network
- Client never sees RPC URLs (maintains Principle VI)

**Environment Variables**:

```bash
# Alchemy (Primary)
NEXT_PUBLIC_ALCHEMY_ETH_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_ALCHEMY_ARB_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_ALCHEMY_OPT_URL=https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_ALCHEMY_POLY_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# Infura (Fallback - used in RPC proxy only)
NEXT_PUBLIC_INFURA_ETH_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_INFURA_ARB_URL=https://arbitrum-mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_INFURA_OPT_URL=https://optimism-mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_INFURA_POLY_URL=https://polygon-mainnet.infura.io/v3/YOUR_KEY
```

**Note**: `NEXT_PUBLIC_` prefix is intentional for Wagmi config (runs in browser), but RPC proxy should use server-only env vars for Infura fallback.

**Alternatives Considered**:

- Single shared RPC key - Rejected (violates network-specific failover requirement from spec clarification)
- Public RPC endpoints - Rejected (unreliable, rate limited)
- Only Alchemy or only Infura - Rejected (no redundancy)

**References**:

- Wagmi v2 config: https://wagmi.sh/react/api/createConfig
- Viem transports: https://viem.sh/docs/clients/transports/http
- Alchemy docs: https://docs.alchemy.com/reference/endpoints
- Infura docs: https://docs.infura.io/networks/ethereum

---

## 4. RainbowKit v2 Integration

### Decision: Use Latest RainbowKit with Custom Theme Matching VoidPay Brand

**Rationale**:

- RainbowKit v2 is constitutional requirement
- Provides battle-tested wallet connection UX (supports 100+ wallets)
- Built-in network switching UI (critical for multi-chain support)
- Customizable theme (match electric violet #7C3AED accent)

**Best Practices**:

```typescript
import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'

const theme = darkTheme({
  accentColor: '#7C3AED', // Electric violet
  accentColorForeground: 'white',
  borderRadius: 'medium',
})

export default function RootLayout({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

**Wallet Support Priority** (auto-detected by RainbowKit):

1. MetaMask (most popular)
2. Coinbase Wallet (mobile-friendly)
3. WalletConnect (universal)
4. Rainbow Wallet (native)

**Alternatives Considered**:

- Custom wallet connection UI - Rejected (reinventing wheel, worse UX)
- Web3Modal - Rejected (constitutional lock on RainbowKit)

**References**:

- RainbowKit v2 docs: https://www.rainbowkit.com/docs/introduction
- Theming: https://www.rainbowkit.com/docs/theming

---

## 5. Zustand Persistence Strategy

### Decision: LocalStorage with Separate Stores for Different Concerns

**Rationale**:

- Constitutional requirement: client-side persistence only (Principle II)
- LocalStorage persists across sessions (better UX than SessionStorage)
- Separate stores prevent data coupling and enable selective clearing
- Zustand persist middleware handles serialization/hydration automatically

**Store Architecture**:

```typescript
// entities/invoice/model/store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useInvoiceHistoryStore = create(
  persist(
    (set) => ({
      invoices: [],
      addInvoice: (invoice) =>
        set((state) => ({
          invoices: [invoice, ...state.invoices],
        })),
      clearHistory: () => set({ invoices: [] }),
    }),
    {
      name: 'voidpay-invoice-history',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// entities/user/model/store.ts
export const useUserPreferencesStore = create(
  persist(
    (set) => ({
      defaultNetwork: 1, // Ethereum
      defaultCurrency: 'USDC',
      theme: 'dark',
    }),
    {
      name: 'voidpay-user-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

**Best Practices**:

- Use separate storage keys (`voidpay-*`) to avoid collisions
- Implement export/import for data portability (JSON download/upload)
- Handle storage quota errors gracefully (show warning, offer to clear old data)
- Never store sensitive data (private keys, seed phrases) - wallet responsibility

**Alternatives Considered**:

- SessionStorage - Rejected (lost on browser close, poor UX)
- IndexedDB - Rejected (overkill for simple key-value data)
- Server-side state - Rejected (violates Principle I)

**References**:

- Zustand persist: https://docs.pmnd.rs/zustand/integrations/persisting-store-data
- LocalStorage best practices: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

## 6. TanStack Query Configuration for Blockchain Data

### Decision: Aggressive Caching with Infinite staleTime for Immutable Data

**Rationale**:

- Blockchain data is append-only (finalized blocks never change)
- Token metadata (decimals, symbols) is immutable
- Aggressive caching reduces RPC costs and improves performance
- Wagmi hooks use TanStack Query under the hood (shared config)

**Best Practices**:

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Immutable data (token decimals, symbols)
      staleTime: Infinity,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

// For dynamic data (balances, pending transactions)
useQuery({
  queryKey: ['balance', address, chainId],
  queryFn: fetchBalance,
  staleTime: 1000 * 10, // 10 seconds
  refetchInterval: 1000 * 30, // Poll every 30s
})
```

**Caching Strategy**:

- **Static data** (decimals, symbols, chain configs): `staleTime: Infinity`
- **Semi-static data** (token prices): `staleTime: 60000` (1 minute)
- **Dynamic data** (balances, tx status): `staleTime: 10000` (10 seconds)

**Alternatives Considered**:

- Default caching (staleTime: 0) - Rejected (unnecessary RPC calls)
- Manual caching with Map - Rejected (TanStack Query handles this better)

**References**:

- TanStack Query: https://tanstack.com/query/latest/docs/react/overview
- Wagmi + Query integration: https://wagmi.sh/react/guides/tanstack-query

---

## 7. Tailwind CSS + shadcn/ui Setup

### Decision: Use shadcn/ui with Electric Violet Theme on Dark Background

**Rationale**:

- Constitutional requirement (locked tech stack)
- shadcn/ui provides copy-paste components (no npm bloat)
- Full control over component code (can modify for crypto-specific needs)
- Built on Radix UI (accessible, unstyled primitives)

**Theme Configuration**:

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'electric-violet': '#7C3AED',
        background: '#09090b', // zinc-950
        foreground: '#fafafa', // zinc-50
        // shadcn/ui CSS variables
        primary: {
          DEFAULT: 'hsl(262 83% 58%)', // #7C3AED
          foreground: 'hsl(0 0% 100%)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
}
```

**Component Installation**:

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install core components
npx shadcn-ui@latest add button card input label select
npx shadcn-ui@latest add dialog dropdown-menu separator
npx shadcn-ui@latest add toast badge avatar
```

**Best Practices**:

- Use `cn()` utility for conditional classes (from shadcn/ui)
- Extend components in `src/shared/ui/` (don't modify `components/ui/` directly)
- Use CSS variables for theme values (supports future light mode)

**Alternatives Considered**:

- Material UI - Rejected (constitutional lock)
- Chakra UI - Rejected (larger bundle, different philosophy)
- Ant Design - Rejected (not crypto-focused)

**References**:

- shadcn/ui: https://ui.shadcn.com/
- Tailwind CSS: https://tailwindcss.com/docs

---

## 8. Geist Font Configuration

### Decision: Self-Host Geist Fonts via Next.js Font Optimization

**Rationale**:

- Constitutional requirement (Geist Sans for UI, Geist Mono for data)
- Next.js `next/font` automatically optimizes font loading (no FOUT/FOIT)
- Self-hosting avoids external requests (privacy, performance)
- Variable fonts provide smooth weight transitions

**Best Practices**:

```typescript
// app/layout.tsx
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}

// Use in Tailwind for specific elements
<code className="font-mono">0x1234...5678</code>
```

**Font Usage Guidelines**:

- **Geist Sans**: Headings, body text, UI labels
- **Geist Mono**: Wallet addresses, amounts, transaction hashes, invoice IDs

**Alternatives Considered**:

- Google Fonts CDN - Rejected (privacy violation, external request)
- System fonts - Rejected (constitutional requirement)
- Inter font - Rejected (not specified in constitution)

**References**:

- Geist font: https://vercel.com/font
- Next.js font optimization: https://nextjs.org/docs/app/building-your-application/optimizing/fonts

---

## 9. lz-string URL Compression

### Decision: Use `compressToEncodedURIComponent` for URL-Safe Compression

**Rationale**:

- Constitutional requirement (locked compression algorithm)
- LZW compression achieves 60-80% size reduction for JSON
- `compressToEncodedURIComponent` produces URL-safe base64 (no escaping needed)
- Stateless - no server-side decompression required

**Best Practices**:

```typescript
import LZString from 'lz-string'

// Compression (invoice creation)
const invoice = { v: 1, id: 'INV-001', ... }
const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(invoice))
const url = `${window.location.origin}/pay?d=${compressed}`

// Decompression (payment view)
const params = new URLSearchParams(window.location.search)
const compressed = params.get('d')
const json = LZString.decompressFromEncodedURIComponent(compressed)
const invoice = JSON.parse(json)
```

**Validation**:

- Check compressed length < 2000 bytes (URL limit)
- Validate round-trip (compress → decompress → compare)
- Handle decompression errors gracefully (show "Invalid invoice URL")

**Alternatives Considered**:

- Base64 only - Rejected (no compression, ~30% larger)
- gzip - Rejected (requires server-side handling)
- pako - Rejected (larger bundle than lz-string)

**References**:

- lz-string: https://github.com/pieroxy/lz-string
- URL length limits: https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers

---

## 10. ESLint + Prettier Configuration

### Decision: Next.js ESLint Config + Prettier with Tailwind Plugin

**Rationale**:

- Consistent code style prevents bugs and improves maintainability
- Next.js ESLint config includes React hooks rules (critical for Web3 hooks)
- Prettier handles formatting (avoid style debates)
- Tailwind ESLint plugin enforces class order

**Best Practices**:

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}

// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**pnpm Scripts**:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  }
}
```

**Alternatives Considered**:

- Standard.js - Rejected (too opinionated, conflicts with Next.js)
- No linting - Rejected (violates quality gate requirements)

**References**:

- Next.js ESLint: https://nextjs.org/docs/app/building-your-application/configuring/eslint
- Prettier: https://prettier.io/docs/en/

---

## 11. Feature-Sliced Design Implementation

### Decision: Strict FSD Layers with Import Constraints

**Rationale**:

- Constitutional requirement (mandated architecture)
- Prevents circular dependencies and spaghetti code
- Scales well for complex features (invoice creation, payment verification)
- Clear separation of concerns (UI, business logic, utilities)

**Layer Rules**:

1. **app/** → Can import from all layers
2. **widgets/** → Can import from features, entities, shared
3. **features/** → Can import from entities, shared
4. **entities/** → Can import from shared only
5. **shared/** → Cannot import from any layer (self-contained)

**Enforcement** (via ESLint plugin):

```json
// .eslintrc.json
{
  "plugins": ["boundaries"],
  "rules": {
    "boundaries/element-types": [
      "error",
      {
        "default": "disallow",
        "rules": [
          { "from": "app", "allow": ["widgets", "features", "entities", "shared"] },
          { "from": "widgets", "allow": ["features", "entities", "shared"] },
          { "from": "features", "allow": ["entities", "shared"] },
          { "from": "entities", "allow": ["shared"] }
        ]
      }
    ]
  }
}
```

**Alternatives Considered**:

- Flat structure - Rejected (constitutional requirement)
- Atomic Design - Rejected (different philosophy, not mandated)

**References**:

- Feature-Sliced Design: https://feature-sliced.design/
- ESLint boundaries plugin: https://github.com/javierbrea/eslint-plugin-boundaries

---

## 12. Development Workflow & Quality Gates

### Decision: Automated Type Checking + Linting Before Commits

**Rationale**:

- Constitutional requirement (agent workflow with quality gates)
- Catch errors early (cheaper to fix)
- TypeScript + ESLint run fast in minimal mode (<45s total per SC-011)
- User confirmation required before commit (maintains human oversight)

**Workflow**:

1. Agent completes task (e.g., "Create landing page layout")
2. Agent automatically runs:
   - `pnpm type-check` (TypeScript strict mode)
   - `pnpm lint` (ESLint)
3. **If errors**: Agent attempts auto-fix, re-runs checks
4. **If pass**: Agent reports "All checks passed" and **WAITS FOR USER CONFIRMATION**
5. **User reviews** changes in IDE/diff
6. **User confirms** → Agent creates git commit
7. **User requests changes** → Agent returns to development mode (no commit)

**No Commit Without**:

- Passing type checks
- Passing lint checks
- Explicit user approval

**Alternatives Considered**:

- Pre-commit hooks (Husky) - Rejected (blocks manual commits, slows workflow)
- CI-only checks - Rejected (too late, wastes time)
- No quality gates - Rejected (violates spec requirements)

**References**:

- TypeScript type checking: https://www.typescriptlang.org/docs/handbook/compiler-options.html
- ESLint: https://eslint.org/docs/latest/user-guide/command-line-interface

---

## Summary of Research Findings

### Confirmed Technology Stack (Constitutional Lock)

✅ Next.js 14+ (App Router, Edge Runtime for RPC proxy)
✅ TypeScript (strict mode + additional safety flags)
✅ Wagmi v2 + Viem (network-specific dual RPC providers)
✅ RainbowKit v2 (custom electric violet theme)
✅ Zustand + persist (LocalStorage, separate stores)
✅ TanStack Query (aggressive caching for immutable data)
✅ Tailwind CSS + shadcn/ui (electric violet accent)
✅ Geist fonts (Sans for UI, Mono for data)
✅ lz-string (URL compression)
✅ ESLint + Prettier (Next.js config + Tailwind plugin)

### Critical Configuration Decisions

1. **RPC Providers**: Network-specific endpoints (8 env vars total, not shared keys)
2. **Caching Strategy**: `staleTime: Infinity` for static blockchain data
3. **Font Loading**: Self-hosted via `next/font` (privacy + performance)
4. **URL Compression**: `compressToEncodedURIComponent` with 2000-byte limit
5. **Quality Gates**: Automated type-check + lint after task completion, user confirmation before commit

### No Open Questions

All technical decisions are either mandated by constitution or resolved through research. No "NEEDS CLARIFICATION" items remain. Proceed to Phase 1 (Design & Contracts).
