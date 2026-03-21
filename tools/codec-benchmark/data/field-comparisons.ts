export interface FieldComparison {
  field: string
  description: string
  versions: { ver: string; encoding: string; bytes: string; size: number }[]
}

export const FIELD_COMPARISONS: FieldComparison[] = [
  {
    field: 'currency',
    description: '"USDC"',
    versions: [
      { ver: 'v0', encoding: '"cur":"USDC"', bytes: '22 63 75 72 22 3A 22 55 53 44 43 22', size: 12 },
      { ver: 'v1', encoding: 'length(4) + "USDC"', bytes: '04 55 53 44 43', size: 5 },
      { ver: 'v2', encoding: '0x00 (dict) + 0x01 (code)', bytes: '00 01', size: 2 },
      { ver: 'v3', encoding: '0x01 (dict flag) + 0x01', bytes: '01 01', size: 2 },
      { ver: 'v4+', encoding: 'TLV type=12: 0x00 + 0x01', bytes: '0C 02 00 01', size: 4 },
    ],
  },
  {
    field: 'walletAddress',
    description: '"0xd8dA6BF2..."',
    versions: [
      { ver: 'v0', encoding: '"a":"0xd8dA6BF2..."', bytes: '22 61 22 3A 22 30 78 64 38 ...', size: 46 },
      { ver: 'v1+', encoding: 'Raw 20 bytes', bytes: 'd8 dA 6B F2 69 64 AF 9D ...', size: 20 },
      { ver: 'v2+ (dict)', encoding: 'Known token: 0x00 + code', bytes: '00 01', size: 2 },
    ],
  },
  {
    field: 'dueAt',
    description: '1702592000 (30 days)',
    versions: [
      { ver: 'v0', encoding: '"due":1702592000', bytes: '22 64 75 65 22 3A 31 37 ...', size: 16 },
      { ver: 'v1', encoding: 'uint32 BE', bytes: '65 81 84 00', size: 4 },
      { ver: 'v2+', encoding: 'Delta varint (dueAt−issuedAt)', bytes: 'C0 A8 A0 14', size: 3 },
    ],
  },
  {
    field: 'total',
    description: '"500000000000000000" (0.5 ETH)',
    versions: [
      { ver: 'v0', encoding: 'JSON string "500000000000000000"', bytes: '22 35 30 30 30 30 ...', size: 20 },
      { ver: 'v1–v3', encoding: 'length + "500000000000000000"', bytes: '12 35 30 30 30 ...', size: 19 },
      { ver: 'v4', encoding: 'BigInt varint', bytes: '06 F4 61 4D C5 ...', size: 9 },
      { ver: 'v5+', encoding: 'Mantissa: 5 × 10¹⁷', bytes: '05 11', size: 2 },
    ],
  },
  {
    field: 'security',
    description: 'Anti-replay + integrity',
    versions: [
      { ver: 'v0–v3', encoding: 'None', bytes: '—', size: 0 },
      { ver: 'v4', encoding: 'Salt(16B) + DomSep(32B) + Mix(2B)', bytes: '...', size: 50 },
      { ver: 'v5', encoding: 'Salt(16B) + DomSep(32B)', bytes: '...', size: 48 },
      { ver: 'v6', encoding: 'Salt(16B) + DomSep(32B)', bytes: '...', size: 48 },
    ],
  },
]
