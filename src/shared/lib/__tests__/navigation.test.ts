import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { navigateToHashUrl } from '../navigation'

const HASH = 'VgERAgIABAQEatmG-wUnS2VlcCB5b3VyIGJvbmVz'

describe('navigateToHashUrl', () => {
  const assign = vi.fn()
  const replace = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('location', { assign, replace, origin: 'https://voidpay.xyz' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    assign.mockReset()
    replace.mockReset()
  })

  it('performs a full document navigation with the exact URL (single #)', () => {
    navigateToHashUrl(`/pay#${HASH}`)

    expect(assign).toHaveBeenCalledTimes(1)
    expect(assign).toHaveBeenCalledWith(`/pay#${HASH}`)
    expect(replace).not.toHaveBeenCalled()
    expect((assign.mock.calls[0]![0] as string).split('#')).toHaveLength(2)
  })

  it('uses location.replace when replace is requested', () => {
    navigateToHashUrl(`/invoice?share=1#${HASH}`, { replace: true })

    expect(replace).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith(`/invoice?share=1#${HASH}`)
    expect(assign).not.toHaveBeenCalled()
  })

  it('accepts a URL object and serialises path, search and hash', () => {
    navigateToHashUrl(new URL(`https://voidpay.xyz/invoice?share=1#${HASH}`))

    expect(assign).toHaveBeenCalledWith(`/invoice?share=1#${HASH}`)
  })
})
