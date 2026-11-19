import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LazyWeb3Provider } from '@/app/lazy-web3-provider'
import { APP_URLS } from '@/shared/config'
import { ENTITY_IDS, entityGraph, ref, serializeJsonLd } from '@/shared/lib/seo'
import { CreatePageHero, CreatePageHowItWorks, CreatePageFaq, FAQ_ITEMS } from '@/widgets/create'
import { CreateWorkspace } from './CreateWorkspace'

const CREATE_URL = `${APP_URLS.base}/create`

export const metadata: Metadata = {
  title: 'Crypto Invoice Generator — No Signup | VoidPay',
  description:
    'Create a shareable crypto invoice in 30 seconds. No account, no backend — the invoice lives in the URL. ETH, Base, Arbitrum, Optimism, Polygon.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: CREATE_URL,
  },
  openGraph: {
    title: 'Crypto Invoice Generator — No Signup | VoidPay',
    description:
      'Create a shareable crypto invoice in 30 seconds. No account, no backend — the invoice lives in the URL.',
    url: CREATE_URL,
    siteName: 'VoidPay',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VoidPay — Crypto Invoice Generator',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Invoice Generator — No Signup | VoidPay',
    description:
      'Create a shareable crypto invoice in 30 seconds. No account, no backend — the invoice lives in the URL.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VoidPay — Crypto Invoice Generator',
      },
    ],
  },
}

// JSON-LD: the page is about the one VoidPay SoftwareApplication (home page), not a second app.
const webPageSchema = {
  '@type': 'WebPage',
  '@id': `${CREATE_URL}#webpage`,
  url: CREATE_URL,
  name: 'Crypto Invoice Generator — No Signup | VoidPay',
  description:
    'Generate shareable crypto invoice links with no account or backend. Invoice data encodes into the URL hash.',
  isPartOf: ref(ENTITY_IDS.website),
  about: ref(ENTITY_IDS.software),
  publisher: ref(ENTITY_IDS.organization),
}

// JSON-LD: FAQPage — derived from FAQ_ITEMS (single source of truth)
const faqSchema = {
  '@type': 'FAQPage',
  '@id': `${CREATE_URL}#faq`,
  isPartOf: ref(ENTITY_IDS.website),
  about: ref(ENTITY_IDS.software),
  mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answer,
    },
  })),
}

export default function CreatePage() {
  return (
    <>
      {/* JSON-LD entity graph — static data, serialized with "<" escaped */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(entityGraph([webPageSchema, faqSchema])),
        }}
      />

      <CreatePageHero />
      <Suspense>
        <LazyWeb3Provider>
          <CreateWorkspace />
        </LazyWeb3Provider>
      </Suspense>
      <CreatePageHowItWorks />
      <CreatePageFaq />
    </>
  )
}
