import type { MockInstance } from 'vitest'
import { render } from '@/shared/lib/test-utils'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/shared/ui/decode-error-screen', () => ({
  DecodeErrorScreen: () => <div />,
}))

vi.mock('@/shared/ui/app-error-screen', () => ({
  AppErrorScreen: () => <div />,
}))

import RootError from '../error'
import PayError from '../(app)/pay/error'
import CreateError from '../create/error'
import HistoryError from '../history/error'

const ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'
const LEAKY_MESSAGE = `Invalid address: ${ADDRESS} for Alice Smith, note: secret 1250.50 USDC`

const BOUNDARIES = [
  ['root', RootError],
  ['pay', PayError],
  ['create', CreateError],
  ['history', HistoryError],
] as const

function makeError(): Error & { digest?: string } {
  const err = new TypeError(LEAKY_MESSAGE) as Error & { digest?: string }
  err.digest = 'digest-123'
  return err
}

describe('error boundaries — privacy allowlist', () => {
  let consoleError: MockInstance<typeof console.error>

  beforeEach(() => {
    window.umami = { track: vi.fn() }
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    delete window.umami
    vi.unstubAllEnvs()
    consoleError.mockRestore()
  })

  it.each(BOUNDARIES)('%s: analytics gets error_name/digest only, never the message', (_n, Boundary) => {
    render(<Boundary error={makeError()} reset={vi.fn()} />)

    const calls = vi.mocked(window.umami!.track).mock.calls
    expect(calls).toHaveLength(1)
    const [event, payload] = calls[0]!
    expect(event).toBe('error-boundary')
    expect(payload).toMatchObject({ error_name: 'TypeError' })
    expect(Object.keys(payload as object).sort()).toEqual(
      expect.arrayContaining(['error_name', 'page']),
    )
    const serialized = JSON.stringify(payload)
    expect(serialized).not.toContain(ADDRESS)
    expect(serialized).not.toContain('Alice')
    expect(serialized).not.toContain('1250.50')
    expect(payload).not.toHaveProperty('error_message')
  })

  it.each(BOUNDARIES)('%s: non-identifier error name is normalized to Error', (_n, Boundary) => {
    const err = makeError()
    err.name = `Bad Name! ${ADDRESS}`
    render(<Boundary error={err} reset={vi.fn()} />)

    const [, payload] = vi.mocked(window.umami!.track).mock.calls[0]!
    expect(payload).toMatchObject({ error_name: 'Error' })
  })

  it.each(BOUNDARIES.filter(([n]) => n !== 'root'))(
    '%s: production JSON log has no message',
    (_n, Boundary) => {
      vi.stubEnv('NODE_ENV', 'production')
      render(<Boundary error={makeError()} reset={vi.fn()} />)

      const jsonLogs = consoleError.mock.calls
        .map((args: unknown[]) => args[0])
        .filter((a: unknown): a is string => typeof a === 'string' && a.startsWith('{'))
      expect(jsonLogs).toHaveLength(1)
      const parsed = JSON.parse(jsonLogs[0]!) as Record<string, unknown>
      expect(parsed.error_name).toBe('TypeError')
      expect(parsed.digest).toBe('digest-123')
      expect(parsed).not.toHaveProperty('message')
      expect(jsonLogs[0]).not.toContain(ADDRESS)
      expect(jsonLogs[0]).not.toContain('Alice')
    },
  )
})
