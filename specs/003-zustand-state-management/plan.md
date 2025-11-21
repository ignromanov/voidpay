# Implementation Plan: Client-Side State Management with Zustand

**Branch**: `003-zustand-state-management` | **Date**: 2025-11-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-zustand-state-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement client-side state management using Zustand with persist middleware to store invoice drafts, user preferences, creation history, auto-incrementing invoice ID counter (useCreatorStore), and payment receipts (usePayerStore) in browser LocalStorage. Add export/import functionality for data portability. All data stored client-side only (no server-side storage per Constitution Principles I & II).

## Technical Context

**Language/Version**: TypeScript 5.x+ (strict mode)  
**Primary Dependencies**: Zustand 5+, Zustand persist middleware, Next.js 15+ (App Router), React 18+  
**Storage**: Browser LocalStorage (client-side only, no server-side database)  
**Testing**: Vitest (unit tests for stores, serialization, migration logic)  
**Target Platform**: Web browsers (modern browsers with LocalStorage support)
**Project Type**: Web application (Next.js frontend)  
**Performance Goals**:

- Draft auto-save debounced to 500ms
- Store hydration < 100ms on page load
- Export/import operations < 1s for typical datasets

**Constraints**:

- LocalStorage quota limits (typically 5-10MB per origin)
- Auto-pruning at 100 entries for history/receipts
- Schema versioning required for future migrations
- No server-side storage (Constitution Principle I)
- No telemetry or analytics (Constitution Principle II)

**Scale/Scope**:

- 2 Zustand stores (useCreatorStore, usePayerStore)
- ~6 entity types (InvoiceDraft, InvoiceTemplate, CreationHistoryEntry, UserPreferences, InvoiceIDCounter, PaymentReceipt)
- Export/import with schema versioning
- Client-side search/filter functionality

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

✅ **Principle I (Zero-Backend Architecture)**: PASS

- All data stored in browser LocalStorage only
- No server-side database or persistent state
- Export/import provides data portability without backend

✅ **Principle II (Privacy-First & Self-Custody)**: PASS

- No analytics or telemetry on user data
- History stored exclusively in LocalStorage
- Export/import enables user data ownership
- No third-party services for state management

✅ **Principle III (Trustless & Permissionless)**: PASS

- No registration or authentication required
- Users can create/manage drafts without permission
- No approval workflows

✅ **Principle IV (Backward Compatibility & Schema Versioning)**: REQUIRES ATTENTION

- ⚠️ Schema versioning MUST be implemented for persisted stores
- Migration adapters MUST be created for future schema changes
- Export data MUST include schema version field
- Import logic MUST handle version mismatches gracefully

✅ **Principle VI (RPC Key Protection)**: N/A

- This feature does not interact with RPC providers

✅ **Principle VIII (Documentation Context Efficiency)**: PASS

- Plan focuses on approach, not implementation details
- Concise entity definitions in spec

✅ **Principle IX (Implementation Deviation Tracking)**: PASS

- Will track deviations in tasks.md during implementation
- Will update PROGRESS.md upon feature completion

✅ **Principle X (Git Worktree Isolation)**: PASS

- Feature developed in dedicated worktree: `worktrees/003-zustand-state-management`
- No cross-worktree modifications

**Overall Status**: ✅ PASS with attention required for schema versioning implementation

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

## Project Structure

### Documentation (this feature)

```text
specs/003-zustand-state-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (Feature-Sliced Design)

```text
src/
├── entities/
│   ├── invoice/
│   │   ├── model/
│   │   │   ├── types.ts           # InvoiceDraft, InvoiceTemplate types
│   │   │   └── validation.ts      # Validation schemas (existing)
│   │   └── lib/
│   │       └── invoice-helpers.ts # Utility functions
│   ├── creator/
│   │   └── model/
│   │       ├── types.ts           # UserPreferences, InvoiceIDCounter, CreationHistoryEntry
│   │       ├── useCreatorStore.ts # Zustand store with persist
│   │       └── migrations.ts      # Schema migration logic
│   └── payer/
│       └── model/
│           ├── types.ts           # PaymentReceipt types
│           ├── usePayerStore.ts   # Zustand store with persist
│           └── migrations.ts      # Schema migration logic
│
├── features/
│   ├── invoice-draft/
│   │   ├── ui/                    # Draft management UI components
│   │   └── lib/
│   │       └── auto-save.ts       # Debounced auto-save hook
│   ├── invoice-history/
│   │   ├── ui/                    # History list, search, duplicate actions
│   │   └── lib/
│   │       └── search.ts          # Client-side search/filter logic
│   ├── data-export/
│   │   ├── ui/                    # Export/import UI
│   │   └── lib/
│   │       ├── export.ts          # JSON export logic
│   │       └── import.ts          # JSON import with validation
│   └── payment-receipts/
│       ├── ui/                    # Receipt list, view transaction
│       └── lib/
│           └── receipt-manager.ts # Receipt storage logic
│
└── shared/
    ├── lib/
    │   ├── storage/
    │   │   ├── quota-check.ts     # LocalStorage quota detection
    │   │   └── namespace.ts       # Key namespacing utilities
    │   └── debounce.ts            # Debounce utility
    └── config/
        └── storage-keys.ts        # Centralized storage key constants
```

**Structure Decision**: Using Feature-Sliced Design (FSD) architecture as mandated by Constitution. Stores are placed in `entities/*/model/` layer since they represent domain state. Features layer contains user-facing interactions (draft management, history, export/import). Shared layer provides storage utilities and debounce helpers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitutional principles are satisfied.

---

## Post-Design Constitution Check

_Re-evaluation after Phase 1 design completion_

✅ **Principle I (Zero-Backend Architecture)**: CONFIRMED

- Data model uses only LocalStorage
- No server-side endpoints introduced
- Export/import maintains client-side only approach

✅ **Principle II (Privacy-First & Self-Custody)**: CONFIRMED

- No telemetry in store implementations
- All data remains in user's browser
- Export format enables full data portability

✅ **Principle IV (Backward Compatibility & Schema Versioning)**: CONFIRMED

- Schema versioning implemented in data model (version: 1)
- Migration strategy defined in research.md
- Export data includes version field
- Zustand persist middleware supports migration function

✅ **All other principles**: CONFIRMED

**Final Status**: ✅ PASS - All constitutional requirements satisfied

---

## Phase Summary

### Phase 0: Research ✅ COMPLETE

- **Output**: `research.md`
- **Key Decisions**:
  - Zustand persist middleware with LocalStorage
  - Schema versioning via persist config
  - Debouncing with use-debounce library
  - Quota handling with try-catch + estimation
  - Export format as versioned JSON envelope
  - Client-side search with Array.filter()

### Phase 1: Design & Contracts ✅ COMPLETE

- **Outputs**:
  - `data-model.md` - Complete entity definitions, validation rules, migration strategy
  - `contracts/creator-store.ts` - Creator store API contract
  - `contracts/payer-store.ts` - Payer store API contract
  - `contracts/export-import.ts` - Export/import API contract
  - `quickstart.md` - Developer guide with examples
  - `CLAUDE.md` - Updated agent context

### Next Steps

Run `/speckit.tasks` to generate implementation tasks from this plan.
