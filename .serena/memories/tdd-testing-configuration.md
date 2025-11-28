# TDD Testing Configuration

> **Constitutional Principle**: XVI (TDD Discipline)
> **Status**: Configuration Guide
> **Last Updated**: 2025-11-28

## Overview

VoidPay uses Test-Driven Development (TDD) with Classic (Detroit) style: Red → Green → Refactor.
All features MUST have tests written BEFORE implementation. Merge requires 80%+ coverage.

## Tech Stack (Installed)

| Component | Package | Version |
|-----------|---------|---------|
| Test Runner | vitest | 4.0.14 |
| Coverage | @vitest/coverage-v8 | 4.0.14 |
| React Testing | @testing-library/react | 16.3.0 |
| User Events | @testing-library/user-event | 14.6.1 |
| DOM Matchers | @testing-library/jest-dom | 6.9.1 |
| Git Hooks | husky | 9.1.7 |
| Staged Files | lint-staged | 16.2.7 |

## Directory Structure

```
src/
├── features/
│   └── invoice-codec/
│       ├── __tests__/
│       │   ├── encode.test.ts
│       │   ├── decode.test.ts
│       │   └── __snapshots__/
│       │       └── encode.test.ts.snap
│       ├── encode.ts
│       └── decode.ts
├── shared/
│   └── lib/
│       └── test-utils/
│           ├── index.ts           # Barrel export
│           ├── render.tsx         # Custom render with providers
│           ├── mocks/
│           │   ├── rpc.ts         # RPC provider mocks
│           │   ├── wagmi.ts       # Wagmi hooks mocks
│           │   └── storage.ts     # LocalStorage mocks
│           └── fixtures/
│               ├── invoices.ts    # Invoice test data
│               └── networks.ts    # Network configs
```

## Configuration Files

### vitest.config.ts (Actual Implementation)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules', 'coverage', '.next', '**/*.config.*', '**/*.d.ts', '.specify/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
})
```

### vitest.setup.ts (Actual Implementation)

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})
```

**Note**: Additional mocks (localStorage, crypto, wagmi) should be added per-test as needed.

## Web3 Mocking Strategy

### RPC Mock (src/shared/lib/test-utils/mocks/rpc.ts)

```typescript
import { vi } from 'vitest';

export const mockPublicClient = {
  getBalance: vi.fn().mockResolvedValue(1000000000000000000n), // 1 ETH
  getTransaction: vi.fn().mockResolvedValue({
    hash: '0x123...',
    status: 'success',
    blockNumber: 12345678n,
  }),
  getTransactionReceipt: vi.fn().mockResolvedValue({
    status: 'success',
    blockNumber: 12345678n,
    transactionHash: '0x123...',
  }),
  readContract: vi.fn().mockImplementation(({ functionName }) => {
    switch (functionName) {
      case 'balanceOf': return 1000000n; // 1 USDC (6 decimals)
      case 'decimals': return 6;
      case 'symbol': return 'USDC';
      default: throw new Error(`Unmocked function: ${functionName}`);
    }
  }),
};

export const createMockClient = (overrides = {}) => ({
  ...mockPublicClient,
  ...overrides,
});
```

### Wagmi Mock (src/shared/lib/test-utils/mocks/wagmi.ts)

```typescript
import { vi } from 'vitest';

export const mockUseAccount = vi.fn().mockReturnValue({
  address: '0x1234567890123456789012345678901234567890',
  isConnected: true,
  isConnecting: false,
  isDisconnected: false,
});

export const mockUseChainId = vi.fn().mockReturnValue(1); // Ethereum mainnet

export const mockUseSendTransaction = vi.fn().mockReturnValue({
  sendTransaction: vi.fn(),
  data: undefined,
  isPending: false,
  isSuccess: false,
  isError: false,
});

// Mock module
vi.mock('wagmi', () => ({
  useAccount: mockUseAccount,
  useChainId: mockUseChainId,
  useSendTransaction: mockUseSendTransaction,
}));
```

## Snapshot Testing

### When to Use Snapshots

MANDATORY for:
- Schema serialization (InvoiceSchemaV1 → JSON)
- URL encoding output (lz-string compression)
- Complex object transformations

### Snapshot Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { encodeInvoice } from '../encode';
import { testInvoiceFixture } from '@/shared/lib/test-utils/fixtures/invoices';

