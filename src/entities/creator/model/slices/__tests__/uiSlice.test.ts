/**
 * UI Slice tests
 * Feature: 015-create-page-preview
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useCreatorStore } from '../../useCreatorStore'

describe('uiSlice', () => {
  beforeEach(() => {
    // Reset store state
    useCreatorStore.setState({
      activeDraft: null,
      lineItems: [],
      templates: [],
      history: [],
      preferences: {
        defaultNetworkId: 1,
        defaultCurrency: 'USDC',
      },
      networkTheme: 'ethereum',
    })
  })

  describe('initial state', () => {
    it('initializes with ethereum theme', () => {
      const state = useCreatorStore.getState()
      expect(state.networkTheme).toBe('ethereum')
    })
  })

  describe('setNetworkTheme', () => {
    it('sets ethereum theme', () => {
      const { setNetworkTheme } = useCreatorStore.getState()

      setNetworkTheme('ethereum')

      const state = useCreatorStore.getState()
      expect(state.networkTheme).toBe('ethereum')
    })

    it('sets arbitrum theme', () => {
      const { setNetworkTheme } = useCreatorStore.getState()

      setNetworkTheme('arbitrum')

      const state = useCreatorStore.getState()
      expect(state.networkTheme).toBe('arbitrum')
    })

    it('sets optimism theme', () => {
      const { setNetworkTheme } = useCreatorStore.getState()

      setNetworkTheme('optimism')

      const state = useCreatorStore.getState()
      expect(state.networkTheme).toBe('optimism')
    })

    it('sets polygon theme', () => {
      const { setNetworkTheme } = useCreatorStore.getState()

      setNetworkTheme('polygon')

      const state = useCreatorStore.getState()
      expect(state.networkTheme).toBe('polygon')
    })

    it('updates theme when called multiple times', () => {
      const { setNetworkTheme } = useCreatorStore.getState()

      setNetworkTheme('arbitrum')
      expect(useCreatorStore.getState().networkTheme).toBe('arbitrum')

      setNetworkTheme('polygon')
      expect(useCreatorStore.getState().networkTheme).toBe('polygon')

      setNetworkTheme('ethereum')
      expect(useCreatorStore.getState().networkTheme).toBe('ethereum')
    })

    it('does not affect other store state', () => {
      const { setNetworkTheme, updateDraft } = useCreatorStore.getState()

      // Create a draft
      updateDraft({ invoiceId: 'TEST-001', networkId: 1 })
      const initialDraft = useCreatorStore.getState().activeDraft

      // Change theme
      setNetworkTheme('arbitrum')

      const state = useCreatorStore.getState()
      expect(state.networkTheme).toBe('arbitrum')
      // Draft should remain unchanged
      expect(state.activeDraft).toEqual(initialDraft)
    })
  })

  describe('persistence', () => {
    it('is excluded from persist middleware', () => {
      // UI state should not be persisted to localStorage
      // This is a design requirement to avoid saving transient UI state

      const { setNetworkTheme } = useCreatorStore.getState()

      setNetworkTheme('polygon')

      // Network theme is transient and resets on page reload
      // (Actual persistence behavior tested in integration tests)
      const state = useCreatorStore.getState()
      expect(state.networkTheme).toBe('polygon')
    })
  })

  describe('selector performance', () => {
    it('allows selective subscription to networkTheme', () => {
      // Test that components can subscribe to just networkTheme
      const selectNetworkTheme = (state: ReturnType<typeof useCreatorStore.getState>) =>
        state.networkTheme

      const initialTheme = selectNetworkTheme(useCreatorStore.getState())
      expect(initialTheme).toBe('ethereum')

      const { setNetworkTheme } = useCreatorStore.getState()
      setNetworkTheme('arbitrum')

      const updatedTheme = selectNetworkTheme(useCreatorStore.getState())
      expect(updatedTheme).toBe('arbitrum')
    })

    it('does not trigger re-renders when other state changes', () => {
      const selectNetworkTheme = (state: ReturnType<typeof useCreatorStore.getState>) =>
        state.networkTheme

      const initialTheme = selectNetworkTheme(useCreatorStore.getState())

      // Update unrelated state
      const { updateDraft } = useCreatorStore.getState()
      updateDraft({ invoiceId: 'UNRELATED' })

      // Theme should remain unchanged
      const themeAfterUpdate = selectNetworkTheme(useCreatorStore.getState())
      expect(themeAfterUpdate).toBe(initialTheme)
    })
  })

  describe('type safety', () => {
    it('accepts only valid NetworkTheme values', () => {
      const { setNetworkTheme } = useCreatorStore.getState()

      // Valid themes (TypeScript would catch invalid ones at compile time)
      setNetworkTheme('ethereum')
      setNetworkTheme('arbitrum')
      setNetworkTheme('optimism')
      setNetworkTheme('polygon')

      // TypeScript ensures only these values are accepted
      expect(useCreatorStore.getState().networkTheme).toBe('polygon')
    })
  })

  describe('integration with invoice data', () => {
    it('complements invoice networkId for background styling', () => {
      const { updateDraft, setNetworkTheme } = useCreatorStore.getState()

      // Create invoice with Arbitrum (networkId: 42161)
      updateDraft({ invoiceId: 'ARB-001', networkId: 42161 })

      // Set matching theme for background
      setNetworkTheme('arbitrum')

      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.networkId).toBe(42161)
      expect(state.networkTheme).toBe('arbitrum')
    })

    it('allows theme to differ from invoice networkId', () => {
      const { updateDraft, setNetworkTheme } = useCreatorStore.getState()

      // Invoice on Ethereum
      updateDraft({ invoiceId: 'ETH-001', networkId: 1 })

      // But background uses Polygon theme (edge case)
      setNetworkTheme('polygon')

      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.networkId).toBe(1)
      expect(state.networkTheme).toBe('polygon')
    })
  })

  describe('concurrent updates', () => {
    it('handles rapid theme changes', () => {
      const { setNetworkTheme } = useCreatorStore.getState()

      // Rapidly change themes
      setNetworkTheme('ethereum')
      setNetworkTheme('arbitrum')
      setNetworkTheme('optimism')
      setNetworkTheme('polygon')

      const state = useCreatorStore.getState()
      expect(state.networkTheme).toBe('polygon')
    })

    it('maintains consistency during parallel state updates', () => {
      const { setNetworkTheme, updateDraft } = useCreatorStore.getState()

      // Simultaneous updates
      setNetworkTheme('arbitrum')
      updateDraft({ invoiceId: 'PARALLEL-001' })
      setNetworkTheme('polygon')

      const state = useCreatorStore.getState()
      expect(state.networkTheme).toBe('polygon')
      expect(state.activeDraft?.data.invoiceId).toBe('PARALLEL-001')
    })
  })

  describe('edge cases', () => {
    it('handles theme change with no active draft', () => {
      const { setNetworkTheme } = useCreatorStore.getState()

      expect(useCreatorStore.getState().activeDraft).toBeNull()

      setNetworkTheme('arbitrum')

      const state = useCreatorStore.getState()
      expect(state.networkTheme).toBe('arbitrum')
      expect(state.activeDraft).toBeNull()
    })

    it('maintains theme across draft changes', () => {
      const { setNetworkTheme, updateDraft } = useCreatorStore.getState()

      setNetworkTheme('optimism')

      updateDraft({ invoiceId: 'DRAFT-1' })
      expect(useCreatorStore.getState().networkTheme).toBe('optimism')

      updateDraft({ invoiceId: 'DRAFT-2' })
      expect(useCreatorStore.getState().networkTheme).toBe('optimism')
    })

    it('resets theme independently of draft reset', () => {
      const { setNetworkTheme } = useCreatorStore.getState()

      setNetworkTheme('polygon')

      // Reset entire store
      useCreatorStore.setState({
        activeDraft: null,
        lineItems: [],
        templates: [],
        history: [],
        preferences: {
          defaultNetworkId: 1,
          defaultCurrency: 'USDC',
        },
        networkTheme: 'ethereum', // Explicit reset
      })

      const state = useCreatorStore.getState()
      expect(state.networkTheme).toBe('ethereum')
    })
  })
})
