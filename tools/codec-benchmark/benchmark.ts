import { writeFileSync } from 'node:fs'
import type { CodecModule } from './shared/types.js'

// Deterministic crypto — applied BEFORE dynamic codec imports
globalThis.crypto.getRandomValues = <T extends ArrayBufferView>(array: T): T => {
  const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength)
  for (let i = 0; i < bytes.length; i++) bytes[i] = (i % 16) + 1
  return array
}

// Dynamic imports — executed AFTER mock is in place
const { codec: v0 } = await import('./codecs/v0-json-lzstring.js')
const { codec: v1 } = await import('./codecs/v1-binary-v1.js')
const { codec: v2 } = await import('./codecs/v2-binary-v2.js')
const { codec: v3 } = await import('./codecs/v3-binary-v3.js')
const { codec: v4 } = await import('./codecs/v4-tlv-v1.js')
const { codec: v5 } = await import('./codecs/v5-tlv-v1-rewrite.js')
const { codec: v6 } = await import('./codecs/v6-tlv-v1-optimized.js')
const { TEST_INVOICES } = await import('./shared/test-invoices.js')

const CODECS: CodecModule[] = [v0, v1, v2, v3, v4, v5, v6]

// ---- Benchmark loop ----

interface Result {
  scenario: string
  codec: string
  version: string
  length: number
  reduction: number
  encoded: string
}

const results: Result[] = []

// Raw JSON size per scenario (uncompressed baseline)
const rawJsonSize: Record<string, number> = {}

for (const { name, invoice } of TEST_INVOICES) {
  rawJsonSize[name] = new TextEncoder().encode(JSON.stringify(invoice)).length
  const v0Length = v0.encode(invoice).length
  for (const codec of CODECS) {
    const encoded = codec.encode(invoice)
    const length = encoded.length
    const reduction = Math.round((1 - length / v0Length) * 100)
    results.push({
      scenario: name,
      codec: codec.info.name,
      version: codec.info.version,
      length,
      reduction,
      encoded,
    })
  }
}

// ---- Console output ----

const scenarios = [...new Set(results.map(r => r.scenario))]
const versions = CODECS.map(c => c.info.version)

const COL_W = 8
const LABEL_W = 16

const header =
  'Scenario'.padEnd(LABEL_W) +
  '| ' +
  versions.map(v => v.padStart(COL_W - 1)).join(' | ')
console.log('\n' + header)
console.log('-'.repeat(LABEL_W + versions.length * (COL_W + 2)))

for (const scenario of scenarios) {
  const row =
    scenario.padEnd(LABEL_W) +
    '| ' +
    versions
      .map(v => {
        const r = results.find(x => x.scenario === scenario && x.version === v)
        return String(r?.length ?? '?').padStart(COL_W - 1)
      })
      .join(' | ')
  console.log(row)
}
console.log()

// ---- Computed data for HTML ----

const codecInfos = CODECS.map(c => c.info)

const lookup: Record<string, Record<string, { length: number; reduction: number }>> = {}
const urlsLookup: Record<string, Record<string, string>> = {}
for (const r of results) {
  if (!lookup[r.scenario]) lookup[r.scenario] = {}
  if (!urlsLookup[r.scenario]) urlsLookup[r.scenario] = {}
  lookup[r.scenario]![r.version] = { length: r.length, reduction: r.reduction }
  urlsLookup[r.scenario]![r.version] = r.encoded
}

const bestPerScenario: Record<string, string> = {}
for (const s of scenarios) {
  let best = versions[0]!
  let bestLen = Infinity
  for (const v of versions) {
    const len = lookup[s]![v]!.length
    if (len < bestLen) {
      bestLen = len
      best = v
    }
  }
  bestPerScenario[s] = best
}

