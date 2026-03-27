import { describe, it, expect, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHashFragment } from '../use-hash-fragment'

describe('useHashFragment', () => {
  afterEach(() => {
    window.location.hash = ''
  })

  it('returns empty string when no hash is set', () => {
    window.location.hash = ''
    const { result } = renderHook(() => useHashFragment())
    expect(result.current).toBe('')
  })

  it('returns hash without leading #', () => {
    window.location.hash = '#N4IgbghgTg9g'
    const { result } = renderHook(() => useHashFragment())
    expect(result.current).toBe('N4IgbghgTg9g')
  })

  it('updates when hash changes', () => {
    window.location.hash = '#initial'
    const { result } = renderHook(() => useHashFragment())
    expect(result.current).toBe('initial')

    act(() => {
      window.location.hash = '#updated'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    expect(result.current).toBe('updated')
  })
})