describe('Invoice Encoding', () => {
  it('should produce consistent URL encoding', () => {
    const encoded = encodeInvoice(testInvoiceFixture);
    expect(encoded).toMatchSnapshot();
  });

  it('should handle all field types', () => {
    const result = encodeInvoice({
      ...testInvoiceFixture,
      nt: 'Test note with special chars: <>&"',
    });
    expect(result).toMatchSnapshot();
  });
});
```

### Updating Snapshots

```bash
# Review changes carefully before updating!
vitest -u

# Or update specific test file
vitest -u src/features/invoice-codec/__tests__/encode.test.ts
```

## TDD Workflow

### Task Format in tasks.md

```markdown
### Tests for User Story 1 (TDD - write FIRST) 🔴
- [ ] T010-test [US1] Unit test for invoice validation in __tests__/validate.test.ts
- [ ] T011-test [US1] Snapshot test for encoding in __tests__/encode.test.ts

### Implementation for User Story 1 (TDD - make tests PASS) 🟢
- [ ] T010-impl [US1] Implement validation (make T010-test pass)
- [ ] T011-impl [US1] Implement encoding (make T011-test pass)
```

### Cycle Rules

1. **RED**: Write failing test that defines expected behavior
2. **GREEN**: Write MINIMAL code to pass the test
3. **REFACTOR**: Improve code quality, tests must stay green
4. **REPEAT**: Next test case

## Coverage Requirements

| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| Lines | 80% | CI blocks merge |
| Branches | 80% | CI blocks merge |
| Functions | 80% | CI blocks merge |
| Statements | 80% | CI blocks merge |

### Critical Paths (100% coverage required)

- Payment verification logic
- Magic Dust generation
- Schema encoding/decoding
- URL compression/decompression

## Package.json Scripts (Actual Implementation)

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "prepare": "husky"
  }
}
```

## CI Integration (GitHub Actions)

```yaml
- name: Run Tests
  run: pnpm test:coverage

- name: Check Coverage
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "Coverage $COVERAGE% is below 80% threshold"
      exit 1
    fi
```

## WIP Commits Exception

- `[WIP]` prefix allowed in feature branches
- Merge to main requires ALL tests green + 80%+ coverage

## Common Patterns

### Testing Zustand Stores

```typescript
import { act, renderHook } from '@testing-library/react';
import { useCreatorStore } from '../store';

describe('Creator Store', () => {
  beforeEach(() => {
    useCreatorStore.getState().reset();
  });

  it('should add draft to history', () => {
    const { result } = renderHook(() => useCreatorStore());
    
    act(() => {
      result.current.saveDraft(testDraft);
    });

    expect(result.current.drafts).toHaveLength(1);
  });
});
```

### Testing Components with Providers

```typescript
import { render, screen } from '@/shared/lib/test-utils';
import { InvoicePreview } from '../InvoicePreview';

describe('InvoicePreview', () => {
  it('should display invoice total', () => {
    render(<InvoicePreview invoice={testInvoice} />);
    
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
  });
});
```

## Git Hooks (Husky + lint-staged) - Actual Implementation

### Installed Versions
- husky: 9.1.7
- lint-staged: 16.2.7

### Configuration

**.husky/pre-commit**:
```bash
pnpm lint-staged && pnpm typecheck
```

**.husky/pre-push**:
```bash
pnpm test:coverage
```

**package.json** (lint-staged config):
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,jsx,mjs,cjs}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

### Hooks Summary

| Hook | Trigger | Actions | Blocks On |
|------|---------|---------|-----------|
| pre-commit | `git commit` | lint-staged (ESLint + Prettier) | Lint errors |
| pre-push | `git push` | `pnpm test:coverage` | Test failures, coverage <80% |

### Bypass (Emergency Only)

```bash
# Skip pre-commit (NOT recommended)
git commit --no-verify -m "emergency fix"

# Skip pre-push (NOT recommended)
git push --no-verify
```

**Warning**: Bypassing hooks violates Constitutional Principle XVI. Use only for emergencies with justification.

## Related Resources

- Constitution Principle XVI: `.specify/memory/constitution.md`
- Roadmap P0.6.7: `.specify/memory/ROADMAP_P0.md`
- Test Utils: `src/shared/lib/test-utils/`