const avgReduction: Record<string, number> = {}
for (const v of versions) {
  const reductions = scenarios.map(s => lookup[s]![v]!.reduction)
  avgReduction[v] = Math.round(reductions.reduce((a, b) => a + b, 0) / reductions.length)
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ---- i18n ----

type Lang = 'en' | 'ru'

interface Tr {
  lang: Lang
  htmlLang: string
  title: string
  subtitle: string
  bestOverall: string
  codecsCompared: string
  v0Baseline: string
  avgSmaller: string
  results: string
  resultsDesc: string
  adhocBinary: string
  tlvStructured: string
  scenario: string
  raw: string
  visualComparison: string
  formatAnatomy: string
  formatAnatomyDesc: string
  encodedUrls: string
  codecMetadata: string
  metaVer: string
  metaName: string
  metaDate: string
  metaDesc: string
  metaCompression: string
  metaEncoding: string
  metaBrowser: string
  metaCommit: string
  generated: string
  copy: string
  copied: string
  failed: string
  chars: string
  encodingPipeline: string
  byteStructure: string
  approxAllocation: string
  innovations: string
  limitations: string
  fieldEncodingComparison: string
  fieldComparisonDesc: string
  field: string
  version: string
  encoding: string
  hex: string
  size: string
  adhocEraDesc: string
  tlvEraDesc: string
  baselineEra: string
}

const TR: Record<Lang, Tr> = {
  en: {
    lang: 'en', htmlLang: 'en',
    title: 'VoidPay Codec Evolution — Size Benchmark',
    subtitle: `Encoded URL character count across ${codecInfos.length} historical codec versions · ${scenarios.length} test scenarios`,
    bestOverall: 'Best Overall',
    codecsCompared: 'Codecs Compared',
    v0Baseline: 'v0 Baseline',
    avgSmaller: 'smaller than v0',
    results: 'Results',
    resultsDesc: 'Encoded string length in chars · bar scaled to Raw baseline per row · <span class="pos">green</span> = best, <span class="neg">red</span> = worst per scenario',
    adhocBinary: 'Ad-hoc Binary',
    tlvStructured: 'TLV Structured',
    scenario: 'Scenario',
    raw: 'Raw',
    visualComparison: 'Visual Comparison',
    formatAnatomy: 'Format Anatomy',
    formatAnatomyDesc: 'How each format encodes the same invoice — click a version to explore its encoding pipeline, structure, and trade-offs',
    encodedUrls: 'Encoded URLs',
    codecMetadata: 'Codec Metadata',
    metaVer: 'Ver', metaName: 'Name', metaDate: 'Date', metaDesc: 'Description',
    metaCompression: 'Compression', metaEncoding: 'Encoding', metaBrowser: 'Browser', metaCommit: 'Commit',
    generated: 'Generated',
    copy: 'Copy', copied: 'Copied!', failed: 'Failed',
    chars: 'chars',
    encodingPipeline: 'Encoding Pipeline',
    byteStructure: 'Byte Structure',
    approxAllocation: '(approximate allocation)',
    innovations: 'Innovations',
    limitations: 'Limitations',
    fieldEncodingComparison: 'Field Encoding Comparison',
    fieldComparisonDesc: 'Same invoice fields — how each version encodes them',
    field: 'Field', version: 'Version', encoding: 'Encoding', hex: 'Hex', size: 'Size',
    adhocEraDesc: 'Sequential field layout, no type tags',
    tlvEraDesc: 'Type-Length-Value, forward-compatible, security primitives',
    baselineEra: 'Baseline',
  },
  ru: {
    lang: 'ru', htmlLang: 'ru',
    title: 'Эволюция кодеков VoidPay — Бенчмарк размера',
    subtitle: `Длина закодированного URL в символах для ${codecInfos.length} версий кодека · ${scenarios.length} тестовых сценариев`,
    bestOverall: 'Лучший результат',
    codecsCompared: 'Сравнено кодеков',
    v0Baseline: 'Базовая версия v0',
    avgSmaller: 'меньше чем v0',
    results: 'Результаты',
    resultsDesc: 'Длина закодированной строки в символах · шкала относительно Raw эталона в каждой строке · <span class="pos">зелёный</span> = лучший, <span class="neg">красный</span> = худший в сценарии',
    adhocBinary: 'Ad-hoc Binary',
    tlvStructured: 'TLV Structured',
    scenario: 'Сценарий',
    raw: 'Raw',
    visualComparison: 'Визуальное сравнение',
    formatAnatomy: 'Анатомия форматов',
    formatAnatomyDesc: 'Как каждый формат кодирует один и тот же инвойс — выберите версию, чтобы изучить пайплайн, структуру и компромиссы',
    encodedUrls: 'Закодированные URL',
    codecMetadata: 'Метаданные кодеков',
    metaVer: 'Вер', metaName: 'Название', metaDate: 'Дата', metaDesc: 'Описание',
    metaCompression: 'Сжатие', metaEncoding: 'Кодировка', metaBrowser: 'Браузер', metaCommit: 'Коммит',
    generated: 'Сгенерировано',
    copy: 'Копия', copied: 'Скопировано!', failed: 'Ошибка',
    chars: 'симв.',
    encodingPipeline: 'Пайплайн кодирования',
    byteStructure: 'Структура байтов',
    approxAllocation: '(приблизительное распределение)',
    innovations: 'Нововведения',
    limitations: 'Ограничения',
    fieldEncodingComparison: 'Сравнение кодирования полей',
    fieldComparisonDesc: 'Одни и те же поля инвойса — как каждая версия их кодирует',
    field: 'Поле', version: 'Версия', encoding: 'Кодирование', hex: 'Hex', size: 'Размер',
    adhocEraDesc: 'Последовательная запись полей, без тегов типов',
    tlvEraDesc: 'Type-Length-Value, прямая совместимость, криптографические примитивы',
    baselineEra: 'Эталон',
  },
}

// ---- Educational data ----

interface FormatEdu {
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

const FORMAT_EDU_EN: FormatEdu[] = [
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
      { label: 'Salt', pct: 5, color: '#ef4444' },
      { label: 'DomSep', pct: 10, color: '#dc2626' },
      { label: 'Binary+Text (Brotli)', pct: 71, color: '#6366f1' },
      { label: 'Encoding', pct: 12, color: '#737373' },
    ],
    structNote: 'VERSION high bit = compression flag: 0x01 = raw, 0x81 = Brotli body',
    innovations: ['Whole-payload Brotli: compresses ALL TLV body, not just text fields', 'Salt reduced 16B → 8B (64-bit, sufficient for HMAC-SHA256 derivation)', 'DomSep reduced 32B → 16B (128-bit, matches AES-GCM/TLS tag standard)', 'Updated app-dict: +development, +consulting, +INV-, +@hotmail.com', 'Zero-cost compression flag via VERSION byte high bit'],
    limitations: ['Brotli requires Node.js (not browser-native)', 'Irreducible security overhead: Salt(8B) + DomSep(16B) = 24B'],
    keyInsight: 'Whole-payload Brotli gives the compressor full context — binary addresses, TLV headers, and text all contribute to the compression dictionary. For full invoices this beats selective compression by 40+ characters.',
  },
]

