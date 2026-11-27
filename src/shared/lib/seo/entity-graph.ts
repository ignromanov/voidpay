/**
 * Entity graph (JSON-LD) for voidpay.xyz.
 *
 * One `<script type="application/ld+json">` per indexable page, one `@graph`, and every
 * cross-reference is a bare `{ '@id' }`, so a consumer joins the nodes into one entity
 * instead of reading islands.
 *
 * The Person node is owned by lasipan.cc (`@id` `https://lasipan.cc/#person`). It is embedded
 * here only as a minimal stub; the full node is published on lasipan.cc.
 */
import { version } from '../../../../package.json'
import { APP_URLS, SOCIAL_URLS } from '@/shared/config'

const SITE = APP_URLS.base

export const ENTITY_IDS = {
  organization: `${SITE}/#organization`,
  website: `${SITE}/#website`,
  software: `${SITE}/#software`,
  person: 'https://lasipan.cc/#person',
} as const

export const ref = (id: string) => ({ '@id': id })

/** entity-pack §3 one-liner, verbatim. */
export const VOIDPAY_DESCRIPTION =
  'Crypto invoicing where the invoice lives in the URL, with no backend storage.'

/** Affirmative only: no other brand is named until a confusion is measured (Vega, 2026-11-18). */
const VOIDPAY_DISAMBIGUATION = 'VoidPay is the crypto invoicing web app at voidpay.xyz.'

type Node = Record<string, unknown>

const organization: Node = {
  '@type': 'Organization',
  '@id': ENTITY_IDS.organization,
  name: 'VoidPay',
  alternateName: ['voidpay.xyz'],
  url: `${SITE}/`,
  logo: `${SITE}/icon-512.png`,
  description: VOIDPAY_DESCRIPTION,
  disambiguatingDescription: VOIDPAY_DISAMBIGUATION,
  founder: ref(ENTITY_IDS.person),
  sameAs: [SOCIAL_URLS.twitter, SOCIAL_URLS.github],
}

// Minimal stub: lasipan.cc owns the full Person node; everything else here refers to it by @id.
const person: Node = {
  '@type': 'Person',
  '@id': ENTITY_IDS.person,
  name: 'Ignat Romanov',
  url: 'https://lasipan.cc/',
}

// Google still reads WebSite for the site name. No SearchAction: the sitelinks search box
// was retired in November 2024.
const website: Node = {
  '@type': 'WebSite',
  '@id': ENTITY_IDS.website,
  name: 'VoidPay',
  alternateName: ['voidpay.xyz'],
  url: `${SITE}/`,
  inLanguage: 'en',
  publisher: ref(ENTITY_IDS.organization),
}

const software: Node = {
  '@type': 'SoftwareApplication',
  '@id': ENTITY_IDS.software,
  name: 'VoidPay',
  url: `${SITE}/`,
  description: VOIDPAY_DESCRIPTION,
  disambiguatingDescription: VOIDPAY_DISAMBIGUATION,
  applicationCategory: 'FinanceApplication',
  applicationSubCategory: 'Crypto Invoicing',
  operatingSystem: 'Web Browser',
  browserRequirements: 'Requires JavaScript. Paying an invoice requires a Web3 wallet.',
  // Derived from package.json, never typed by hand.
  softwareVersion: version,
  license: 'https://spdx.org/licenses/MIT.html',
  screenshot: `${SITE}/og-image.png`,
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Zero-backend invoicing',
    'Multi-chain support (Ethereum, Base, Arbitrum, Optimism, Polygon)',
    'PDF export',
    'QR code generation',
    'Privacy-first design',
    'No KYC required',
  ],
  author: ref(ENTITY_IDS.person),
  publisher: ref(ENTITY_IDS.organization),
}

/**
 * Organization and Person on every indexable page; WebSite and SoftwareApplication on the
 * home page only. `nodes` are the page's own nodes (FAQPage, HowTo, WebPage), which point
 * back at the graph by `@id`.
 */
export function entityGraph(nodes: Node[] = [], { home = false } = {}) {
  const base = home ? [organization, person, website, software] : [organization, person]
  return { '@context': 'https://schema.org', '@graph': [...base, ...nodes] }
}

/** JSON for a `<script type="application/ld+json">` body: no "<", so no value can close the element. */
export function serializeJsonLd(graph: object): string {
  return JSON.stringify(graph).replace(/</g, '\\u003c')
}
