/**
 * Vitest Global Setup
 *
 * This file runs BEFORE all tests.
 *
 * Mock strategy:
 * - framer-motion: via alias in vitest.config.ts → __mocks__/framer-motion.tsx
 * - React.useId: via vi.mock in this file
 * - matchMedia: via vi.hoisted in this file
 *
 * @see https://vitest.dev/guide/mocking.html
 */
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, vi } from 'vitest'

// ============================================================================
// JEST COMPAT SHIM
// RTL's waitFor detects fake timers via `typeof jest !== 'undefined'` and then
// calls `jest.advanceTimersByTime()`. Without this shim, waitFor hangs when
// vi.useFakeTimers() is active because RTL falls back to real setInterval (also faked).
// @see https://github.com/testing-library/dom-testing-library/blob/main/src/wait-for.ts
// ============================================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).jest = vi

// ============================================================================
// HOISTED MOCKS - Run before any imports
// ============================================================================

/**
 * Mock environment variables for Web3 configuration
 * Must be set before any imports that read process.env
 */
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-project-id'
  process.env.NEXT_PUBLIC_ENABLE_TESTNETS = 'false'
})

/**
 * Mock window.matchMedia for prefers-reduced-motion
 * Must be hoisted because some libraries read it on import
 *
 * Note: happy-dom creates its own window object, so we need to mock both
 * globalThis AND window. The vi.hoisted runs before happy-dom sets up window,
 * so we also apply the mock in beforeAll.
 *
 * @see https://rebeccamdeprey.com/blog/mock-windowmatchmedia-in-vitest
 */
const createMatchMediaMock = () => (query: string) => ({
  matches: query === '(prefers-reduced-motion: reduce)',
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})

vi.hoisted(() => {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })

  /**
   * Mock localStorage and sessionStorage for Wagmi storage layer
   * Wagmi's createStorage expects storage.setItem/getItem as functions
   */
  const createStorageMock = () => {
    const store = new Map<string, string>()
    return {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      get length() {
        return store.size
      },
      key: (index: number) => Array.from(store.keys())[index] ?? null,
    }
  }

  Object.defineProperty(globalThis, 'localStorage', {
    writable: true,
    value: createStorageMock(),
  })

  Object.defineProperty(globalThis, 'sessionStorage', {
    writable: true,
    value: createStorageMock(),
  })

  /**
   * Mock indexedDB for Web3Modal/WalletConnect
   */
  Object.defineProperty(globalThis, 'indexedDB', {
    writable: true,
    value: {
      open: () => ({
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        result: {
          objectStoreNames: { contains: () => false },
          createObjectStore: () => ({}),
          transaction: () => ({
            objectStore: () => ({
              get: () => ({ onsuccess: null, onerror: null }),
              put: () => ({ onsuccess: null, onerror: null }),
              delete: () => ({ onsuccess: null, onerror: null }),
            }),
          }),
        },
      }),
      deleteDatabase: () => ({ onsuccess: null, onerror: null }),
    },
  })
})

// ============================================================================
// MODULE MOCKS
// ============================================================================

/**
 * Mock React.useId for deterministic snapshot testing
 *
 * React's useId generates unique IDs like ":r0:", ":r1:" based on component tree.
 * In CI, test execution order differs, causing snapshot mismatches.
 * Using a STATIC ID eliminates this variability.
 *
 * @see https://4markdown.com/how-to-stabilize-useid-testing-with-global-mocking/
 */
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useId: () => 'test-id',
  }
})

/**
 * Mock our wrapper hook for consistency
 */
vi.mock('@/shared/ui/hooks/use-reduced-motion', () => ({
  useReducedMotion: () => true,
}))

// ============================================================================
// SNAPSHOT SERIALIZERS
// ============================================================================

/**
 * Stabilize Radix UI auto-generated IDs in snapshot tests.
 * Radix generates incremental IDs (radix-_r_XX_) that shift when component
 * tree order changes (e.g., adding a new network to a select).
 * This serializer replaces them with a stable placeholder.
 */
expect.addSnapshotSerializer({
  test: (val) => typeof val === 'string' && /radix-_r_\w+/.test(val),
  serialize: (val) =>
    `"${(val as string).replace(/radix-_r_\w+/g, 'radix-test')}"`,
})

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

/**
 * Runs a cleanup after each test case (e.g. clearing DOM)
 */
afterEach(() => {
  cleanup()
})

/**
 * Reset all mocks before each test to ensure clean state
 */
beforeEach(() => {
  vi.clearAllMocks()
})

/**
 * Mock pointer capture methods for Radix UI components (happy-dom compatibility)
 * Also apply matchMedia mock to window (happy-dom creates its own window after vi.hoisted)
 */
beforeAll(() => {
  // Apply matchMedia mock to window (happy-dom's window, not globalThis)
  // happy-dom's matchMedia exists but returns null for queries, causing
  // "Cannot read properties of null (reading 'matches')" errors
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: createMatchMediaMock(),
    })
  }

  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
})
