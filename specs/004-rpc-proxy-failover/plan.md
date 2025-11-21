# Implementation Plan: RPC Proxy & Multi-Provider Failover

**Branch**: `004-rpc-proxy-failover` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-rpc-proxy-failover/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a privacy-preserving, server-side RPC proxy using Next.js Edge API Routes to route blockchain requests to Alchemy (primary) and Infura (fallback). The system will enforce rate limiting, prevent data logging, and secure API keys. Additionally, a Mock RPC provider will be implemented for development and testing, supporting simulation modes via query parameters.

## Technical Context

**Language/Version**: TypeScript 5.x+
**Primary Dependencies**: Next.js 15+ (App Router + Edge Runtime), Wagmi v2+, Viem v2+
**Storage**: Vercel KV (Rate limiting only - transient operational data)
**Testing**: Vitest, Manual (cURL/Postman)
**Target Platform**: Vercel Edge Functions
**Project Type**: Web Application (Next.js)
**Performance Goals**: Failover < 2s, 100 req/min per IP
**Constraints**: No logging, No telemetry, API keys in env vars, Stateless (mostly)
**Scale/Scope**: 2 Providers, 1 Mock Provider, Proxy Endpoint

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] No backend database introduced (Principle I) - *Exception: Vercel KV used for transient Rate Limiting (Infrastructure State)*
- [x] No user authentication/registration added (Principle III)
- [x] Schema changes follow versioning rules (Principle IV) - *N/A*
- [x] New features preserve privacy-first approach (Principle II)
- [x] Security mechanisms not bypassed (Principle V)
- [x] Documentation follows context efficiency guidelines (Principle VIII)
- [x] UI follows Hybrid Theme Strategy: dark desk (`zinc-950`), light paper (`white`) (Principle XI) - *N/A*
- [x] Document representations maintain ISO 216 (A4) aspect ratio `1:1.414` (Principle XI) - *N/A*

## Project Structure

### Documentation (this feature)

```text
specs/004-rpc-proxy-failover/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── rpc/
│           └── route.ts       # Edge API Route
├── features/
│   └── rpc-proxy/             # Feature logic
│       ├── lib/
│       │   ├── proxy.ts       # Proxy logic & Failover
│       │   ├── rate-limit.ts  # Rate limiting logic
│       │   ├── mock.ts        # Mock provider logic
│       │   └── config.ts      # Provider configuration
│       └── model/
│           └── types.ts       # Types
└── shared/
    └── config/
        └── env.ts             # Environment variables
```

**Structure Decision**: Implemented as a Feature (`features/rpc-proxy`) exposing an Edge API Route (`app/api/rpc`).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| Vercel KV (Transient DB)   | Rate Limiting (FR-004) | In-memory limiting doesn't work in serverless/edge. WAF is too opaque/expensive. |
