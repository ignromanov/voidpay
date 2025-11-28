# 🗺️ VoidPay Roadmap: P0 (Critical / MVP Blocker)

> **Focus**: Essential infrastructure and core features required for the initial launch.
> **Status**: Active Development

---

## 📋 Legend

- **P0** - Critical (MVP Blocker) - Must have for launch
- ✅ Compliant | ⚠️ Review Required | 🔒 Locked

---

## 🎯 Phase 0: Project Foundation

### P0.1 - Repository Setup & Tooling

**Status**: 🟢 **Completed**: 2025-11-19 **Compliance**: ✅
**Feature Folder**: `specs/001-project-initialization/` (inferred)
**Implemented**:

- ✅ Next.js 15.5.6 (downgraded from 16 per user request)
- ✅ React 19.2.0
- ✅ TypeScript 5.7 strict mode
- ✅ Tailwind CSS 4.1.17
- ✅ ESLint + Prettier configured
- ✅ .nvmrc with Node 22.19.0 (upgraded from 20)
- ✅ shadcn/ui initialized with button & card components
- ✅ Git hooks setup (via pnpm scripts)
  **Deviations**:
- Used Next.js 15 instead of 16 (user preference for stability)
- Node 22 instead of 20 (latest LTS)
- Added shadcn/ui early (originally planned for P0.5)
- Configured Geist fonts in layout (originally P0.8)
  **Notes**:
- All quality gates passing (lint, type-check, format)
- Development server verified working
- Basic routing structure in place (/, /create, /pay/[invoiceId])

### P0.X - Design System Refinement (App Shell & Vibes)

**Status**: 🟢 **Completed**: 2025-11-20 **Compliance**: ✅
**Feature Folder**: `specs/001-design-system/` (inferred)
**Implemented**:

- ✅ App Shell Architecture formalized (Header/Footer separation)
- ✅ "Network Vibes" visual language defined (Geometric shapes per network)
- ✅ "Blur Wrapper" technical pattern specified
- ✅ Constitution updated with App Shell rules (Principle XI)
- ✅ FSD structure updated with `widgets/app-shell`
  **Notes**:
- Ensures clear separation between Platform (Desk) and Content (Paper)
- Prepares for implementation of P0.11 and P1.4

---

## 🏗️ Phase 1: Core Infrastructure

### P0.2 - URL State Codec & Schema Validation

**Status**: 🟢 **Completed**: 2025-11-20 **Compliance**: 🔒 **Constitutional**: Principle IV
**Feature Folder**: `specs/002-url-state-codec/`
**Implemented**:

- ✅ InvoiceSchemaV1 TypeScript interfaces with all required fields
- ✅ lz-string compression/decompression (lz-string@1.5.0)
- ✅ URL length validation (2000 bytes hard limit)
- ✅ Schema versioning support (v1 with forward compatibility)
- ✅ Reserved fields for extensibility (\_reserved1-5)
- ✅ Zod validation schemas for data integrity
- ✅ Public API (encodeInvoiceToUrl, decodeInvoiceFromUrl)
- ✅ User-friendly error handling (no stack traces exposed)
- ✅ Public API barrel exports (src/features/invoice-codec/index.ts)
  **Deviations**:
- Test tasks (T009, T011, T013) skipped per implementation strategy
- Focus on MVP functionality over comprehensive test coverage
  **Notes**:
- Feature-Sliced Design structure: `src/entities/invoice/`, `src/features/invoice-codec/`, `src/shared/lib/compression/`
- Comprehensive README with usage examples in `src/features/invoice-codec/README.md`
- Implementation report available in `specs/002-url-state-codec/IMPLEMENTATION_REPORT.md`
- Ready for integration into invoice editor and payment views

### P0.2.5 - Schema Migration Engine

**Status**: 🔴 **Priority**: P0 **Compliance**: 🔒 **Constitutional**: Principle IV

- **Migration Pipeline**: Chain of Responsibility pattern (v1 -> v2 -> v3).
- **Legacy Adapter**: `normalizeInvoice(data: any): InvoiceSchemaV1`.
- **Version Detection**: Logic to detect version before parsing.
- **Unit Tests**: Snapshot tests for regression prevention.

### P0.3 - Client-Side Storage (Zustand Stores)

**Status**: 🟡 **In Progress** **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle II
**Feature Folder**: `specs/003-zustand-state-management/` (inferred)
**Completed**:

- ✅ Defined storage keys and namespace (`voidpay:`)
- ✅ Implemented `useCreatorStore` schema and types
- ✅ Implemented `usePayerStore` schema and types
- ✅ Added LocalStorage quota management utilities
- ✅ Defined `InvoiceDraft` and `LineItem` data models
- ✅ Implemented `useCreatorStore` actions and persistence
- ✅ Implemented `usePayerStore` actions and persistence
- ✅ Implemented export/import functionality with validation
  **Remaining**:
