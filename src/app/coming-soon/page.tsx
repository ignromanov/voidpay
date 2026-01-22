/**
 * Coming Soon Page
 * Feature: Production landing-only mode with waitlist
 *
 * Shows when NEXT_PUBLIC_COMING_SOON_MODE=true and user
 * tries to access /create, /pay, or /history routes.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { AuroraText, Button, Heading, Text, VoidLogo } from '@/shared/ui'

import { WaitlistForm } from './_components/waitlist-form'

export const metadata: Metadata = {
  title: 'Coming Soon | VoidPay',
  description:
    'Privacy-first crypto invoicing is coming. No signup, no tracking, no backend. Join the waitlist for early access.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'VoidPay — Coming Soon',
    description: 'Privacy-first crypto invoicing. Join the waitlist.',
    type: 'website',
  },
}

export default function ComingSoonPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem-2.5rem)] flex-col items-center justify-center overflow-hidden px-4">
      {/* Background glow - matches HeroSection */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[min(800px,150vw)] w-[min(800px,150vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

      {/* Dev Navigation */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 z-50 flex gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-xs backdrop-blur">
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              Home
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              History
            </Button>
          </Link>
          <Link href="/create">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              Blocked
            </Button>
          </Link>
        </div>
      )}

      {/* Content container - matches HeroSection structure */}
      <div className="hero-animate-container relative z-20 mx-auto flex max-w-4xl flex-col items-center space-y-10 text-center">
        {/* Logo with animation */}
        <div className="hero-animate-badge">
          <VoidLogo size="xl" />
        </div>

        {/* Heading with proper hierarchy */}
        <div className="space-y-4">
          <Heading variant="hero" as="h1">
            <AuroraText className="drop-shadow-2xl">Coming Soon</AuroraText>
          </Heading>

          {/* Value proposition - matches HeroSection style */}
          <Text
            variant="large"
            className="mx-auto max-w-2xl px-4 leading-relaxed font-light text-zinc-400/90"
          >
            Privacy-first crypto invoicing —{' '}
            <span className="font-medium text-zinc-100">no signup, no tracking, no backend.</span>
          </Text>
        </div>

        {/* Waitlist Form with CTA animation */}
        <div className="hero-animate-cta w-full max-w-md px-4">
          <WaitlistForm />
        </div>

        {/* Features Preview - card grid */}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 px-4 pt-4 sm:grid-cols-3">
          <FeatureCard
            title="Zero Backend"
            description="Your invoice data lives in the URL, not on our servers"
          />
          <FeatureCard
            title="Instant Links"
            description="Generate payment links in seconds, share anywhere"
          />
          <FeatureCard
            title="Multi-Chain"
            description="Ethereum, Arbitrum, Optimism, Polygon supported"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-left backdrop-blur transition-colors hover:border-violet-500/30 hover:bg-zinc-900/80">
      <Heading variant="h3" as="h3" className="mb-2 text-base">
        {title}
      </Heading>
      <Text variant="small" className="leading-relaxed text-zinc-400">
        {description}
      </Text>
    </div>
  )
}
