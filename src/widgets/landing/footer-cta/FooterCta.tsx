/**
 * FooterCta - Bottom call-to-action section
 * Feature: 012-landing-page
 * User Story: US2 (Convert Interest to Action)
 * DAO Diplomat: Final push with sovereignty message
 */

'use client'

import { Github, Twitter } from 'lucide-react'
import Link from 'next/link'

import { AuroraText, Button, Heading, Text } from '@/shared/ui'

// Placeholder URLs - to be replaced with actual links
const SOCIAL_LINKS = {
  github: 'https://github.com/voidpay',
  twitter: 'https://twitter.com/voidpay',
} as const

export function FooterCta() {
  return (
    <section
      className="relative z-10 border-t border-zinc-800/50 bg-gradient-to-b from-transparent to-violet-950/30 px-6 py-40"
      aria-labelledby="footer-cta-heading"
    >
      <div className="mx-auto max-w-4xl space-y-10 text-center">
        <Heading variant="hero" as="h2" id="footer-cta-heading" className="text-4xl md:text-6xl">
          Your Invoice. Your Link.{' '}
          <AuroraText className="drop-shadow-2xl">Your Rules.</AuroraText>
        </Heading>

        <Text variant="large" className="mx-auto max-w-xl text-zinc-400">
          Ready to own your invoices?
        </Text>

        <div className="flex flex-col items-center pt-8">
          <Link href="/create">
            <Button
              variant="glow"
              size="lg"
              className="h-16 rounded-2xl px-12 text-xl shadow-[0_0_60px_-15px_rgba(124,58,237,0.5)]"
            >
              Get Paid Now
            </Button>
          </Link>
          <span className="mt-3 text-sm text-zinc-500">
            No signup. No fees. Just results.
          </span>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-6 pt-8">
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-zinc-500 transition-colors hover:text-white"
          >
            <Github className="h-6 w-6" />
          </a>
          <a
            href={SOCIAL_LINKS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-zinc-500 transition-colors hover:text-white"
          >
            <Twitter className="h-6 w-6" />
          </a>
        </div>
      </div>
    </section>
  )
}
