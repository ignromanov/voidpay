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
          Ready to upgrade your billing?
        </Heading>

        <Text variant="large" className="text-zinc-400">
          Join thousands of web3 natives using VoidPay to settle millions in on-chain volume.
        </Text>

        <div className="pt-8">
          <Link href="/create">
            <Button
              variant="glow"
              size="lg"
              className="h-16 w-full rounded-2xl px-12 text-xl shadow-[0_0_60px_-15px_rgba(124,58,237,0.5)] sm:w-auto"
            >
              Create Free Invoice
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
