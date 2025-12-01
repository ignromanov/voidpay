---
description: Audit Memory Bank integrity. Run before commit/PR or when user says "Audit Memory".
---

# MEMORY INTEGRITY AUDIT PROTOCOL

**ROLE:** You are the **Memory Auditor**. Ensure the "Map" (Memory Bank) matches the "Territory" (Codebase & Conversation).

---

## STEP 1: THE DELTA CHECK

Analyze conversation history and file modifications. For each "YES" answer, update the corresponding memory.

### 1. FSD Structure Check
**Question:** Did we create, rename, or delete any Entity, Feature, Widget, or Page?
**Target:** `fsdRegistry`
**Action:**
```
mcp__serena__read_memory → fsdRegistry
```
- Update registry entries
- Ensure `Public API` exports match `index.ts`
- Verify strict layer compliance (no cross-feature imports)

### 2. UI Registry Check
**Question:** Did we modify `shared/ui` or create a component that *should* be shared?
**Target:** `sharedUiIndex`
**Action:**
```
mcp__serena__read_memory → sharedUiIndex
```
- Add new component with import path, props, variants
- Remove deprecated components

### 3. Spec Compliance Check
**Question:** Did implementation deliberately contradict SpecKit due to technical constraints?
**Target:** `specDrift`
**Action:**
```
mcp__serena__read_memory → specDrift
```
- Log: Feature, Spec location, Expected vs Actual, Reason, Impact

### 4. Knowledge Check (Meta-Learning)
**Question:** Did user correct my coding style, library choice, or behavior?
**Target:** `userPreferences`
**Action:**
```
mcp__serena__read_memory → userPreferences
```
- Crystallize feedback into permanent rule
- Add to Learning Log with date

### 5. Architecture Check
**Question:** Did we introduce a new Store, Context, or complex data relationship?
**Target:** `dataFlow`
**Action:**
```
mcp__serena__read_memory → dataFlow
```
- Map new store with location, persistence, purpose
- Define Write Access (which slices can write)

### 6. Context Snapshot
**Question:** Does `activeContext` reflect the END of this session?
**Target:** `activeContext` + `progress`
**Action:**
```
mcp__serena__read_memory → activeContext
mcp__serena__read_memory → progress
```
- Mark completed steps
- Clear done "Next Steps"
- Define starting point for next session
- Update progress roadmap if feature completed

---

## STEP 2: EXECUTION

For each "YES" identified:

1. **Read** current memory content (don't overwrite blindly):
   ```
   mcp__serena__read_memory(memory_file_name)
   ```

2. **Update** using edit_memory (surgical) or write_memory (replace):
   ```
   mcp__serena__edit_memory(memory_file_name, needle, repl, mode)
   ```

3. **Report** to user:
   ```
   Memory Audit Complete.
   Updated: [list of files]
   No changes needed: [list of files]
   ```

---

## STEP 3: REFACTORING FLAG

**Question:** Did I write code in `features/` that feels generic (used by 3+ places)?
**Target:** `refactoringCandidates`
**Action:**
```
mcp__serena__edit_memory → refactoringCandidates
```
- Add entry: Current location → Target layer (shared/entities)
- Set Priority: Low/Medium/High

---

## STEP 4: VALIDATION

Run compiler checks on changed files:
```bash
pnpm type-check
pnpm lint
```

If errors exist, fix them BEFORE completing audit.

---

## OUTPUT FORMAT

```markdown
## Memory Audit Report

### Delta Analysis
| Check | Status | Action |
|-------|--------|--------|
| FSD Structure | YES/NO | Updated fsdRegistry / No changes |
| UI Registry | YES/NO | Added Button to sharedUiIndex / No changes |
| Spec Compliance | YES/NO | Logged deviation / No changes |
| User Preferences | YES/NO | Added rule: "..." / No changes |
| Data Flow | YES/NO | Added useNewStore / No changes |
| Context Snapshot | YES/NO | Updated activeContext / No changes |
| Refactoring | YES/NO | Flagged formatCurrency → shared | No changes |

### Updated Memories
- `fsdRegistry` — Added features/new-feature
- `activeContext` — Marked P0.8.2 complete

### Validation
- TypeScript: PASS/FAIL
- ESLint: PASS/FAIL

### Next Session Starting Point
[Brief description of where to continue]
```
