import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { track, AnalyticsEvent, sanitizeErrorMessage } from '../track'

describe('track', () => {
  beforeEach(() => {
    window.umami = { track: vi.fn() }
  })

  afterEach(() => {
    delete window.umami
  })

  it('sends event with properties to umami', () => {
    track(AnalyticsEvent.INVOICE_CREATE, {
      network: 'arbitrum',
      token_symbol: 'USDC',
      line_item_count: 3,
    })

    expect(window.umami!.track).toHaveBeenCalledWith('invoice-create', {
      network: 'arbitrum',
      token_symbol: 'USDC',
      line_item_count: 3,
    })
  })

  it('sends event without properties when none required', () => {
    track(AnalyticsEvent.SHARE_QR_DOWNLOAD)

    expect(window.umami!.track).toHaveBeenCalledWith('share-qr-download', undefined)
  })

  it('sends boolean properties correctly', () => {
    track(AnalyticsEvent.SHARE_LINK_COPY, { has_og: true })

    expect(window.umami!.track).toHaveBeenCalledWith('share-link-copy', { has_og: true })
  })

  it('does not throw when umami is not loaded (ad-blocker)', () => {
    delete window.umami

    expect(() =>
      track(AnalyticsEvent.PAY_TX_SENT, { network: 'ethereum', token_symbol: 'ETH' })
    ).not.toThrow()
  })

  it('does not throw when umami.track is not a function', () => {
    // @ts-expect-error — simulate partial load
    window.umami = {}

    expect(() =>
      track(AnalyticsEvent.PAY_PAGE_LOAD, {
        network: 'polygon',
        token_symbol: 'USDC',
        referrer_domain: 't.me',
      })
    ).not.toThrow()
  })

  it('sends error events with error_type property', () => {
    track(AnalyticsEvent.ERROR_PAYMENT, { error_type: 'INSUFFICIENT_FUNDS' })

    expect(window.umami!.track).toHaveBeenCalledWith('error-payment', {
      error_type: 'INSUFFICIENT_FUNDS',
    })
  })

  it('sends error-boundary with truncated message', () => {
    const longMessage = 'x'.repeat(300)
    track(AnalyticsEvent.ERROR_BOUNDARY, {
      page: '/pay',
      error_message: longMessage.slice(0, 200),
    })

    expect(window.umami!.track).toHaveBeenCalledWith('error-boundary', {
      page: '/pay',
      error_message: 'x'.repeat(200),
    })
  })

  it('maps all AnalyticsEvent values to kebab-case strings', () => {
    const values = Object.values(AnalyticsEvent)
    for (const v of values) {
      expect(v).toMatch(/^[a-z]+(-[a-z]+)*$/)
    }
  })

  it('sanitizeErrorMessage redacts addresses, amounts, emails, and URLs', () => {
    const err = new TypeError(
      'Payment failed for 0x1234567890abcdef1234567890abcdef12345678 amount 1250.50 from alice@example.com at https://voidpay.xyz/pay#abc',
    )
    const sanitized = sanitizeErrorMessage(err)

    expect(sanitized).not.toContain('0x1234567890abcdef1234567890abcdef12345678')
    expect(sanitized).not.toContain('1250.50')
    expect(sanitized).not.toContain('alice@example.com')
    expect(sanitized).not.toContain('https://voidpay.xyz')
    expect(sanitized).toContain('[HEX]')
    expect(sanitized).toContain('[NUM]')
    expect(sanitized).toContain('[EMAIL]')
    expect(sanitized).toContain('[URL]')
    expect(sanitizeErrorMessage('non-error')).toBe('Unknown error')
  })
})