- Integrate with UI components

### P0.4 - RPC Proxy & Multi-Provider Failover

**Status**: 🟢 **Completed**: 2025-11-21 **Compliance**: ✅ **Constitutional**: Principle VI
**Feature Folder**: `specs/004-rpc-proxy-failover/`
**Implemented**:

- ✅ Edge API route at `/api/rpc` with Next.js Edge Runtime
- ✅ Alchemy (primary) + Infura (fallback) automatic failover
- ✅ 2-second timeout for primary, 5-second for fallback
- ✅ Error classification (retryable vs non-retryable)
- ✅ Per-IP rate limiting (100 req/min) via Vercel KV
- ✅ HTTP 503 responses for complete provider failure
- ✅ User-friendly error messages with Retry-After headers
- ✅ Zero logging/telemetry (privacy-preserving)
- ✅ Server-side only API key validation
  **Deviations**:
- Used Vercel KV for rate limiting (justified exception to Principle I - transient operational data only)
- Added anonymous request IDs for operational metrics (privacy-preserving monitoring)
- Wagmi integration (T045) deferred to main app integration phase
  **Notes**:
- Edge Runtime constraints required Web API-only implementation
- All RPC methods explicitly allowlisted for security (9 methods)
- Fail-open rate limiting prevents blocking users during KV outages
- Build successful with all linting and type checks passed

### P0.4.5 - Mock RPC & Simulation Mode

**Status**: 🟢 **Completed**: 2025-11-21 **Compliance**: ✅ **Constitutional**: Development Philosophy
**Feature Folder**: `specs/004-rpc-proxy-failover/` (integrated)
**Implemented**:

- ✅ Mock provider with automatic activation (localhost or `?debug=1`)
- ✅ Three simulation modes: `success` (1-3s), `error`, `slow` (10-30s)
- ✅ All 9 RPC methods implemented with realistic responses
- ✅ Transaction state tracking (pending → success)
- ✅ Fake transaction hash generation using Web Crypto API
- ✅ Mock mode automatically disabled in production builds
  **Notes**:
- Mock mode bypasses rate limiting for development workflow
- X-Mock-Mode header added to responses for debugging

### P0.4.6 - API Security Hardening (CORS & Headers)

**Status**: 🟢 **Completed**: 2025-11-21 **Compliance**: ✅ **Constitutional**: Principle VI
**Feature Folder**: `specs/004-rpc-proxy-failover/` (integrated)
**Implemented**:

- ✅ Strict CORS policy (application domain only)
- ✅ HTTP method restriction (POST only, rejects GET/PUT/DELETE/PATCH)
- ✅ JSON-RPC method allowlist validation (9 permitted methods)
- ✅ Origin and Referer header verification
- ✅ Security headers (Cache-Control: no-cache, no-store)
- ✅ CORS preflight handler (OPTIONS)
  **Notes**:
- Security controls enforced in production only (relaxed for localhost)
- All security validations happen before rate limiting check

### P0.5 - Wagmi + Viem + RainbowKit Setup

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅

