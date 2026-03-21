import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave, useAutoSaveWithManual } from '../auto-save'

// ── Mock creator store ────────────────────────────────────────────────────────

const mockUpdateDraft = vi.fn()

vi.mock('@/entities/creator', () => ({
  useCreatorStore: vi.fn((selector: (s: { updateDraft: typeof mockUpdateDraft }) => unknown) =>
    selector({ updateDraft: mockUpdateDraft }),
  ),
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('does not call updateDraft immediately on autoSave', () => {
    const { result } = renderHook(() => useAutoSave())

    act(() => {
      result.current.autoSave({ invoiceId: 'INV-001' })
    })

    expect(mockUpdateDraft).not.toHaveBeenCalled()
  })

  it('calls updateDraft after 500ms debounce', () => {
    const { result } = renderHook(() => useAutoSave())

    act(() => {
      result.current.autoSave({ invoiceId: 'INV-001' })
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(mockUpdateDraft).toHaveBeenCalledWith({ invoiceId: 'INV-001' })
    expect(mockUpdateDraft).toHaveBeenCalledTimes(1)
  })

  it('debounces rapid successive calls — only saves once', () => {
    const { result } = renderHook(() => useAutoSave())

    act(() => {
      result.current.autoSave({ invoiceId: 'INV-001' })
      result.current.autoSave({ invoiceId: 'INV-002' })
      result.current.autoSave({ invoiceId: 'INV-003' })
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(mockUpdateDraft).toHaveBeenCalledTimes(1)
    expect(mockUpdateDraft).toHaveBeenCalledWith({ invoiceId: 'INV-003' })
  })

  it('does not fire on leading edge (leading: false)', () => {
    const { result } = renderHook(() => useAutoSave())

    act(() => {
      result.current.autoSave({ invoiceId: 'INV-001' })
    })

    // Even at t=0 nothing should have been called
    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(mockUpdateDraft).not.toHaveBeenCalled()
  })

  it('isPending returns true while debounce is active', () => {
    const { result } = renderHook(() => useAutoSave())

    act(() => {
      result.current.autoSave({ invoiceId: 'INV-001' })
    })

    expect(result.current.isPending()).toBe(true)
  })

  it('isPending returns false after debounce fires', () => {
    const { result } = renderHook(() => useAutoSave())

    act(() => {
      result.current.autoSave({ invoiceId: 'INV-001' })
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current.isPending()).toBe(false)
  })

  it('cancel() prevents the debounced save from firing', () => {
    const { result } = renderHook(() => useAutoSave())

    act(() => {
      result.current.autoSave({ invoiceId: 'INV-001' })
      result.current.cancel()
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(mockUpdateDraft).not.toHaveBeenCalled()
  })

  it('flush() triggers the pending save immediately', () => {
    const { result } = renderHook(() => useAutoSave())

    act(() => {
      result.current.autoSave({ invoiceId: 'INV-001' })
      result.current.flush()
    })

    expect(mockUpdateDraft).toHaveBeenCalledWith({ invoiceId: 'INV-001' })
    expect(mockUpdateDraft).toHaveBeenCalledTimes(1)
  })

  it('returns autoSave, isPending, cancel and flush', () => {
    const { result } = renderHook(() => useAutoSave())

    expect(typeof result.current.autoSave).toBe('function')
    expect(typeof result.current.isPending).toBe('function')
    expect(typeof result.current.cancel).toBe('function')
    expect(typeof result.current.flush).toBe('function')
  })
})

describe('useAutoSaveWithManual', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('saveNow flushes pending debounced saves', () => {
    const { result } = renderHook(() => useAutoSaveWithManual())

    act(() => {
      result.current.autoSave({ invoiceId: 'INV-001' })
      result.current.saveNow()
    })

    expect(mockUpdateDraft).toHaveBeenCalledWith({ invoiceId: 'INV-001' })
  })

  it('saveNow saves provided data immediately without waiting for debounce', () => {
    const { result } = renderHook(() => useAutoSaveWithManual())

    act(() => {
      result.current.saveNow({ invoiceId: 'INV-MANUAL' })
    })

    expect(mockUpdateDraft).toHaveBeenCalledWith({ invoiceId: 'INV-MANUAL' })
  })

  it('saveNow without data only flushes — does not call updateDraft with undefined', () => {
    const { result } = renderHook(() => useAutoSaveWithManual())

    act(() => {
      result.current.saveNow()
    })

    // No pending save and no data provided → updateDraft not called
    expect(mockUpdateDraft).not.toHaveBeenCalled()
  })

  it('exposes autoSave, saveNow, and isPending', () => {
    const { result } = renderHook(() => useAutoSaveWithManual())

    expect(typeof result.current.autoSave).toBe('function')
    expect(typeof result.current.saveNow).toBe('function')
    expect(typeof result.current.isPending).toBe('function')
  })
})
