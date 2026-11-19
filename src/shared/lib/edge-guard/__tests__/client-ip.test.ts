import { describe, it, expect } from 'vitest'
import { clientIp } from '../client-ip'

function headers(init: Record<string, string>): Headers {
  return new Headers(init)
}

describe('clientIp', () => {
  describe('source precedence', () => {
    it('prefers x-real-ip over x-forwarded-for', () => {
      expect(clientIp(headers({ 'x-real-ip': '203.0.113.7', 'x-forwarded-for': '198.51.100.1' }))).toBe(
        '203.0.113.7'
      )
    })

    it('uses the last x-forwarded-for entry when x-real-ip is absent', () => {
      expect(clientIp(headers({ 'x-forwarded-for': '10.0.0.1, 172.16.0.1, 198.51.100.9' }))).toBe('198.51.100.9')
    })

    it('trims whitespace', () => {
      expect(clientIp(headers({ 'x-real-ip': '  203.0.113.7  ' }))).toBe('203.0.113.7')
      expect(clientIp(headers({ 'x-forwarded-for': '10.0.0.1 ,  198.51.100.9 ' }))).toBe('198.51.100.9')
    })

    it("returns 'unknown' when no header is present", () => {
      expect(clientIp(headers({}))).toBe('unknown')
    })

    it("returns 'unknown' for an empty trailing x-forwarded-for entry", () => {
      expect(clientIp(headers({ 'x-forwarded-for': '10.0.0.1,' }))).toBe('unknown')
    })
  })

  describe('validation', () => {
    it.each(['not-an-ip', '999.1.1.1', '1.2.3', '1.2.3.4.5', '01.2.3.4', '1.2.3.4:8080', '', '<script>'])(
      "returns 'unknown' for invalid IPv4-ish value %j",
      (value) => {
        expect(clientIp(headers({ 'x-real-ip': value }))).toBe('unknown')
      }
    )

    it.each(['2001:::1', '1:2:3:4:5:6:7:8:9', 'gggg::1', '1::2::3', ':1', '1:', 'fe80::1%eth0', '[::1]', '::ffff:999.0.0.1'])(
      "returns 'unknown' for invalid IPv6-ish value %j",
      (value) => {
        expect(clientIp(headers({ 'x-real-ip': value }))).toBe('unknown')
      }
    )

    it('accepts a valid IPv4 address unchanged', () => {
      expect(clientIp(headers({ 'x-real-ip': '0.0.0.0' }))).toBe('0.0.0.0')
      expect(clientIp(headers({ 'x-real-ip': '255.255.255.255' }))).toBe('255.255.255.255')
    })
  })

  describe('IPv6 /64 bucketing', () => {
    it('buckets a full IPv6 address to its /64 prefix', () => {
      expect(clientIp(headers({ 'x-real-ip': '2001:0db8:85a3:08d3:1319:8a2e:0370:7348' }))).toBe(
        '2001:db8:85a3:8d3::/64'
      )
    })

    it('expands :: compression before bucketing', () => {
      expect(clientIp(headers({ 'x-real-ip': '2001:db8::1' }))).toBe('2001:db8:0:0::/64')
      expect(clientIp(headers({ 'x-real-ip': '::1' }))).toBe('0:0:0:0::/64')
      expect(clientIp(headers({ 'x-real-ip': '::' }))).toBe('0:0:0:0::/64')
    })

    it('maps two addresses inside the same /64 to the same bucket', () => {
      const a = clientIp(headers({ 'x-real-ip': '2001:db8:1:2:aaaa:bbbb:cccc:dddd' }))
      const b = clientIp(headers({ 'x-real-ip': '2001:db8:1:2::1' }))
      expect(a).toBe(b)
    })

    it('maps addresses in different /64s to different buckets', () => {
      const a = clientIp(headers({ 'x-real-ip': '2001:db8:1:2::1' }))
      const b = clientIp(headers({ 'x-real-ip': '2001:db8:1:3::1' }))
      expect(a).not.toBe(b)
    })

    it('is case-insensitive', () => {
      expect(clientIp(headers({ 'x-real-ip': '2001:DB8:ABCD:1::1' }))).toBe('2001:db8:abcd:1::/64')
    })

    it('buckets IPv6 taken from x-forwarded-for too', () => {
      expect(clientIp(headers({ 'x-forwarded-for': '10.0.0.1, 2001:db8:1:2::9' }))).toBe('2001:db8:1:2::/64')
    })
  })

  describe('IPv4-mapped IPv6', () => {
    it('maps dotted ::ffff:a.b.c.d to plain IPv4', () => {
      expect(clientIp(headers({ 'x-real-ip': '::ffff:203.0.113.7' }))).toBe('203.0.113.7')
    })

    it('maps hex ::ffff:cb00:7107 to plain IPv4', () => {
      expect(clientIp(headers({ 'x-real-ip': '::FFFF:cb00:7107' }))).toBe('203.0.113.7')
    })

    it('does not treat a non-mapped embedded IPv4 as IPv4', () => {
      expect(clientIp(headers({ 'x-real-ip': '64:ff9b::203.0.113.7' }))).toBe('64:ff9b:0:0::/64')
    })
  })
})
