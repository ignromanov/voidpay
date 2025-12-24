/**
 * HeroSection - Landing page hero with animated headline
 * Feature: 012-landing-page
 * User Story: US1 (First Impression), US2 (Convert to Action)
 *
 * Performance: Uses CSS animations instead of Framer Motion for LCP optimization.
 * CSS animations in globals.css: hero-animate-container, hero-animate-badge, etc.
 * Reduced motion is handled via @media (prefers-reduced-motion) in CSS.
 */

import Link from 'next/link'

import {
  ArrowRightIcon,
  AuroraText,
  Button,
  Heading,
  Text,
} from '@/shared/ui'

export function HeroSection() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-36 pt-16 text-center md:px-6"
      aria-labelledby="hero-heading"
    >
      {/* Background glow element */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(800px,150vw)] w-[min(800px,150vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="hero-animate-container relative z-20 mx-auto max-w-5xl space-y-10">
        {/* Open Source • Zero Tracking badge */}
        <div className="hero-animate-badge mx-auto inline-flex cursor-default items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 shadow-lg backdrop-blur transition-colors hover:border-violet-500/50">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
          <span className="text-xs font-medium tracking-wide text-zinc-300">
            Open Source • Zero Tracking
          </span>
        </div>

        {/* Main headline */}
        <div className="space-y-2">
          <Heading variant="hero" as="h1" id="hero-heading">
            Get Paid in Crypto.
            <br />
            <AuroraText className="drop-shadow-2xl">Just Send a Link.</AuroraText>
          </Heading>
        </div>

        {/* Value proposition */}
        <Text
          variant="large"
          className="mx-auto max-w-2xl px-4 font-light leading-relaxed text-zinc-400/90"
        >
          No servers. No accounts.{' '}
          <span className="font-medium text-zinc-100">
            If we disappear, your invoices don&apos;t.
          </span>
        </Text>

        {/* CTA */}
        <div className="hero-animate-cta flex flex-col items-center px-4 pt-8">
          <Link href="/create">
            <Button
              variant="glow"
              size="lg"
              className="h-14 rounded-2xl px-8 text-base shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)]"
            >
              Create Your Invoice
              <ArrowRightIcon size={16} />
            </Button>
          </Link>
          <span className="mt-3 text-sm text-zinc-400">
            No signup. Takes 30 seconds.
          </span>
        </div>
      </div>

      {/* Scroll indicator - positioned at bottom of section */}
      <div className="hero-animate-scroll absolute bottom-28 left-1/2 z-20 -translate-x-1/2">
        <div className="hero-animate-scroll-bounce flex flex-col items-center gap-2 text-zinc-400">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-zinc-400"
          >
            <path
              d="M10 4v12M4 10l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
