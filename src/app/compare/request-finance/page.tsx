/**
 * VoidPay vs Request Finance — Comparison Page
 * Feature: 040-competitor-comparison
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'

import { APP_URLS } from '@/shared/config'
import { ArrowLeftIcon, CheckIcon, XIcon, MinusIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'
import { Heading, Text } from '@/shared/ui/typography'

import { compareContent } from './content'

export const metadata: Metadata = {
  title: compareContent.meta.title,
  description: compareContent.meta.description,
  keywords: [
    'voidpay vs request finance',
    'request finance alternative',
    'crypto invoicing comparison',
    'free crypto invoice tool',
    'request finance pricing',
    'privacy crypto payments',
    'zero backend invoicing',
    'request network alternative',
  ],
  openGraph: {
    title: compareContent.meta.title,
    description: compareContent.meta.description,
    url: `${APP_URLS.base}/compare/request-finance`,
    siteName: 'VoidPay',
    type: 'article',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: compareContent.meta.title,
    description: compareContent.meta.description,
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${APP_URLS.base}/compare/request-finance`,
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is VoidPay free compared to Request Finance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. VoidPay is completely free — no subscription, no transaction fees, no hidden costs. Request Finance starts at $250/month billed annually.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does VoidPay require signup like Request Finance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. VoidPay requires zero signup. Open the site, fill in invoice details, get a shareable link in 30 seconds. Request Finance requires account creation and KYB/KYC verification.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does VoidPay protect privacy compared to Request Finance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'VoidPay stores nothing — the entire invoice lives in the URL hash fragment, which browsers never send to servers. This is a structural guarantee. Request Finance stores invoice data, user accounts, and compliance documents on centralized servers.',
      },
    },
  ],
}

export default function CompareRequestFinancePage() {
  const { tldr, quickComparison, sections, reviews, disclaimer } = compareContent

  return (
    <main className="min-h-screen px-4 pt-4 pb-20 sm:py-20">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon size={16} />
            Back to Home
          </Button>
        </Link>

        {/* TL;DR Header */}
        <section className="mb-12">
          <Heading variant="h1" as="h1" className="mb-3 text-pretty">
            {tldr.heading}
          </Heading>
          <Text variant="large" className="mb-6 text-zinc-400">
            {tldr.subheading}
          </Text>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6">
            <Text variant="label" className="mb-3 text-violet-400">TL;DR</Text>
            <Text className="leading-relaxed text-zinc-300">{tldr.summary}</Text>
          </div>
          <Text variant="small" className="mt-3 text-zinc-600">
            Last verified: {compareContent.meta.lastVerified}
          </Text>
        </section>

        {/* Quick Comparison Table */}
        <section className="mb-12">
          <Heading variant="h2" as="h2" className="mb-4 text-xl text-zinc-200">
            Quick Comparison
          </Heading>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Feature</th>
                  <th className="px-4 py-3 text-left font-bold text-violet-400">VoidPay</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-400">
                    Request Finance
                  </th>
                </tr>
              </thead>
              <tbody>
                {quickComparison.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`transition-colors hover:bg-zinc-800/50 ${i % 2 === 0 ? 'bg-zinc-950' : 'bg-zinc-900/30'}`}
                  >
                    <td className="px-4 py-3 text-zinc-400">{row.feature}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-zinc-200">{row.voidpay}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-zinc-300">{row.requestFinance}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Sections */}
        <div className="mb-12 space-y-10">
          {sections.map((section) => (
            <section key={section.id}>
              <Heading variant="h2" as="h2" className="mb-4 text-xl text-zinc-200">
                {section.title}
              </Heading>

              {'voidpay' in section && 'requestFinance' in section ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* VoidPay card */}
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                      <Text variant="small" className="mb-2 font-semibold text-violet-400">
                        VoidPay
                      </Text>
                      <Text className="mb-2 text-zinc-300">{section.voidpay.summary}</Text>
                      <Text variant="small" className="text-zinc-500">
                        {section.voidpay.details}
                      </Text>
                    </div>

                    {/* Request Finance card */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                      <Text variant="small" className="mb-2 font-semibold text-zinc-400">
                        Request Finance
                      </Text>
                      <Text className="mb-2 text-zinc-300">{section.requestFinance.summary}</Text>
                      <Text variant="small" className="text-zinc-500">
                        {section.requestFinance.details}
                      </Text>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-zinc-800 border-l-2 border-l-violet-500/30 bg-zinc-900/50 px-5 py-3">
                    <Text variant="small" className="text-zinc-400">
                      <span className="font-semibold text-zinc-200">Bottom line: </span>
                      {section.bottomLine}
                    </Text>
                  </div>
                </>
              ) : null}

              {'chooseVoidpay' in section && 'chooseRequestFinance' in section ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Choose VoidPay */}
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                    <Text variant="small" className="mb-3 font-semibold text-violet-400">
                      Choose VoidPay if you…
                    </Text>
                    <ul className="space-y-2">
                      {section.chooseVoidpay.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckIcon
                            size={14}
                            className="mt-0.5 shrink-0 text-emerald-400"
                          />
                          <Text variant="small" className="text-zinc-300">
                            {item}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Choose Request Finance */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                    <Text variant="small" className="mb-3 font-semibold text-zinc-400">
                      Choose Request Finance if you…
                    </Text>
                    <ul className="space-y-2">
                      {section.chooseRequestFinance.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <MinusIcon
                            size={14}
                            className="mt-0.5 shrink-0 text-zinc-500"
                          />
                          <Text variant="small" className="text-zinc-300">
                            {item}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </section>
          ))}
        </div>

        {/* Reviews Section */}
        <section className="mb-12">
          <Heading variant="h2" as="h2" className="mb-2 text-xl text-zinc-200">
            {reviews.heading}
          </Heading>
          <Text variant="small" className="mb-6 text-zinc-500">
            {reviews.note}
          </Text>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-amber-400" aria-hidden="true">★★★★★</span>
              <Text variant="small" as="span" className="font-semibold text-zinc-300">
                {reviews.requestFinance.rating}
              </Text>
            </div>

            <div className="mb-5">
              <Text variant="small" className="mb-2 font-medium text-emerald-400">
                Praised for
              </Text>
              <ul className="space-y-2">
                {reviews.requestFinance.praised.map((quote, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckIcon size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                    <Text variant="small" className="italic text-zinc-400">
                      {quote}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Text variant="small" className="mb-2 font-medium text-red-400">
                Complaints
              </Text>
              <ul className="space-y-2">
                {reviews.requestFinance.complaints.map((quote, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XIcon size={14} className="mt-0.5 shrink-0 text-red-400" />
                    <Text variant="small" className="italic text-zinc-400">
                      {quote}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-12 rounded-xl border border-violet-500/20 bg-violet-500/5 p-8 text-center shadow-[0_0_40px_-10px_rgba(124,58,237,0.15)]">
          <Heading variant="h2" as="h2" className="mb-3 text-zinc-100">
            Try VoidPay — No Signup Required
          </Heading>
          <Text className="mb-6 text-zinc-400">
            Create your first crypto invoice in 30 seconds. Free forever.
          </Text>
          <Link href="/create">
            <Button variant="glow" size="lg">Create Invoice</Button>
          </Link>
        </section>

        {/* Disclaimer */}
        <div className="mb-10 rounded-lg border border-zinc-800 bg-zinc-900/30 px-5 py-4">
          <Text variant="small" className="text-zinc-500">
            {disclaimer}
          </Text>
        </div>

      </div>
    </main>
  )
}
