/* eslint-disable no-console */
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
const rawJsonSize: Record<string, number> = {}

for (const { name, invoice } of TEST_INVOICES) {
  rawJsonSize[name] = new TextEncoder().encode(JSON.stringify(invoice)).length
  const v0Length = v0.encode(invoice).length
  for (const codec of CODECS) {
    const encoded = codec.encode(invoice)
    const length = encoded.length
    const reduction = Math.round((1 - length / v0Length) * 100)
    results.push({ scenario: name, codec: codec.info.name, version: codec.info.version, length, reduction, encoded })
  }
}

// ---- Console output ----

const scenarios = [...new Set(results.map(r => r.scenario))]
const versions = CODECS.map(c => c.info.version)
const COL_W = 8
const LABEL_W = 16

const header = 'Scenario'.padEnd(LABEL_W) + '| ' + versions.map(v => v.padStart(COL_W - 1)).join(' | ')
console.log('\n' + header)
console.log('-'.repeat(LABEL_W + versions.length * (COL_W + 2)))

for (const scenario of scenarios) {
  const row = scenario.padEnd(LABEL_W) + '| ' + versions
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
    if (len < bestLen) { bestLen = len; best = v }
  }
  bestPerScenario[s] = best
}

const avgReduction: Record<string, number> = {}
for (const v of versions) {
  const reductions = scenarios.map(s => lookup[s]![v]!.reduction)
  avgReduction[v] = Math.round(reductions.reduce((a, b) => a + b, 0) / reductions.length)
}

// ---- i18n + data ----

import { TR } from './data/i18n.js'
import { FORMAT_EDU_EN } from './data/edu-en.js'
import { FORMAT_EDU_RU } from './data/edu-ru.js'
import { FIELD_COMPARISONS } from './data/field-comparisons.js'
import { INTRO_EN } from './data/intro-en.js'
import { INTRO_RU } from './data/intro-ru.js'

// ---- HTML renderers ----

import { renderIntro } from './html/render-intro.js'
import { renderSummary } from './html/render-summary.js'
import { renderResults } from './html/render-results.js'
import { renderEducation } from './html/render-edu.js'
import { renderUrls } from './html/render-urls.js'
import { renderMeta } from './html/render-meta.js'
import { renderPage } from './html/render-page.js'

function generateDemoHtml(lang: 'en' | 'ru'): string {
  const t = {
    ...TR[lang],
    subtitle: TR[lang].subtitle
      .replace('{codecCount}', String(codecInfos.length))
      .replace('{scenarioCount}', String(scenarios.length)),
  }
  const eduData = lang === 'en' ? FORMAT_EDU_EN : FORMAT_EDU_RU
  const intro = lang === 'en' ? INTRO_EN : INTRO_RU

  return renderPage(t, {
    intro: renderIntro(intro),
    summary: renderSummary(t, codecInfos, versions, avgReduction),
    results: renderResults(t, scenarios, versions, codecInfos, rawJsonSize, lookup, bestPerScenario),
    education: renderEducation(t, eduData, FIELD_COMPARISONS),
    urls: renderUrls(t, scenarios, versions, codecInfos, lookup, urlsLookup, bestPerScenario),
    meta: renderMeta(t, codecInfos),
  }, scenarios.length)
}

// ---- Generate both files ----

writeFileSync('demo.html', generateDemoHtml('en'))
console.log('✓ demo.html generated')

writeFileSync('demo-ru.html', generateDemoHtml('ru'))
console.log('✓ demo-ru.html generated')
