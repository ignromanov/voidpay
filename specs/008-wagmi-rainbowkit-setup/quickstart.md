# Quickstart: Wagmi + Viem + RainbowKit Setup

**Feature**: 008-wagmi-rainbowkit-setup
**Date**: 2025-11-28

## Prerequisites

1. Node.js 20+ (check with `node -v`)
2. pnpm installed (`npm install -g pnpm`)
3. WalletConnect Project ID from https://cloud.walletconnect.com/

## Setup Steps

### 1. Install Dependencies

```bash
cd /Users/ignat/Documents/Repository/stateless-invoicing-platform/worktrees/008-wagmi-rainbowkit-setup
pnpm add wagmi@^2.19.4 viem@^2.39.3 @rainbow-me/rainbowkit@^2.2.9
```

### 2. Configure Environment Variables

Create/update `.env.local`:

```env
# Required: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: Enable testnet networks (default: false)
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

### 3. Verify Build

```bash
pnpm build
```

## Usage

### Connect Wallet

```tsx
import { ConnectButton } from '@/features/wallet-connect/ui/ConnectButton'

function Header() {
  return (
    <header>
      <ConnectButton />
    </header>
  )
}
```

### Check Connection Status

```tsx
import { useAccount, useChainId } from 'wagmi'

function WalletStatus() {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()

  if (!isConnected) return <p>Not connected</p>

  return (
    <p>
      Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
      on chain {chainId}
    </p>
  )
}
```

### Switch Network

```tsx
import { useSwitchChain } from 'wagmi'

function NetworkSwitcher() {
  const { switchChain, chains } = useSwitchChain()

  return (
    <select onChange={(e) => switchChain({ chainId: Number(e.target.value) })}>
      {chains.map((chain) => (
        <option key={chain.id} value={chain.id}>
          {chain.name}
        </option>
      ))}
    </select>
  )
}
```

### Testnet Banner

```tsx
import { TestnetBanner } from '@/features/wallet-connect/ui/TestnetBanner'

function Layout({ children }) {
  return (
    <>
      <TestnetBanner />
      {children}
    </>
  )
}
```

## Testing

### Run Unit Tests

```bash
pnpm test src/features/wallet-connect
```

### Run with Coverage

```bash
pnpm test:coverage src/features/wallet-connect
```

## File Structure After Implementation

```
src/
├── app/
│   ├── layout.tsx         # Updated with providers
│   └── providers.tsx      # NEW: Client providers wrapper
│
└── features/
    └── wallet-connect/
        ├── config/
        │   ├── wagmi.ts
        │   ├── chains.ts
        │   └── rainbowkit-theme.ts
        ├── lib/
        │   └── custom-transport.ts
        ├── ui/
        │   ├── ConnectButton.tsx
        │   └── TestnetBanner.tsx
        └── __tests__/
            ├── wagmi-config.test.ts
            ├── custom-transport.test.ts
            └── chains.test.ts
```

## Troubleshooting

### "WalletConnect Project ID is required"

Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set in `.env.local`.

### RPC Calls Failing

1. Check `/api/rpc` endpoint is working: `curl -X POST http://localhost:3000/api/rpc?chainId=1`
2. Verify Alchemy/Infura keys in `.env.local`

### Testnets Not Appearing

Set `NEXT_PUBLIC_ENABLE_TESTNETS=true` in `.env.local` and restart dev server.

### Wallet Connection Not Persisting

1. Check LocalStorage for `voidpay-wagmi` key
2. Ensure `createStorage` is using `window.localStorage`
3. Clear browser storage and reconnect

## Related Documentation

- [Wagmi Docs](https://wagmi.sh/)
- [Viem Docs](https://viem.sh/)
- [RainbowKit Docs](https://rainbowkit.com/docs/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
