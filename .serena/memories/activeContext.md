# Active Context

**Last Updated**: 2025-12-01
**Current Session**: Memory Bank v2.1 Setup — COMPLETE

## Completed This Session

### Memory Bank v2.1 Updates

1. **userPreferences.md** — Personal coding style rules (Meta-Learning)
   - Type vs Interface rules, no `any`, named exports only
   - Library preferences (date-fns, not moment)
   - Naming conventions
   - **Learning Log**: When user corrects → add rule here

2. **dataFlow.md** — State Topology & Store Ownership
   - Maps all Zustand stores
   - Defines which slices can write to each store
   - Prevents prop drilling and duplicate stores
   - ⚠️ Found: duplicate `useCreatorStore` (entities/user vs entities/creator)

3. **CLAUDE.md Updated**:
   - Operational Loop now has **7 steps** (added VALIDATE)
   - **Step 5: VALIDATE** — Run `pnpm type-check` + `pnpm lint`, fix before reporting success
   - **Meta-Learning Protocol** — When corrected, add rule to userPreferences.md
   - New anti-patterns for state and style compliance

### Memory Bank Structure (13 files total)

**Context Files (6)**

- `activeContext` — Current session state
- `productContext` — Project "Why"
- `systemPatterns` — Architecture "How"
- `techContext` — Dependencies "What"
- `progress` — Roadmap status
- `userPreferences` — **NEW** Personal coding style rules

**Architecture Registries (5)**

- `fsdRegistry` — FSD slice registry
- `sharedUiIndex` — UI Design System catalog
- `dataFlow` — **NEW** State topology & store ownership
- `specDrift` — SpecKit deviation log
- `refactoringCandidates` — Technical debt tracker

**Feature-Specific (2)**

- `008-wagmi-rainbowkit-implementation`
- `binary-codec-optimization`

## Operational Loop v2

```
1. SYNC       → Read activeContext.md + userPreferences.md
2. SPEC       → Find SpecKit definition
3. ARCHITECT  → Consult fsdRegistry + sharedUiIndex + dataFlow
4. EXECUTE    → Write code using Serena
5. VALIDATE   → pnpm type-check + pnpm lint (FIX errors)
6. VERIFY     → Does code match Spec?
7. PERSIST    → Update memories
```

## Next Steps

1. Commit all memory changes
2. Continue with P0.8.2 (Brand & Visual Components)

## Blockers

None
