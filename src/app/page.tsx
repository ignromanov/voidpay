/**
 * Landing Page - Marketing & SEO
 * Feature: 012-landing-page
 */

import type { Metadata } from 'next'

import { LandingContent } from '@/widgets/landing'

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
    url: 'https://voidpay.xyz',
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
    canonical: 'https://voidpay.xyz',
  },
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen">
      <LandingContent />
    </main>
  )
}