# Implementation Plan: Wagmi + Viem + RainbowKit Setup

**Branch**: `008-wagmi-rainbowkit-setup` | **Date**: 2025-11-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-wagmi-rainbowkit-setup/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Integrate Wagmi v2.x, Viem v2.x, and RainbowKit v2.x for Web3 wallet connectivity. Setup includes:

- Custom Wagmi config with 4 mainnet + 4 testnet networks
- Single custom HTTP transport routing ALL RPC calls to `/api/rpc?chainId={id}`
- RainbowKit theme with Electric Violet (#7C3AED) accent
- Network-specific ambient theming (already implemented in P0.6.6)
- LocalStorage persistence via Wagmi's `createStorage`
- Environment-controlled testnet visibility

## Technical Context

**Language/Version**: TypeScript 5.x+ (strict mode), React 19.0.0+, Node.js 20+
**Primary Dependencies**: Wagmi 2.19.4+, Viem 2.39.3+, RainbowKit 2.2.9+, TanStack Query 5.90.10+ (peer dep)
**Storage**: LocalStorage (via Wagmi createStorage + Zustand persist)
**Testing**: Vitest 4.0.14+ (mocked RPC, no testnet in CI)
**Target Platform**: Web (Next.js 15+ App Router, Edge Runtime compatible)
**Project Type**: Web application (FSD structure)
**Performance Goals**: Wallet connect <10s, network switch <5s, zero RPC key exposure
**Constraints**: All RPC routed through `/api/rpc`, no client-side keys
**Scale/Scope**: 4 mainnet networks, 4 testnet networks, 4 wallet connectors

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] No backend database introduced (I) - _LocalStorage only via Wagmi createStorage, no server-side state_
- [x] No user authentication/registration added (III) - _Wallet connection is permissionless, no KYC/registration_
- [x] Schema changes follow versioning rules (IV) - _No schema changes, this feature adds Web3 connectivity layer_
- [x] New features preserve privacy-first approach (II) - _No analytics, wallet state in LocalStorage only_
- [x] Security mechanisms not bypassed (V) - _All RPC through `/api/rpc` proxy, no client-side key exposure_
- [x] Documentation follows context efficiency guidelines (VIII) - _Concise plan, structured format_
- [x] UI follows Hybrid Theme Strategy: dark desk (`zinc-950`), light paper (`white`) (XII) - _RainbowKit theme matches dark desk_
- [x] Document representations maintain ISO 216 (A4) aspect ratio `1:1.414` (XII) - _N/A for this feature (no invoice display changes)_
- [x] All TypeScript/Markdown navigation uses Serena tools first (XIII) - _Using mcp**serena**\* for planning_
- [x] Serena memories consulted before planning via `mcp__serena__*` tools (XIV) - _Read: tech-stack-locked, architecture-summary, development-status, constitutional-principles-summary_
- [x] Memory update plan identified: which memories need updating after feature completion (XIV) - _Update: development-status (mark P0.5 complete)_
- [x] Following SpecKit workflow phases: specify → plan → tasks → implement (XV) - _Currently in plan phase_
- [x] TDD cycle planned: Red → Green → Refactor with 80%+ coverage target (XVI) - _Tests for: Wagmi config, transport, RainbowKit theme, network switching_

## Project Structure

### Documentation (this feature)

```text
specs/008-wagmi-rainbowkit-setup/
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: N/A (no API contracts for this feature)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (FSD structure)

```text
src/
├── app/
│   ├── layout.tsx                    # Root layout with providers (MODIFY)
│   ├── providers.tsx                 # NEW: Client-side providers wrapper
│   └── api/rpc/route.ts              # EXISTING: RPC proxy (no changes needed)
│
├── features/
│   └── wallet-connect/               # NEW: Web3 wallet connection feature
│       ├── config/
│       │   ├── wagmi.ts              # Wagmi config with custom transport
│       │   ├── chains.ts             # Network configurations (mainnet + testnet)
│       │   └── rainbowkit-theme.ts   # Custom RainbowKit theme
│       ├── ui/
│       │   ├── ConnectButton.tsx     # Wrapped RainbowKit button with custom styling
│       │   └── TestnetBanner.tsx     # "TESTNET MODE" warning banner
│       ├── lib/
│       │   └── custom-transport.ts   # HTTP transport to /api/rpc
│       └── __tests__/
│           ├── wagmi-config.test.ts  # Config unit tests
│           ├── custom-transport.test.ts # Transport unit tests
│           └── chains.test.ts        # Network config tests
│
├── entities/
│   └── network/
│       └── config/
│           └── index.ts              # EXISTING: Add testnet chain configs
│
└── shared/
    └── config/
        └── env.ts                    # EXISTING: Add WALLETCONNECT_PROJECT_ID
```

**Structure Decision**: FSD (Feature-Sliced Design) with new `wallet-connect` feature module. Wagmi/RainbowKit providers added to root layout. All RPC calls routed through existing `/api/rpc` proxy via custom transport.

## Complexity Tracking

> No constitution violations. All checks passed.
