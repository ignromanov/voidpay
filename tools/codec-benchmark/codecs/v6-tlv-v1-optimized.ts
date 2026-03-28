import { keccak_256 } from '@noble/hashes/sha3'
import { brotliCompressSync, constants } from 'node:zlib'
import type { Invoice, CodecModule } from '../shared/types.js'
import { encodeBase64url } from '../shared/encoding.js'
import {
  addressToBytes, writeVarInt, writeMantissa, writeQuantity,
} from '../shared/binary-helpers.js'

interface TlvRecord { type: number; value: Uint8Array }

// --- CHAIN_TO_CODE ---
const CHAIN_TO_CODE: Record<number, number> = {
  1: 0x01, 42161: 0x02, 10: 0x03, 137: 0x04, 8453: 0x05,
}

function encodeChainId(buf: number[], chainId: number): void {
  const code = CHAIN_TO_CODE[chainId]
  if (code !== undefined) {
    buf.push(0x00, code)
  } else {
    buf.push(0x01)
    writeVarInt(buf, chainId)
  }
}

// --- APP_DICT (updated: removed short patterns, added domain-specific) ---
const APP_DICT: [string, number][] = [
  ['@outlook.com', 0x02],
  ['@hotmail.com', 0x0c],
  ['development',  0x0d],
  ['consulting',   0x0e],
  ['@gmail.com',   0x03],
  ['@yahoo.com',   0x04],
  ['https://',     0x05],
  ['Invoice',      0x06],
  ['Payment',      0x07],
  ['.com',         0x09],
  ['INV-',         0x0f],
]

function applyDict(input: Uint8Array): Uint8Array {
  let text = new TextDecoder().decode(input)
  for (const [pattern, code] of APP_DICT) {
    text = text.replaceAll(pattern, String.fromCharCode(code))
  }
  return new TextEncoder().encode(text)
}

// --- CURRENCY_DICT ---
const CURRENCY_DICT: Record<string, number> = {
  USDC: 1, USDT: 2, DAI: 3, ETH: 4, WETH: 5, MATIC: 6,
  POL: 7, WBTC: 8, 'USDC.E': 9, EURC: 10, USDT0: 11,
}

// --- TOKEN_DICT (same as v5) ---
const TOKEN_DICT: Record<string, { code: number; decimals: number }> = {
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { code: 1,  decimals: 6  },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { code: 2,  decimals: 6  },
  '0x6b175474e89094c44da98b954eedeac495271d0f': { code: 3,  decimals: 18 },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { code: 4,  decimals: 18 },
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { code: 5,  decimals: 8  },
  '0x1abaea1f7c830bd89acc67ec4af516284b1bc33c': { code: 6,  decimals: 6  },
  '0x6c96de32cea08842dcc4058c14d3aaad7fa41dee': { code: 7,  decimals: 6  },
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831': { code: 10, decimals: 6  },
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': { code: 11, decimals: 6  },
  '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': { code: 12, decimals: 6  },
  '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': { code: 13, decimals: 18 },
  '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': { code: 14, decimals: 18 },
  '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': { code: 15, decimals: 8  },
  '0x0b2c639c533813f4aa9d7837caf62653d097ff85': { code: 20, decimals: 6  },
  '0x7f5c764cbc14f9669b88837ca1490cca17c31607': { code: 21, decimals: 6  },
  '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': { code: 22, decimals: 6  },
  '0x4200000000000000000000000000000000000006': { code: 24, decimals: 18 },
  '0x68f180fcce6836688e9084f035309e29bf0a2095': { code: 25, decimals: 8  },
  '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': { code: 30, decimals: 6  },
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { code: 31, decimals: 6  },
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': { code: 32, decimals: 6  },
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': { code: 33, decimals: 18 },
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': { code: 34, decimals: 18 },
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6': { code: 35, decimals: 8  },
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { code: 40, decimals: 6  },
  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': { code: 41, decimals: 6  },
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { code: 42, decimals: 18 },
  '0x0555e30da8f98308edb960aa94c0ed47230d2b9c': { code: 44, decimals: 8  },
  '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42': { code: 45, decimals: 6  },
}

