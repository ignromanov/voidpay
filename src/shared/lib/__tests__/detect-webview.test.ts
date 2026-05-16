import { describe, it, expect, afterEach, vi } from 'vitest'
import { isInAppBrowser, isTelegramWebView, isHostileInAppBrowser } from '../detect-webview'

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

// ---------------------------------------------------------------------------
// isHostileInAppBrowser — Tier-1 hostile IAB detection
// ---------------------------------------------------------------------------

describe('isHostileInAppBrowser', () => {
  const originalUA = navigator.userAgent

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUA,
      configurable: true,
    })
    vi.unstubAllGlobals()
  })

  function setUA(ua: string) {
    Object.defineProperty(navigator, 'userAgent', {
      value: ua,
      configurable: true,
    })
  }

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

  // ─── UA-based Tier-1 browsers ─────────────────────────────────────────────

  it('detects iOS X/Twitter via UA token', () => {
    setUA(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Twitter for iPhone'
    )
    expect(isHostileInAppBrowser()).toBe(true)
  })

  it('detects Instagram via UA token', () => {
    setUA(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0.0'
    )
    expect(isHostileInAppBrowser()).toBe(true)
  })

  it('detects FB Messenger via FBAN UA token', () => {
    setUA(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 FBAN/MessengerForiOS;FBAV/400.0.0.0.0'
    )
    expect(isHostileInAppBrowser()).toBe(true)
  })

  it('detects TikTok via musical_ly UA token', () => {
    setUA(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly/26.5.0'
    )
    expect(isHostileInAppBrowser()).toBe(true)
  })

  it('detects TikTok via Bytedance UA token', () => {
    setUA(
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Mobile Safari/537.36 Bytedance/1.0'
    )
    expect(isHostileInAppBrowser()).toBe(true)
  })

  // ─── Telegram — globals, not UA ───────────────────────────────────────────

  it('detects Telegram via TelegramWebviewProxy global (no UA token)', () => {
    // iOS Telegram strips UA — detection must fall back to globals
    const cleanup = stubWindowGlobal('TelegramWebviewProxy')
    expect(isHostileInAppBrowser()).toBe(true)
    cleanup()
  })

  // ─── Negative cases ───────────────────────────────────────────────────────

  it('returns false for plain iPhone Safari UA', () => {
    setUA(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    )
    expect(isHostileInAppBrowser()).toBe(false)
  })

  it('returns false during SSR (window is undefined)', () => {
    vi.stubGlobal('window', undefined)
    expect(isHostileInAppBrowser()).toBe(false)
  })
})
