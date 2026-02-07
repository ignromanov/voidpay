/**
 * Shared mock factories for vi.mock() calls.
 *
 * Usage patterns:
 *
 * 1. Factories that don't need JSX/React — call directly in vi.mock():
 *    vi.mock('next/navigation', () => createNavigationMock())
 *
 * 2. UUID counter mock — use vi.hoisted() to get resetable reference:
 *    const uuidMock = vi.hoisted(() => createUUIDCounterMock())
 *    vi.mock('uuid', () => uuidMock)
 *    beforeEach(() => uuidMock._reset())
 */

// ---------------------------------------------------------------------------
// next/navigation — useRouter + usePathname with configurable defaults
// Consolidates mocks from: PayWorkspace.test, Navigation.test
// ---------------------------------------------------------------------------
type MockFn = (...args: unknown[]) => unknown

export function createNavigationMock(overrides?: {
  pathname?: string
  push?: MockFn
}) {
  return {
    useRouter: () => ({
      push: overrides?.push ?? (() => {}),
      replace: () => {},
      prefetch: () => {},
      back: () => {},
      forward: () => {},
      refresh: () => {},
    }),
    usePathname: () => overrides?.pathname ?? '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
  }
}

// ---------------------------------------------------------------------------
// uuid — counter mode (unique per call, resetable between tests)
// Consolidates mocks from: draftSlice.test, templateSlice.test
//
// Usage:
//   const uuidMock = vi.hoisted(() => createUUIDCounterMock())
//   vi.mock('uuid', () => uuidMock)
//   beforeEach(() => uuidMock._reset())
// ---------------------------------------------------------------------------
export function createUUIDCounterMock() {
  let counter = 0
  return {
    v4: () => `test-uuid-${++counter}`,
    _reset: () => { counter = 0 },
  }
}

// ---------------------------------------------------------------------------
// uuid — fixed mode (same value always)
// Consolidates mock from: historySlice.test
//
// Usage:
//   vi.mock('uuid', () => createUUIDFixedMock())
// ---------------------------------------------------------------------------
export function createUUIDFixedMock(value = 'test-uuid-1234') {
  return { v4: () => value }
}
