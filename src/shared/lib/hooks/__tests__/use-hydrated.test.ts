import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHydrated } from '../use-hydrated'

describe('useHydrated', () => {
  it('returns true on client after hydration', () => {
    const { result } = renderHook(() => useHydrated())
    expect(result.current).toBe(true)
  })
})
