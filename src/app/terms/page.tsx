/**
 * Terms of Service Page
 * Feature: SEO & E-E-A-T improvements
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { ArrowLeftIcon, Button, Heading, Text } from '@/shared/ui'

export const metadata: Metadata = {
  title: 'Terms of Service | VoidPay',
  description:
    'VoidPay terms of service. Free, open-source crypto invoicing tool provided as-is with no warranties.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsPage() {
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
            Terms of Service
          </Heading>
          <Text variant="small" className="mb-8 text-zinc-500">
            Last updated: December 2025
          </Text>

          <section className="space-y-6">
            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                Service Description
              </Heading>
              <Text className="text-zinc-400">
                VoidPay is a free, open-source tool for creating and sharing crypto invoices. We
                provide the interface; you handle your own payments directly on the blockchain.
              </Text>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                No Account Required
              </Heading>
              <Text className="text-zinc-400">
                VoidPay doesn&apos;t require registration. There&apos;s no user account to manage or
                terms to sign up for. You use the tool, and that&apos;s it.
              </Text>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                Your Responsibility
              </Heading>
              <ul className="list-disc space-y-2 pl-6 text-zinc-400">
                <li>Verify recipient wallet addresses before sending payments</li>
                <li>Ensure you&apos;re on the correct network before transacting</li>
                <li>Keep your invoice URLs secure if they contain sensitive information</li>
                <li>Comply with applicable laws in your jurisdiction</li>
              </ul>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                No Warranties
              </Heading>
              <Text className="text-zinc-400">
                VoidPay is provided &quot;as is&quot; without warranties of any kind. We&apos;re not
                responsible for lost funds, incorrect payments, or any damages arising from use of
                this tool.
              </Text>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                No Custody
              </Heading>
              <Text className="text-zinc-400">
                VoidPay never holds, transmits, or has access to your funds. All transactions occur
                directly between wallets on the blockchain. We&apos;re not a money transmitter or
                financial service.
              </Text>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                Prohibited Use
              </Heading>
              <Text className="text-zinc-400">
                Don&apos;t use VoidPay for illegal activities, fraud, money laundering, or any
                purpose that violates applicable laws. We reserve the right to block abusive usage
                patterns.
              </Text>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                Open Source
              </Heading>
              <Text className="text-zinc-400">
                VoidPay is open source under the MIT License. You&apos;re free to fork, modify, and
                self-host. See our{' '}
                <a
                  href="https://github.com/ignromanov/voidpay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300"
                >
                  GitHub repository
                </a>{' '}
                for details.
              </Text>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                Changes to Terms
              </Heading>
              <Text className="text-zinc-400">
                We may update these terms occasionally. Since there&apos;s no account system,
                we&apos;ll post updates here and on our GitHub.
              </Text>
            </div>

            <div>
              <Heading variant="h2" as="h2" className="mb-3 text-xl">
                Contact
              </Heading>
              <Text className="text-zinc-400">
                Questions? Open an issue on GitHub or reach out on{' '}
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
