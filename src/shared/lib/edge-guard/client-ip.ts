/**
 * Client IP extraction for edge rate limiting.
 *
 * Returns a rate-limit bucket, not a raw address:
 * - IPv4 (and IPv4-mapped IPv6) → dotted quad
 * - IPv6 → its /64 prefix (one subscriber usually owns a whole /64)
 * - anything missing or malformed → 'unknown'
 */

const IPV4_OCTET = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)'
const IPV4_RE = new RegExp(`^${IPV4_OCTET}(?:\\.${IPV4_OCTET}){3}$`)
const HEXTET_RE = /^[0-9a-f]{1,4}$/

function parseIPv6(value: string): number[] | null {
  let text = value.toLowerCase()

  // Embedded IPv4 tail (e.g. ::ffff:203.0.113.7) → two hextets
  if (text.includes('.')) {
    const lastColon = text.lastIndexOf(':')
    const v4 = text.slice(lastColon + 1)
    if (lastColon === -1 || !IPV4_RE.test(v4)) return null
    const [a, b, c, d] = v4.split('.').map(Number) as [number, number, number, number]
    text = `${text.slice(0, lastColon + 1)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`
  }

  const halves = text.split('::')
  if (halves.length > 2) return null

  const head = halves[0] ? halves[0].split(':') : []
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : []
  const groups = [...head, ...tail]
  if (!groups.every((g) => HEXTET_RE.test(g))) return null

  const toNum = (g: string) => parseInt(g, 16)
  if (halves.length === 1) {
    return groups.length === 8 ? groups.map(toNum) : null
  }
  if (groups.length > 7) return null
  return [...head.map(toNum), ...Array<number>(8 - groups.length).fill(0), ...tail.map(toNum)]
}

function toBucket(raw: string): string | null {
  if (IPV4_RE.test(raw)) return raw

  const h = parseIPv6(raw)
  if (!h) return null

  const isV4Mapped = h.slice(0, 5).every((x) => x === 0) && h[5] === 0xffff
  if (isV4Mapped) {
    return [h[6]! >> 8, h[6]! & 0xff, h[7]! >> 8, h[7]! & 0xff].join('.')
  }

  return `${h.slice(0, 4).map((x) => x.toString(16)).join(':')}::/64`
}

/**
 * Rate-limit bucket for the requesting client.
 * Source: `x-real-ip` (set by Vercel) → last `x-forwarded-for` entry → 'unknown'.
 */
export function clientIp(headers: Headers): string {
  const raw = headers.get('x-real-ip') ?? headers.get('x-forwarded-for')?.split(',').at(-1)
  const trimmed = raw?.trim()
  if (!trimmed) return 'unknown'
  return toBucket(trimmed) ?? 'unknown'
}
