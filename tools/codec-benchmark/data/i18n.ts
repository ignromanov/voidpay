export type Lang = 'en' | 'ru'

export interface Tr {
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

export const TR: Record<Lang, Tr> = {
  en: {
    lang: 'en', htmlLang: 'en',
    title: 'VoidPay Codec Evolution — Size Benchmark',
    subtitle: `Encoded URL character count across {codecCount} historical codec versions · {scenarioCount} test scenarios`,
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
    subtitle: `Длина закодированного URL в символах для {codecCount} версий кодека · {scenarioCount} тестовых сценариев`,
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
