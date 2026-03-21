import type { Invoice, CodecModule } from '../shared/types.js'
import { toSchemaV1 } from '../shared/types.js'
import { encodeBase62 } from '../shared/encoding.js'
import {
  uuidToBytes, addressToBytes, writeUInt32, writeVarInt,
  writeString, writeOptionalString, writeOptionalAddress,
} from '../shared/binary-helpers.js'

export const codec: CodecModule = {
  info: {
    name: 'Binary v1',
    version: 'v1',
    date: '2025-12-24',
    description: 'Sequential binary fields, no compression, Base62',
    commit: '397537c',
    encoding: 'Base62',
    compression: 'None',
    browserCompatible: true,
  },
  encode(invoice: Invoice): string {
    const v1 = toSchemaV1(invoice)
    const buffer: number[] = []
    // 1. Version
    buffer.push(v1.v)
    // 2. UUID (16 bytes) — treat invoiceId as a non-UUID string by hashing to 16 bytes
    // The original used uuidToBytes, but invoiceId might not be a UUID; handle gracefully
    try {
      buffer.push(...Array.from(uuidToBytes(v1.id)))
    } catch {
      // If not a UUID, pad to 16 bytes from the string
      const enc = new TextEncoder().encode(v1.id)
      const padded = new Uint8Array(16)
      padded.set(enc.slice(0, 16))
      buffer.push(...Array.from(padded))
    }
    // 3. Issue date (uint32)
    writeUInt32(buffer, v1.iss)
    // 4. Due date (uint32)
    writeUInt32(buffer, v1.due)
    // 5. Notes (optional string)
    writeOptionalString(buffer, v1.nt)
    // 6. Network chain ID (varint)
    writeVarInt(buffer, v1.net)
    // 7. Currency (string)
    writeString(buffer, v1.cur)
    // 8. Token address (optional 20 bytes)
    writeOptionalAddress(buffer, v1.t)
    // 9. Decimals (varint)
    writeVarInt(buffer, v1.dec)
    // 10. From info
    writeString(buffer, v1.f.n)
    buffer.push(...Array.from(addressToBytes(v1.f.a)))
    writeOptionalString(buffer, v1.f.e)
    writeOptionalString(buffer, v1.f.ads)
    writeOptionalString(buffer, v1.f.ph)
    // 11. Client info
    writeString(buffer, v1.c.n)
    writeOptionalAddress(buffer, v1.c.a)
    writeOptionalString(buffer, v1.c.e)
    writeOptionalString(buffer, v1.c.ads)
    writeOptionalString(buffer, v1.c.ph)
    // 12. Line items
    writeVarInt(buffer, v1.it.length)
    for (const item of v1.it) {
      writeString(buffer, item.d)
      const qtyStr = typeof item.q === 'number' ? item.q.toString() : item.q
      writeString(buffer, qtyStr)
      writeString(buffer, item.r)
    }
    // 13. Tax
    writeOptionalString(buffer, v1.tax)
    // 14. Discount
    writeOptionalString(buffer, v1.dsc)
    return encodeBase62(new Uint8Array(buffer))
  },
}
