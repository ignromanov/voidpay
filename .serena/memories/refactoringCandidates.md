# Refactoring Candidates

**Last Updated**: 2025-12-01
**Purpose**: Technical debt log for code that should move to lower FSD layers
**Rule**: Log when you spot code in upper layers that should sink down

---

## How to Log

When you find code that should be refactored:

```markdown
## [Current Location] → [Target Layer]

**Current**: `path/to/current/file.ts`
**Should Be**: `path/to/target/file.ts`
**Reason**: [Why it should move - used by N features, generic utility, etc.]
**Priority**: Low | Medium | High
**Blocked By**: [None | Feature X must be completed first]
```

---

## Candidates

### None Currently

Project is young, FSD structure was established early. Monitor as codebase grows.

---

## Common Patterns to Watch

### Move to `shared/lib/`

- Utility functions used by 2+ features
- Formatters (currency, date, address)
- Validation helpers
- Type guards

### Move to `entities/`

- Business logic duplicated across features
- Domain types used everywhere
- Store slices with shared state

### Move to `shared/ui/`

- UI components duplicated in features
- Styling patterns repeated 3+ times
- Animation presets

---

## Review Triggers

Check this list when:

1. Starting a new feature (might reuse existing candidates)
2. Completing a feature (might have created new candidates)
3. During code review (spot cross-cutting concerns)
4. Sprint planning (allocate refactoring time)

---

## Priority Guidelines

| Priority   | Criteria                            | Action                  |
| ---------- | ----------------------------------- | ----------------------- |
| **High**   | Blocking new features, causing bugs | Refactor immediately    |
| **Medium** | Code smell, 3+ duplications         | Schedule in next sprint |
| **Low**    | Minor improvement, 2 duplications   | Add to backlog          |
