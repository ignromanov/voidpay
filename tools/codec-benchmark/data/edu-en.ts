export interface FormatEdu {
  ver: string
  name: string
  era: 'baseline' | 'adhoc' | 'tlv'
  pipeline: { label: string; accent?: string }[]
  structure: { label: string; pct: number; color: string }[]
  structNote: string
  innovations: string[]
  limitations: string[]
  keyInsight: string
}

export const FORMAT_EDU_EN: FormatEdu[] = [
  {
    ver: 'v0', name: 'JSON + lz-string', era: 'baseline',
    pipeline: [
      { label: 'Invoice Object' },
      { label: 'JSON.stringify', accent: '#f59e0b' },
      { label: 'LZ77 compress', accent: '#6366f1' },
      { label: 'URI-encode', accent: '#737373' },
    ],
    structure: [
      { label: 'Compressed JSON blob', pct: 100, color: '#6366f1' },
    ],
    structNote: 'Opaque — no field access without full decompression',
    innovations: ['Browser-compatible', 'Zero dependencies beyond lz-string'],
    limitations: ['JSON keys waste ~40% space ("invoiceId":, "walletAddress":)', 'LZ77 is weakest modern compressor', 'URI encoding expands data ~30%'],
    keyInsight: 'Every invoice repeats the same JSON keys. For a known schema, these keys are pure overhead — the decoder already knows the field names.',
  },
  {
    ver: 'v1', name: 'Binary v1', era: 'adhoc',
    pipeline: [
      { label: 'Invoice Object' },
      { label: 'Sequential binary fields', accent: '#22c55e' },
      { label: 'Base62 encode', accent: '#737373' },
    ],
    structure: [
      { label: 'Ver', pct: 1, color: '#a3a3a3' },
      { label: 'UUID', pct: 14, color: '#ef4444' },
      { label: 'Dates', pct: 7, color: '#f59e0b' },
      { label: 'Chain+Currency', pct: 4, color: '#8b5cf6' },
      { label: 'Addresses', pct: 18, color: '#3b82f6' },
      { label: 'Names+Text', pct: 35, color: '#22c55e' },
      { label: 'Items', pct: 21, color: '#06b6d4' },
    ],
    structNote: 'Fixed field order — decoder reads sequentially, position = meaning',
    innovations: ['Eliminated JSON key overhead', 'Wallet addresses as raw 20 bytes (not 42-char hex strings)', 'Varint encoding for small numbers'],
    limitations: ['No optional field flags — null markers still consume 1 byte each', 'InvoiceId stored as 16-byte UUID (wasteful for short IDs)', 'Text stored as raw UTF-8 (no compression)'],
    keyInsight: 'A 42-character hex address "0xd8dA6BF2..." becomes 20 raw bytes — saving 22 bytes per address. This single change saves ~44 bytes for a two-party invoice.',
  },
  {
    ver: 'v2', name: 'Binary v2', era: 'adhoc',
    pipeline: [
      { label: 'Invoice Object' },
      { label: 'Bit flags + dicts', accent: '#f59e0b' },
      { label: 'Sequential binary', accent: '#22c55e' },
      { label: 'Base62 encode', accent: '#737373' },
    ],
    structure: [
      { label: 'Ver', pct: 1, color: '#a3a3a3' },
      { label: 'Flags', pct: 2, color: '#ef4444' },
      { label: 'ID+Dates', pct: 12, color: '#f59e0b' },
      { label: 'Dict fields', pct: 4, color: '#8b5cf6' },
      { label: 'Addresses', pct: 18, color: '#3b82f6' },
      { label: 'Names+Text', pct: 38, color: '#22c55e' },
      { label: 'Items', pct: 25, color: '#06b6d4' },
    ],
    structNote: '2-byte bit flags control which optional fields are present',
    innovations: ['Bit flags: 2 bytes encode presence of 11 optional fields', 'Delta due-date: dueAt − issuedAt as varint (4B → 3B)', 'Currency dictionary: "USDC" → 0x01 (4B → 2B)', 'Token address dictionary: 20B → 2B for known tokens'],
    limitations: ['Text still uncompressed', 'Adding new optional fields requires new flag bits', 'Fixed field order limits extensibility'],
    keyInsight: 'Bit flags eliminate null markers: 11 optional fields × 1 byte each = 11 bytes saved. The currency dict turns "USDC" into a single byte.',
  },
  {
    ver: 'v3', name: 'Binary v3 (Hybrid)', era: 'adhoc',
    pipeline: [
      { label: 'Invoice Object' },
      { label: 'Binary header', accent: '#3b82f6' },
      { label: 'Text blob assembly', accent: '#22c55e' },
      { label: 'DEFLATE text (optional)', accent: '#6366f1' },
      { label: 'Base62 encode', accent: '#737373' },
    ],
    structure: [
      { label: 'Header', pct: 3, color: '#a3a3a3' },
      { label: 'Binary fields', pct: 30, color: '#3b82f6' },
      { label: 'Compressed text blob', pct: 55, color: '#6366f1' },
      { label: 'Base62 overhead', pct: 12, color: '#737373' },
    ],
    structNote: 'Two zones: binary header (addresses, dates) + text blob (names, notes, items)',
    innovations: ['Hybrid architecture: binary for structured data, blob for text', 'DEFLATE compression on text blob (when > 100 bytes)', 'TEXT_COMPRESSED flag bit signals compression to decoder', 'Text fields joined with \\x00 separator for better compression context'],
    limitations: ['DEFLATE is weaker than Brotli (zlib level 6 vs Brotli q11)', 'No security primitives (salt, domain separator)', 'No forward compatibility (new fields break old decoders)', 'Base62 encoding: 1.37× expansion (vs 1.33× for Base64url)'],
    keyInsight: 'Joining all text into one blob before compressing gives DEFLATE more context to find repeated patterns — "alice@studio.com" and "bob@corp.io" share the ".com" suffix that gets deduplicated.',
  },
  {
    ver: 'v4', name: 'TLV v1', era: 'tlv',
    pipeline: [
      { label: 'Invoice Object' },
      { label: 'TLV records', accent: '#22c55e' },
      { label: 'Grouped DEFLATE', accent: '#6366f1' },
      { label: 'keccak256 domain sep', accent: '#ef4444' },
      { label: 'Mix prefix', accent: '#f59e0b' },
      { label: 'Base62 encode', accent: '#737373' },
    ],
    structure: [
      { label: 'Mix', pct: 1, color: '#f59e0b' },
      { label: 'Header', pct: 2, color: '#a3a3a3' },
      { label: 'Salt', pct: 8, color: '#ef4444' },
      { label: 'DomSep', pct: 17, color: '#dc2626' },
      { label: 'Binary TLVs', pct: 30, color: '#3b82f6' },
      { label: 'Text TLVs', pct: 30, color: '#22c55e' },
      { label: 'Encoding', pct: 12, color: '#737373' },
    ],
    structNote: 'Type-Length-Value records: each field self-describes (type=1 byte, length=uint16, value=N bytes)',
    innovations: ['TLV format: forward-compatible (unknown types safely skipped)', 'Salt (16B): privacy — same invoice produces different URLs', 'Domain separator (32B): keccak256 integrity tag', 'Canonical ordering: records sorted by type for deterministic hashing', 'Even type = required, odd type = optional (BOLT12 convention)'],
    limitations: ['Security overhead: Salt(16B) + DomSep(32B) + MixPrefix(2B) = 50 bytes', 'uint16 lengths: 2 bytes per TLV (wasteful for small values)', '4-byte header: [MAGIC, VERSION, 0x00, COUNT]', 'DEFLATE only on optional text fields (required fields uncompressed)'],
    keyInsight: 'The TLV format is the architectural leap — it makes the codec extensible. New field types can be added without breaking old decoders. But the security overhead (50 bytes) makes small invoices much larger.',
  },
  {
    ver: 'v5', name: 'TLV v1 Rewrite', era: 'tlv',
    pipeline: [
      { label: 'Invoice Object' },
      { label: 'TLV records', accent: '#22c55e' },
      { label: 'App-dict substitution', accent: '#f59e0b' },
      { label: 'Grouped Brotli', accent: '#6366f1' },
      { label: 'keccak256 domain sep', accent: '#ef4444' },
      { label: 'Base64url encode', accent: '#737373' },
    ],
    structure: [
      { label: 'Header', pct: 2, color: '#a3a3a3' },
      { label: 'Salt', pct: 9, color: '#ef4444' },
      { label: 'DomSep', pct: 18, color: '#dc2626' },
      { label: 'Binary TLVs', pct: 32, color: '#3b82f6' },
      { label: 'Compressed text', pct: 27, color: '#22c55e' },
      { label: 'Encoding', pct: 12, color: '#737373' },
    ],
    structNote: '3-byte header [MAGIC, VERSION, COUNT] + varint lengths (1 byte for values < 128)',
    innovations: ['Brotli q11: ~20% better than DEFLATE on typical payloads', 'App-level text dictionary: @gmail.com → 1 byte', 'Varint TLV lengths: 1 byte (not 2) for values < 128', 'Chain dictionary: chainId 42161 → 0x02 (3B → 2B)', 'Mantissa encoding: 500000000000000000 → [5, 17] (18B → 2B)', 'Base64url: 1.33× expansion (vs 1.37× for Base62)', 'Removed keccak mix prefix (−2B)'],
    limitations: ['Salt still 16B, DomSep still 32B', 'Grouped Brotli only compresses optional text fields', 'Required fields (names, items) not in compression scope'],
    keyInsight: 'Mantissa encoding is the biggest win for amount fields: "500000000000000000" (18 chars as text) becomes mantissa=5 + exponent=17 → just 2 bytes. This matters because crypto amounts routinely have 18 decimal places.',
  },
  {
    ver: 'v6', name: 'TLV v1 Optimized', era: 'tlv',
    pipeline: [
      { label: 'Invoice Object' },
      { label: 'TLV records', accent: '#22c55e' },
      { label: 'App-dict substitution', accent: '#f59e0b' },
      { label: 'Serialize TLV', accent: '#3b82f6' },
      { label: 'Whole-payload Brotli', accent: '#6366f1' },
      { label: 'Base64url encode', accent: '#737373' },
    ],
    structure: [
      { label: 'Header', pct: 2, color: '#a3a3a3' },
      { label: 'Salt', pct: 9, color: '#ef4444' },
      { label: 'DomSep', pct: 18, color: '#dc2626' },
      { label: 'Binary+Text (Brotli)', pct: 59, color: '#6366f1' },
      { label: 'Encoding', pct: 12, color: '#737373' },
    ],
    structNote: 'Same security as v5 (Salt 16B + DomSep 32B) — whole-payload Brotli gives compressor full context over all TLV records',
    innovations: ['Whole-payload Brotli: compresses ALL TLV body, not just text fields', 'Updated app-dict: +development, +consulting, +INV-, +@hotmail.com', 'App-dict applied to item descriptions (not just text fields)', 'Brotli guard: picks raw TLV when compression expands tiny payloads'],
    limitations: ['Brotli requires Node.js (not browser-native)', 'Irreducible security overhead: Salt(16B) + DomSep(32B) = 48B'],
    keyInsight: 'Whole-payload Brotli gives the compressor full context — binary addresses, TLV headers, and text all contribute to the compression dictionary. For full invoices this beats selective compression by 40+ characters.',
  },
]
