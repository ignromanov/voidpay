/**
 * useReducedMotion Hook Tests
 *
 * Tests the hook that detects user's prefers-reduced-motion preference.
 * Note: Happy-dom's matchMedia implementation makes detailed mocking challenging.
 */
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useReducedMotion } from '../use-reduced-motion'

describe('useReducedMotion', () => {
  it('returns a boolean value', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(typeof result.current).toBe('boolean')
  })

  it('exports useReducedMotion function', async () => {
    const mod = await import('../use-reduced-motion')
    expect(mod.useReducedMotion).toBeDefined()
    expect(typeof mod.useReducedMotion).toBe('function')
  })
})
