import type { Invoice, CodecModule } from '../shared/types.js'
import { toSchemaV1 } from '../shared/types.js'
import { encodeBase62 } from '../shared/encoding.js'
import {
  addressToBytes, writeUInt32, writeVarInt, writeString,
} from '../shared/binary-helpers.js'

// v2-era CURRENCY_DICT (simple code, no decimals)
const CURRENCY_DICT: Record<string, number> = {
  USDC: 1, USDT: 2, DAI: 3, ETH: 4, WETH: 5, MATIC: 6,
  ARB: 7, OP: 8, AVAX: 9, BNB: 10, BUSD: 11, FRAX: 12, LUSD: 13, sUSD: 14, TUSD: 15,
}

// v2-era TOKEN_DICT (address → simple code, no decimals)
const TOKEN_DICT: Record<string, number> = {
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 1,  // USDC ETH
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 2,  // USDT ETH
  '0x6b175474e89094c44da98b954eedeac495271d0f': 3,  // DAI ETH
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 4,  // WETH ETH
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': 5,  // USDC Polygon
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 6,  // USDT Polygon
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': 7,  // DAI Polygon
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': 8,  // USDC Arbitrum
  '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': 9,  // USDT Arbitrum
  '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': 10, // DAI Arbitrum
}

const Flags = {
  HAS_NOTES: 1 << 0,
  HAS_TOKEN: 1 << 1,
  HAS_SENDER_EMAIL: 1 << 2,
  HAS_SENDER_ADDRESS: 1 << 3,
  HAS_SENDER_PHONE: 1 << 4,
  HAS_CLIENT_WALLET: 1 << 5,
  HAS_CLIENT_EMAIL: 1 << 6,
  HAS_CLIENT_ADDRESS: 1 << 7,
  HAS_CLIENT_PHONE: 1 << 8,
  HAS_TAX: 1 << 9,
  HAS_DISCOUNT: 1 << 10,
}

function writeDictString(buffer: number[], str: string, dict: Record<string, number>): void {
  const code = dict[str]
  if (code !== undefined) {
    buffer.push(0x00, code)
  } else {
    buffer.push(0x01)
    writeString(buffer, str)
  }
}

function writeDictAddress(buffer: number[], address: string, dict: Record<string, number>): void {
  const lower = address.toLowerCase()
  const code = dict[lower]
  if (code !== undefined) {
    buffer.push(0x00, code)
  } else {
    buffer.push(0x01)
    buffer.push(...Array.from(addressToBytes(address)))
  }
}

export const codec: CodecModule = {
  info: {
    name: 'Binary v2',
    version: 'v2',
    date: '2025-12-28',
    description: 'Bit flags, delta due-date, currency/token dicts, Base62',
    commit: '397537c',
    encoding: 'Base62',
    compression: 'None',
    browserCompatible: true,
  },
  encode(invoice: Invoice): string {
    const v1 = toSchemaV1(invoice)
    const buffer: number[] = []

    // Compute flags
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
    buffer.push(v1.v)
    // 2. Flags (2 bytes big-endian)
    buffer.push((flags >> 8) & 0xff, flags & 0xff)
    // 3. InvoiceId as length-prefixed string
    writeString(buffer, v1.id)
    // 4. Issue date (uint32)
    writeUInt32(buffer, v1.iss)
    // 5. Delta due (varint)
    writeVarInt(buffer, v1.due - v1.iss)
    // 6. Network chain ID (varint)
    writeVarInt(buffer, v1.net)
    // 7. Currency (dict-encoded)
    writeDictString(buffer, v1.cur, CURRENCY_DICT)
    // 8. Token address (dict-encoded, if present)
    if (v1.t) writeDictAddress(buffer, v1.t, TOKEN_DICT)
    // 9. Decimals (varint)
    writeVarInt(buffer, v1.dec)
    // 10. From wallet (20 bytes raw)
    buffer.push(...Array.from(addressToBytes(v1.f.a)))
    // 11. From name
    writeString(buffer, v1.f.n)
    // 12. Optional from fields
    if (v1.f.e) writeString(buffer, v1.f.e)
    if (v1.f.ads) writeString(buffer, v1.f.ads)
    if (v1.f.ph) writeString(buffer, v1.f.ph)
    // 13. Client name
    writeString(buffer, v1.c.n)
    // 14. Optional client fields
    if (v1.c.a) buffer.push(...Array.from(addressToBytes(v1.c.a)))
    if (v1.c.e) writeString(buffer, v1.c.e)
    if (v1.c.ads) writeString(buffer, v1.c.ads)
    if (v1.c.ph) writeString(buffer, v1.c.ph)
    // 15. Notes
    if (v1.nt) writeString(buffer, v1.nt)
    // 16. Line items
    writeVarInt(buffer, v1.it.length)
    for (const item of v1.it) {
      writeString(buffer, item.d)
      const qtyStr = typeof item.q === 'number' ? item.q.toString() : item.q
      writeString(buffer, qtyStr)
      writeString(buffer, item.r)
    }
    // 17. Tax / Discount
    if (v1.tax) writeString(buffer, v1.tax)
    if (v1.dsc) writeString(buffer, v1.dsc)

    return 'B' + encodeBase62(new Uint8Array(buffer))
  },
}
