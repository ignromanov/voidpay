import { describe, it, expect, beforeEach } from 'vitest'
import { CREATOR_INITIAL_STATE } from '../initial-state'
import { useCreatorStore } from '../useCreatorStore'

describe('CREATOR_INITIAL_STATE', () => {
  it('matches canonical shape snapshot', () => {
    expect(CREATOR_INITIAL_STATE).toMatchInlineSnapshot(`
      {
        "activeDraft": null,
        "idCounter": {
          "currentValue": 1,
          "prefix": "INV",
        },
        "lineItems": [],
        "preferences": {},
        "templates": [],
        "version": 1,
      }
    `)
  })

  it('contains all fields persisted by partialize', () => {
    const persistedKeys = ['version', 'activeDraft', 'lineItems', 'templates', 'preferences', 'idCounter'] as const
    for (const key of persistedKeys) {
      expect(CREATOR_INITIAL_STATE).toHaveProperty(key)
    }
  })
})

describe('clearAllData', () => {
  beforeEach(() => {
    useCreatorStore.setState({
      activeDraft: null,
      lineItems: [],
      templates: [],
      preferences: {},
    })
  })

  it('resets persisted fields to CREATOR_INITIAL_STATE values', () => {
    // Set some non-initial state
    useCreatorStore.setState({
      templates: [
        {
          templateId: 'tpl-1',
          name: 'Test Template',
          invoiceData: { invoiceId: 'T-001', networkId: 1, currency: 'USDC', decimals: 6 },
          createdAt: new Date().toISOString(),
        },
      ],
      preferences: { defaultNetworkId: 137 },
    })

    useCreatorStore.getState().clearAllData()

    const state = useCreatorStore.getState()
    expect(state.version).toBe(CREATOR_INITIAL_STATE.version)
    expect(state.activeDraft).toBe(CREATOR_INITIAL_STATE.activeDraft)
    expect(state.lineItems).toEqual(CREATOR_INITIAL_STATE.lineItems)
    expect(state.templates).toEqual(CREATOR_INITIAL_STATE.templates)
    expect(state.preferences).toEqual(CREATOR_INITIAL_STATE.preferences)
    expect(state.idCounter).toEqual(CREATOR_INITIAL_STATE.idCounter)
  })

  it('post-reset state deep-equals CREATOR_INITIAL_STATE for all persisted fields', () => {
    useCreatorStore.getState().clearAllData()

    const state = useCreatorStore.getState()
    const persistedKeys = Object.keys(CREATOR_INITIAL_STATE) as Array<keyof typeof CREATOR_INITIAL_STATE>
    for (const key of persistedKeys) {
      expect(state[key]).toEqual(CREATOR_INITIAL_STATE[key])
    }
  })
})

describe('migrate() fallback on corrupted input', () => {
  it('rehydrates store to CREATOR_INITIAL_STATE shape when localStorage contains corrupted data', async () => {
    // Simulate corrupted localStorage: version mismatch with unparseable state
    const corruptedEntry = JSON.stringify({
      state: null,
      version: 0,
    })
    localStorage.setItem('voidpay:creator', corruptedEntry)

    // Trigger rehydration by calling hydrate()
    await useCreatorStore.persist.rehydrate()

    const state = useCreatorStore.getState()

    // After corruption recovery, all persisted fields should match CREATOR_INITIAL_STATE
    expect(state.version).toBe(CREATOR_INITIAL_STATE.version)
    expect(state.activeDraft).toBe(CREATOR_INITIAL_STATE.activeDraft)
    expect(state.lineItems).toEqual(CREATOR_INITIAL_STATE.lineItems)
    expect(state.templates).toEqual(CREATOR_INITIAL_STATE.templates)
    expect(state.idCounter).toEqual(CREATOR_INITIAL_STATE.idCounter)
  })
})
