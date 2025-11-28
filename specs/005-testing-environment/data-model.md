# Data Model: Testing Environment Configuration

**Feature**: 005-testing-environment | **Date**: 2025-11-28

> Note: This feature is infrastructure/configuration focused. "Data model" here refers to configuration schemas rather than application entities.

## Configuration Schemas

### 1. Vitest Configuration Schema

**File**: `vitest.config.ts`

```typescript
interface VitestConfig {
  plugins: VitePlugin[] // [@vitejs/plugin-react, vite-tsconfig-paths]
  test: {
    environment: 'jsdom' // Browser environment for React
    globals: boolean // true - enables describe/it without imports
    setupFiles: string[] // ['./vitest.setup.ts']
    include: string[] // ['src/**/*.{test,spec}.{ts,tsx}']
    exclude: string[] // ['node_modules', '.next']
    coverage: CoverageConfig
  }
}

interface CoverageConfig {
  provider: 'v8' // Fastest coverage provider
  reporter: ('text' | 'html')[] // ['text', 'html']
  reportsDirectory: string // './coverage'
  exclude: string[] // Files to exclude from coverage
  thresholds: {
    global: {
      lines: 80 // Constitutional requirement
      branches: 80
      functions: 80
      statements: 80
    }
  }
}
```

### 2. lint-staged Configuration Schema

**Location**: `package.json` → `"lint-staged"` field

```typescript
interface LintStagedConfig {
  '*.{ts,tsx}': string[] // ['eslint --fix']
  '*.{ts,tsx,json,md}': string[] // ['prettier --write']
}
```

### 3. Husky Hook Schemas

**Files**: `.husky/pre-commit`, `.husky/pre-push`

```bash
# .husky/pre-commit
pnpm lint-staged && pnpm typecheck

# .husky/pre-push
pnpm test:coverage
```

### 4. Test Utilities Types

**File**: `src/shared/test-utils/types.ts`

```typescript
// Custom render options extending RTL options
interface CustomRenderOptions extends RenderOptions {
  wagmiConfig?: Config // Optional mock Wagmi config
  queryClient?: QueryClient // Optional TanStack Query client
  initialRoute?: string // Optional initial route for router
}

// Mock RPC response types
interface MockRPCResponse<T = unknown> {
  jsonrpc: '2.0'
  id: number
  result: T
}

interface MockBalance {
  balance: bigint
  symbol: string
  decimals: number
}
```

## File Organization

```text
Configuration Files:
├── vitest.config.ts       # Vitest configuration
├── vitest.setup.ts        # Test setup (cleanup, matchers)
├── package.json           # Scripts + lint-staged config
└── .husky/
    ├── pre-commit         # lint-staged + typecheck
    └── pre-push           # test:coverage

Test Utilities:
└── src/shared/test-utils/
    ├── index.ts           # Re-exports
    ├── render.tsx         # Custom render with providers
    ├── wagmi-mock.ts      # Mock Wagmi config
    ├── rpc-mocks.ts       # Mock RPC responses
    └── types.ts           # TypeScript types
```

## Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "typecheck": "tsc --noEmit",
    "prepare": "husky"
  }
}
```
