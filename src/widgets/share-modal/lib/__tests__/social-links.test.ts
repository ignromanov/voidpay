/**
 * Tests for social share link utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getTelegramShareUrl,
  getTwitterShareUrl,
  isWebShareSupported,
  nativeShare,
} from '../social-links'

const TEST_URL = 'https://voidpay.xyz/pay#abc123def'

describe('getTelegramShareUrl', () => {
  it('generates valid Telegram share URL', () => {
    const result = getTelegramShareUrl(TEST_URL)

    expect(result).toContain('https://t.me/share/url')
    expect(result).toContain(`url=${encodeURIComponent(TEST_URL)}`)
    expect(result).toContain('text=')
  })

  it('uses default share text', () => {
    const result = getTelegramShareUrl(TEST_URL)

    expect(result).toContain(encodeURIComponent('VoidPay'))
  })

  it('allows custom share text', () => {
    const customText = 'Check out my invoice!'
    const result = getTelegramShareUrl(TEST_URL, customText)

    expect(result).toContain(encodeURIComponent(customText))
  })

  it('properly encodes special characters in URL', () => {
    const urlWithSpecialChars = 'https://voidpay.xyz/pay#data=foo&bar=baz'
    const result = getTelegramShareUrl(urlWithSpecialChars)

    expect(result).toContain(encodeURIComponent(urlWithSpecialChars))
  })
})

describe('getTwitterShareUrl', () => {
  it('generates valid Twitter share URL', () => {
    const result = getTwitterShareUrl(TEST_URL)

    expect(result).toContain('https://twitter.com/intent/tweet')
    expect(result).toContain(`url=${encodeURIComponent(TEST_URL)}`)
    expect(result).toContain('text=')
  })

  it('uses default share text', () => {
    const result = getTwitterShareUrl(TEST_URL)

    expect(result).toContain(encodeURIComponent('VoidPay'))
  })

  it('allows custom share text', () => {
    const customText = 'Pay me via VoidPay!'
    const result = getTwitterShareUrl(TEST_URL, customText)

    expect(result).toContain(encodeURIComponent(customText))
  })
})

describe('isWebShareSupported', () => {
  const originalNavigator = global.navigator

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    })
  })

  it('returns true when navigator.share is available', () => {
    Object.defineProperty(global, 'navigator', {
      value: { share: vi.fn() },
      writable: true,
    })

    expect(isWebShareSupported()).toBe(true)
  })

  it('returns false when navigator.share is not available', () => {
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
    })

    expect(isWebShareSupported()).toBe(false)
  })

  it('returns false when navigator is undefined', () => {
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
    })

    expect(isWebShareSupported()).toBe(false)
  })
})

describe('nativeShare', () => {
  const originalNavigator = global.navigator

  beforeEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: {
        share: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    })
  })

  it('calls navigator.share with correct parameters', async () => {
    await nativeShare(TEST_URL)

    expect(navigator.share).toHaveBeenCalledWith({
      title: 'VoidPay Invoice',
      text: expect.stringContaining('VoidPay'),
      url: TEST_URL,
    })
  })

  it('allows custom title', async () => {
    await nativeShare(TEST_URL, 'My Custom Title')

    expect(navigator.share).toHaveBeenCalledWith({
      title: 'My Custom Title',
      text: expect.any(String),
      url: TEST_URL,
    })
  })

  it('throws error when Web Share API is not supported', async () => {
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
    })

    await expect(nativeShare(TEST_URL)).rejects.toThrow('Web Share API is not supported')
  })
})
