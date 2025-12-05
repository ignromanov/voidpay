# Data Model: Wagmi + Viem + RainbowKit Setup

**Feature**: 008-wagmi-rainbowkit-setup
**Date**: 2025-11-28

## Entities

### E1: ChainConfig

Network configuration for Wagmi/RainbowKit.

```typescript
// src/features/wallet-connect/config/chains.ts

import type { Chain } from 'viem'

interface ExtendedChainConfig extends Chain {
  // VoidPay-specific extensions
  themeColors: {
    primary: string // Gradient start
    secondary: string // Gradient end
  }
  isTestnet: boolean
}
```

**Mainnet Chains**:

| Chain    | ID    | Native | Theme Primary | Theme Secondary |
| -------- | ----- | ------ | ------------- | --------------- |
| Ethereum | 1     | ETH    | #7C3AED       | #A78BFA         |
| Arbitrum | 42161 | ETH    | #3B82F6       | #06B6D4         |
| Optimism | 10    | ETH    | #EF4444       | #F97316         |
| Polygon  | 137   | POL    | #A855F7       | #C084FC         |

**Testnet Chains**:

| Chain            | ID       | Native | Parent Mainnet |
| ---------------- | -------- | ------ | -------------- |
| Sepolia          | 11155111 | ETH    | Ethereum       |
| Arbitrum Sepolia | 421614   | ETH    | Arbitrum       |
| Optimism Sepolia | 11155420 | ETH    | Optimism       |
| Polygon Amoy     | 80002    | POL    | Polygon        |

### E2: WagmiConfig

Configuration object for Wagmi provider.

```typescript
// src/features/wallet-connect/config/wagmi.ts

import { createConfig, createStorage } from 'wagmi'
import type { Config } from 'wagmi'

interface WagmiConfigOptions {
  chains: readonly Chain[]
  projectId: string // WalletConnect Project ID
  appName: string // Application name for wallets
  appDescription?: string
  appUrl?: string
  appIcon?: string
}

// Config creation function
function createWagmiConfig(options: WagmiConfigOptions): Config
```

**Storage Schema** (LocalStorage key: `voidpay-wagmi`):

```typescript
interface WagmiStorageState {
  state: {
    connections: Array<{
      accounts: `0x${string}`[]
      chainId: number
      connector: {
        id: string
        name: string
        type: string
      }
    }>
    chainId: number
    current: string | null // Current connection key
  }
  version: number
}
```

### E3: RainbowKitTheme

Custom theme configuration for RainbowKit.

```typescript
// src/features/wallet-connect/config/rainbowkit-theme.ts

import type { Theme } from '@rainbow-me/rainbowkit'

interface VoidPayThemeConfig {
  accentColor: string // #7C3AED (Electric Violet)
  accentColorForeground: string // white
  borderRadius: 'none' | 'small' | 'medium' | 'large'
  fontStack: 'rounded' | 'system'
  overlayBlur: 'none' | 'small' | 'large'
}

// Theme export
const voidPayTheme: Theme
```

### E4: CustomTransport

HTTP transport configuration for RPC proxy routing.

```typescript
// src/features/wallet-connect/lib/custom-transport.ts

import type { Transport } from 'viem'

interface TransportConfig {
  chainId: number
  batch?: boolean
  retryCount?: number
  timeout?: number
}

// Transport factory
function createProxyTransport(chainId: number): Transport
```

**Request Flow**:

```
Client Action
    ↓
Wagmi Hook (useBalance, useSendTransaction, etc.)
    ↓
Viem Client with Custom Transport
    ↓
HTTP POST to /api/rpc?chainId={id}
    ↓
Edge Function (existing)
    ↓
Alchemy/Infura (provider selection)
```

## State Management

### Wagmi State (Automatic)

Wagmi manages connection state internally with LocalStorage persistence:

| State         | Type          | Persistence              |
| ------------- | ------------- | ------------------------ |
| `isConnected` | boolean       | Session + LocalStorage   |
| `address`     | `0x${string}` | LocalStorage             |
| `chainId`     | number        | LocalStorage             |
| `connector`   | Connector     | LocalStorage (reference) |

### Application State (Zustand - No Changes)

Existing stores remain unchanged:

- `useCreatorStore` - Invoice drafts, history
- `usePayerStore` - Receipts, transaction hashes

Wagmi state accessed via hooks, not duplicated in Zustand.

## Validation Rules

### Chain ID Validation

```typescript
const SUPPORTED_MAINNET_IDS = [1, 42161, 10, 137] as const
const SUPPORTED_TESTNET_IDS = [11155111, 421614, 11155420, 80002] as const

function isSupportedChain(chainId: number): boolean {
  return (
    SUPPORTED_MAINNET_IDS.includes(chainId) ||
    (ENABLE_TESTNETS && SUPPORTED_TESTNET_IDS.includes(chainId))
  )
}
```

### Environment Variable Validation

```typescript
// Required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string // Non-empty

// Optional (defaults to false)
NEXT_PUBLIC_ENABLE_TESTNETS: 'true' | 'false' | undefined
```

## Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                        Providers.tsx                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 RainbowKitProvider                   │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │              WagmiProvider                     │  │    │
│  │  │  ┌─────────────────────────────────────────┐  │  │    │
│  │  │  │         QueryClientProvider              │  │  │    │
│  │  │  │                                          │  │  │    │
│  │  │  │              {children}                  │  │  │    │
│  │  │  │                                          │  │  │    │
│  │  │  └─────────────────────────────────────────┘  │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

wagmi.ts ──uses──> chains.ts (chain definitions)
         ──uses──> custom-transport.ts (RPC routing)
         ──uses──> rainbowkit-theme.ts (UI theme)
```

## File Dependencies

```
src/features/wallet-connect/
├── config/
│   ├── chains.ts          # Chain definitions (no deps)
│   ├── rainbowkit-theme.ts # Theme config (no deps)
│   └── wagmi.ts           # Main config
│       ├── imports chains.ts
│       ├── imports custom-transport.ts
│       └── imports rainbowkit-theme.ts
├── lib/
│   └── custom-transport.ts # Transport factory (no deps)
└── ui/
    ├── ConnectButton.tsx  # Wrapper for RainbowKit button
    │   └── imports from @rainbow-me/rainbowkit
    └── TestnetBanner.tsx  # Warning banner
        └── imports useChainId from wagmi
```
