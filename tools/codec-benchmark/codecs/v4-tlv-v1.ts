import pako from 'pako'
import { keccak_256 } from '@noble/hashes/sha3'
import type { Invoice, CodecModule } from '../shared/types.js'
import { encodeBase62 } from '../shared/encoding.js'
import { addressToBytes, writeVarInt, writeBigIntVarInt } from '../shared/binary-helpers.js'

interface TlvRecord { type: number; value: Uint8Array }

// --- TLV writer (v4: 4-byte header, uint16 length) ---
function writeTlvV4(records: TlvRecord[]): Uint8Array {
  let dataSize = 0
  for (const r of records) dataSize += 3 + r.value.length
  const bytes = new Uint8Array(4 + dataSize)
  bytes[0] = 0x56; bytes[1] = 0x01; bytes[2] = 0x00; bytes[3] = records.length
  let offset = 4
  for (const r of records) {
    bytes[offset] = r.type
    bytes[offset + 1] = (r.value.length >> 8) & 0xff
    bytes[offset + 2] = r.value.length & 0xff
    bytes.set(r.value, offset + 3)
    offset += 3 + r.value.length
  }
  return bytes
}

// --- Domain separator (v4: uint16 length serialization) ---
function computeDomainSeparatorV4(records: TlvRecord[]): Uint8Array {
  const DOMAIN_SEPARATOR_TYPE = 31
  const prefix = new TextEncoder().encode('VOIDPAY_INVOICE_V1')
  const parts: Uint8Array[] = [prefix]
  for (const record of records) {
    if (record.type === DOMAIN_SEPARATOR_TYPE) continue
    const chunk = new Uint8Array(3 + record.value.length)
    chunk[0] = record.type
    chunk[1] = (record.value.length >> 8) & 0xff
    chunk[2] = record.value.length & 0xff
    chunk.set(record.value, 3)
    parts.push(chunk)
  }
  const totalLen = parts.reduce((a, p) => a + p.length, 0)
  const body = new Uint8Array(totalLen)
  let offset = 0
  for (const p of parts) { body.set(p, offset); offset += p.length }
  return keccak_256(body)
}

// --- Grouped DEFLATE (v4: pako) ---
function groupedDeflateV4(fields: { typeId: number; value: Uint8Array }[]): Uint8Array | null {
  if (fields.length === 0) return null
  const rawParts: number[] = [fields.length]
  for (const f of fields) {
    rawParts.push(f.typeId)
    writeVarInt(rawParts, f.value.length)
    for (let i = 0; i < f.value.length; i++) rawParts.push(f.value[i]!)
  }
  const raw = new Uint8Array(rawParts)
  if (raw.length < 100) return null
  const compressed = pako.deflate(raw)
  if (compressed.length >= raw.length) return null
  return compressed
}

// --- Dictionaries from tlv-map.ts ---

const CURRENCY_DICT_V4: Record<string, number> = {
  USDC: 1,
  USDT: 2,
  DAI: 3,
  ETH: 4,
  WETH: 5,
  MATIC: 6,
  POL: 7,
  WBTC: 8,
  'USDC.E': 9,
  EURC: 10,
  USDT0: 11,
}

