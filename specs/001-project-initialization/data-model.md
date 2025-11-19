# Data Model: VoidPay Project Initialization

**Feature**: 001-project-initialization
**Date**: 2025-11-19
**Phase**: 1 (Design & Contracts)

## Overview

This document defines the core data entities for the VoidPay project initialization. Since this feature establishes the development environment foundation, the data model focuses on **configuration entities** and **runtime state** rather than business domain entities (invoices, payments), which will be defined in future features.

---

## Entity Catalog

### 1. Network Configuration

**Purpose**: Represents a supported blockchain network with RPC endpoints and display properties.

**Schema**:

```typescript
interface NetworkConfig {
  chainId: number // Chain ID (1, 42161, 10, 137)
  name: string // Display name ("Ethereum", "Arbitrum", "Optimism", "Polygon PoS")
  nativeCurrency: {
    name: string // "Ether", "Ether", "Ether", "MATIC"
    symbol: string // "ETH", "ETH", "ETH", "MATIC"
    decimals: number // Always 18 for native tokens
  }
  rpcUrls: {
    alchemy: string // Primary RPC endpoint (from env vars)
    infura: string // Fallback RPC endpoint (from env vars)
  }
  blockExplorer: {
    name: string // "Etherscan", "Arbiscan", etc.
    url: string // Base URL for block explorer
  }
  theme: {
    color: string // Network accent color (hex)
    icon?: string // Optional network icon/logo
  }
}
```

**Validation Rules**:

- `chainId` must be one of: `[1, 42161, 10, 137]` (constitutional lock)
- `rpcUrls.alchemy` and `rpcUrls.infura` must be valid HTTPS URLs
- `nativeCurrency.decimals` must be 18 for all MVP networks
- `theme.color` must be valid hex color

**Relationships**:

- No relationships (self-contained configuration)

**State Transitions**:

- Immutable (defined at app initialization)
- No runtime mutations

**Storage**:

- Source: `src/entities/network/model/networks.ts` (hardcoded TypeScript)
- NOT stored in LocalStorage (static data)

**Example**:

```typescript
export const networks: NetworkConfig[] = [
  {
    chainId: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      alchemy: process.env.NEXT_PUBLIC_ALCHEMY_ETH_URL!,
      infura: process.env.NEXT_PUBLIC_INFURA_ETH_URL!,
    },
    blockExplorer: { name: 'Etherscan', url: 'https://etherscan.io' },
    theme: { color: '#627EEA' }, // Ethereum blue
  },
  // ... other networks
]
```

---

### 2. User Preferences

**Purpose**: Stores user-configurable settings in browser LocalStorage.

**Schema**:

```typescript
interface UserPreferences {
  defaultNetwork: number // Chain ID of preferred network (default: 1)
  defaultCurrency: string // Preferred token symbol (default: "USDC")
  theme: 'dark' | 'light' // UI theme (MVP: dark only, future: light mode)
  locale: string // Language/region (default: "en-US", future: i18n)
  currencyFormat: {
    decimals: number // Default decimal places (default: 2)
    thousandsSeparator: string // "," or "." (default: ",")
    decimalSeparator: string // "." or "," (default: ".")
  }
}
```

**Validation Rules**:

- `defaultNetwork` must be valid `chainId` from `NetworkConfig[]`
- `defaultCurrency` must be valid ERC-20 symbol (future: validate against token list)
- `theme` must be `"dark"` in MVP (light mode deferred)
- `locale` must be valid BCP 47 language tag
- `currencyFormat.decimals` must be between 0-18

**Relationships**:

- References `NetworkConfig` via `defaultNetwork` (chain ID)

**State Transitions**:

- User changes settings → Update store → Persist to LocalStorage
- App initialization → Load from LocalStorage → Fallback to defaults if missing

**Storage**:

- Source: Zustand store with persist middleware
- LocalStorage key: `voidpay-user-preferences`
- Format: JSON

**Example**:

```typescript
// Default state
const defaultPreferences: UserPreferences = {
  defaultNetwork: 1, // Ethereum
  defaultCurrency: 'USDC',
  theme: 'dark',
  locale: 'en-US',
  currencyFormat: {
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
}
```

---

### 3. Environment Configuration

**Purpose**: Represents required environment variables for RPC providers and app configuration.

**Schema**:

```typescript
interface EnvironmentConfig {
  // RPC Endpoints (Alchemy - Primary)
  NEXT_PUBLIC_ALCHEMY_ETH_URL: string
  NEXT_PUBLIC_ALCHEMY_ARB_URL: string
  NEXT_PUBLIC_ALCHEMY_OPT_URL: string
  NEXT_PUBLIC_ALCHEMY_POLY_URL: string

  // RPC Endpoints (Infura - Fallback)
  NEXT_PUBLIC_INFURA_ETH_URL: string
  NEXT_PUBLIC_INFURA_ARB_URL: string
  NEXT_PUBLIC_INFURA_OPT_URL: string
  NEXT_PUBLIC_INFURA_POLY_URL: string

  // App Configuration (optional)
  NEXT_PUBLIC_APP_URL?: string // Base URL for OG images, sitemaps (default: localhost in dev)
  NEXT_PUBLIC_VERCEL_ENV?: string // Vercel environment (production, preview, development)
}
```

