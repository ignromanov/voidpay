/**
 * FooterCta - Bottom call-to-action section
 * Feature: 012-landing-page
 * User Story: US2 (Convert Interest to Action)
 */

'use client'

import Link from 'next/link'

import { Button, Heading, Text } from '@/shared/ui'

export function FooterCta() {
  return (
    <section
      className="relative z-10 border-t border-zinc-800/50 bg-gradient-to-b from-transparent to-violet-950/30 px-6 py-40"
      aria-labelledby="footer-cta-heading"
    >
      <div className="mx-auto max-w-4xl space-y-10 text-center">
        <Heading variant="hero" as="h2" id="footer-cta-heading" className="text-4xl md:text-6xl">
          Your Invoice. Your Link. Your Rules.
        </Heading>

        <Text variant="large" className="mx-auto max-w-xl text-zinc-400">
          Create your first invoice in 30 seconds.
        </Text>

        <div className="flex flex-col items-center pt-8">
          <Link href="/create">
            <Button
              variant="glow"
              size="lg"
              className="h-16 rounded-2xl px-12 text-xl shadow-[0_0_60px_-15px_rgba(124,58,237,0.5)]"
            >
              Create Invoice
            </Button>
          </Link>
          <span className="mt-3 text-sm text-zinc-500">
            No sign-up required
          </span>
        </div>
      </div>
    </section>
  )
}