const TOKEN_DICT_V4: Record<string, { code: number; decimals: number }> = {
  // Ethereum (chainId: 1), codes 1-9
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { code: 1, decimals: 6 },   // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { code: 2, decimals: 6 },   // USDT
  '0x6b175474e89094c44da98b954eedeac495271d0f': { code: 3, decimals: 18 },  // DAI
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { code: 4, decimals: 18 },  // WETH
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { code: 5, decimals: 8 },   // WBTC
  '0x1abaea1f7c830bd89acc67ec4af516284b1bc33c': { code: 6, decimals: 6 },   // EURC
  '0x6c96de32cea08842dcc4058c14d3aaad7fa41dee': { code: 7, decimals: 6 },   // USDT0

  // Arbitrum (chainId: 42161), codes 10-19
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831': { code: 10, decimals: 6 },  // USDC
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': { code: 11, decimals: 6 },  // USDC.e
  '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': { code: 12, decimals: 6 },  // USDT
  '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': { code: 13, decimals: 18 }, // DAI
  '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': { code: 14, decimals: 18 }, // WETH
  '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': { code: 15, decimals: 8 },  // WBTC

  // Optimism (chainId: 10), codes 20-29
  '0x0b2c639c533813f4aa9d7837caf62653d097ff85': { code: 20, decimals: 6 },  // USDC
  '0x7f5c764cbc14f9669b88837ca1490cca17c31607': { code: 21, decimals: 6 },  // USDC.e
  '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': { code: 22, decimals: 6 },  // USDT
  '0x4200000000000000000000000000000000000006': { code: 24, decimals: 18 }, // WETH (OP; Base uses code 43)
  '0x68f180fcce6836688e9084f035309e29bf0a2095': { code: 25, decimals: 8 },  // WBTC

  // Polygon (chainId: 137), codes 30-39
  '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': { code: 30, decimals: 6 },  // USDC
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { code: 31, decimals: 6 },  // USDC.e
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': { code: 32, decimals: 6 },  // USDT
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': { code: 33, decimals: 18 }, // DAI
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': { code: 34, decimals: 18 }, // WETH
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6': { code: 35, decimals: 8 },  // WBTC

  // Base (chainId: 8453), codes 40-49
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { code: 40, decimals: 6 },  // USDC
  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': { code: 41, decimals: 6 },  // USDbC
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { code: 42, decimals: 18 }, // DAI
  '0x0555e30da8f98308edb960aa94c0ed47230d2b9c': { code: 44, decimals: 8 },  // WBTC
  '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42': { code: 45, decimals: 6 },  // EURC
}

/** Chain ID → valid token dictionary code range */
const CHAIN_CODE_RANGES: Record<number, [number, number]> = {
  1: [1, 9],
  42161: [10, 19],
  10: [20, 29],
  137: [30, 39],
  8453: [40, 49],
}

function encodeCurrencyV4(currency: string): number | null {
  return CURRENCY_DICT_V4[currency.toUpperCase()] ?? null
}

function encodeTokenAddressV4(address: string, chainId: number): { code: number; decimals: number } | null {
  const entry = TOKEN_DICT_V4[address.toLowerCase()] ?? null
  if (!entry) return null
  const range = CHAIN_CODE_RANGES[chainId]
  if (range && (entry.code < range[0] || entry.code > range[1])) return null
  return entry
}

const utf8 = (s: string) => new TextEncoder().encode(s)
const uint32BE = (v: number) => {
  const b = new Uint8Array(4)
  b[0] = (v >>> 24) & 0xff; b[1] = (v >>> 16) & 0xff; b[2] = (v >>> 8) & 0xff; b[3] = v & 0xff
  return b
}
const varintBytes = (v: number) => { const b: number[] = []; writeVarInt(b, v); return new Uint8Array(b) }
const bigintVBytes = (v: bigint) => { const b: number[] = []; writeBigIntVarInt(b, v); return new Uint8Array(b) }

