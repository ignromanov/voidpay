# Implementation Plan: VoidPay Project Initialization

**Branch**: `001-project-initialization` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-initialization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Initialize the VoidPay cryptocurrency invoicing platform with Next.js 14+ App Router, TypeScript, Web3 stack (Wagmi v2, Viem, RainbowKit), and Feature-Sliced Design architecture. Establish development environment with all constitutional dependencies, routing structure (`/`, `/create`, `/pay`), dual RPC provider configuration (Alchemy + Infura) for 4 networks (Ethereum, Arbitrum, Optimism, Polygon PoS), and automated quality gates for agent-driven development workflow.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20+ (specified in .nvmrc)
**Primary Dependencies**: Next.js 15+, Wagmi v2, Viem v2, RainbowKit v2, Zustand, TanStack Query v5, Tailwind CSS, shadcn/ui (Radix UI), lz-string
**Storage**: Client-side only (LocalStorage via Zustand persist), no backend database (Constitutional Principle I)
**Testing**: pnpm scripts for type-check (tsc), lint (ESLint), format (Prettier)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Brave with Web3 wallet extensions), Vercel Edge Runtime for serverless RPC proxy
**Project Type**: Web application (Next.js App Router SPA with SSG landing page)
**Performance Goals**: <500KB compressed bundle for landing page, <3s initial page load, RPC proxy response <200ms p95
**Constraints**: No server-side state (stateless), URL parameter limit 2000 bytes, privacy-first (no analytics/tracking), RPC keys must never be exposed client-side
**Scale/Scope**: MVP supports 4 blockchain networks, unlimited invoice creation (stateless), 6 user stories with 19 acceptance criteria, ~50 UI components (shadcn/ui + custom)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: Zero-Backend Architecture ✅

- **Status**: PASS
- **Verification**: Feature spec explicitly prohibits server-side database (FR-001 to FR-013). All invoice data encoded in URLs. LocalStorage only for user preferences/history. Serverless RPC proxy is permitted (edge functions for API key protection, not state storage).

### Principle II: Privacy-First & Self-Custody ✅

- **Status**: PASS
- **Verification**: No analytics dependencies in tech stack (FR-002). No tracking mechanisms. LocalStorage-only persistence (FR-010). Constitutional prohibition on telemetry explicitly acknowledged.

### Principle III: Trustless & Permissionless ✅

- **Status**: PASS
- **Verification**: No authentication/registration requirements (implicit in stateless design). No KYC. Users create invoices without personal information. Direct peer-to-peer payments.

### Principle IV: Backward Compatibility & Schema Versioning ✅

- **Status**: PASS (deferred to future features)
- **Verification**: Project initialization does not create invoice schema parsers yet. Schema versioning rules will be enforced when invoice creation feature is implemented. This feature establishes foundation only.

### Principle V: Security & Abuse Prevention ✅

- **Status**: PASS (deferred to future features)
- **Verification**: Blocklist and abuse prevention mechanisms not implemented in initialization. SEO noindex configuration (FR-015) is included. Full abuse prevention deferred to invoice display feature.

### Principle VI: RPC Key Protection & Rate Limit Management ✅

- **Status**: PASS
- **Verification**: Environment variables for RPC keys (FR-008, FR-009). Dual provider configuration (Alchemy + Infura) per network. No client-side key exposure. Edge function proxy pattern (implicit in architecture).

### Principle VII: Web3 Safety & Transaction Validation ✅

- **Status**: PASS (deferred to future features)
- **Verification**: Network configuration established (FR-007, FR-008). Transaction validation, Magic Dust, and payment verification deferred to payment processing feature. Foundation supports future safety mechanisms.

### Technology Stack Compliance ✅

- **Status**: PASS
- **Verification**: All locked MVP dependencies specified (Next.js 15+, Wagmi v2, Viem, RainbowKit v2, Zustand, TanStack Query, lz-string, Tailwind, shadcn/ui, Geist fonts). All 4 required networks configured (Ethereum, Arbitrum, Optimism, Polygon PoS).

### Feature-Sliced Design Compliance ✅

