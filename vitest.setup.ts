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
// HOISTED MOCKS - Run before any imports
// ============================================================================

/**
 * Mock window.matchMedia for prefers-reduced-motion
 * Must be hoisted because some libraries read it on import
 *
 * @see https://rebeccamdeprey.com/blog/mock-windowmatchmedia-in-vitest
 */
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
 */
beforeAll(() => {
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