export const codec: CodecModule = {
  info: {
    name: 'TLV v1',
    version: 'v4',
    date: '2026-03-17',
    description: 'TLV binary (4B header, uint16 len) + DEFLATE + keccak mix + Base62',
    commit: 'develop',
    encoding: 'Base62',
    compression: 'DEFLATE (pako)',
    browserCompatible: true,
  },
  encode(invoice: Invoice): string {
    const records: TlvRecord[] = []

    // Required fields (even types)
    records.push({ type: 2,  value: varintBytes(invoice.networkId) })           // CHAIN_ID
    records.push({ type: 4,  value: uint32BE(invoice.issuedAt) })               // ISSUED_AT
    records.push({ type: 6,  value: uint32BE(invoice.dueAt) })                  // DUE_AT (uint32, not delta)
    records.push({ type: 8,  value: new Uint8Array([invoice.decimals]) })        // DECIMALS
    records.push({ type: 10, value: addressToBytes(invoice.from.walletAddress) }) // FROM_WALLET

    // CURRENCY (type 12): prefix 0x00=dict code, 0x01=raw UTF-8
    const currCode = encodeCurrencyV4(invoice.currency)
    if (currCode !== null) {
      records.push({ type: 12, value: new Uint8Array([0x00, currCode]) })
    } else {
      const raw = utf8(invoice.currency)
      const val = new Uint8Array(1 + raw.length)
      val[0] = 0x01
      val.set(raw, 1)
      records.push({ type: 12, value: val })
    }

    // ITEMS (type 14): packed binary
    const itemBuf: number[] = []
    writeVarInt(itemBuf, invoice.items.length)
    for (const item of invoice.items) {
      const descBytes = utf8(item.description)
      writeVarInt(itemBuf, descBytes.length)
      for (const b of descBytes) itemBuf.push(b)
      // qty: float32 BE (4 bytes)
      const qtyView = new DataView(new ArrayBuffer(4))
      qtyView.setFloat32(0, item.quantity, false)
      for (let i = 0; i < 4; i++) itemBuf.push(qtyView.getUint8(i))
      // rate: length-prefixed BigInt varint
      const rateBytes = bigintVBytes(BigInt(item.rate || '0'))
      writeVarInt(itemBuf, rateBytes.length)
      for (const b of rateBytes) itemBuf.push(b)
    }
    records.push({ type: 14, value: new Uint8Array(itemBuf) })

    records.push({ type: 16, value: utf8(invoice.from.name) })    // FROM_NAME
    records.push({ type: 18, value: utf8(invoice.client.name) })  // CLIENT_NAME
    records.push({ type: 20, value: crypto.getRandomValues(new Uint8Array(16)) }) // SALT
    records.push({ type: 22, value: utf8(invoice.invoiceId) })    // INVOICE_ID

    // TOTAL (type 24) — required (even), stored as BigInt varint
    records.push({ type: 24, value: bigintVBytes(BigInt(invoice.total)) })

    // Optional text fields — grouped for DEFLATE compression
    const textFields: { typeId: number; value: Uint8Array }[] = []
    if (invoice.notes)                  textFields.push({ typeId: 5,  value: utf8(invoice.notes) })
    if (invoice.from.email)             textFields.push({ typeId: 7,  value: utf8(invoice.from.email) })
    if (invoice.from.phone)             textFields.push({ typeId: 9,  value: utf8(invoice.from.phone) })
    if (invoice.from.physicalAddress)   textFields.push({ typeId: 11, value: utf8(invoice.from.physicalAddress) })
    if (invoice.client.email)           textFields.push({ typeId: 13, value: utf8(invoice.client.email) })
    if (invoice.client.phone)           textFields.push({ typeId: 15, value: utf8(invoice.client.phone) })
    if (invoice.client.physicalAddress) textFields.push({ typeId: 17, value: utf8(invoice.client.physicalAddress) })
    if (invoice.from.taxId)             textFields.push({ typeId: 35, value: utf8(invoice.from.taxId) })
    if (invoice.client.taxId)           textFields.push({ typeId: 37, value: utf8(invoice.client.taxId) })

    const compressed = groupedDeflateV4(textFields)
    if (compressed) {
      records.push({ type: 253, value: compressed })
    } else {
      for (const f of textFields) records.push({ type: f.typeId, value: f.value })
    }

    // Optional binary fields
    if (invoice.tokenAddress) {
      const tokenEntry = encodeTokenAddressV4(invoice.tokenAddress, invoice.networkId)
      if (tokenEntry) {
        records.push({ type: 1, value: new Uint8Array([0x00, tokenEntry.code]) })
      } else {
        const raw = addressToBytes(invoice.tokenAddress)
        const val = new Uint8Array(21)
        val[0] = 0x01
        val.set(raw, 1)
        records.push({ type: 1, value: val })
      }
    }
    if (invoice.client.walletAddress) {
      records.push({ type: 3, value: addressToBytes(invoice.client.walletAddress) })
    }
    if (invoice.tax)      records.push({ type: 19, value: utf8(invoice.tax) })
    if (invoice.discount) records.push({ type: 21, value: utf8(invoice.discount) })
    if (invoice.magicDust) {
      records.push({ type: 25, value: bigintVBytes(BigInt(invoice.magicDust)) })
    }

    // Sort canonically, compute domain separator, re-sort
    const sorted = records.sort((a, b) => a.type - b.type)
    sorted.push({ type: 31, value: computeDomainSeparatorV4(sorted) })
    const finalRecords = sorted.sort((a, b) => a.type - b.type)

    const bytes = writeTlvV4(finalRecords)

    // Mix prefix: 2 bytes of keccak256(payload) prepended before Base62 encoding
    const mixHash = keccak_256(bytes)
    const withMix = new Uint8Array(2 + bytes.length)
    withMix.set(mixHash.slice(0, 2))
    withMix.set(bytes, 2)

    return encodeBase62(withMix)
  },
}