- **Status**: PASS
- **Verification**: FSD folder structure required (FR-003, FR-004). TypeScript path aliases configured. Routing structure matches constitutional requirements (/, /create, /pay) with correct SEO indexing (FR-015).

### Overall Assessment: ✅ PASS

**Decision**: Proceed to Phase 0 research. All constitutional principles are either satisfied or appropriately deferred to future features where they apply. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js 14 App Router + Feature-Sliced Design (FSD)
src/
├── app/                          # Next.js App Router (Layer 1)
│   ├── layout.tsx                # Root layout (RainbowKit, TanStack Query providers)
│   ├── page.tsx                  # Landing page (/) - SEO optimized, indexed
│   ├── create/
│   │   └── page.tsx              # Invoice editor (/create) - noindex
│   ├── pay/
│   │   └── page.tsx              # Payment view (/pay) - noindex, URL state decoding
│   └── api/
│       └── rpc/
│           └── route.ts          # Edge function RPC proxy (API key protection)
├── widgets/                      # FSD Layer 2: Large UI blocks
│   ├── invoice-card/
│   ├── payment-flow/
│   └── wallet-connect/
├── features/                     # FSD Layer 3: User interactions
│   ├── create-invoice/
│   ├── process-payment/
│   └── connect-wallet/
├── entities/                     # FSD Layer 4: Business logic & domain models
│   ├── invoice/
│   │   ├── model/                # Zustand store, types
│   │   ├── lib/                  # Compression, validation
│   │   └── ui/                   # Invoice-specific components
│   ├── token/
│   │   ├── model/                # Token list, decimals
│   │   └── lib/                  # Token validation
│   └── network/
│       ├── model/                # Network configs (4 chains)
│       └── lib/                  # RPC provider setup
└── shared/                       # FSD Layer 5: Utilities & UI primitives
    ├── ui/                       # shadcn/ui components
    │   ├── button.tsx
    │   ├── card.tsx
    │   └── ...
    ├── lib/                      # Utilities
    │   ├── utils.ts              # cn() helper, formatters
    │   └── constants.ts          # Chain IDs, colors
    ├── config/
    │   ├── wagmi.ts              # Wagmi config (dual RPC providers)
    │   └── query.ts              # TanStack Query config
    └── types/
        └── index.ts              # Shared TypeScript types

