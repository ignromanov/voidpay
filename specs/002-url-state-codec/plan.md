# Implementation Plan: URL State Codec System

**Branch**: `002-url-state-codec` | **Date**: 2025-11-19 | **Spec**: [spec.md](specs/002-url-state-codec/spec.md)
**Input**: Feature specification from `/specs/002-url-state-codec/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a stateless URL state codec system for invoice data to enable zero-backend invoicing. Key components include:
1.  **InvoiceSchemaV1**: TypeScript interface with abbreviated keys (`v`, `id`, `iss`, `due`, `nt`, `net`, `cur`, `dec`, `f`, `c`, `it`, `tax`, `dsc`, `ads`, `ph`) to minimize payload.
2.  **URL Compression**: Use `lz-string` for LZW compression/decompression.
3.  **Validation**: Enforce 2000-byte URL limit and schema validation (Zod recommended).
4.  **Versioning**: Embed `v: 1` field and implement immutable parser logic for forward compatibility.

## Technical Context

**Language/Version**: TypeScript 5.x+ (Strict Mode)
**Primary Dependencies**: `lz-string` (v1.5.0+), `zod` (for runtime validation), native `BigInt` (for amounts)
**Storage**: None (Stateless URL-based state)
**Testing**: Vitest (Unit tests for codec round-trips, validation logic)
**Target Platform**: Web (Next.js 15+ Edge Runtime compatible)
**Project Type**: Web application (Feature-Sliced Design)
**Performance Goals**: Encoding/Decoding < 50ms, URL length < 2000 bytes
**Constraints**: No backend database, strict privacy (no telemetry), immutable v1 schema
**Scale/Scope**: Core feature, critical for platform functionality

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Zero-Backend Architecture (Principle I)**: Compliant. State is fully contained in URL.
- [x] **Privacy-First (Principle II)**: Compliant. No server-side storage or analytics.
- [x] **Permissionless (Principle III)**: Compliant. No auth required to generate/read URLs.
- [x] **Backward Compatibility (Principle IV)**: Compliant. Explicit versioning (`v: 1`) and immutable parser requirement.
- [x] **Security (Principle V)**: Compliant. Input validation and size limits included.
- [x] **RPC Protection (Principle VI)**: N/A (No RPC calls in codec logic).
- [x] **Web3 Safety (Principle VII)**: N/A (No transaction execution in codec logic).
- [x] **Documentation (Principle VIII)**: Compliant. Concise specs and plans.
- [x] **Git Worktree (Principle X)**: Compliant. Working in `worktrees/002-url-state-codec`.

## Project Structure

### Documentation (this feature)

```text
specs/002-url-state-codec/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── entities/
│   └── invoice/
│       ├── model/
│       │   ├── schema.ts       # InvoiceSchemaV1 definition
│       │   └── types.ts        # Domain types
│       └── lib/
│           └── validation.ts   # Zod schemas
├── features/
│   └── invoice-codec/
│       ├── lib/
│       │   ├── encode.ts       # URL encoding logic
│       │   └── decode.ts       # URL decoding logic
│       └── test/
│           ├── codec.test.ts   # Round-trip tests
│           └── limits.test.ts  # Size limit tests
└── shared/
    └── lib/
        └── compression/        # lz-string wrapper
```

**Structure Decision**: Adopting Feature-Sliced Design (FSD). `entities/invoice` holds the data model, while `features/invoice-codec` contains the transformation logic.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| None | N/A | N/A |
