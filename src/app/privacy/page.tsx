/**
 * Privacy Policy Page
 * Feature: SEO & E-E-A-T improvements
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { ArrowLeftIcon, Button, Heading, Text } from '@/shared/ui'

export const metadata: Metadata = {
  title: 'Privacy Policy | VoidPay',
  description:
    'VoidPay privacy policy. We collect zero data - your invoice information lives only in the URL, never on our servers.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-20">
      <div className="mx-auto max-w-3xl">
        {/* Back button */}
        <Link href="/" className="mb-8 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon size={16} />
            Back to Home
          </Button>
        </Link>

        <article className="prose prose-invert prose-zinc max-w-none">
          <Heading variant="h1" as="h1" className="mb-4">
            Privacy Policy
          </Heading>
          <Text variant="small" className="mb-8 text-zinc-500">
            Last updated: December 2025
          </Text>

          <section className="space-y-6">
            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                Our Privacy Philosophy
              </Heading>
              <Text className="text-zinc-400">
                VoidPay is built on a simple principle:{' '}
                <strong className="text-zinc-200">
                  we can&apos;t lose your data because we don&apos;t have it.
                </strong>
              </Text>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                What We Don&apos;t Collect
              </Heading>
              <ul className="list-disc space-y-2 pl-6 text-zinc-400">
                <li>No invoice data - everything lives in the URL</li>
                <li>No user accounts or profiles</li>
                <li>No wallet addresses (we never see them)</li>
                <li>No payment information</li>
                <li>No cookies for tracking</li>
                <li>No analytics that identify you</li>
              </ul>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                Local Storage
              </Heading>
              <Text className="text-zinc-400">
                VoidPay uses browser LocalStorage to save your invoice drafts and history on your
                device. This data never leaves your browser and can be cleared at any time in your
                browser settings.
              </Text>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                Third-Party Services
              </Heading>
              <Text className="text-zinc-400">
                When you connect your wallet to pay an invoice, the transaction goes directly to the
                blockchain via your wallet provider. We use RPC providers (like Alchemy) to read
                blockchain data, but these requests don&apos;t contain your personal information.
              </Text>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                Open Source Transparency
              </Heading>
              <Text className="text-zinc-400">
                VoidPay is open source. You can verify our privacy claims by reviewing the code on{' '}
                <a
                  href="https://github.com/ignromanov/voidpay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300"
                >
                  GitHub
                </a>
                .
              </Text>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                Contact
              </Heading>
              <Text className="text-zinc-400">
                Questions about privacy? Open an issue on GitHub or reach out on{' '}
                <a
                  href="https://twitter.com/voidpay_xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300"
                >
                  Twitter
                </a>
                .
              </Text>
            </div>
          </section>
        </article>
      </div>
    </main>
  )
}
