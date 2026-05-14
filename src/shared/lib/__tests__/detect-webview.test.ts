import { describe, it, expect, afterEach, vi } from 'vitest'
import { isInAppBrowser, isTelegramWebView } from '../detect-webview'

// ---------------------------------------------------------------------------
// isTelegramWebView
// ---------------------------------------------------------------------------

describe('isTelegramWebView', () => {
  // Helper: add a global to window, return cleanup
  function stubWindowGlobal(key: string): () => void {
    Object.defineProperty(window, key, {
      value: {},
      configurable: true,
      writable: true,
    })
    return () => {
      // @ts-expect-error — intentional deletion for cleanup
      delete window[key]
    }
  }

  it('returns true for iOS Telegram (TelegramWebviewProxy)', () => {
    const cleanup = stubWindowGlobal('TelegramWebviewProxy')
    expect(isTelegramWebView()).toBe(true)
    cleanup()
  })

  it('returns true for iOS Telegram legacy (TelegramWebviewProxyProto)', () => {
    const cleanup = stubWindowGlobal('TelegramWebviewProxyProto')
    expect(isTelegramWebView()).toBe(true)
    cleanup()
  })

  it('returns true for Android Telegram (TelegramWebview)', () => {
    const cleanup = stubWindowGlobal('TelegramWebview')
    expect(isTelegramWebView()).toBe(true)
    cleanup()
  })

  it('returns false in Mobile Safari (no Telegram globals)', () => {
    // No stubs — clean window
    expect(isTelegramWebView()).toBe(false)
  })

  it('returns false in Chrome desktop (no Telegram globals)', () => {
    expect(isTelegramWebView()).toBe(false)
  })

  it('returns false during SSR (window is undefined)', () => {
    vi.stubGlobal('window', undefined)
    expect(isTelegramWebView()).toBe(false)
    vi.unstubAllGlobals()
  })
})

// ---------------------------------------------------------------------------
// isInAppBrowser — regression: still detects non-Telegram browsers via UA
// ---------------------------------------------------------------------------

describe('isInAppBrowser (regression)', () => {
  const originalUA = navigator.userAgent

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUA,
      configurable: true,
    })
  })

  function setUA(ua: string) {
    Object.defineProperty(navigator, 'userAgent', {
      value: ua,
      configurable: true,
    })
  }

  it('detects Instagram in-app browser via UA', () => {
    setUA('Mozilla/5.0 Instagram 123')
    expect(isInAppBrowser()).toBe(true)
  })

  it('detects Facebook in-app browser (FBAN) via UA', () => {
    setUA('Mozilla/5.0 FBAN/FB4A')
    expect(isInAppBrowser()).toBe(true)
  })

  it('detects Facebook in-app browser (FBAV) via UA', () => {
    setUA('Mozilla/5.0 FBAV/400')
    expect(isInAppBrowser()).toBe(true)
  })

  it('detects Twitter/X in-app browser via UA', () => {
    setUA('Mozilla/5.0 Twitter/9.0')
    expect(isInAppBrowser()).toBe(true)
  })

  it('returns false for a regular mobile Safari UA', () => {
    setUA(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    )
    expect(isInAppBrowser()).toBe(false)
  })

  it('returns false for Chrome on Android UA', () => {
    setUA(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
    )
    expect(isInAppBrowser()).toBe(false)
  })
})