**Validation Rules**:

- All `*_URL` variables must be valid HTTPS URLs
- All `NEXT_PUBLIC_ALCHEMY_*` variables are **REQUIRED** (app fails to start if missing)
- All `NEXT_PUBLIC_INFURA_*` variables are **REQUIRED** (app fails to start if missing)
- `NEXT_PUBLIC_APP_URL` is optional (defaults to `http://localhost:3000` in dev)

**Relationships**:

- Consumed by `NetworkConfig` (RPC URLs)
- Consumed by RPC proxy (`app/api/rpc/route.ts`)

**State Transitions**:

- Immutable (loaded at app startup)
- No runtime changes (requires restart)

**Storage**:

- Source: `.env.local` (developer), Vercel environment variables (production)
- NOT committed to git (`.gitignore`)
- Template: `.env.example` (committed, no secrets)

**Example** (`.env.example`):

```bash
# Alchemy RPC Endpoints (Primary)
NEXT_PUBLIC_ALCHEMY_ETH_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_ALCHEMY_ARB_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_ALCHEMY_OPT_URL=https://opt-mainnet.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_ALCHEMY_POLY_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Infura RPC Endpoints (Fallback)
NEXT_PUBLIC_INFURA_ETH_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
NEXT_PUBLIC_INFURA_ARB_URL=https://arbitrum-mainnet.infura.io/v3/YOUR_PROJECT_ID
NEXT_PUBLIC_INFURA_OPT_URL=https://optimism-mainnet.infura.io/v3/YOUR_PROJECT_ID
NEXT_PUBLIC_INFURA_POLY_URL=https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID

# App Configuration (Optional)
NEXT_PUBLIC_APP_URL=https://voidpay.xyz
```

---

### 4. Font Configuration

**Purpose**: Represents Geist font family loading configuration.

**Schema**:

```typescript
interface FontConfig {
  sans: {
    name: string // "Geist Sans"
    variable: string // CSS variable name "--font-geist-sans"
    weights: number[] // Available weights [100, 200, ..., 900]
    subsets: string[] // Character subsets ["latin"]
    display: string // Font display strategy "swap"
  }
  mono: {
    name: string // "Geist Mono"
    variable: string // CSS variable name "--font-geist-mono"
    weights: number[] // Available weights [100, 200, ..., 900]
    subsets: string[] // Character subsets ["latin"]
    display: string // Font display strategy "swap"
  }
}
```

**Validation Rules**:

- `weights` must include at least [400, 700] (normal, bold)
- `subsets` must include "latin" (MVP requirement)
- `display` must be "swap" (avoids FOIT - Flash of Invisible Text)

**Relationships**:

- No relationships (self-contained)

**State Transitions**:

- Immutable (loaded at app initialization via Next.js font optimization)

**Storage**:

- Source: `app/layout.tsx` (imported from `geist/font/sans` and `geist/font/mono`)
- Applied via CSS variables in root `<html>` element

**Example**:

```typescript
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

// Next.js automatically generates FontConfig internally
// We apply via className:
<html className={`${GeistSans.variable} ${GeistMono.variable}`}>
```

---

### 5. Build Configuration

**Purpose**: Represents TypeScript compiler and build tool settings.

**Schema**:

```typescript
interface BuildConfig {
  typescript: {
    strict: boolean // true (constitutional requirement)
    noUncheckedIndexedAccess: boolean // true (array safety)
    exactOptionalPropertyTypes: boolean // true (undefined vs missing)
    paths: Record<string, string[]> // Path aliases (e.g., "@/*": ["./src/*"])
  }
  nextjs: {
    experimental: {
      typedRoutes: boolean // true (type-safe routing)
    }
    compiler: {
      removeConsole: boolean // true in production only
    }
  }
  tailwind: {
    darkMode: 'class' | 'media' // "class" (user-controlled)
    content: string[] // Paths to scan for classes
    theme: {
      extend: {
        colors: Record<string, string> // Custom colors (electric-violet, etc.)
        fontFamily: Record<string, string[]> // Geist fonts
      }
    }
  }
}
```

**Validation Rules**:

- `typescript.strict` must be `true` (constitutional requirement)
- `nextjs.compiler.removeConsole` must only be `true` in production
- `tailwind.content` must include all source directories (`src/**/*.{ts,tsx}`)

**Relationships**:

- No runtime relationships (compile-time only)

