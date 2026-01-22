/**
 * Landing Page - Marketing & SEO
 * Feature: 012-landing-page
 */

import type { Metadata } from 'next'
import Script from 'next/script'

import { UmamiScript } from '@/features/analytics'
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
  applicationSubCategory: 'Crypto Invoicing',
  operatingSystem: 'Web',
  browserRequirements: 'Requires JavaScript. Requires Web3 wallet.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Zero-backend invoicing',
    'Multi-chain support (Ethereum, Arbitrum, Optimism, Polygon)',
    'PDF export',
    'QR code generation',
    'Privacy-first design',
    'No KYC required',
  ],
}

// JSON-LD: HowTo schema for rich snippets
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
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
    'Create crypto invoices in 30 seconds. No accounts, no KYC, no servers. Your data lives in the URL, not our database. Works on ETH, ARB, OP.',
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
      'Privacy-first invoicing for Web3. No accounts, no servers. Your invoice = your URL. Works on Ethereum, Arbitrum, Optimism.',
    url: APP_URLS.base,
    siteName: 'VoidPay',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Invoices in 30 Seconds - No KYC Required',
    description:
      'Stateless invoicing for freelancers & DAOs. Generate a link, share it, get paid. Zero backend, zero tracking.',
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
      {/* HowTo schema for rich snippets - safe: static data with JSON.stringify */}
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Privacy-focused analytics (landing page only, opt-out via footer) */}
      <UmamiScript />

      <main className="relative min-h-screen">
        <LandingContent />
      </main>
    </>
  )
}
