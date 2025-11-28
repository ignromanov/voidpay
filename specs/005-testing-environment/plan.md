# Implementation Plan: Testing Environment Setup (Vitest + TDD) and Git Hooks

**Branch**: `005-testing-environment` | **Date**: 2025-11-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-testing-environment/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Establish a comprehensive testing environment with Vitest 3.x+ as the test runner, @testing-library/react for component testing, and @wagmi/connectors mock connector for Web3 testing. Configure Husky + lint-staged for git hooks to enforce quality gates: pre-commit (lint + type-check staged files) and pre-push (full test suite with 80% coverage threshold). This enables the TDD workflow (Red → Green → Refactor) mandated by Constitutional Principle XVI.

## Technical Context

**Language/Version**: TypeScript 5.x+ (strict mode), Node.js 20+
**Primary Dependencies**:

- Testing: Vitest 3.x+, @testing-library/react, @testing-library/jest-dom
- Web3 Mocking: @wagmi/connectors (mock connector), Vitest vi.mock()
- Git Hooks: Husky 9.x+, lint-staged 15.x+
- Existing: Next.js 16.0.3+, React 19+, ESLint, TypeScript

**Storage**: N/A (testing infrastructure only)
**Testing**: Vitest (unit, component, snapshot), @testing-library/react (component rendering)
**Target Platform**: Node.js 20+ (test runner), Browser (jsdom environment for component tests)
**Project Type**: Web application (Next.js)
**Performance Goals**:

- Full test suite < 60 seconds
- Individual tests < 10 seconds (95%+)
- Pre-commit hooks < 5 seconds for staged files
  **Constraints**:
- 80% minimum coverage threshold (Constitutional Principle XVI)
- No network calls in tests (mocked RPC)
- No testnet dependencies in CI
  **Scale/Scope**: ~50-100 test files expected for MVP, scaling with feature development

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] No backend database introduced (I) - _Testing infrastructure only, no data storage_
- [x] No user authentication/registration added (III) - _N/A for testing setup_
- [x] Schema changes follow versioning rules (IV) - _Snapshot tests protect schema stability_
- [x] New features preserve privacy-first approach (II) - _No analytics in tests_
- [x] Security mechanisms not bypassed (V) - _N/A for testing infrastructure_
- [x] Documentation follows context efficiency guidelines (VIII) - _Concise plan format_
- [x] UI follows Hybrid Theme Strategy (XII) - _N/A for testing infrastructure_
- [x] Document representations maintain ISO 216 (A4) aspect ratio (XII) - _N/A_
- [x] All TypeScript/Markdown navigation uses Serena tools first (XIII) - _Will use for implementation_
- [x] Serena memories consulted before planning via `mcp__serena__*` tools (XIV) - _Constitution read_
- [x] Following SpecKit workflow phases (XV) - _Currently in /speckit.plan phase_
- [x] TDD discipline followed with 80%+ coverage (XVI) - _This feature implements XVI; 80% threshold enforced_

## Project Structure

### Documentation (this feature)

```text
specs/005-testing-environment/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal - config schemas)
├── quickstart.md        # Phase 1 output (developer setup guide)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Testing Configuration Files (root level)
vitest.config.ts         # Vitest configuration
vitest.setup.ts          # Test setup (jsdom, testing-library)

# Git Hooks
.husky/
├── pre-commit           # lint-staged trigger
└── pre-push             # full test suite trigger

# Test Utilities (shared layer per FSD)
src/shared/
├── test-utils/
│   ├── index.ts         # Re-exports
│   ├── render.tsx       # Custom render with providers
│   ├── wagmi-mock.ts    # Wagmi mock config for tests
│   └── rpc-mocks.ts     # RPC response mocks

# Co-located Tests (per FSD layer)
src/entities/invoice/__tests__/
├── schema.test.ts       # Schema validation tests
└── schema.test.ts.snap  # Snapshots

src/features/create-invoice/__tests__/
└── CreateInvoiceForm.test.tsx

src/shared/lib/__tests__/
├── url-codec.test.ts    # URL encoding tests
└── url-codec.test.ts.snap
```

**Structure Decision**: Co-located `__tests__/` directories within FSD layers. Test utilities in `src/shared/test-utils/`. Configuration files at repository root.

## Complexity Tracking

> No Constitution Check violations - testing infrastructure is fully compliant.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
