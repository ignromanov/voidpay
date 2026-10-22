/**
 * Canonical FAQ data for the /create page.
 * Single source of truth — consumed by both CreatePageFaq (visible HTML)
 * and faqSchema in page.tsx (JSON-LD). Keeping them in sync prevents
 * Google's structured-data/visible-content mismatch penalty.
 */

import type { FaqItem } from '@/shared/lib/faq-types'

export const FAQ_ITEMS = [
  {
    question: 'Do I need to create an account?',
    answer: 'No. VoidPay has no accounts and no signup. Fill the form and share the link.',
  },
  {
    question: 'Where is invoice data stored?',
    answer:
      'In the URL itself. The hash fragment of the link contains the full invoice, compressed. It never reaches our servers.',
  },
  {
    question: 'Which networks are supported?',
    answer:
      'Ethereum, Base, Arbitrum, Optimism, and Polygon. More networks are encoded in the open @void-layer codec standard.',
  },
  {
    question: 'What happens to old invoice links?',
    answer:
      'They work forever. Schema v1 is locked — links created today will resolve correctly regardless of future updates.',
  },
  {
    question: 'Is there a fee to create an invoice?',
    answer:
      'No fee from VoidPay. You pay only the blockchain gas fee when the payment is sent by your payer.',
  },
] as const satisfies readonly FaqItem[]
