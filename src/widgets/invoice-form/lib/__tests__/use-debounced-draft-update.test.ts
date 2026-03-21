/**
 * useDebouncedDraftUpdate hook tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCreatorStore } from '@/entities/creator'
import { useDebouncedDraftUpdate } from '../use-debounced-draft-update'

describe('useDebouncedDraftUpdate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useCreatorStore.setState({
      activeDraft: null,
      draftSyncStatus: 'idle',
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.runAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns a function', () => {
    const { result } = renderHook(() => useDebouncedDraftUpdate())
    expect(typeof result.current).toBe('function')
  })

  it('calls storeUpdateDraft immediately when updateDraft is invoked', () => {
    const updateDraft = vi.fn()
    useCreatorStore.setState({ updateDraft })

    const { result } = renderHook(() => useDebouncedDraftUpdate())

    act(() => {
      result.current({ invoiceId: 'INV-001' })
    })

    expect(updateDraft).toHaveBeenCalledWith({ invoiceId: 'INV-001' })
  })

  it('sets sync status to "syncing" immediately', () => {
    const setDraftSyncStatus = vi.fn()
    useCreatorStore.setState({ setDraftSyncStatus })

    const { result } = renderHook(() => useDebouncedDraftUpdate())

    act(() => {
      result.current({ invoiceId: 'INV-001' })
    })

    expect(setDraftSyncStatus).toHaveBeenCalledWith('syncing')
  })

  it('sets sync status to "synced" after 500ms of inactivity', () => {
    const setDraftSyncStatus = vi.fn()
    useCreatorStore.setState({ setDraftSyncStatus })

    const { result } = renderHook(() => useDebouncedDraftUpdate())

    act(() => {
      result.current({ invoiceId: 'INV-001' })
    })

    // Not yet synced
    expect(setDraftSyncStatus).not.toHaveBeenCalledWith('synced')

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(setDraftSyncStatus).toHaveBeenCalledWith('synced')
  })

  it('sets sync status to "idle" after 2500ms total (500 + 2000)', () => {
    const setDraftSyncStatus = vi.fn()
    useCreatorStore.setState({ setDraftSyncStatus })

    const { result } = renderHook(() => useDebouncedDraftUpdate())

    act(() => {
      result.current({ invoiceId: 'INV-001' })
    })

    act(() => {
      vi.advanceTimersByTime(2500)
    })

    expect(setDraftSyncStatus).toHaveBeenCalledWith('idle')
  })

  it('resets debounce when called multiple times in quick succession', () => {
    const setDraftSyncStatus = vi.fn()
    useCreatorStore.setState({ setDraftSyncStatus })

    const { result } = renderHook(() => useDebouncedDraftUpdate())

    act(() => {
      result.current({ invoiceId: 'INV-001' })
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Call again before debounce completes
    act(() => {
      result.current({ invoiceId: 'INV-002' })
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    // 300ms after second call — should not be "synced" yet
    expect(setDraftSyncStatus).not.toHaveBeenCalledWith('synced')

    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Now 500ms after second call — should be synced
    expect(setDraftSyncStatus).toHaveBeenCalledWith('synced')
  })

  it('calls updateDraft with each set of updates', () => {
    const updateDraft = vi.fn()
    useCreatorStore.setState({ updateDraft })

    const { result } = renderHook(() => useDebouncedDraftUpdate())

    act(() => {
      result.current({ invoiceId: 'INV-001' })
      result.current({ notes: 'Updated note' })
    })

    expect(updateDraft).toHaveBeenCalledTimes(2)
    expect(updateDraft).toHaveBeenNthCalledWith(1, { invoiceId: 'INV-001' })
    expect(updateDraft).toHaveBeenNthCalledWith(2, { notes: 'Updated note' })
  })

  it('clears pending timers on unmount', () => {
    const setDraftSyncStatus = vi.fn()
    useCreatorStore.setState({ setDraftSyncStatus })

    const { result, unmount } = renderHook(() => useDebouncedDraftUpdate())

    act(() => {
      result.current({ invoiceId: 'INV-001' })
    })

    unmount()

    // Advance past debounce — should not call "synced" after unmount
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(setDraftSyncStatus).not.toHaveBeenCalledWith('synced')
  })
})
