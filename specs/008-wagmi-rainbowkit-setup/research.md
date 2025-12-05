# Research: Wagmi + Viem + RainbowKit Setup

**Feature**: 008-wagmi-rainbowkit-setup
**Date**: 2025-11-28
**Status**: Complete

## Technology Decisions

### D1: Wagmi Version Selection

**Decision**: Wagmi v2.x (^2.19.4)
**Rationale**: RainbowKit 2.2.9 requires `wagmi: ^2.9.0` as peer dependency. Wagmi v3.x is not yet supported.
**Alternatives Rejected**:

- Wagmi v3.x (3.0.2) - Incompatible with RainbowKit 2.x
- ethers.js - Constitutional violation (tech-stack-locked)

### D2: Viem Version Selection

**Decision**: Viem v2.x (^2.39.3)
**Rationale**: RainbowKit 2.2.9 requires `viem: 2.x` as peer dependency. Already specified in tech-stack-locked memory.
**Alternatives Rejected**:

- Viem v3.x - Not yet released
- ethers.js - Architectural decision to use Viem (lighter, faster)

### D3: RainbowKit Version Selection

**Decision**: RainbowKit v2.2.9
**Rationale**: Latest stable release compatible with Wagmi v2.x and React 19.
**Peer Dependencies**:

- `@tanstack/react-query: >=5.0.0` (already in project: 5.90.10+)
- `react: >=18` (project has 19.0.0+)
- `viem: 2.x`
- `wagmi: ^2.9.0`

### D4: Custom Transport Architecture

**Decision**: Single HTTP transport to `/api/rpc?chainId={id}`
**Rationale**:

- Constitutional Principle VI (RPC Key Protection)
- Existing `/api/rpc` proxy handles provider selection (Alchemy/Infura failover)
- No client-side RPC keys

**Implementation**:

```typescript
import { http } from 'viem'

// Per-chain transport factory
const createProxyTransport = (chainId: number) =>
  http(`/api/rpc?chainId=${chainId}`, {
    batch: true,
    retryCount: 3,
    timeout: 10_000,
  })
```

### D5: RainbowKit Theme Configuration

**Decision**: `darkTheme` with Electric Violet accent
**Rationale**: Matches Hybrid Theme Strategy (dark desk zinc-950)
**Implementation**:

```typescript
import { darkTheme } from '@rainbow-me/rainbowkit'

const theme = darkTheme({
  accentColor: '#7C3AED', // Electric Violet
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system', // Uses Geist via CSS
  overlayBlur: 'small',
})
```

### D6: Wallet Selection

**Decision**: MetaMask, WalletConnect, Coinbase Wallet, Rainbow
**Rationale**:

- MetaMask: Most popular browser extension
- WalletConnect: Mobile wallet support (QR code)
- Coinbase Wallet: Second largest user base
- Rainbow: RainbowKit's native wallet

**Implementation**: Use `getDefaultWallets` from RainbowKit with custom `projectId`.

### D7: Storage Backend

**Decision**: Wagmi `createStorage` with LocalStorage
**Rationale**:

- Constitutional Principle II (Privacy-First)
- Matches existing Zustand persist pattern
- No server-side session storage

**Implementation**:

```typescript
import { createStorage } from 'wagmi'

const storage = createStorage({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'voidpay-wagmi',
})
```

### D8: Network Configuration

**Decision**: 4 mainnet + 4 testnet chains with environment toggle
**Mainnets**: Ethereum (1), Arbitrum (42161), Optimism (10), Polygon (137)
**Testnets**: Sepolia (11155111), Arbitrum Sepolia (421614), Optimism Sepolia (11155420), Polygon Amoy (80002)

**Toggle**: `NEXT_PUBLIC_ENABLE_TESTNETS=true`

**Implementation**: Conditional chain array based on env var.

### D9: WalletConnect Project ID

**Decision**: Environment variable `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
**Rationale**:

- Required for WalletConnect v2 protocol
- Public variable (safe for client-side)
- Obtain from https://cloud.walletconnect.com/

## Architecture Decisions

### A1: Provider Hierarchy

```
RainbowKitProvider
  └── WagmiProvider (with config)
        └── QueryClientProvider (TanStack Query)
              └── App
```

**File**: `src/app/providers.tsx` (new client component)
**Integration**: Import in `src/app/layout.tsx`

### A2: FSD Layer Placement

| Component         | FSD Layer    | Path                                                     |
| ----------------- | ------------ | -------------------------------------------------------- |
| Wagmi config      | features     | `src/features/wallet-connect/config/wagmi.ts`            |
| Chain configs     | features     | `src/features/wallet-connect/config/chains.ts`           |
| RainbowKit theme  | features     | `src/features/wallet-connect/config/rainbowkit-theme.ts` |
| Custom transport  | features/lib | `src/features/wallet-connect/lib/custom-transport.ts`    |
| ConnectButton     | features/ui  | `src/features/wallet-connect/ui/ConnectButton.tsx`       |
| TestnetBanner     | features/ui  | `src/features/wallet-connect/ui/TestnetBanner.tsx`       |
| Providers wrapper | app          | `src/app/providers.tsx`                                  |

### A3: Testnet Banner Design

**Visibility**: Always visible when connected to testnet chain
**Placement**: Fixed banner below header (or top of viewport)
**Style**: Warning color (Amber #F59E0B), prominent but not intrusive
**Text**: "TESTNET MODE - Not for production use"

## Dependencies to Install

```bash
pnpm add wagmi@^2.19.4 viem@^2.39.3 @rainbow-me/rainbowkit@^2.2.9
```

**Note**: `@tanstack/react-query` already installed (5.90.10+).

## Environment Variables

```env
# Required for WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: Enable testnet networks
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

## Testing Strategy

### Unit Tests (Vitest)

| Test File                  | Coverage                             |
| -------------------------- | ------------------------------------ |
| `wagmi-config.test.ts`     | Config creation, chain list, storage |
| `custom-transport.test.ts` | URL generation, request routing      |
| `chains.test.ts`           | Mainnet/testnet filtering, chain IDs |
| `rainbowkit-theme.test.ts` | Theme object structure, colors       |

### Mocking Strategy

- Mock `fetch` for transport tests
- Mock `window.localStorage` for storage tests
- No testnet RPC calls in CI (Constitutional Principle XVI)

## Risks & Mitigations

| Risk                                | Mitigation                          |
| ----------------------------------- | ----------------------------------- |
| WalletConnect Project ID exposure   | Public env var is expected behavior |
| RainbowKit v3 breaking changes      | Pin to v2.2.9, monitor releases     |
| Transport errors not reaching proxy | Retry logic with 3 attempts         |
| Mobile wallet deep-linking issues   | WalletConnect protocol handles this |

## Open Questions (Resolved)

1. ~~Which storage backend?~~ → LocalStorage via Wagmi createStorage
2. ~~How to integrate with RPC proxy?~~ → Single custom HTTP transport
3. ~~Which Wagmi version?~~ → v2.x (RainbowKit compatibility)
4. ~~WalletConnect configuration?~~ → Environment variable for Project ID
