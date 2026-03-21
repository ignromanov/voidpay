import pako from 'pako'
import type { Invoice, CodecModule } from '../shared/types.js'
import { toSchemaV1 } from '../shared/types.js'
import { encodeBase62 } from '../shared/encoding.js'
import {
  addressToBytes, writeUInt32, writeVarInt, writeString,
} from '../shared/binary-helpers.js'

// v3-era CURRENCY_DICT
const CURRENCY_DICT: Record<string, number> = {
  USDC: 1, USDT: 2, DAI: 3, ETH: 4, WETH: 5, MATIC: 6,
  ARB: 7, OP: 8, AVAX: 9, BNB: 10, BUSD: 11, FRAX: 12, LUSD: 13, sUSD: 14, TUSD: 15,
}

const TOKEN_DICT: Record<string, number> = {
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 1,
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 2,
  '0x6b175474e89094c44da98b954eedeac495271d0f': 3,
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 4,
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': 5,
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 6,
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': 7,
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': 8,
  '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': 9,
  '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': 10,
}

const Flags = {
  HAS_NOTES: 1 << 0, HAS_TOKEN: 1 << 1,
  HAS_SENDER_EMAIL: 1 << 2, HAS_SENDER_ADDRESS: 1 << 3, HAS_SENDER_PHONE: 1 << 4,
  HAS_CLIENT_WALLET: 1 << 5, HAS_CLIENT_EMAIL: 1 << 6, HAS_CLIENT_ADDRESS: 1 << 7,
  HAS_CLIENT_PHONE: 1 << 8, HAS_TAX: 1 << 9, HAS_DISCOUNT: 1 << 10,
  TEXT_COMPRESSED: 1 << 11,
}

export const codec: CodecModule = {
  info: {
    name: 'Binary v3',
    version: 'v3',
    date: '2025-12-30',
    description: 'Hybrid: binary header + text blob (optional DEFLATE), Base62',
    commit: '007-binary-codec',
    encoding: 'Base62',
    compression: 'DEFLATE (pako, optional)',
    browserCompatible: true,
  },
  encode(invoice: Invoice): string {
    const v1 = toSchemaV1(invoice)
    const buffer: number[] = []

    // Compute flags (without TEXT_COMPRESSED yet)
    let flags = 0
    if (v1.nt) flags |= Flags.HAS_NOTES
    if (v1.t) flags |= Flags.HAS_TOKEN
    if (v1.f.e) flags |= Flags.HAS_SENDER_EMAIL
    if (v1.f.ads) flags |= Flags.HAS_SENDER_ADDRESS
    if (v1.f.ph) flags |= Flags.HAS_SENDER_PHONE
    if (v1.c.a) flags |= Flags.HAS_CLIENT_WALLET
    if (v1.c.e) flags |= Flags.HAS_CLIENT_EMAIL
    if (v1.c.ads) flags |= Flags.HAS_CLIENT_ADDRESS
    if (v1.c.ph) flags |= Flags.HAS_CLIENT_PHONE
    if (v1.tax) flags |= Flags.HAS_TAX
    if (v1.dsc) flags |= Flags.HAS_DISCOUNT

    // 1. Version
    buffer.push(3)
    // 2. Flags placeholder (will be backfilled)
    const flagsOffset = buffer.length
    buffer.push(0, 0)
    // 3. InvoiceId as length-prefixed string
    writeString(buffer, v1.id)
    // 4. Issue date (uint32)
    writeUInt32(buffer, v1.iss)
    // 5. Delta due (varint)
    writeVarInt(buffer, v1.due - v1.iss)
    // 6. Network chain ID (varint)
    writeVarInt(buffer, v1.net)
    // 7. Decimals (varint)
    writeVarInt(buffer, v1.dec)
    // 8. Token (dict-encoded, if present)
    if (v1.t) {
      const lower = v1.t.toLowerCase()
      const code = TOKEN_DICT[lower]
      if (code !== undefined) {
        buffer.push(0x00, code)
      } else {
        buffer.push(0x01)
        buffer.push(...Array.from(addressToBytes(v1.t)))
      }
    }
    // 9. From wallet (20 bytes raw)
    buffer.push(...Array.from(addressToBytes(v1.f.a)))
    // 10. Client wallet (optional 20 bytes)
    if (v1.c.a) buffer.push(...Array.from(addressToBytes(v1.c.a)))
    // 11. Item count (varint)
    writeVarInt(buffer, v1.it.length)

    // Assemble text blob
    const enc = new TextEncoder()
    const textParts: Uint8Array[] = []

    // Currency
    const currCode = CURRENCY_DICT[v1.cur]
    if (currCode !== undefined) {
      textParts.push(new Uint8Array([0x01, currCode]))
    } else {
      textParts.push(new Uint8Array([0x02, ...Array.from(enc.encode(v1.cur))]))
    }
    if (v1.nt) textParts.push(enc.encode(v1.nt))
    textParts.push(enc.encode(v1.f.n))
    if (v1.f.e) textParts.push(enc.encode(v1.f.e))
    if (v1.f.ads) textParts.push(enc.encode(v1.f.ads))
    if (v1.f.ph) textParts.push(enc.encode(v1.f.ph))
    textParts.push(enc.encode(v1.c.n))
    if (v1.c.e) textParts.push(enc.encode(v1.c.e))
    if (v1.c.ads) textParts.push(enc.encode(v1.c.ads))
    if (v1.c.ph) textParts.push(enc.encode(v1.c.ph))
    if (v1.tax) textParts.push(enc.encode(v1.tax))
    if (v1.dsc) textParts.push(enc.encode(v1.dsc))
    for (const item of v1.it) {
      textParts.push(enc.encode(item.d))
      const qtyStr = typeof item.q === 'number' ? item.q.toString() : item.q
      textParts.push(enc.encode(qtyStr))
      textParts.push(enc.encode(item.r))
    }

    // Join with \x00 separator
    const sep = new Uint8Array([0x00])
    let totalLen = 0
    for (let i = 0; i < textParts.length; i++) {
      totalLen += textParts[i]!.length
      if (i < textParts.length - 1) totalLen += 1
    }
    const rawBytes = new Uint8Array(totalLen)
    let offset = 0
    for (let i = 0; i < textParts.length; i++) {
      rawBytes.set(textParts[i]!, offset)
      offset += textParts[i]!.length
      if (i < textParts.length - 1) { rawBytes.set(sep, offset); offset++ }
    }

    // Optionally compress
    let blobBytes = rawBytes
    if (rawBytes.length > 100) {
      const compressed = pako.deflate(rawBytes)
      if (compressed.length < rawBytes.length) {
        blobBytes = compressed
        flags |= Flags.TEXT_COMPRESSED
      }
    }

    // Backfill flags
    buffer[flagsOffset] = (flags >> 8) & 0xff
    buffer[flagsOffset + 1] = flags & 0xff

    // Write text blob: varint(length) + bytes
    writeVarInt(buffer, blobBytes.length)
    buffer.push(...Array.from(blobBytes))

    return 'H' + encodeBase62(new Uint8Array(buffer))
  },
}
