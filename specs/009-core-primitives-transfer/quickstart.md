# Quickstart: Core UI Primitives Transfer (009)

**Generated**: 2025-11-28

## Prerequisites

- Node.js 20+ (check with `node -v`)
- pnpm installed
- Worktree active: `worktrees/009-core-primitives-transfer/`

## Quick Commands

```bash
# Navigate to worktree
cd worktrees/009-core-primitives-transfer

# Install dependencies (if needed)
pnpm install

# Run tests in watch mode
pnpm test:watch

# Run all tests with coverage
pnpm test:coverage

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Component Files to Create

| File                           | Description                        |
| ------------------------------ | ---------------------------------- |
| `src/shared/ui/input.tsx`      | Input component with CVA variants  |
| `src/shared/ui/textarea.tsx`   | Textarea component                 |
| `src/shared/ui/badge.tsx`      | Badge component with 4 variants    |
| `src/shared/ui/typography.tsx` | Heading and Text components        |
| `src/shared/ui/card.tsx`       | Extend with glass variant (MODIFY) |

## Test Files to Create

| File                                          | Coverage Target |
| --------------------------------------------- | --------------- |
| `src/shared/ui/__tests__/input.test.tsx`      | 80%+            |
| `src/shared/ui/__tests__/textarea.test.tsx`   | 80%+            |
| `src/shared/ui/__tests__/badge.test.tsx`      | 80%+            |
| `src/shared/ui/__tests__/typography.test.tsx` | 80%+            |
| `src/shared/ui/__tests__/card.test.tsx`       | 80%+            |

## TDD Workflow (Constitutional Principle XVI)

```
1. Write failing test (RED)
2. Implement minimum code to pass (GREEN)
3. Refactor if needed (REFACTOR)
4. Repeat
```

## Design Source Reference

```bash
# View design source components
ls assets/aistudio/v3/shared/ui/
# Input.tsx, Textarea.tsx, Badge.tsx, Typography.tsx, Card.tsx
```

## Component Import Pattern

```typescript
// After implementation, components can be used as:
import { Input, Textarea, Badge, Heading, Text, Card } from '@/shared/ui';

// With variants
<Badge variant="success">Paid</Badge>
<Heading variant="h1">Invoice #001</Heading>
<Text variant="small" mono>0x1234...5678</Text>
<Card variant="glass">Content</Card>
```

## Acceptance Criteria Checklist

- [ ] All 5 component types implemented
- [ ] CVA pattern used for all variants
- [ ] 80%+ test coverage achieved
- [ ] Type-check passes (`pnpm type-check`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Card backward compatibility verified
- [ ] Accessibility attributes present (labels, ARIA)
