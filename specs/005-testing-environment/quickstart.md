# Quickstart: Testing Environment

**Feature**: 005-testing-environment | **Date**: 2025-11-28

## Prerequisites

- Node.js 20+ (check with `node -v`)
- pnpm 8+ (check with `pnpm -v`)
- Git repository initialized

## Setup (After Feature Merge)

```bash
# 1. Install dependencies (Husky auto-initializes via "prepare" script)
pnpm install

# 2. Verify hooks are installed
ls -la .husky/

# 3. Run tests to verify setup
pnpm test
```

## Daily Usage

### Running Tests

```bash
# Run all tests once
pnpm test

# Watch mode (TDD workflow)
pnpm test:watch

# Coverage report
pnpm test:coverage

# Interactive UI (optional)
pnpm test:ui
```

### TDD Workflow (Red → Green → Refactor)

1. **Red**: Write failing test first

   ```bash
   pnpm test:watch  # Start watch mode
   # Write test in src/features/foo/__tests__/foo.test.ts
   # See test fail (RED)
   ```

2. **Green**: Implement minimal code to pass

   ```bash
   # Edit src/features/foo/foo.ts
   # See test pass (GREEN)
   ```

3. **Refactor**: Clean up while tests stay green
   ```bash
   # Refactor code
   # Tests auto-run and stay GREEN
   ```

### Committing Code

```bash
# Stage changes
git add .

# Commit (pre-commit hook auto-runs)
git commit -m "feat: add invoice validation"
# → Runs: lint-staged + typecheck
# → Blocks if lint/type errors found
```

### Pushing Code

```bash
git push
# → Runs: full test suite with coverage
# → Blocks if tests fail OR coverage < 80%
```

## Test File Locations

```text
src/
├── entities/invoice/__tests__/
│   ├── schema.test.ts           # Unit tests
│   └── schema.test.ts.snap      # Snapshots
├── features/create-invoice/__tests__/
│   └── CreateInvoiceForm.test.tsx  # Component tests
└── shared/lib/__tests__/
    └── url-codec.test.ts        # Utility tests
```

## Writing Tests

### Unit Test Example

```typescript
// src/shared/lib/__tests__/url-codec.test.ts
import { describe, it, expect } from 'vitest'
import { encodeInvoice, decodeInvoice } from '../url-codec'

describe('URL Codec', () => {
  it('should round-trip encode/decode invoice', () => {
    const invoice = { v: 1, id: 'INV-001' /* ... */ }
    const encoded = encodeInvoice(invoice)
    const decoded = decodeInvoice(encoded)
    expect(decoded).toEqual(invoice)
  })
})
```

### Snapshot Test Example

```typescript
// src/entities/invoice/__tests__/schema.test.ts
import { describe, it, expect } from 'vitest'
import { encodeInvoice } from '@/shared/lib/url-codec'

describe('Invoice Schema v1', () => {
  it('should match encoding snapshot', () => {
    const invoice = { v: 1, id: 'INV-001' /* ... */ }
    expect(encodeInvoice(invoice)).toMatchSnapshot()
  })
})
```

### Component Test Example

```typescript
// src/features/create-invoice/__tests__/CreateInvoiceForm.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/shared/test-utils'
import { CreateInvoiceForm } from '../CreateInvoiceForm'

describe('CreateInvoiceForm', () => {
  it('should render form fields', () => {
    render(<CreateInvoiceForm />)
    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument()
  })
})
```

### Web3 Mock Test Example

```typescript
// src/features/payment/__tests__/PaymentFlow.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/shared/test-utils'
import { PaymentFlow } from '../PaymentFlow'

describe('PaymentFlow', () => {
  it('should display wallet connection button', () => {
    render(<PaymentFlow invoice={mockInvoice} />)
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
  })
})
```

## Troubleshooting

### "Hooks not running"

```bash
# Reinstall Husky
pnpm exec husky install
```

### "Coverage below threshold"

```bash
# View detailed coverage
pnpm test:coverage
# Open coverage/index.html in browser
```

### "Snapshot mismatch"

```bash
# Update snapshots (review changes carefully!)
pnpm test -- -u
```

### "Type errors in tests"

Ensure `vitest/globals` is in tsconfig:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```
