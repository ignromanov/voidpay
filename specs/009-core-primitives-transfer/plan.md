# Implementation Plan: Core UI Primitives Transfer (009)

**Branch**: `009-core-primitives-transfer` | **Date**: 2025-11-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-core-primitives-transfer/spec.md`

## Summary

Transfer and implement core UI primitives (Input, Textarea, Badge, Typography, Card glass variant) from AI Studio v3 design source to production codebase using CVA pattern, with 80%+ test coverage per Constitutional Principle XVI.

## Technical Context

**Language/Version**: TypeScript 5.x+ (strict mode)  
**Primary Dependencies**: React 19+, CVA 0.7.1+, Tailwind CSS 4.1.17+, clsx, tailwind-merge  
**Storage**: N/A (UI components only)  
**Testing**: Vitest 4.0.14+, @testing-library/react 16.3.0+  
**Target Platform**: Web (Next.js 16+)
**Project Type**: web (FSD architecture)  
**Performance Goals**: N/A (UI primitives)  
**Constraints**: Backward compatibility for Card component  
**Scale/Scope**: 5 new components, 1 enhanced component

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] No backend database introduced (I) - N/A, UI components only
- [x] No user authentication/registration added (III) - N/A
- [x] Schema changes follow versioning rules (IV) - N/A
- [x] New features preserve privacy-first approach (II) - N/A
- [x] Security mechanisms not bypassed (V) - N/A
- [x] Documentation follows context efficiency guidelines (VIII) - Concise specs
- [x] UI follows Hybrid Theme Strategy: dark desk (`zinc-950`), light paper (`white`) (XII) - Verified in design source
- [x] Document representations maintain ISO 216 (A4) aspect ratio `1:1.414` (XII) - N/A for primitives
- [x] All TypeScript/Markdown navigation uses Serena tools first (XIII) - Followed
- [x] Serena memories consulted before planning via `mcp__serena__*` tools (XIV) - Read constitutional-principles-summary, tech-stack-locked
- [x] Memory update plan identified: Update `development-status` after feature completion (XIV)
- [x] Following SpecKit workflow phases: specify → plan → tasks → implement (XV) - Currently in plan phase
- [x] TDD cycle planned: Red → Green → Refactor with 80%+ coverage target (XVI) - Test-first for all components

## Project Structure

### Documentation (this feature)

```text
specs/009-core-primitives-transfer/
├── plan.md              # This file
├── research.md          # Phase 0 output - COMPLETE
├── data-model.md        # Phase 1 output - COMPLETE
├── quickstart.md        # Phase 1 output - COMPLETE
├── contracts/           # Phase 1 output - COMPLETE
│   └── component-api.ts # TypeScript interfaces
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/shared/ui/
├── card.tsx           # MODIFY - add glass variant
├── input.tsx          # NEW
├── textarea.tsx       # NEW
├── badge.tsx          # NEW
├── typography.tsx     # NEW (Heading + Text)
├── index.ts           # MODIFY - add exports
└── __tests__/
    ├── card.test.tsx      # NEW
    ├── input.test.tsx     # NEW
    ├── textarea.test.tsx  # NEW
    ├── badge.test.tsx     # NEW
    └── typography.test.tsx # NEW
```

**Structure Decision**: FSD (Feature-Sliced Design) with components in `src/shared/ui/` layer. Tests co-located in `__tests__/` subdirectory.

## Design Source Reference

All styling values extracted from `assets/aistudio/v3/shared/ui/`:

- Input.tsx, Textarea.tsx, Badge.tsx, Typography.tsx, Card.tsx

See [research.md](./research.md) for extracted patterns.

## Complexity Tracking

No constitutional violations. All checks pass.
