# Walkthrough - Project Initialization

I have successfully initialized the VoidPay project with the following stack:

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS v4, Radix UI, CVA, Framer Motion
- **Web3**: Wagmi v2, Viem v2, RainbowKit v2
- **State**: Zustand v5, TanStack Query v5
- **Architecture**: Feature-Sliced Design (FSD)

## Verification Results

### 1. Development Server

The development server starts successfully with no errors.

```bash
pnpm dev
```

- **Landing Page**: [http://localhost:3000](http://localhost:3000) - Loads with "Connect Wallet" button.
- **Create Invoice**: [http://localhost:3000/create](http://localhost:3000/create) - Loads correctly.
- **Pay Invoice**: [http://localhost:3000/pay/123](http://localhost:3000/pay/123) - Loads with Invoice ID 123.

### 2. Quality Gates

All automated quality checks passed:

- **Linting**: `pnpm lint` ✅
- **Type Checking**: `pnpm type-check` ✅
- **Formatting**: `pnpm format` ✅

### 3. Configuration

- **Environment**: `.env.example` created. `.env.local` is gitignored.
- **RPC Proxy**: Implemented at `/api/rpc`.
- **Network Config**: Defined in `src/entities/network/model/networks.ts`.

## Next Steps

1.  Copy `.env.example` to `.env.local` and add your Alchemy/Infura keys.
2.  Start building features!
