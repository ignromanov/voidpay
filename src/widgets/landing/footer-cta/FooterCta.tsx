/**
 * FooterCta - Bottom call-to-action section
 * Feature: 012-landing-page
 * User Story: US2 (Convert Interest to Action)
 * DAO Diplomat: Final push with sovereignty message
 */

'use client'

import { GithubIcon, TwitterIcon } from '@/shared/ui/icons'
import Link from 'next/link'

import { track, AnalyticsEvent } from '@/features/analytics'
import { SOCIAL_URLS } from '@/shared/config'
import { AuroraText } from '@/shared/ui/aurora-text'
import { Button } from '@/shared/ui/button'
import { Heading, Text } from '@/shared/ui/typography'

export function FooterCta() {
  return (
    <section
      className="relative border-t border-zinc-800/50 bg-gradient-to-b from-transparent to-violet-950/30 px-6 pt-40 pb-20"
      aria-labelledby="footer-cta-heading"
    >
      <div className="mx-auto max-w-4xl space-y-10 text-center">
        <Heading variant="hero" as="h2" id="footer-cta-heading" className="text-4xl md:text-6xl">
          <span>Your Invoice.</span>
          <br />
          <span>Your Link.</span>
          <br />
          <AuroraText className="drop-shadow-2xl">Your Rules.</AuroraText>
        </Heading>

        <Text variant="large" className="mx-auto max-w-xl text-zinc-400">
          Ready to own your invoices?
        </Text>

        <div className="flex flex-col items-center pt-8">
          <Button
            variant="glow"
            size="lg"
            className="h-16 rounded-2xl px-8 text-base shadow-[0_0_60px_-15px_rgba(124,58,237,0.5)] md:px-12 md:text-xl"
            onClick={() => track(AnalyticsEvent.LANDING_CTA_CLICK, { cta_location: 'footer' })}
            asChild
          >
            <Link href="/create">Get Paid Now</Link>
          </Button>
          <span className="mt-3 text-sm text-zinc-400">No signup. No fees. Just results.</span>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-6 pt-8">
          <a
            href={SOCIAL_URLS.githubOrg}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-zinc-400 transition-colors hover:text-white"
            onClick={() => track(AnalyticsEvent.OUTBOUND_CLICK, { target: 'github' })}
          >
            <GithubIcon className="h-6 w-6" />
          </a>
          <a
            href={SOCIAL_URLS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-zinc-400 transition-colors hover:text-white"
            onClick={() => track(AnalyticsEvent.OUTBOUND_CLICK, { target: 'twitter' })}
          >
            <TwitterIcon className="h-6 w-6" />
          </a>
        </div>
      </div>
    </section>
  )
}