const FORMAT_EDU_RU: FormatEdu[] = [
  {
    ver: 'v0', name: 'JSON + lz-string', era: 'baseline',
    pipeline: [
      { label: 'Объект инвойса' },
      { label: 'JSON.stringify', accent: '#f59e0b' },
      { label: 'LZ77 сжатие', accent: '#6366f1' },
      { label: 'URI-кодирование', accent: '#737373' },
    ],
    structure: [
      { label: 'Сжатый JSON-блоб', pct: 100, color: '#6366f1' },
    ],
    structNote: 'Непрозрачный — доступ к полям только после полной декомпрессии',
    innovations: ['Работает в браузере', 'Единственная зависимость — lz-string'],
    limitations: ['Ключи JSON тратят ~40% места ("invoiceId":, "walletAddress":)', 'LZ77 — самый слабый современный компрессор', 'URI-кодирование раздувает данные на ~30%'],
    keyInsight: 'Каждый инвойс повторяет одни и те же ключи JSON. Для известной схемы эти ключи — чистые потери: декодер и так знает названия полей.',
  },
  {
    ver: 'v1', name: 'Binary v1', era: 'adhoc',
    pipeline: [
      { label: 'Объект инвойса' },
      { label: 'Бинарные поля последовательно', accent: '#22c55e' },
      { label: 'Base62 кодирование', accent: '#737373' },
    ],
    structure: [
      { label: 'Вер', pct: 1, color: '#a3a3a3' },
      { label: 'UUID', pct: 14, color: '#ef4444' },
      { label: 'Даты', pct: 7, color: '#f59e0b' },
      { label: 'Сеть+Валюта', pct: 4, color: '#8b5cf6' },
      { label: 'Адреса', pct: 18, color: '#3b82f6' },
      { label: 'Имена+Текст', pct: 35, color: '#22c55e' },
      { label: 'Позиции', pct: 21, color: '#06b6d4' },
    ],
    structNote: 'Фиксированный порядок полей — декодер читает последовательно, позиция = смысл',
    innovations: ['Убран оверхед ключей JSON', 'Адреса кошельков как 20 сырых байт (не 42-символьные hex-строки)', 'Varint-кодирование для маленьких чисел'],
    limitations: ['Нет флагов опциональных полей — null-маркеры по-прежнему занимают по 1 байту', 'InvoiceId хранится как 16-байтный UUID (расточительно для коротких ID)', 'Текст хранится как сырой UTF-8 (без сжатия)'],
    keyInsight: '42-символьный hex-адрес "0xd8dA6BF2..." превращается в 20 сырых байт — экономия 22 байт на адрес. Одно это изменение экономит ~44 байта для инвойса с двумя сторонами.',
  },
  {
    ver: 'v2', name: 'Binary v2', era: 'adhoc',
    pipeline: [
      { label: 'Объект инвойса' },
      { label: 'Битовые флаги + словари', accent: '#f59e0b' },
      { label: 'Бинарная запись', accent: '#22c55e' },
      { label: 'Base62 кодирование', accent: '#737373' },
    ],
    structure: [
      { label: 'Вер', pct: 1, color: '#a3a3a3' },
      { label: 'Флаги', pct: 2, color: '#ef4444' },
      { label: 'ID+Даты', pct: 12, color: '#f59e0b' },
      { label: 'Словари', pct: 4, color: '#8b5cf6' },
      { label: 'Адреса', pct: 18, color: '#3b82f6' },
      { label: 'Имена+Текст', pct: 38, color: '#22c55e' },
      { label: 'Позиции', pct: 25, color: '#06b6d4' },
    ],
    structNote: '2-байтовые битовые флаги определяют наличие опциональных полей',
    innovations: ['Битовые флаги: 2 байта кодируют наличие 11 опциональных полей', 'Дельта-дата: dueAt − issuedAt как varint (4Б → 3Б)', 'Словарь валют: "USDC" → 0x01 (4Б → 2Б)', 'Словарь токенов: 20Б → 2Б для известных токенов'],
    limitations: ['Текст всё ещё без сжатия', 'Добавление новых опциональных полей требует новых бит флагов', 'Фиксированный порядок полей ограничивает расширяемость'],
    keyInsight: 'Битовые флаги устраняют null-маркеры: 11 опциональных полей × 1 байт = 11 байт экономии. Словарь валют превращает "USDC" в один байт.',
  },
  {
    ver: 'v3', name: 'Binary v3 (Hybrid)', era: 'adhoc',
    pipeline: [
      { label: 'Объект инвойса' },
      { label: 'Бинарный заголовок', accent: '#3b82f6' },
      { label: 'Сборка текст-блоба', accent: '#22c55e' },
      { label: 'DEFLATE текста (опционально)', accent: '#6366f1' },
      { label: 'Base62 кодирование', accent: '#737373' },
    ],
    structure: [
      { label: 'Заголовок', pct: 3, color: '#a3a3a3' },
      { label: 'Бинарные поля', pct: 30, color: '#3b82f6' },
      { label: 'Сжатый текст-блоб', pct: 55, color: '#6366f1' },
      { label: 'Оверхед Base62', pct: 12, color: '#737373' },
    ],
    structNote: 'Две зоны: бинарный заголовок (адреса, даты) + текст-блоб (имена, заметки, позиции)',
    innovations: ['Гибридная архитектура: бинарное для структурированных данных, блоб для текста', 'DEFLATE сжатие текст-блоба (при > 100 байт)', 'Бит TEXT_COMPRESSED сигнализирует декодеру о сжатии', 'Текстовые поля объединяются через \\x00 для лучшего контекста сжатия'],
    limitations: ['DEFLATE слабее Brotli (zlib level 6 vs Brotli q11)', 'Нет криптографических примитивов (salt, domain separator)', 'Нет прямой совместимости (новые поля ломают старые декодеры)', 'Base62: расширение 1.37× (vs 1.33× для Base64url)'],
    keyInsight: 'Объединение всего текста в один блоб перед сжатием даёт DEFLATE больше контекста для поиска повторов — "alice@studio.com" и "bob@corp.io" имеют общий суффикс ".com", который дедуплицируется.',
  },
  {
    ver: 'v4', name: 'TLV v1', era: 'tlv',
    pipeline: [
      { label: 'Объект инвойса' },
      { label: 'TLV записи', accent: '#22c55e' },
      { label: 'Групповой DEFLATE', accent: '#6366f1' },
      { label: 'keccak256 domain sep', accent: '#ef4444' },
      { label: 'Mix-префикс', accent: '#f59e0b' },
      { label: 'Base62 кодирование', accent: '#737373' },
    ],
    structure: [
      { label: 'Mix', pct: 1, color: '#f59e0b' },
      { label: 'Загол.', pct: 2, color: '#a3a3a3' },
      { label: 'Salt', pct: 8, color: '#ef4444' },
      { label: 'DomSep', pct: 17, color: '#dc2626' },
      { label: 'Бинарные TLV', pct: 30, color: '#3b82f6' },
      { label: 'Текстовые TLV', pct: 30, color: '#22c55e' },
      { label: 'Кодировка', pct: 12, color: '#737373' },
    ],
    structNote: 'Type-Length-Value записи: каждое поле самоописывается (тип=1Б, длина=uint16, значение=NБ)',
    innovations: ['TLV формат: прямая совместимость (неизвестные типы безопасно пропускаются)', 'Salt (16Б): приватность — одинаковый инвойс создаёт разные URL', 'Domain separator (32Б): тег целостности keccak256', 'Каноническая сортировка: записи по типу для детерминированного хеширования', 'Чётный тип = обязательное, нечётный = опциональное (конвенция BOLT12)'],
    limitations: ['Оверхед безопасности: Salt(16Б) + DomSep(32Б) + MixPrefix(2Б) = 50 байт', 'uint16 длины: 2 байта на TLV (расточительно для маленьких значений)', '4-байтный заголовок: [MAGIC, VERSION, 0x00, COUNT]', 'DEFLATE только на опциональных текстовых полях (обязательные не сжимаются)'],
    keyInsight: 'TLV формат — архитектурный прорыв: он делает кодек расширяемым. Новые типы полей можно добавлять не ломая старые декодеры. Но оверхед безопасности (50 байт) делает маленькие инвойсы значительно больше.',
  },
  {
    ver: 'v5', name: 'TLV v1 Rewrite', era: 'tlv',
    pipeline: [
      { label: 'Объект инвойса' },
      { label: 'TLV записи', accent: '#22c55e' },
      { label: 'Подстановка app-dict', accent: '#f59e0b' },
      { label: 'Групповой Brotli', accent: '#6366f1' },
      { label: 'keccak256 domain sep', accent: '#ef4444' },
      { label: 'Base64url кодирование', accent: '#737373' },
    ],
    structure: [
      { label: 'Загол.', pct: 2, color: '#a3a3a3' },
      { label: 'Salt', pct: 9, color: '#ef4444' },
      { label: 'DomSep', pct: 18, color: '#dc2626' },
      { label: 'Бинарные TLV', pct: 32, color: '#3b82f6' },
      { label: 'Сжатый текст', pct: 27, color: '#22c55e' },
      { label: 'Кодировка', pct: 12, color: '#737373' },
    ],
    structNote: '3-байтный заголовок [MAGIC, VERSION, COUNT] + varint-длины (1 байт для значений < 128)',
    innovations: ['Brotli q11: ~20% лучше DEFLATE на типичных данных', 'Прикладной словарь: @gmail.com → 1 байт', 'Varint-длины TLV: 1 байт (не 2) для значений < 128', 'Словарь сетей: chainId 42161 → 0x02 (3Б → 2Б)', 'Мантисса-кодирование: 500000000000000000 → [5, 17] (18Б → 2Б)', 'Base64url: расширение 1.33× (vs 1.37× для Base62)', 'Убран keccak mix-префикс (−2Б)'],
    limitations: ['Salt по-прежнему 16Б, DomSep по-прежнему 32Б', 'Групповой Brotli сжимает только опциональные текстовые поля', 'Обязательные поля (имена, позиции) вне области сжатия'],
    keyInsight: 'Мантисса-кодирование — главный выигрыш для сумм: "500000000000000000" (18 символов текстом) становится мантисса=5 + экспонента=17 → всего 2 байта. Это важно, потому что крипто-суммы routinely имеют 18 десятичных знаков.',
  },
  {
    ver: 'v6', name: 'TLV v1 Optimized', era: 'tlv',
    pipeline: [
      { label: 'Объект инвойса' },
      { label: 'TLV записи', accent: '#22c55e' },
      { label: 'Подстановка app-dict', accent: '#f59e0b' },
      { label: 'Сериализация TLV', accent: '#3b82f6' },
      { label: 'Brotli всего payload', accent: '#6366f1' },
      { label: 'Base64url кодирование', accent: '#737373' },
    ],
    structure: [
      { label: 'Загол.', pct: 2, color: '#a3a3a3' },
      { label: 'Salt', pct: 5, color: '#ef4444' },
      { label: 'DomSep', pct: 10, color: '#dc2626' },
      { label: 'Binary+Text (Brotli)', pct: 71, color: '#6366f1' },
      { label: 'Кодировка', pct: 12, color: '#737373' },
    ],
    structNote: 'Старший бит VERSION = флаг сжатия: 0x01 = raw, 0x81 = Brotli-тело',
    innovations: ['Brotli всего payload: сжимает ВСЁ тело TLV, а не только текстовые поля', 'Salt уменьшен 16Б → 8Б (64-бит, достаточно для HMAC-SHA256)', 'DomSep уменьшен 32Б → 16Б (128-бит, стандарт AES-GCM/TLS тегов)', 'Обновлённый app-dict: +development, +consulting, +INV-, +@hotmail.com', 'Бесплатный флаг сжатия через старший бит байта VERSION'],
    limitations: ['Brotli требует Node.js (не работает в браузере нативно)', 'Неустранимый оверхед безопасности: Salt(8Б) + DomSep(16Б) = 24Б'],
    keyInsight: 'Brotli всего payload даёт компрессору полный контекст — бинарные адреса, TLV-заголовки и текст все вносят вклад в словарь сжатия. Для полных инвойсов это даёт выигрыш 40+ символов по сравнению с селективным сжатием.',
  },
]

