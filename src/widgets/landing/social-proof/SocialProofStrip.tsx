/**
 * SocialProofStrip - Minimal trust signals section
 * Feature: 012-landing-page
 * Research: Qualitative proof > quantitative for early-stage
 */

'use client'

import type { LucideIcon } from 'lucide-react'

import { Github, Lock, ServerOff, Globe } from 'lucide-react'

import { useHydrated } from '@/shared/lib'
import { motion, useReducedMotion } from '@/shared/ui'

type TrustBadge = {
  icon: LucideIcon
  label: string
  description: string
  href?: string
}

const TRUST_BADGES: TrustBadge[] = [
  {
    icon: Lock,
    label: 'Zero Data Storage',
    description: 'No servers, no databases',
  },
  {
    icon: Github,
    label: 'Open Source',
    description: 'Verify the code yourself',
    href: 'https://github.com/voidpay/voidpay',
  },
  {
    icon: ServerOff,
    label: 'Shutdown-Proof',
    description: 'Deploy locally if we disappear',
  },
  {
    icon: Globe,
    label: 'Multi-Chain',
    description: 'ETH • Arbitrum • Optimism • Polygon',
  },
]

function TrustBadge({ icon: Icon, label, description, href }: TrustBadge) {
  const content = (
    <>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50 transition-colors group-hover:border-violet-500/50 group-hover:bg-violet-900/20">
        <Icon className="h-5 w-5 text-violet-400" aria-hidden="true" />
      </div>
      <span className="text-sm font-medium text-zinc-100">{label}</span>
      <span className="text-xs text-zinc-500">{description}</span>
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
  const shouldAnimate = hydrated && !prefersReducedMotion

  return (
    <section className="relative z-10 border-y border-zinc-800/50 bg-zinc-900/30 px-6 py-8 backdrop-blur-sm">
      <motion.div
        initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-5xl"
      >
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {TRUST_BADGES.map((badge) => (
            <TrustBadge key={badge.label} {...badge} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
