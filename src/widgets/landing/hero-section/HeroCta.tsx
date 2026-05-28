/**
 * HeroCta - Client CTA button for HeroSection
 * Feature: 012-landing-page
 *
 * Extracted as a thin client child so HeroSection can stay a Server Component
 * (the <h1> paints from SSR HTML without waiting for hydration). This component
 * owns the analytics track() call on click.
 */

'use client'

import Link from 'next/link'

import { track, AnalyticsEvent } from '@/features/analytics'
import { ArrowRightIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'

export function HeroCta(): React.JSX.Element {
  return (
    <div className="hero-animate-cta flex flex-col items-center px-4 pt-8">
      <Button
        variant="glow"
        size="lg"
        className="h-14 rounded-2xl px-8 text-base shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)]"
        onClick={() => track(AnalyticsEvent.LANDING_CTA_CLICK, { cta_location: 'hero' })}
        asChild
      >
        <Link href="/create">
          Create Your Invoice
          <ArrowRightIcon size={16} />
        </Link>
      </Button>
      <span className="mt-3 text-sm text-zinc-400">No signup. Takes 30 seconds.</span>
    </div>
  )
}
