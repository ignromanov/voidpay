/**
 * Landing Page - Marketing & SEO
 * Feature: 012-landing-page
 */

import type { Metadata } from 'next'

import { APP_URLS } from '@/shared/config'
import { ENTITY_IDS, entityGraph, ref, serializeJsonLd } from '@/shared/lib/seo'
import { defaultOgImages } from '@/features/og-image'
import { LandingContent, FAQ_ITEMS } from '@/widgets/landing'

// JSON-LD: page nodes; Organization, Person, WebSite and SoftwareApplication come from entityGraph.
// FAQPage and HowTo no longer earn Google rich results; they stay for answer engines.
const faqSchema = {
  '@type': 'FAQPage',
  '@id': `${APP_URLS.base}/#faq`,
  about: ref(ENTITY_IDS.software),
  isPartOf: ref(ENTITY_IDS.website),
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

// JSON-LD: HowTo schema for rich snippets
const howToSchema = {
  '@type': 'HowTo',
  '@id': `${APP_URLS.base}/#howto`,
  about: ref(ENTITY_IDS.software),
  name: 'How to Create a Crypto Invoice with VoidPay',
  description: 'Create and share crypto invoices in 3 simple steps without signup or servers.',
  totalTime: 'PT30S',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Create',
      text: 'Add invoice details. Pick network and token.',
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'Share',
      text: 'Get a permanent URL. No attachments needed.',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'Get Paid',
      text: 'Client connects wallet and pays. One click.',
      position: 3,
    },
  ],
}

export const metadata: Metadata = {
  title: 'Free Crypto Invoice Generator | No KYC | VoidPay',
  description:
    'Create crypto invoices in 30 seconds. No accounts, no KYC, no servers. Your data lives in the URL, not our database. Works on Ethereum, Base, Arbitrum, Optimism, Polygon.',
  keywords: [
    'crypto invoice',
    'crypto invoicing',
    'web3 payments',
    'web3 invoice',
    'stateless invoicing',
    'privacy-first',
    'privacy-first payments',
    'no-kyc payments',
    'permissionless invoicing',
    'ethereum invoice',
    'arbitrum payments',
    'optimism payments',
    'polygon payments',
    'crypto billing',
    'decentralized payments',
    'freelancer invoice crypto',
    'dao payments',
  ],
  openGraph: {
    title: 'VoidPay - Create Crypto Invoices Without Signup',
    description:
      'Privacy-first invoicing for Web3. No accounts, no servers. Your invoice = your URL. Works on Ethereum, Base, Arbitrum, Optimism.',
    url: APP_URLS.base,
    siteName: 'VoidPay',
    type: 'website',
    locale: 'en_US',
    images: defaultOgImages().openGraph,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Invoices in 30 Seconds - No KYC Required',
    description:
      'Stateless invoicing for freelancers & DAOs. Generate a link, share it, get paid. Zero backend, zero tracking.',
    images: defaultOgImages().twitter,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: APP_URLS.base,
  },
}

export default function LandingPage() {
  return (
    <>
      {/* JSON-LD entity graph — static data, serialized with "<" escaped */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(entityGraph([faqSchema, howToSchema], { home: true })),
        }}
      />

      <main className="relative min-h-screen">
        <LandingContent />
      </main>
    </>
  )
}
