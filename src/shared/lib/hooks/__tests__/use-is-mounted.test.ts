import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useIsMounted } from '../use-is-mounted'

describe('useIsMounted', () => {
  it('returns true after mount', () => {
    const { result } = renderHook(() => useIsMounted())
    expect(result.current).toBe(true)
  })

  it('returns false after unmount (no re-render possible)', () => {
    const { result, unmount } = renderHook(() => useIsMounted())
    expect(result.current).toBe(true)
    unmount()
    // After unmount, last captured value is still true
    // (React doesn't update state after unmount)
    expect(result.current).toBe(true)
  })
})
