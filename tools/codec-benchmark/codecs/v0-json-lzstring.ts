import lzString from 'lz-string'
import type { Invoice, CodecModule } from '../shared/types.js'
import { toSchemaV1 } from '../shared/types.js'

export const codec: CodecModule = {
  info: {
    name: 'JSON + lz-string',
    version: 'v0',
    date: '2025-11-20',
    description: 'JSON.stringify → lz-string compressToEncodedURIComponent',
    commit: '19b3f62',
    encoding: 'lz-string URI-encoded',
    compression: 'LZ77 (lz-string)',
    browserCompatible: true,
  },
  encode(invoice: Invoice): string {
    const v1 = toSchemaV1(invoice)
    const json = JSON.stringify(v1)
    return lzString.compressToEncodedURIComponent(json)
  },
}
