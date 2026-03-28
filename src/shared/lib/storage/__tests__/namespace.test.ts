import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  createNamespacedKey,
  isNamespacedKey,
  extractBaseKey,
  getAllNamespacedKeys,
  clearAllNamespacedKeys,
} from '../namespace'
import { STORAGE_NAMESPACE } from '@/shared/config/storage-keys'

describe('namespace', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ──────────────────────────────────────────────────────────────
  // createNamespacedKey
  // ──────────────────────────────────────────────────────────────
  describe('createNamespacedKey', () => {
    it('prepends the namespace prefix with colon separator', () => {
      expect(createNamespacedKey('mykey')).toBe(`${STORAGE_NAMESPACE}:mykey`)
    })

    it('handles keys containing colons', () => {
      expect(createNamespacedKey('a:b')).toBe(`${STORAGE_NAMESPACE}:a:b`)
    })

    it('handles empty key', () => {
      expect(createNamespacedKey('')).toBe(`${STORAGE_NAMESPACE}:`)
    })
  })

  // ──────────────────────────────────────────────────────────────
  // isNamespacedKey
  // ──────────────────────────────────────────────────────────────
  describe('isNamespacedKey', () => {
    it('returns true for a properly namespaced key', () => {
      expect(isNamespacedKey(`${STORAGE_NAMESPACE}:creator`)).toBe(true)
    })

    it('returns false for a key without the namespace prefix', () => {
      expect(isNamespacedKey('creator')).toBe(false)
    })

    it('returns false for an empty string', () => {
      expect(isNamespacedKey('')).toBe(false)
    })

    it('returns false for a key that is just the namespace without colon', () => {
      expect(isNamespacedKey(STORAGE_NAMESPACE)).toBe(false)
    })

    it('returns true for nested keys after the prefix', () => {
      expect(isNamespacedKey(`${STORAGE_NAMESPACE}:a:b:c`)).toBe(true)
    })
  })

  // ──────────────────────────────────────────────────────────────
  // extractBaseKey
  // ──────────────────────────────────────────────────────────────
  describe('extractBaseKey', () => {
    it('returns the base key without namespace prefix', () => {
      expect(extractBaseKey(`${STORAGE_NAMESPACE}:creator`)).toBe('creator')
    })

    it('returns null for a non-namespaced key', () => {
      expect(extractBaseKey('creator')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(extractBaseKey('')).toBeNull()
    })

    it('preserves colons in the base key portion', () => {
      expect(extractBaseKey(`${STORAGE_NAMESPACE}:a:b`)).toBe('a:b')
    })

    it('returns empty string for key that is just the namespace prefix + colon', () => {
      expect(extractBaseKey(`${STORAGE_NAMESPACE}:`)).toBe('')
    })
  })

  // ──────────────────────────────────────────────────────────────
  // getAllNamespacedKeys
  // ──────────────────────────────────────────────────────────────
  describe('getAllNamespacedKeys', () => {
    it('returns empty array when localStorage is empty', () => {
      expect(getAllNamespacedKeys()).toEqual([])
    })

    it('returns only keys with our namespace prefix', () => {
      localStorage.setItem(`${STORAGE_NAMESPACE}:creator`, '{}')
      localStorage.setItem(`${STORAGE_NAMESPACE}:payer`, '{}')
      localStorage.setItem('other-app:key', '{}')

      const keys = getAllNamespacedKeys()
      expect(keys).toContain(`${STORAGE_NAMESPACE}:creator`)
      expect(keys).toContain(`${STORAGE_NAMESPACE}:payer`)
      expect(keys).not.toContain('other-app:key')
      expect(keys).toHaveLength(2)
    })

    it('returns empty array when no namespaced keys exist', () => {
      localStorage.setItem('unrelated', 'value')
      expect(getAllNamespacedKeys()).toEqual([])
    })

    it('returns empty array when localStorage.key throws', () => {
      // Add a real item so length > 0, then make key() throw during iteration
      localStorage.setItem(`${STORAGE_NAMESPACE}:creator`, '{}')
      vi.spyOn(localStorage, 'key').mockImplementation(() => {
        throw new Error('storage error')
      })
      expect(getAllNamespacedKeys()).toEqual([])
    })
  })

  // ──────────────────────────────────────────────────────────────
  // clearAllNamespacedKeys
  // ──────────────────────────────────────────────────────────────
  describe('clearAllNamespacedKeys', () => {
    it('removes all namespaced keys from localStorage', () => {
      localStorage.setItem(`${STORAGE_NAMESPACE}:creator`, '{}')
      localStorage.setItem(`${STORAGE_NAMESPACE}:payer`, '{}')

      clearAllNamespacedKeys()

      expect(localStorage.getItem(`${STORAGE_NAMESPACE}:creator`)).toBeNull()
      expect(localStorage.getItem(`${STORAGE_NAMESPACE}:payer`)).toBeNull()
    })

    it('does not remove non-namespaced keys', () => {
      localStorage.setItem('other-app:data', 'important')
      localStorage.setItem(`${STORAGE_NAMESPACE}:creator`, '{}')

      clearAllNamespacedKeys()

      expect(localStorage.getItem('other-app:data')).toBe('important')
    })

    it('handles empty localStorage without errors', () => {
      expect(() => clearAllNamespacedKeys()).not.toThrow()
    })

    it('handles removeItem throwing gracefully', () => {
      localStorage.setItem(`${STORAGE_NAMESPACE}:creator`, '{}')
      vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('removeItem failed')
      })
      // Should not throw - errors are swallowed per source
      expect(() => clearAllNamespacedKeys()).not.toThrow()
    })
  })
})