const CHAIN_CODE_RANGES: Record<number, [number, number]> = {
  1: [1, 9], 42161: [10, 19], 10: [20, 29], 137: [30, 39], 8453: [40, 49],
}

function encodeTokenAddress(address: string, chainId: number): { code: number } | null {
  const entry = TOKEN_DICT[address.toLowerCase()]
  if (!entry) return null
  const range = CHAIN_CODE_RANGES[chainId]
  if (range && (entry.code < range[0] || entry.code > range[1])) return null
  return { code: entry.code }
}

// --- TLV writer (same header as v5: 3B) ---
const MAGIC = 0x56
const VERSION = 0x01

function writeTlv(records: TlvRecord[]): Uint8Array {
  const bytes: number[] = [MAGIC, VERSION, records.length]
  for (const r of records) {
    bytes.push(r.type)
    writeVarInt(bytes, r.value.length)
    for (const b of r.value) bytes.push(b)
  }
  return new Uint8Array(bytes)
}

// --- Domain separator: full keccak256 (32 bytes) ---
function computeDomainSeparator(records: TlvRecord[]): Uint8Array {
  const prefix = new TextEncoder().encode('VOIDPAY_INVOICE_V1')
  const parts: Uint8Array[] = [prefix]
  for (const record of records) {
    if (record.type === 31) continue
    const lenBuf: number[] = []
    writeVarInt(lenBuf, record.value.length)
    const chunk = new Uint8Array(1 + lenBuf.length + record.value.length)
    chunk[0] = record.type
    chunk.set(new Uint8Array(lenBuf), 1)
    chunk.set(record.value, 1 + lenBuf.length)
    parts.push(chunk)
  }
  const totalLen = parts.reduce((a, p) => a + p.length, 0)
  const body = new Uint8Array(totalLen)
  let offset = 0
  for (const p of parts) { body.set(p, offset); offset += p.length }
  return keccak_256(body) // full 32 bytes (restored from truncated 16)
}

// --- Helpers ---
const utf8 = (s: string) => new TextEncoder().encode(s)

const uint32BE = (v: number): Uint8Array => {
  const b = new Uint8Array(4)
  b[0] = (v >>> 24) & 0xff; b[1] = (v >>> 16) & 0xff
  b[2] = (v >>> 8) & 0xff; b[3] = v & 0xff
  return b
}

const varintBytes = (v: number): Uint8Array => {
  const b: number[] = []; writeVarInt(b, v); return new Uint8Array(b)
}

const mantissaBytes = (v: bigint): Uint8Array => {
  const b: number[] = []; writeMantissa(b, v); return new Uint8Array(b)
}

