/**
 * SocialProofStrip - Minimal trust signals section
 * Feature: 012-landing-page
 * Research: Qualitative proof > quantitative for early-stage
 *
 * Performance: Uses CSS animations instead of Framer Motion for LCP optimization.
 * Animation triggers on scroll via CSS (no JS Intersection Observer needed).
 */

'use client'

import type { ComponentType, SVGProps } from 'react'

import { cn, useHydrated } from '@/shared/lib'
import {
  GithubIcon,
  GlobeIcon,
  LockIcon,
  ServerOffIcon,
  useReducedMotion,
} from '@/shared/ui'

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>

type TrustBadgeData = {
  icon: IconComponent
  label: string
  description: string
  href?: string
}

const TRUST_BADGES: TrustBadgeData[] = [
  {
    icon: LockIcon,
    label: 'Zero Data Storage',
    description: 'No servers, no databases',
  },
  {
    icon: GithubIcon,
    label: 'Open Source',
    description: 'Verify the code yourself',
    href: 'https://github.com/voidpay/voidpay',
  },
  {
    icon: ServerOffIcon,
    label: 'Shutdown-Proof',
    description: 'Deploy locally if we disappear',
  },
  {
    icon: GlobeIcon,
    label: 'Multi-Chain',
    description: 'ETH • Arbitrum • Optimism • Polygon',
  },
]

function TrustBadge({ icon: Icon, label, description, href }: TrustBadgeData) {
  const content = (
    <>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50 transition-colors group-hover:border-violet-500/50 group-hover:bg-violet-900/20">
        <Icon size={20} className="text-violet-400" aria-hidden="true" />
      </div>
      <span className="text-sm font-medium text-zinc-100">{label}</span>
      <span className="text-xs text-zinc-400">{description}</span>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col items-center gap-2 text-center transition-transform hover:scale-105"
      >
        {content}
      </a>
    )
  }

  return (
    <div className="group flex flex-col items-center gap-2 text-center">
      {content}
    </div>
  )
}

export function SocialProofStrip() {
  const prefersReducedMotion = useReducedMotion()
  const hydrated = useHydrated()

  // Only animate after hydration to prevent SSR mismatch
  // Uses CSS animation with longer delay (0.6s) since this is below hero
  const shouldAnimate = hydrated && !prefersReducedMotion

  return (
    <section className="relative border-y border-zinc-800/50 bg-zinc-900/30 px-6 py-8 backdrop-blur-sm">
      <div
        className={cn(
          'mx-auto max-w-5xl',
          shouldAnimate && 'hero-animate-social-proof'
        )}
      >
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {TRUST_BADGES.map((badge) => (
            <TrustBadge key={badge.label} {...badge} />
          ))}
        </div>
      </div>
    </section>
  )
}