- Wagmi v2.19.4+ configuration
- Viem v2.39.3+ for contract interactions
- RainbowKit v2.2.9+ wallet connector UI
- Support for 4 networks: Ethereum (1), Arbitrum (42161), Optimism (10), Polygon (137)
- Custom theme with Electric Violet accent (#7C3AED)
- Progressive wallet connection

### P0.5.5 - Testnet Configuration & Staging Environment

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle VII

- **Chain Config**: Sepolia, Arbitrum Sepolia, Optimism Sepolia, Polygon Amoy.
- **Env Logic**: `NEXT_PUBLIC_ENABLE_TESTNETS` flag.
- **Vercel Preview**: CI/CD preview builds with Testnet mode.
- **UI Indicator**: "TESTNET MODE" banner.
- **Keys**: Separate Mainnet/Testnet keys.

### P0.6 - Feature-Sliced Design (FSD) Structure

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Architectural Constraints

- Implement FSD layers: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`
- Define entity models: `invoice`, `token`, `network`
- Create shared utilities and UI primitives
- Set up routing structure: `/`, `/create`, `/pay`

### P0.6.5 - Design System Implementation (Shared UI)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle XI

- **Tailwind Config**: `bg-background` (Zinc-950), `primary` (Violet-600).
- **Typography**: Geist Sans & Geist Mono.
- **Animations**: Ambient Glow keyframes.
- **Shadcn/ui**: Base components (Button, Input, Card, Sheet, Dialog) with "VoidPay Look".
- **Base Widgets**: `AppShell`, `AmbientBackground`, `InvoicePaper`.

### P0.6.6 - App Shell & Global Layouts (UI Assembly)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle XI

- **Widget `app-shell`**: Global layout.
- **Header**: Floating, glassmorphism. Logo + Wallet Connect only.
- **Footer**: Trust & Safety slot.
- **Widget `ambient-background`**: Network Vibes (blobs).
- **Page Wrapper**: `max-w-[1600px]` centered.

### P0.6.7 - Global Notification System (Sonner)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅

- **Library**: `sonner`.
- **Styles**: Void theme (black bg, colored border).
- **Types**: Loading, Success, Web3 (Tx Sent), Error.

### P0.6.8 - App Hydration Loader (The Void)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅

- **Component**: Fullscreen loader blocking render until hydration.
- **Visual**: Pulsing Void logo.
- **Logic**: `useStoreHydration` hook.

### P0.6.9 - Testing Environment Setup (Vitest + TDD)

**Status**: 🟢 **Completed**: 2024-11-28 **Compliance**: ✅ **Constitutional**: Principle XVI
**Feature Folder**: `specs/005-testing-environment/`
**Implemented**:

- ✅ Vitest 4.x configuration with coverage (80%+ threshold enforced)
- ✅ @testing-library/react setup with custom providers
- ✅ @wagmi/connectors mock for Web3 testing (no network calls in tests)
- ✅ Snapshot testing for invoice schema protection (Principle IV)
- ✅ RPC mock utilities for payment verification testing
- ✅ Pre-commit hooks (lint-staged + typecheck)
- ✅ Pre-push hooks (coverage enforcement)
- ✅ GitHub Actions CI workflow
  **Coverage**: 90%+ statements, branches, lines; 80%+ functions
  **Deviations**: Schema test path changed from entities to features for FSD alignment
  **Notes**: Supports Constitutional Principle XVI (TDD Discipline) enforcement

---

## 💎 Phase 2: MVP Core Features

### P0.7 - Landing Page (Marketing + SEO)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅

- **Hero Visual**: 3D-tilted floating Invoice Paper.
- **Value Prop**: "No backend, no sign-up".
- Feature grid & Trust signals.
- CTA "Start Invoicing".
- SEO optimization & Dark mode theme.

### P0.12.1 - Payment Terminal UI (The Interaction Layer)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅

- **Integrated Paper Footer**: Payment controls inside InvoicePaper.
- **Smart Button UI**: Connect, Switch Network, Pay, Processing, Success.
- **Status Indicators**: Pending/Paid badges.
- **Magic Dust Display**: Micro-component for exact amount.

### P0.12 - Payment Terminal Widget (Web3 Flow)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle III, VII

- Smart button with 6 states (Disconnected -> Success).
- Magic Dust integration.
- Network switching & Transaction submission.
- Donation Widget (Native Currency).
- Error handling.

### P0.13 - Magic Dust Payment Verification

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle VII

- Random micro-amount generation (0.000001 - 0.000999).
- Crypto-secure randomness.
- Exact amount matching (NO fuzzy tolerance).
- Payment uniqueness guarantee.

### P0.14 - Payment Status Polling (Alchemy Transfers API)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle VII

- Alchemy Transfers API integration.
- Polling interval: 10s.
- Filters: recipient, token, exact amount, timestamp.
- Status phases: Processing → Confirming → Paid.
- TanStack Query caching.

### P0.19 - Deployment Configuration & Hardening (vercel.json)

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅ **Constitutional**: Principle V

- **Security Headers**: `X-Content-Type-Options`, `X-Frame-Options`, etc.
- **Caching Policy**: `immutable` for static, `no-store` for HTML.
- **Region Selection**: `us-east-1` (latency optimization).
- **Clean URLs**.

---

## 🚦 Release Checklist (Pre-Launch)

### MVP Launch Criteria

**Status**: 🔴 **Priority**: P0 **Compliance**: ✅

**Must Complete Before Launch**:

- [ ] All P0 features implemented and tested
- [ ] Security audit completed (no critical vulnerabilities)
- [ ] Performance benchmarks met (Lighthouse score >90)
- [ ] Mobile responsive design verified on iOS Safari + Android Chrome
- [ ] Multi-network testing on testnets (Sepolia, Arbitrum Goerli, etc.)
- [ ] Abuse blocklist system operational
- [ ] Legal disclaimer reviewed
- [ ] Domain configured (voidpay.xyz)
- [ ] Vercel deployment with env vars configured
- [ ] Constitution compliance verified for all features
- [ ] Analytics/telemetry confirmed disabled
- [ ] Open source license added (MIT or Apache 2.0)
- [ ] GitHub repository public

---

## 🎯 Critical Path (MVP Only)

1. P0.2 → P0.3 → P0.4 → P0.5 (Infrastructure in parallel)
2. P0.8 (P1) → P0.9 (P1) → P0.10 (P1) (Create flow - _Note: P1 items required for flow_)
3. P0.11 (P1) → P0.12 → P0.13 → P0.14 (Pay flow)
4. P1.1 (P1) + P1.7 (P1) + P1.8 (P1) (Essential polish)
5. Testing + Launch

---

**Document Version**: 1.1.0
**Last Updated**: 2025-11-21