export const codec: CodecModule = {
  info: {
    name: 'TLV v1 Optimized',
    version: 'v6',
    date: '2026-03-19',
    description: 'Salt(16B) + DomSep(32B) + whole-payload Brotli + app-dict + Base64url',
    commit: '027-poc',
    encoding: 'Base64url',
    compression: 'Brotli (whole-payload, quality=11)',
    browserCompatible: false,
  },

  encode(invoice: Invoice): string {
    const records: TlvRecord[] = []

    // --- Required fields (even types) ---

    // CHAIN_ID (Type 2): dict code or varint
    const chainBuf: number[] = []
    encodeChainId(chainBuf, invoice.networkId)
    records.push({ type: 2, value: new Uint8Array(chainBuf) })

    // ISSUED_AT (Type 4): uint32 BE
    records.push({ type: 4, value: uint32BE(invoice.issuedAt) })

    // DUE_AT (Type 6): delta varint
    records.push({ type: 6, value: varintBytes(invoice.dueAt - invoice.issuedAt) })

    // DECIMALS (Type 8): uint8
    records.push({ type: 8, value: new Uint8Array([invoice.decimals]) })

    // FROM_WALLET (Type 10): 20 bytes
    records.push({ type: 10, value: addressToBytes(invoice.from.walletAddress) })

    // CURRENCY (Type 12): 0x00+dict or 0x01+raw
    const currCode = CURRENCY_DICT[invoice.currency.toUpperCase()] ?? null
    if (currCode !== null) {
      records.push({ type: 12, value: new Uint8Array([0x00, currCode]) })
    } else {
      const raw = utf8(invoice.currency)
      const val = new Uint8Array(1 + raw.length)
      val[0] = 0x01; val.set(raw, 1)
      records.push({ type: 12, value: val })
    }

    // ITEMS (Type 14): app-dict on descriptions for better Brotli
    const itemBuf: number[] = []
    writeVarInt(itemBuf, invoice.items.length)
    for (const item of invoice.items) {
      const descBytes = applyDict(utf8(item.description))
      writeVarInt(itemBuf, descBytes.length)
      for (const b of descBytes) itemBuf.push(b)
      writeQuantity(itemBuf, item.quantity)
      writeMantissa(itemBuf, BigInt(item.rate || '0'))
    }
    records.push({ type: 14, value: new Uint8Array(itemBuf) })

    // FROM_NAME (Type 16): app-dict
    records.push({ type: 16, value: applyDict(utf8(invoice.from.name)) })

    // CLIENT_NAME (Type 18): app-dict
    records.push({ type: 18, value: applyDict(utf8(invoice.client.name)) })

    // SALT (Type 20): 16 bytes (128-bit, NIST SP 800-132)
    records.push({ type: 20, value: crypto.getRandomValues(new Uint8Array(16)) })

    // INVOICE_ID (Type 22)
    records.push({ type: 22, value: utf8(invoice.invoiceId) })

    // TOTAL (Type 24): final payment amount (includes magicDust if applied)
    records.push({ type: 24, value: mantissaBytes(BigInt(invoice.total)) })

    // --- Optional text fields: individual TLVs (Brotli handles compression) ---
    if (invoice.notes)                  records.push({ type: 5,  value: applyDict(utf8(invoice.notes)) })
    if (invoice.from.email)             records.push({ type: 7,  value: applyDict(utf8(invoice.from.email)) })
    if (invoice.from.phone)             records.push({ type: 9,  value: applyDict(utf8(invoice.from.phone)) })
    if (invoice.from.physicalAddress)   records.push({ type: 11, value: applyDict(utf8(invoice.from.physicalAddress)) })
    if (invoice.client.email)           records.push({ type: 13, value: applyDict(utf8(invoice.client.email)) })
    if (invoice.client.phone)           records.push({ type: 15, value: applyDict(utf8(invoice.client.phone)) })
    if (invoice.client.physicalAddress) records.push({ type: 17, value: applyDict(utf8(invoice.client.physicalAddress)) })
    if (invoice.from.taxId)             records.push({ type: 35, value: applyDict(utf8(invoice.from.taxId)) })
    if (invoice.client.taxId)           records.push({ type: 37, value: applyDict(utf8(invoice.client.taxId)) })

    // --- Optional binary fields ---
    if (invoice.tokenAddress) {
      const tokenEntry = encodeTokenAddress(invoice.tokenAddress, invoice.networkId)
      if (tokenEntry) {
        records.push({ type: 1, value: new Uint8Array([0x00, tokenEntry.code]) })
      } else {
        const raw = addressToBytes(invoice.tokenAddress)
        const val = new Uint8Array(21); val[0] = 0x01; val.set(raw, 1)
        records.push({ type: 1, value: val })
      }
    }
    if (invoice.client.walletAddress) {
      records.push({ type: 3, value: addressToBytes(invoice.client.walletAddress) })
    }
    if (invoice.tax)      records.push({ type: 19, value: utf8(invoice.tax) })
    if (invoice.discount) records.push({ type: 21, value: utf8(invoice.discount) })

    // --- Sort canonically, compute domain separator (16B), re-sort ---
    const sorted = records.sort((a, b) => a.type - b.type)
    sorted.push({ type: 31, value: computeDomainSeparator(sorted) })
    const finalRecords = sorted.sort((a, b) => a.type - b.type)

    // --- Serialize TLV → whole-payload Brotli → Base64url ---
    const tlvBytes = writeTlv(finalRecords)
    const compressed = new Uint8Array(brotliCompressSync(Buffer.from(tlvBytes), {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    }))

    // Pick shorter representation (Brotli may expand tiny payloads)
    const payload = compressed.length < tlvBytes.length ? compressed : tlvBytes
    return encodeBase64url(payload)
  },
}
