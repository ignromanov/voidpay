import { describe, it, expect, beforeEach } from 'vitest'
import { useCreatorStore } from '../useCreatorStore'

const DEFAULT_PREFERENCES = {
  includeOgImage: true,
  magicDustEnabled: true,
}

describe('preferencesSlice', () => {
  beforeEach(() => {
    useCreatorStore.setState({ preferences: { ...DEFAULT_PREFERENCES } })
  })

  describe('updatePreferences', () => {
    it('partially updates preferences', () => {
      const { updatePreferences } = useCreatorStore.getState()

      updatePreferences({ includeOgImage: false })

      const { preferences } = useCreatorStore.getState()
      expect(preferences.includeOgImage).toBe(false)
      expect(preferences.magicDustEnabled).toBe(true)
    })

    it('updates multiple preferences at once', () => {
      const { updatePreferences } = useCreatorStore.getState()

      updatePreferences({ includeOgImage: false, magicDustEnabled: false })

      const { preferences } = useCreatorStore.getState()
      expect(preferences.includeOgImage).toBe(false)
      expect(preferences.magicDustEnabled).toBe(false)
    })

    it('handles empty update without changing state', () => {
      const { updatePreferences } = useCreatorStore.getState()

      updatePreferences({})

      const { preferences } = useCreatorStore.getState()
      expect(preferences).toEqual(DEFAULT_PREFERENCES)
    })
  })

  describe('resetPreferences', () => {
    it('resets preferences to defaults', () => {
      const { updatePreferences, resetPreferences } = useCreatorStore.getState()

      updatePreferences({ includeOgImage: false, magicDustEnabled: false })
      resetPreferences()

      const { preferences } = useCreatorStore.getState()
      expect(preferences).toEqual(DEFAULT_PREFERENCES)
    })
  })
})
