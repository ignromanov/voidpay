# Tech Context

**Last Updated**: 2025-12-01
**Status**: Locked for MVP
**Policy**: Minor/patch OK, major requires constitutional amendment

## Core Framework

| Component  | Version                 |
| ---------- | ----------------------- |
| Next.js    | 15+ (App Router + Edge) |
| React      | 19+                     |
| TypeScript | 5.x+ (strict)           |
| Node.js    | 20+ (.nvmrc)            |

## Web3 Stack

| Component    | Version | Provider |
| ------------ | ------- | -------- |
| Wagmi        | 2.19.4+ | -        |
| Viem         | 2.39.3+ | -        |
| RainbowKit   | 2.2.9+  | -        |
| RPC Primary  | -       | Alchemy  |
| RPC Fallback | -       | Infura   |

## State & Data

| Component      | Version  |
| -------------- | -------- |
| Zustand        | 5.0.8+   |
| TanStack Query | 5.90.10+ |
| lz-string      | 1.5.0+   |
| Zod            | Latest   |

## UI & Styling

| Component      | Version                          |
| -------------- | -------------------------------- |
| Tailwind CSS   | 4.1.17+                          |
| Radix UI       | Latest (dialog, select, popover) |
| CVA            | 0.7.1+                           |
| Framer Motion  | 12.x+                            |
| Lucide React   | Latest                           |
| clsx           | 2.1.1+                           |
| tailwind-merge | 2.5.4+                           |

## Testing Stack

| Tool                      | Version |
| ------------------------- | ------- |
| Vitest                    | 4.0.14+ |
| @testing-library/react    | 16.3.0+ |
| @testing-library/jest-dom | 6.6.3+  |
| jsdom                     | 26.1.0+ |
| Husky                     | 9.1.7+  |
| lint-staged               | 16.2.7+ |

**Coverage Threshold**: 80%+ (lines, branches, functions, statements)

## Supported Networks

| Network     | Chain ID |
| ----------- | -------- |
| Ethereum    | 1        |
| Arbitrum    | 42161    |
| Optimism    | 10       |
| Polygon PoS | 137      |

## Design Tokens

| Token              | Value                   |
| ------------------ | ----------------------- |
| Accent             | Electric Violet #7C3AED |
| Background (Desk)  | zinc-950 #09090b        |
| Background (Paper) | white #ffffff           |
| Success            | Emerald #10B981         |
| Warning            | Amber #F59E0B           |
| Error              | Rose #F43F5E            |

## Typography

| Font       | Usage                    |
| ---------- | ------------------------ |
| Geist Sans | UI, headings, body       |
| Geist Mono | Data, addresses, amounts |

## Locked Dependencies (NO substitutions)

- lz-string → NO alternatives (URL compatibility)
- Wagmi + Viem → NO ethers.js
- Zustand → NO Redux/Recoil
- TanStack Query → NO SWR
- Tailwind CSS → NO styled-components

## Package Manager

**pnpm** — Strict lockfile, workspace support

## Infrastructure

| Component           | Environment      |
| ------------------- | ---------------- |
| Vercel Edge Runtime | Production       |
| Vercel KV (Redis)   | Rate limiting    |
| GitHub              | Static blocklist |