const FORMAT_EDU: Record<Lang, FormatEdu[]> = { en: FORMAT_EDU_EN, ru: FORMAT_EDU_RU }

// Field encoding comparison
interface FieldComparison {
  field: string
  description: string
  versions: { ver: string; encoding: string; bytes: string; size: number }[]
}

const FIELD_COMPARISONS: FieldComparison[] = [
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
      { ver: 'v6', encoding: 'Salt(8B) + DomSep(16B)', bytes: '...', size: 24 },
    ],
  },
]

// ---- HTML generators ----

function generateEducationHtml(t: Tr, eduData: FormatEdu[]): string {
  const tabs = eduData
    .map((f, i) => `<button class="edu-tab${i === 0 ? ' active' : ''}" data-ver="${f.ver}" onclick="showEdu(this)">${f.ver}</button>`)
    .join('\n    ')

  const panels = eduData.map((f, i) => {
    const pipeSteps = f.pipeline
      .map((s, si) => {
        const accent = s.accent ? `border-color:${s.accent};color:${s.accent}` : 'border-color:#404040;color:#a3a3a3'
        const arrow = si < f.pipeline.length - 1 ? '<span class="pipe-arrow">→</span>' : ''
        return `<span class="pipe-step" style="${accent}">${esc(s.label)}</span>${arrow}`
      })
      .join('\n          ')

    const structBars = f.structure
      .map(s => `<div class="struct-seg" style="width:${s.pct}%;background:${s.color}" title="${esc(s.label)}: ~${s.pct}%">
              <span class="struct-label">${esc(s.label)}</span>
            </div>`)
      .join('\n          ')

    const innovations = f.innovations
      .map(inn => `<div class="edu-item edu-pro"><span class="edu-icon">+</span>${esc(inn)}</div>`)
      .join('\n          ')

    const limitations = f.limitations
      .map(lim => `<div class="edu-item edu-con"><span class="edu-icon">−</span>${esc(lim)}</div>`)
      .join('\n          ')

    const eraLabel = f.era === 'baseline' ? t.baselineEra : f.era === 'adhoc' ? t.adhocBinary : t.tlvStructured
    const eraColor = f.era === 'baseline' ? '#525252' : f.era === 'adhoc' ? '#f59e0b' : '#3b82f6'

    return `<div class="edu-panel${i === 0 ? '' : ' hidden'}" id="edu-${f.ver}">
        <div class="edu-header">
          <div>
            <span class="edu-ver">${f.ver}</span>
            <span class="edu-name">${esc(f.name)}</span>
            <span class="edu-era" style="background:${eraColor}">${eraLabel}</span>
          </div>
        </div>
        <div class="edu-section">
          <div class="edu-section-title">${t.encodingPipeline}</div>
          <div class="pipe-flow">${pipeSteps}</div>
        </div>
        <div class="edu-section">
          <div class="edu-section-title">${t.byteStructure} <span class="edu-dim">${t.approxAllocation}</span></div>
          <div class="struct-bar-container">${structBars}</div>
          <div class="struct-note">${esc(f.structNote)}</div>
        </div>
        <div class="edu-columns">
          <div class="edu-section">
            <div class="edu-section-title">${t.innovations}</div>
            ${innovations}
          </div>
          <div class="edu-section">
            <div class="edu-section-title">${t.limitations}</div>
            ${limitations}
          </div>
        </div>
        <div class="edu-insight">
          <span class="edu-insight-icon">&#x1f4a1;</span>
          <span>${esc(f.keyInsight)}</span>
        </div>
      </div>`
  }).join('\n    ')

  // Field comparison table (technical — same for both languages)
  const fieldRows = FIELD_COMPARISONS.map(fc => {
    return fc.versions.map((v, vi) => {
      const sizeBar = fc.versions[0]!.size > 0
        ? `<div class="field-bar" style="width:${Math.round((v.size / fc.versions[0]!.size) * 100)}%;background:${v.size <= 4 ? '#22c55e' : v.size <= 10 ? '#f59e0b' : '#ef4444'}"></div>`
        : ''
      return `<tr${vi === 0 ? ' class="field-first"' : ''}>
          ${vi === 0 ? `<td rowspan="${fc.versions.length}" class="field-name"><div>${esc(fc.field)}</div><div class="field-desc">${esc(fc.description)}</div></td>` : ''}
          <td class="field-ver">${esc(v.ver)}</td>
          <td class="field-enc">${esc(v.encoding)}</td>
          <td class="field-hex"><code>${esc(v.bytes)}</code></td>
          <td class="field-size">
            <div class="field-size-row">
              <span>${v.size > 0 ? v.size + 'B' : '—'}</span>
              ${sizeBar}
            </div>
          </td>
        </tr>`
    }).join('\n      ')
  }).join('\n      ')

  return `
    <div class="edu-tabs" id="eduTabs">${tabs}</div>
    ${panels}
    <div class="edu-section" style="margin-top:2rem">
      <h3 style="color:#e5e5e5;font-size:1rem;margin-bottom:0.75rem">${t.fieldEncodingComparison}</h3>
      <p style="color:#525252;font-size:0.8rem;margin:-0.25rem 0 1rem">${t.fieldComparisonDesc}</p>
      <table class="field-table">
        <thead>
          <tr><th>${t.field}</th><th>${t.version}</th><th>${t.encoding}</th><th>${t.hex}</th><th>${t.size}</th></tr>
        </thead>
        <tbody>${fieldRows}</tbody>
      </table>
    </div>`
}

