/**
 * Landing Page - Marketing & SEO
 * Feature: 012-landing-page
 */

import type { Metadata } from 'next'
import Script from 'next/script'

import { APP_URLS, SOCIAL_URLS } from '@/shared/config'
import { LandingContent, FAQ_ITEMS } from '@/widgets/landing'

// JSON-LD: FAQPage schema for rich snippets
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

// JSON-LD: Organization schema
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VoidPay',
  url: APP_URLS.base,
  logo: APP_URLS.logo,
  description: 'Privacy-first, stateless crypto invoicing platform',
  sameAs: [SOCIAL_URLS.github, SOCIAL_URLS.twitter],
}

// JSON-LD: SoftwareApplication schema
const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'VoidPay',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    ratingCount: '1',
  },
}

export const metadata: Metadata = {
  title: 'VoidPay - Stateless Crypto Invoicing',
  description:
    'Create crypto invoices without accounts or servers. Privacy-first, zero-backend invoicing for Ethereum, Arbitrum, and Optimism.',
  keywords: [
    'crypto invoice',
    'web3 payments',
    'stateless invoicing',
    'privacy-first',
    'ethereum invoice',
    'arbitrum payments',
    'optimism payments',
    'crypto billing',
    'decentralized payments',
  ],
  openGraph: {
    title: 'VoidPay - Stateless Crypto Invoicing',
    description:
      'Create crypto invoices without accounts or servers. Privacy-first, zero-backend invoicing.',
    url: APP_URLS.base,
    siteName: 'VoidPay',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoidPay - Stateless Crypto Invoicing',
    description:
      'Create crypto invoices without accounts or servers. Privacy-first, zero-backend invoicing.',
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
      {/* JSON-LD Structured Data */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="software-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <main className="relative min-h-screen">
        <LandingContent />
      </main>
    </>
  )
}
