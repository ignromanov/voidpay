import type { Metadata } from 'next'
import { LazyWeb3Provider } from '@/app/lazy-web3-provider'
import { APP_URLS } from '@/shared/config'
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
  },
  twitter: {
    card: 'summary',
    title: 'Crypto Invoice Generator — No Signup | VoidPay',
    description:
      'Create a shareable crypto invoice in 30 seconds. No account, no backend — the invoice lives in the URL.',
  },
}

// JSON-LD: WebApplication schema — static literal, no user input
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'VoidPay Crypto Invoice Generator',
  url: CREATE_URL,
  description:
    'Generate shareable crypto invoice links with no account or backend. Invoice data encodes into the URL hash.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'No signup required',
    'No server storage',
    'Ethereum, Base, Arbitrum, Optimism, Polygon',
    'ERC-20 and native token support',
    'Shareable invoice link',
  ],
}

// JSON-LD: FAQPage schema — derived from FAQ_ITEMS (single source of truth)
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
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
      {/* JSON-LD Structured Data — static literals, JSON.stringify only, no XSS surface */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <CreatePageHero />
      <LazyWeb3Provider>
        <CreateWorkspace />
      </LazyWeb3Provider>
      <CreatePageHowItWorks />
      <CreatePageFaq />
    </>
  )
}