# Configuration files (repository root)
.env.example                      # Template with 8 RPC endpoint variables
.nvmrc                            # Node 20+ version lock
package.json                      # pnpm scripts, dependencies
tsconfig.json                     # Strict mode, path aliases (@/*)
next.config.mjs                   # Next.js config (SEO, Edge Runtime)
tailwind.config.ts                # Tailwind + shadcn/ui theme
components.json                   # shadcn/ui configuration
.eslintrc.json                    # ESLint rules
.prettierrc                       # Prettier config
```

**Structure Decision**: Feature-Sliced Design (FSD) architecture with Next.js App Router. This structure is mandated by Constitutional requirements and aligns with the feature spec (FR-003, FR-004). TypeScript path aliases (`@/app/*`, `@/widgets/*`, `@/features/*`, `@/entities/*`, `@/shared/*`) enable clean imports and enforce layer dependencies. The `src/app/` directory uses Next.js 14 file-based routing, while other layers follow FSD principles for domain-driven organization.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations - Table empty (all constitutional principles satisfied)

---

## Post-Design Constitution Re-Check

*Re-evaluated after completing Phase 0 (Research) and Phase 1 (Design & Contracts)*

### Design Artifacts Review

**Generated Artifacts**:
- ✅ `research.md`: Technology stack best practices and configuration patterns
- ✅ `data-model.md`: Configuration entities (NetworkConfig, UserPreferences, EnvironmentConfig, etc.)
- ✅ `contracts/rpc-proxy-api.md`: RPC proxy endpoint specification
- ✅ `contracts/config-schema.ts`: TypeScript type contracts
- ✅ `quickstart.md`: Developer onboarding guide

**Constitutional Compliance Verification**:

### Principle I: Zero-Backend Architecture ✅ PASS
- **Evidence**: `data-model.md` explicitly states "No server-side state storage"
- **RPC Proxy**: Edge Function is stateless (no database, no caching at proxy level)
- **User Data**: All persistence via LocalStorage (UserPreferences entity)
- **No Violations**: Confirmed

### Principle II: Privacy-First & Self-Custody ✅ PASS
- **Evidence**: `contracts/rpc-proxy-api.md` specifies "NO logging of request/response bodies"
- **No Tracking**: Research confirms no analytics dependencies (Sentry, GA explicitly excluded)
- **LocalStorage Only**: `data-model.md` confirms user preferences stored client-side only
- **No Violations**: Confirmed

### Principle III: Trustless & Permissionless ✅ PASS
- **Evidence**: No authentication entities in data model
- **No Registration**: No user account schema defined
- **Direct Payments**: RPC proxy is read-only (no custody of funds)
- **No Violations**: Confirmed

### Principle IV: Backward Compatibility & Schema Versioning ✅ PASS (Deferred)
- **Evidence**: `config-schema.ts` includes `SUPPORTED_CHAIN_IDS` as const (immutable)
- **Future-Ready**: Schema versioning pattern established via TypeScript types
- **Invoice Schema**: Deferred to future feature (as planned)
- **No Violations**: Confirmed

### Principle V: Security & Abuse Prevention ✅ PASS (Partial Implementation)
- **Evidence**: `quickstart.md` warns against committing `.env.local` (secrets protection)
- **SEO Noindex**: Mentioned in research (FR-015 compliance)
- **Blocklist**: Deferred to future feature (as planned)
- **No Violations**: Confirmed (appropriate deferral)

### Principle VI: RPC Key Protection & Rate Limit Management ✅ PASS
- **Evidence**: `contracts/rpc-proxy-api.md` specifies server-side key injection
- **Env Vars**: `data-model.md` defines EnvironmentConfig with all RPC URLs
- **No Client Exposure**: Research confirms keys in env vars only
- **Dual Providers**: Alchemy (primary) + Infura (fallback) configured per network
- **No Violations**: Confirmed

### Principle VII: Web3 Safety & Transaction Validation ✅ PASS (Foundation Only)
- **Evidence**: `data-model.md` includes NetworkConfig with validation rules
- **Chain ID Validation**: `config-schema.ts` includes `isSupportedChainId()` type guard
- **Transaction Safety**: Deferred to payment feature (as planned)
- **No Violations**: Confirmed

### Technology Stack Compliance ✅ PASS
- **Evidence**: `research.md` documents all constitutional dependencies:
  - Next.js 15+ (App Router, Edge Runtime) ✅
  - TypeScript (strict mode + additional safety flags) ✅
  - Wagmi v2 + Viem ✅
  - RainbowKit v2 ✅
  - Zustand + persist ✅
  - TanStack Query ✅
  - lz-string ✅
  - Tailwind CSS + shadcn/ui ✅
  - Geist fonts ✅
- **All 4 Networks**: Ethereum, Arbitrum, Optimism, Polygon PoS ✅
- **No Violations**: Confirmed

### Feature-Sliced Design Compliance ✅ PASS
- **Evidence**: Project structure in `plan.md` shows full FSD hierarchy
- **Layer Separation**: `config-schema.ts` comments indicate proper entity placement
- **Path Aliases**: Research confirms `@/*` TypeScript paths configured
- **No Violations**: Confirmed

### Overall Post-Design Assessment: ✅ PASS

**Decision**: All constitutional principles satisfied or appropriately deferred. Design phase (research, data model, contracts) introduces **zero violations**. Implementation can proceed to Phase 2 (task breakdown via `/speckit.tasks`).

**Key Findings**:
1. **No Server-Side State**: Confirmed across all artifacts (RPC proxy is stateless, LocalStorage for preferences)
2. **Privacy Preserved**: No analytics, no logging, no tracking mechanisms
3. **RPC Keys Protected**: Environment variables + server-side injection pattern
4. **Type Safety**: Strict TypeScript with validation helpers (`isSupportedChainId`, `isValidUserPreferences`)
5. **FSD Architecture**: Clear layer separation with import constraints

**No Complexity Justifications Required**: Zero constitutional violations to justify.
