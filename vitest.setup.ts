import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, vi } from 'vitest'

// Mock React useId for deterministic snapshots
let idCounter = 0
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useId: () => `:r${(idCounter++).toString(16)}:`,
  }
})

// Reset ID counter before each test for consistent snapshots
beforeEach(() => {
  idCounter = 0
})

// Runs a cleanup after each test case (e.g. clearing DOM)
afterEach(() => {
  cleanup()
})

// Mock pointer capture methods for Radix UI components (happy-dom compatibility)
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
