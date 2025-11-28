# Research: Testing Environment Setup

**Feature**: 005-testing-environment | **Date**: 2025-11-28

## Key Decisions

### 1. Vitest Configuration for Next.js 16+

**Decision**: Use `vitest.config.ts` with `@vitejs/plugin-react` and `jsdom` environment

**Rationale**:

- Official Next.js docs recommend Vitest ([nextjs.org/docs/testing/vitest](https://nextjs.org/docs/app/guides/testing/vitest))
- Vitest provides same API as Jest but runs faster (native Vite integration)
- Next.js 16 uses Turbopack by default; Vitest works alongside it for testing

**Alternatives Rejected**:

- Jest: Slower, requires more configuration for ESM/TypeScript
- `@next/test` utilities: Limited to RSC testing, not component testing

**Configuration**:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: { global: { lines: 80, branches: 80, functions: 80, statements: 80 } },
    },
  },
})
```

**Sources**: [Next.js Vitest Guide](https://nextjs.org/docs/app/guides/testing/vitest), [Vitest Getting Started](https://vitest.dev/guide/)

---

### 2. @testing-library/react Setup

**Decision**: Use `@testing-library/react` with `@testing-library/jest-dom/vitest` for DOM matchers

**Rationale**:

- v6 of @testing-library/jest-dom provides native Vitest support
- `cleanup()` called automatically after each test
- Standard in React ecosystem, well-documented

**Setup File**:

```typescript
// vitest.setup.ts
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(() => cleanup())
```

**Sources**: [Testing Library Setup](https://testing-library.com/docs/react-testing-library/setup/), [Vitest React Testing](https://dev.to/pacheco/configure-vitest-with-react-testing-library-5cbb)

---

### 3. Husky 9 + lint-staged with pnpm

**Decision**: Use Husky 9.x for git hooks, lint-staged 15.x for staged file processing

**Rationale**:

- Husky 9 is the latest stable version with improved pnpm support
- lint-staged only processes staged files (fast pre-commit)
- Modern setup uses `npx husky init` (simplified from older versions)

**Installation**:

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

**Configuration** (`package.json`):

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

**Hooks**:

- `.husky/pre-commit`: `pnpm lint-staged`
- `.husky/pre-push`: `pnpm test:coverage`

**Sources**: [Husky Get Started](https://typicode.github.io/husky/get-started.html), [lint-staged npm](https://www.npmjs.com/package/lint-staged)

---

### 4. @wagmi/connectors Mock for Web3 Testing

**Decision**: Use `mock` connector from `@wagmi/connectors` for wallet interactions

**Rationale**:

- Official Wagmi solution - designed for testing
- Supports simulating: connection, signing, chain switching, errors
- No additional dependencies beyond existing Wagmi stack

**Configuration**:

```typescript
// src/shared/test-utils/wagmi-mock.ts
import { createConfig, http } from '@wagmi/core'
import { mainnet, arbitrum, optimism, polygon } from '@wagmi/core/chains'
import { mock } from '@wagmi/connectors'

export const mockConfig = createConfig({
  chains: [mainnet, arbitrum, optimism, polygon],
  connectors: [
    mock({
      accounts: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
      features: { reconnect: true },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
})
```

**Sources**: [Wagmi Mock Connector](https://wagmi.sh/core/api/connectors/mock)

---

### 5. Coverage Threshold Enforcement

**Decision**: 80% threshold for lines, branches, functions, statements (Constitutional Principle XVI)

**Rationale**:

- Constitution mandates 80% minimum coverage
- Vitest's v8 provider is fastest for coverage
- HTML reporter for local debugging, text for CI output

**Configuration**:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html'],
  reportsDirectory: './coverage',
  exclude: ['node_modules/', '.next/', 'coverage/', '*.config.*'],
  thresholds: {
    global: { lines: 80, branches: 80, functions: 80, statements: 80 }
  }
}
```

---

### 6. TypeScript Type Checking in Pre-commit

**Decision**: Run `tsc --noEmit` on full project (not just staged files)

**Rationale**:

- TypeScript cannot type-check individual files in isolation
- Staged file might break imports elsewhere
- Fast enough for pre-commit (~2-5s on this project size)

**lint-staged config**:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix"],
    "*.{ts,tsx,json,md}": ["prettier --write"]
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

**Pre-commit hook**:

```bash
pnpm lint-staged && pnpm typecheck
```

---

## Dependencies Summary

| Package                   | Version | Purpose                 |
| ------------------------- | ------- | ----------------------- |
| vitest                    | ^3.0.0  | Test runner             |
| @vitejs/plugin-react      | ^4.0.0  | React support in Vitest |
| @testing-library/react    | ^16.0.0 | Component testing       |
| @testing-library/jest-dom | ^6.0.0  | DOM matchers            |
| jsdom                     | ^25.0.0 | Browser environment     |
| vite-tsconfig-paths       | ^5.0.0  | Path alias support      |
| husky                     | ^9.0.0  | Git hooks               |
| lint-staged               | ^15.0.0 | Staged file processing  |
| @vitest/coverage-v8       | ^3.0.0  | Coverage reporting      |

---

## Async Server Components Note

Vitest currently does not support async Server Components. Use E2E tests (Playwright) for RSC testing. This feature focuses on unit/component tests for client components and shared utilities.