**State Transitions**:

- Immutable (changed only via config files)
- Requires rebuild to take effect

**Storage**:

- Source: `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`
- Committed to git (part of repository)

**Example** (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Entity Relationships Diagram

```
┌─────────────────────────┐
│ NetworkConfig           │
│ - chainId (PK)          │
│ - name                  │
│ - rpcUrls               │◄──────────┐
│ - nativeCurrency        │           │
│ - blockExplorer         │           │
│ - theme                 │           │
└─────────────────────────┘           │
                                      │
                                      │ References
                                      │ (defaultNetwork)
┌─────────────────────────┐           │
│ UserPreferences         │           │
│ - defaultNetwork (FK)   ├───────────┘
│ - defaultCurrency       │
│ - theme                 │
│ - locale                │
│ - currencyFormat        │
└─────────────────────────┘
         ▲
         │ Persists to
         │
┌─────────────────────────┐
│ LocalStorage            │
│ Key: voidpay-user-      │
│      preferences        │
│ Format: JSON            │
└─────────────────────────┘


┌─────────────────────────┐
│ EnvironmentConfig       │
│ - ALCHEMY_*_URL         │──────┐
│ - INFURA_*_URL          │      │ Consumed by
│ - APP_URL               │      │
└─────────────────────────┘      │
                                 ▼
                          ┌─────────────────────────┐
                          │ NetworkConfig.rpcUrls   │
                          │ RPC Proxy Route         │
                          └─────────────────────────┘


┌─────────────────────────┐
│ FontConfig              │
│ - sans (Geist Sans)     │
│ - mono (Geist Mono)     │──────┐
└─────────────────────────┘      │
                                 │ Applied to
                                 ▼
                          ┌─────────────────────────┐
                          │ Root Layout <html>      │
                          │ CSS Variables           │
                          └─────────────────────────┘


┌─────────────────────────┐
│ BuildConfig             │
│ - typescript            │
│ - nextjs                │
│ - tailwind              │
└─────────────────────────┘
         │
         │ Compile-time only
         │ (no runtime relationships)
```

---

## Data Flow Summary

### Initialization Flow (App Startup)

1. **Environment variables** loaded from `.env.local` → `EnvironmentConfig`
2. **Network configs** initialized with RPC URLs from env vars → `NetworkConfig[]`
3. **Fonts** loaded via Next.js font optimization → `FontConfig`
4. **User preferences** loaded from LocalStorage → `UserPreferences` (or defaults)
5. **Wagmi** configured with network configs and RPC endpoints
6. **App renders** with Geist fonts, electric violet theme, and user preferences

### User Preference Update Flow

1. User changes setting (e.g., default network) → UI
2. UI calls Zustand store action → `setDefaultNetwork(chainId)`
3. Store updates state → New `defaultNetwork` value
4. Persist middleware saves to LocalStorage → `voidpay-user-preferences`
5. UI re-renders with new preference

### RPC Request Flow (Future Features)

1. Component needs blockchain data → Calls Wagmi hook (e.g., `useBalance`)
2. Wagmi hook uses TanStack Query → Check cache first
3. If stale/missing → Send RPC request via configured transport
4. Transport uses Alchemy URL (primary) → HTTP request
5. If Alchemy fails → Automatic retry via Wagmi (built-in)
6. If persistent failure → Future enhancement: manual fallback to Infura in proxy
7. Response cached by TanStack Query → Return to component

---

## Validation & Constraints Summary

### Constitutional Constraints (Enforced)

- ✅ No server-side state storage (Principle I)
- ✅ LocalStorage only for user preferences (Principle II)
- ✅ No analytics or tracking (Principle II)
- ✅ RPC keys never exposed in client code (Principle VI)
- ✅ Only 4 networks supported: Ethereum, Arbitrum, Optimism, Polygon PoS (Architecture Constraints)

### Technical Constraints

- URL parameter max length: 2000 bytes (browser/server limits)
- LocalStorage max size: ~5-10MB (varies by browser)
- TypeScript strict mode: All entities must have explicit types
- Environment variables: All RPC URLs required at startup (fail-fast if missing)

### Future Entity Extensions (Not in This Feature)

- **InvoiceSchemaV1**: Defined in invoice creation feature
- **TokenMetadata**: Defined in token selection feature
- **PaymentHistory**: Defined in payment tracking feature
- **TransactionStatus**: Defined in payment verification feature

---

## Data Model Review Checklist

- [x] All entities have clear purpose and schema
- [x] Validation rules defined for each field
- [x] Relationships documented (or explicitly none)
- [x] State transitions specified (immutable vs mutable)
- [x] Storage location identified (LocalStorage, env vars, hardcoded)
- [x] Constitutional compliance verified (no violations)
- [x] Example data provided for clarity
- [x] Future extensions noted (not implemented in this feature)