function generateDemoHtml(lang: Lang): string {
  const t = TR[lang]
  const eduData = FORMAT_EDU[lang]
  const ERA_BOUNDARY = 4

  function cellColor(length: number, min: number, max: number): string {
    if (max === min) return '#22c55e'
    const ratio = (length - min) / (max - min)
    const r = Math.round(34 + ratio * (239 - 34))
    const g = Math.round(197 - ratio * (197 - 68))
    const b = Math.round(94 - ratio * (94 - 68))
    return `rgb(${r},${g},${b})`
  }

  function reductionColor(pct: number): string {
    const clamped = Math.max(0, Math.min(100, pct)) / 100
    if (clamped >= 0.5) {
      const s = (clamped - 0.5) * 2
      return `rgb(${Math.round(234 - s * 200)},${Math.round(179 + s * 18)},68)`
    }
    const s = clamped * 2
    return `rgb(${Math.round(239 - s * 5)},${Math.round(68 + s * 111)},68)`
  }

  // Build results table rows — Raw = 100% baseline per row
  const tableRows = scenarios
    .map(s => {
      const raw = rawJsonSize[s]!
      const lengths = versions.map(v => lookup[s]![v]!.length)
      const minLen = Math.min(...lengths)
      const maxLen = Math.max(...lengths)

      const rawCell = `<td class="raw-cell">
          <div class="cell-bar"><div class="cell-fill" style="width:100%;background:#525252"></div></div>
          <div class="cell-val"><span>${raw}</span><span class="reduction zero">0%</span></div>
        </td>`

      const cells = versions
        .map((v, vi) => {
          const { length } = lookup[s]![v]!
          const barColor = cellColor(length, minLen, maxLen)
          const isBest = bestPerScenario[s] === v
          const barPct = Math.min(100, Math.round((length / raw) * 100))
          const reduction = Math.round((1 - length / raw) * 100)
          const redStr = reduction >= 0 ? `−${reduction}%` : `+${Math.abs(reduction)}%`
          const redColor = reductionColor(reduction)
          const eraBorder = vi === ERA_BOUNDARY ? 'border-left:2px solid #404040;' : ''
          return `<td style="${eraBorder}">
          <div class="cell-bar"><div class="cell-fill" style="width:${barPct}%;background:${barColor}"></div></div>
          <div class="cell-val">
            <span${isBest ? ' class="best"' : ''}>${length}</span>
            <span class="reduction" style="color:${redColor}">${redStr}</span>
          </div>
        </td>`
        })
        .join('\n')
      return `<tr><td class="scenario-name">${s}</td>${rawCell}${cells}</tr>`
    })
    .join('\n')

  const versionHeaders = versions
    .map((v, vi) => {
      const eraBorder = vi === ERA_BOUNDARY ? 'border-left:2px solid #404040;' : ''
      return `<th style="${eraBorder}">${v}</th>`
    })
    .join('\n        ')

  // Bar charts
  const barCharts = scenarios
    .map(s => {
      const lengths = versions.map(v => lookup[s]![v]!.length)
      const maxLen = Math.max(...lengths)
      const minLen = Math.min(...lengths)
      const bars = CODECS.map(c => {
        const { length } = lookup[s]![c.info.version]!
        const pct = Math.round((length / maxLen) * 100)
        const color = cellColor(length, minLen, maxLen)
        return `<div style="display:flex;align-items:center;gap:8px;margin:4px 0">
          <span style="width:32px;text-align:right;color:#a3a3a3;font-size:0.8rem;flex-shrink:0">${c.info.version}</span>
          <div style="flex:1;display:flex;align-items:center;gap:8px">
            <div style="background:${color};height:20px;width:${pct}%;border-radius:3px;min-width:4px"></div>
            <span style="color:#e5e5e5;font-size:0.85rem;flex-shrink:0">${length}</span>
          </div>
        </div>`
      }).join('\n')
      return `<div class="card">
      <div style="color:#a3a3a3;font-size:0.9rem;margin-bottom:0.5rem">${s}</div>
      ${bars}
    </div>`
    })
    .join('\n')

  // URL comparison panels
  const urlTabs = scenarios
    .map((s, i) => `<button class="url-tab${i === 0 ? ' active' : ''}" data-scenario="${esc(s)}" onclick="showScenario(this)">${esc(s)}</button>`)
    .join('\n  ')

  const urlPanels = scenarios
    .map((s, i) => {
      const lengths = versions.map(v => lookup[s]![v]!.length)
      const minLen = Math.min(...lengths)
      const maxLen = Math.max(...lengths)
      const rows = versions.map(v => {
        const { length } = lookup[s]![v]!
        const encoded = urlsLookup[s]![v]!
        const fullUrl = `https://voidpay.xyz/pay#${encoded}`
        const isBest = bestPerScenario[s] === v
        const color = cellColor(length, minLen, maxLen)
        const codecName = codecInfos.find(c => c.version === v)?.name ?? v
        const panelId = `url-${s.replace(/\s+/g, '-')}-${v}`
        return `<div class="url-row${isBest ? ' url-best' : ''}">
        <div class="url-meta">
          <span class="url-ver">${v}</span>
          <span class="url-name">${esc(codecName)}</span>
          <span class="url-len" style="color:${color}">${length} ${t.chars}</span>
        </div>
        <div class="url-content">
          <code class="url-text" id="${panelId}">${esc(fullUrl)}</code>
          <button class="copy-btn" data-url="${esc(fullUrl)}" onclick="copyUrl(this,'${esc(t.copied)}','${esc(t.failed)}','${esc(t.copy)}')">${t.copy}</button>
        </div>
      </div>`
      }).join('\n      ')
      return `<div class="url-panel${i === 0 ? '' : ' hidden'}" id="panel-${s.replace(/\s+/g, '-')}">
      ${rows}
    </div>`
    })
    .join('\n')

  // Codec metadata
  const metaRows = codecInfos
    .map((c, i) => {
      const eraLabel = i === 0
        ? `<tr class="era-sep"><td colspan="8"><span class="era-tag">${t.adhocBinary}</span> ${t.adhocEraDesc}</td></tr>\n`
        : i === ERA_BOUNDARY
          ? `<tr class="era-sep"><td colspan="8"><span class="era-tag">${t.tlvStructured}</span> ${t.tlvEraDesc}</td></tr>\n`
          : ''
      return `${eraLabel}<tr>
      <td><strong>${c.version}</strong></td>
      <td>${c.name}</td>
      <td>${c.date}</td>
      <td class="meta-desc">${esc(c.description)}</td>
      <td>${c.compression}</td>
      <td>${c.encoding}</td>
      <td>${c.browserCompatible ? '✓' : '✗'}</td>
      <td style="font-family:monospace">${c.commit}</td>
    </tr>`
    })
    .join('\n')

  // Summary
  const bestOverallVersion = versions.reduce((best, v) =>
    avgReduction[v]! > avgReduction[best]! ? v : best,
  )
  const bestCodecInfo = codecInfos.find(c => c.version === bestOverallVersion)!

  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #e5e5e5; margin: 0; padding: 2rem; }
    h1 { color: #fff; font-size: 1.5rem; margin-bottom: 0.25rem; }
    .subtitle { color: #737373; font-size: 0.9rem; margin-bottom: 2rem; }
    h2 { color: #a3a3a3; margin-top: 2.5rem; font-size: 1.1rem; border-bottom: 1px solid #262626; padding-bottom: 0.5rem; }
    .summary { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1.5rem 0; }
    .card { background: #171717; border: 1px solid #262626; border-radius: 8px; padding: 1rem 1.5rem; }
    .card .label { color: #737373; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .card .value { font-size: 1.4rem; font-weight: 700; margin-top: 0.25rem; }
    .card .sub { font-size: 0.8rem; color: #525252; margin-top: 0.25rem; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.9rem; }
    th, td { padding: 0.5rem 0.75rem; text-align: right; border: 1px solid #262626; }
    th { background: #111; color: #a3a3a3; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
    td:first-child, th:first-child { text-align: left; }
    .best { font-weight: 700; color: #22c55e; }
    .reduction { display: block; font-size: 0.72rem; margin-top: 2px; }
    .pos { color: #22c55e; } .neg { color: #ef4444; } .zero { color: #737373; }
    .results td { padding: 0.35rem 0.5rem; vertical-align: middle; min-width: 80px; }
    .results .raw-cell { opacity: 0.5; }
    .results .scenario-name { font-weight: 500; white-space: nowrap; min-width: 0; }
    .cell-bar { height: 6px; background: #1a1a1a; border-radius: 3px; margin-bottom: 4px; overflow: hidden; }
    .cell-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
    .cell-val { display: flex; justify-content: space-between; align-items: baseline; gap: 4px; }
    .cell-val span:first-child { font-size: 0.9rem; font-weight: 600; font-variant-numeric: tabular-nums; }
    .meta td, .meta th { border-color: #1a1a1a; padding: 0.35rem 0.75rem; font-size: 0.82rem; }
    .meta td:nth-child(7) { text-align: center; }
    .meta .meta-desc { color: #737373; font-size: 0.78rem; max-width: 280px; text-align: left; }
    .era-sep td { background: #111; border-color: #1a1a1a; padding: 0.5rem 0.75rem; color: #a3a3a3; font-size: 0.78rem; }
    .era-tag { background: #262626; color: #e5e5e5; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.15rem 0.5rem; border-radius: 3px; margin-right: 0.5rem; }
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .url-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .url-tab { background: #171717; border: 1px solid #262626; color: #737373; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.82rem; transition: all 0.1s; }
    .url-tab:hover { border-color: #404040; color: #a3a3a3; }
    .url-tab.active { background: #262626; color: #e5e5e5; border-color: #404040; }
    .url-panel { display: flex; flex-direction: column; gap: 0.5rem; }
    .url-panel.hidden { display: none; }
    .url-row { background: #111; border: 1px solid #1e1e1e; border-radius: 6px; padding: 0.6rem 0.75rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .url-row.url-best { border-color: #166534; }
    .url-meta { display: flex; align-items: center; gap: 0.5rem; }
    .url-ver { background: #1e1e1e; color: #a3a3a3; font-family: monospace; font-size: 0.75rem; padding: 0.1rem 0.4rem; border-radius: 3px; }
    .url-name { color: #525252; font-size: 0.8rem; }
    .url-len { margin-left: auto; font-size: 0.78rem; font-family: monospace; font-weight: 600; }
    .url-content { display: flex; align-items: flex-start; gap: 0.5rem; }
    .url-text { font-family: monospace; font-size: 0.7rem; color: #525252; word-break: break-all; flex: 1; line-height: 1.6; }
    .url-best .url-text { color: #737373; }
    .copy-btn { background: #1e1e1e; border: 1px solid #333; color: #737373; padding: 0.25rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem; white-space: nowrap; flex-shrink: 0; transition: all 0.1s; }
    .copy-btn:hover { background: #262626; color: #e5e5e5; border-color: #404040; }
    .edu-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .edu-tab { background: #171717; border: 1px solid #262626; color: #737373; padding: 0.4rem 0.85rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; font-family: monospace; transition: all 0.15s; }
    .edu-tab:hover { border-color: #404040; color: #a3a3a3; }
    .edu-tab.active { background: #262626; color: #e5e5e5; border-color: #404040; }
    .edu-panel { background: #111; border: 1px solid #1e1e1e; border-radius: 8px; padding: 1.25rem; }
    .edu-panel.hidden { display: none; }
    .edu-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; gap: 0.75rem; }
    .edu-ver { font-family: monospace; font-size: 1.1rem; font-weight: 700; color: #e5e5e5; margin-right: 0.5rem; }
    .edu-name { color: #a3a3a3; font-size: 0.95rem; }
    .edu-era { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.15rem 0.5rem; border-radius: 3px; color: #fff; margin-left: 0.5rem; }
    .edu-section { margin-bottom: 1rem; }
    .edu-section-title { color: #737373; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 0.5rem; }
    .edu-dim { font-weight: 400; text-transform: none; letter-spacing: 0; }
    .edu-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .pipe-flow { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }
    .pipe-step { border: 1px solid; padding: 0.3rem 0.6rem; border-radius: 5px; font-size: 0.8rem; font-weight: 500; white-space: nowrap; }
    .pipe-arrow { color: #404040; font-size: 0.9rem; }
    .struct-bar-container { display: flex; height: 28px; border-radius: 5px; overflow: hidden; margin-bottom: 0.35rem; }
    .struct-seg { display: flex; align-items: center; justify-content: center; min-width: 0; overflow: hidden; transition: width 0.3s; }
    .struct-label { font-size: 0.68rem; color: rgba(255,255,255,0.85); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; }
    .struct-note { color: #525252; font-size: 0.78rem; font-style: italic; }
    .edu-item { font-size: 0.82rem; padding: 0.2rem 0; display: flex; gap: 0.4rem; line-height: 1.4; }
    .edu-icon { font-weight: 700; width: 14px; flex-shrink: 0; text-align: center; }
    .edu-pro { color: #a3a3a3; } .edu-pro .edu-icon { color: #22c55e; }
    .edu-con { color: #737373; } .edu-con .edu-icon { color: #ef4444; }
    .edu-insight { background: #1a1a2e; border: 1px solid #262650; border-radius: 6px; padding: 0.6rem 0.85rem; font-size: 0.82rem; color: #a3a3d4; display: flex; gap: 0.5rem; align-items: flex-start; line-height: 1.5; }
    .edu-insight-icon { font-size: 1rem; flex-shrink: 0; }
    .field-table { border-collapse: collapse; width: 100%; font-size: 0.82rem; }
    .field-table th { background: #111; color: #737373; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.4rem 0.6rem; text-align: left; border: 1px solid #1a1a1a; }
    .field-table td { padding: 0.35rem 0.6rem; border: 1px solid #1a1a1a; vertical-align: middle; }
    .field-name { background: #0d0d0d; font-weight: 600; color: #e5e5e5; white-space: nowrap; }
    .field-desc { color: #525252; font-size: 0.75rem; font-weight: 400; margin-top: 0.15rem; }
    .field-first td { border-top: 1px solid #333; }
    .field-ver { font-family: monospace; color: #a3a3a3; font-size: 0.78rem; white-space: nowrap; }
    .field-enc { color: #a3a3a3; }
    .field-hex code { color: #525252; font-size: 0.72rem; word-break: break-all; }
    .field-size { min-width: 80px; }
    .field-size-row { display: flex; align-items: center; gap: 6px; }
    .field-size-row span { font-family: monospace; font-weight: 600; font-size: 0.8rem; color: #a3a3a3; white-space: nowrap; min-width: 28px; }
    .field-bar { height: 8px; border-radius: 4px; min-width: 3px; transition: width 0.3s; }
    @media (max-width: 600px) { body { padding: 1rem; } .summary { flex-direction: column; } .edu-columns { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <h1>${t.title}</h1>
  <div class="subtitle">${t.subtitle}</div>

  <div class="summary">
    <div class="card">
      <div class="label">${t.bestOverall}</div>
      <div class="value">${bestCodecInfo.version} — ${bestCodecInfo.name}</div>
      <div class="sub">Avg ${avgReduction[bestOverallVersion]}% ${t.avgSmaller}</div>
    </div>
    <div class="card">
      <div class="label">${t.codecsCompared}</div>
      <div class="value">${codecInfos.length}</div>
      <div class="sub">v0 (2025-11) → v6 (2026-03)</div>
    </div>
    <div class="card">
      <div class="label">${t.v0Baseline}</div>
      <div class="value">JSON + lz-string</div>
      <div class="sub">URI-encoded, LZ77 compression</div>
    </div>
  </div>

  <h2>${t.results}</h2>
  <p style="color:#525252;font-size:0.8rem;margin:-0.5rem 0 1rem">${t.resultsDesc}</p>
  <table class="results">
    <thead>
      <tr>
        <th></th>
        <th style="text-align:center;color:#525252;font-weight:400;border-bottom:2px solid #262626;letter-spacing:0">${t.baselineEra}</th>
        <th colspan="${ERA_BOUNDARY}" style="text-align:center;color:#737373;font-weight:400;border-bottom:2px solid #333;letter-spacing:0">${t.adhocBinary}</th>
        <th colspan="${versions.length - ERA_BOUNDARY}" style="text-align:center;color:#737373;font-weight:400;border-bottom:2px solid #525252;letter-spacing:0">${t.tlvStructured}</th>
      </tr>
      <tr>
        <th>${t.scenario}</th>
        <th style="color:#525252">${t.raw}</th>
        ${versionHeaders}
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <h2>${t.visualComparison}</h2>
  <div class="charts-grid">${barCharts}</div>

  <h2>${t.formatAnatomy}</h2>
  <p style="color:#525252;font-size:0.8rem;margin:-0.5rem 0 1rem">${t.formatAnatomyDesc}</p>
  ${generateEducationHtml(t, eduData)}

  <h2>${t.encodedUrls}</h2>
  <div class="url-tabs" id="urlTabs">${urlTabs}</div>
  ${urlPanels}

  <h2>${t.codecMetadata}</h2>
  <table class="meta">
    <thead>
      <tr><th>${t.metaVer}</th><th>${t.metaName}</th><th>${t.metaDate}</th><th>${t.metaDesc}</th><th>${t.metaCompression}</th><th>${t.metaEncoding}</th><th>${t.metaBrowser}</th><th>${t.metaCommit}</th></tr>
    </thead>
    <tbody>${metaRows}</tbody>
  </table>

  <p style="color:#3f3f46;font-size:0.75rem;margin-top:2rem">
    ${t.generated} ${new Date().toISOString()} · ${scenarios.length} test invoices (minimal → unicode) · Salt deterministic for reproducibility
  </p>

  <script>
    function showEdu(btn) {
      const ver = btn.dataset.ver;
      document.querySelectorAll('.edu-panel').forEach(p => p.classList.add('hidden'));
      document.querySelectorAll('.edu-tab').forEach(t => t.classList.remove('active'));
      const panel = document.getElementById('edu-' + ver);
      if (panel) panel.classList.remove('hidden');
      btn.classList.add('active');
    }
    function showScenario(btn) {
      const name = btn.dataset.scenario;
      document.querySelectorAll('.url-panel').forEach(p => p.classList.add('hidden'));
      document.querySelectorAll('.url-tab').forEach(t => t.classList.remove('active'));
      const panel = document.getElementById('panel-' + name.replace(/\\s+/g, '-'));
      if (panel) panel.classList.remove('hidden');
      btn.classList.add('active');
    }
    function copyUrl(btn, successText, failText, defaultText) {
      const url = btn.dataset.url;
      navigator.clipboard.writeText(url).then(() => {
        btn.textContent = successText;
        btn.style.color = '#22c55e';
        setTimeout(() => { btn.textContent = defaultText; btn.style.color = ''; }, 1500);
      }).catch(() => {
        btn.textContent = failText;
        setTimeout(() => { btn.textContent = defaultText; }, 1500);
      });
    }
  </script>
</body>
</html>`
}

// ---- Generate both files ----

writeFileSync('demo.html', generateDemoHtml('en'))
console.log('✓ demo.html generated')

writeFileSync('demo-ru.html', generateDemoHtml('ru'))
console.log('✓ demo-ru.html generated')
