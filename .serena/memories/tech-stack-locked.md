# VoidPay - Locked Technology Stack

**Status**: Locked for MVP (Major version updates require constitutional amendment)
**Last Updated**: 2025-11-28
**Version Policy**: Minor/patch updates permitted, security patches applied immediately

## Core Framework

| Component | Version | Rationale |
|-----------|---------|-----------|
| **Next.js** | 15+ (App Router) | Server Components for OG Images, Edge Runtime |
| **React** | 19+ | Latest stable with concurrent features |
| **React DOM** | 19+ | Matches React version |
| **TypeScript** | 5.x+ (strict mode) | Type safety for financial data |
| **Node.js** | 20+ (.nvmrc) | LTS with Edge Runtime compatibility |

## Web3 Stack

| Component | Version | Provider | Rationale |
|-----------|---------|----------|-----------|
| **Wagmi** | 2.19.4+ | - | React hooks for Web3, multi-provider support |
| **Viem** | 2.39.3+ | - | Lightweight Ethereum library (fastest, smallest) |
| **RainbowKit** | 2.2.9+ | - | Wallet connector UI, customizable |
| **RPC Primary** | - | Alchemy | Speed, Transfers API integration |
| **RPC Fallback** | - | Infura | Reliability, SLA guarantees |
| **Token List** | - | Uniswap | Decentralized, high-quality curation |

## State & Data Management

| Component | Version | Rationale |
|-----------|---------|-----------|
| **Zustand** | 5.0.8+ | Lightweight state (vs Redux), LocalStorage integration |
| **Zustand Persist** | - | Built-in middleware for LocalStorage |
| **TanStack Query** | 5.90.10+ | RPC caching, deduplication, polling |
| **lz-string** | 1.5.0+ | LZW compression for URL parameters |
| **Zod** | Latest | Runtime validation for invoice schema |

## UI & Styling

| Component | Version | Rationale |
|-----------|---------|-----------|
| **Tailwind CSS** | 4.1.17+ | Fast prototyping, large ecosystem |
| **shadcn/ui** | Latest | Radix UI components, easy customization |
| **Radix UI** | Latest | Accessible primitives (via shadcn/ui) |
| **Lucide React** | Latest | Icon library |
| **clsx** | 2.1.1+ | Conditional classes |
| **tailwind-merge** | 2.5.4+ | Class merging utility |
| **Framer Motion** | Latest | Ambient animations, transitions |

## Typography

| Font | Usage | Source |
|------|-------|--------|
| **Geist Sans** | UI, headings, body text | next/font (self-hosted) |
| **Geist Mono** | Data, addresses, amounts, hashes | next/font (self-hosted) |

**Rationale**: Unified family from Vercel, Next.js optimization, excellent tabular-nums support, zero layout shift

## Utilities

| Component | Version | Rationale |
|-----------|---------|-----------|
| **@react-pdf/renderer** | Latest | React components → PDF (client-side) |
| **react-qr-code** | Latest | QR code generation for payment links |
| **sonner** | Latest | Toast notifications (themed) |

## Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9+ | Code linting (strict Next.js config) |
| **Prettier** | Latest | Code formatting |
| **TypeScript ESLint** | Latest | TS-specific linting rules |

## Testing Stack

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | 4.0.14+ | Unit/Integration testing (V8 coverage) |
| **@testing-library/react** | 16.3.0+ | React component testing |
| **@testing-library/jest-dom** | 6.6.3+ | DOM matchers |
| **jsdom** | 26.1.0+ | Browser environment for tests |
| **Husky** | 9.1.7+ | Git hooks |
| **lint-staged** | 16.2.7+ | Pre-commit linting |

## Supported Networks (MVP)

| Network | Chain ID | Primary Use Case |
|---------|----------|------------------|
| **Ethereum Mainnet** | 1 | Maximum liquidity, trust |
| **Arbitrum** | 42161 | L2 low fees, DAO payments |
| **Optimism** | 10 | L2 low fees, DAO payments |
| **Polygon PoS** | 137 | Very low fees, micropayments |

**Post-MVP Candidates**: Base, zkSync Era, Linea

## Infrastructure (Runtime)

| Component | Environment | Purpose |
|-----------|-------------|---------|
| **Vercel Edge Runtime** | Production | RPC proxy, rate limiting |
| **Vercel KV (Redis)** | Production | Rate limiting counters (transient only) |
| **GitHub** | Public Repo | Static blocklist hosting |

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| **Accent Color** | Electric Violet #7C3AED | Primary actions (Create, Pay buttons) |
| **Background (Desk)** | Zinc-950 #09090b | App shell, controls |
| **Background (Paper)** | White #ffffff | Invoice document surface |
| **Success** | Emerald #10B981 | Success states |
| **Warning** | Amber #F59E0B | Warnings, unknown tokens |
| **Error** | Rose #F43F5E | Error states |

## Network Theme Colors

| Network | Gradient | Hex Values |
|---------|----------|------------|
| **Ethereum** | Violet | #7C3AED to #A78BFA |
| **Arbitrum** | Blue/Cyan | #3B82F6 to #06B6D4 |
| **Optimism** | Red/Orange | #EF4444 to #F97316 |
| **Polygon** | Purple | #A855F7 to #C084FC |

## Package Manager

**pnpm** - Locked (strict lockfile management, workspace support)

## Version Update Policy

- **Patch Updates** (x.x.N): Auto-apply
- **Minor Updates** (x.N.0): Review changelog, apply if non-breaking
- **Major Updates** (N.0.0): Requires constitutional amendment + migration plan
- **Security Patches**: Apply immediately (override all other rules)

## Locked Dependencies (NO substitutions)

- lz-string → NO alternatives (URL compatibility requirement)
- Wagmi + Viem → NO ethers.js (architectural decision)
- Zustand → NO Redux/Recoil (simplicity principle)
- TanStack Query → NO SWR (RPC polling requirements)
- Tailwind CSS → NO styled-components/Emotion (build performance)

## Constitutional Reference

This stack is locked by **Constitutional Principle: Architectural Constraints (Tech Stack section)**. Changes require formal amendment process.
