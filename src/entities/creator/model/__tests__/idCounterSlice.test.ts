import { describe, it, expect, beforeEach } from 'vitest'
import { useCreatorStore } from '../useCreatorStore'

describe('idCounterSlice', () => {
  beforeEach(() => {
    useCreatorStore.setState({
      idCounter: { currentValue: 1, prefix: 'INV' },
    })
  })

  describe('generateNextInvoiceId', () => {
    it('generates INV-001 for first invoice', () => {
      const { generateNextInvoiceId } = useCreatorStore.getState()
      expect(generateNextInvoiceId()).toBe('INV-001')
    })

    it('increments counter after generation', () => {
      const { generateNextInvoiceId } = useCreatorStore.getState()
      generateNextInvoiceId()

      const { idCounter } = useCreatorStore.getState()
      expect(idCounter.currentValue).toBe(2)
    })

    it('pads numbers to 3 digits', () => {
      const { generateNextInvoiceId } = useCreatorStore.getState()

      expect(generateNextInvoiceId()).toBe('INV-001')
      expect(useCreatorStore.getState().generateNextInvoiceId()).toBe('INV-002')
    })

    it('handles numbers beyond 3 digits', () => {
      useCreatorStore.setState({ idCounter: { currentValue: 1000, prefix: 'INV' } })

      const { generateNextInvoiceId } = useCreatorStore.getState()
      expect(generateNextInvoiceId()).toBe('INV-1000')
    })

    it('uses custom prefix', () => {
      useCreatorStore.setState({ idCounter: { currentValue: 5, prefix: 'PO' } })

      const { generateNextInvoiceId } = useCreatorStore.getState()
      expect(generateNextInvoiceId()).toBe('PO-005')
    })
  })

  describe('updateIdPrefix', () => {
    it('updates prefix', () => {
      const { updateIdPrefix } = useCreatorStore.getState()
      updateIdPrefix('BILL')

      const { idCounter } = useCreatorStore.getState()
      expect(idCounter.prefix).toBe('BILL')
    })

    it('falls back to INV for empty string', () => {
      const { updateIdPrefix } = useCreatorStore.getState()
      updateIdPrefix('')

      const { idCounter } = useCreatorStore.getState()
      expect(idCounter.prefix).toBe('INV')
    })

    it('throws on prefix longer than 10 chars', () => {
      const { updateIdPrefix } = useCreatorStore.getState()
      expect(() => updateIdPrefix('VERYLONGPREFIX')).toThrow('Invalid prefix')
    })

    it('throws on non-alphanumeric prefix', () => {
      const { updateIdPrefix } = useCreatorStore.getState()
      expect(() => updateIdPrefix('INV-')).toThrow('Invalid prefix')
      expect(() => updateIdPrefix('INV 1')).toThrow('Invalid prefix')
    })

    it('preserves counter value when changing prefix', () => {
      useCreatorStore.setState({ idCounter: { currentValue: 42, prefix: 'INV' } })

      const { updateIdPrefix } = useCreatorStore.getState()
      updateIdPrefix('PO')

      const { idCounter } = useCreatorStore.getState()
      expect(idCounter.currentValue).toBe(42)
      expect(idCounter.prefix).toBe('PO')
    })
  })

  describe('resetCounter', () => {
    it('resets counter to specified value', () => {
      useCreatorStore.setState({ idCounter: { currentValue: 99, prefix: 'INV' } })

      const { resetCounter } = useCreatorStore.getState()
      resetCounter(1)

      const { idCounter } = useCreatorStore.getState()
      expect(idCounter.currentValue).toBe(1)
    })

    it('throws on value < 1', () => {
      const { resetCounter } = useCreatorStore.getState()
      expect(() => resetCounter(0)).toThrow('Counter value must be >= 1')
      expect(() => resetCounter(-5)).toThrow('Counter value must be >= 1')
    })

    it('preserves prefix when resetting counter', () => {
      useCreatorStore.setState({ idCounter: { currentValue: 99, prefix: 'BILL' } })

      const { resetCounter } = useCreatorStore.getState()
      resetCounter(10)

      const { idCounter } = useCreatorStore.getState()
      expect(idCounter.prefix).toBe('BILL')
      expect(idCounter.currentValue).toBe(10)
    })
  })
})
