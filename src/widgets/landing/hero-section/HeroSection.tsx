/**
 * HeroSection - Landing page hero with animated headline
 * Feature: 012-landing-page
 * User Story: US1 (First Impression), US2 (Convert to Action)
 */

'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import {
  AuroraText,
  Button,
  Heading,
  motion,
  Text,
  useReducedMotion,
} from '@/shared/ui'

import { useNetworkTheme } from '../context/network-theme-context'
import { SUPPORTED_NETWORKS } from '../constants/networks'

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion()
  const { theme } = useNetworkTheme()

  return (
    <section
      className="relative z-10 flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-24 text-center md:px-6"
      aria-labelledby="hero-heading"
    >
      {/* Background glow element */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-20 mx-auto max-w-5xl space-y-10"
      >
        {/* Beta badge */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto inline-flex cursor-default items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 shadow-lg backdrop-blur transition-colors hover:border-violet-500/50"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
          <span className="text-xs font-medium tracking-wide text-zinc-300">
            v1.0 Public Beta Live
          </span>
        </motion.div>

        {/* Main headline */}
        <div className="space-y-2">
          <Heading variant="hero" as="h1" id="hero-heading">
            The Stateless <br />
            <AuroraText className="drop-shadow-2xl">Crypto Invoice.</AuroraText>
          </Heading>
        </div>

        {/* Value proposition */}
        <Text
          variant="large"
          className="mx-auto max-w-2xl px-4 font-light leading-relaxed text-zinc-400/90"
        >
          No backend, no sign-up, just links.
          <br />
          Create pure, immutable{' '}
          <span className="font-medium text-zinc-100">on-chain business</span> documents instantly.
        </Text>

        {/* CTAs */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col justify-center gap-5 px-4 pt-8 sm:flex-row"
        >
          <Link href="/create" className="w-full sm:w-auto">
            <Button
              variant="glow"
              size="lg"
              className="h-14 w-full rounded-2xl text-base shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)]"
            >
              Start Invoicing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-14 w-full rounded-2xl border-zinc-700/50 bg-zinc-900/40 text-base text-white backdrop-blur hover:border-zinc-500 hover:bg-zinc-800/60 sm:w-auto"
          >
            View Gallery
          </Button>
        </motion.div>

        {/* Network trust signals */}
        <div className="flex justify-center gap-6 pt-12">
          {SUPPORTED_NETWORKS.map(({ id, name, icon: Icon }) => {
            const isActive = theme === id
            return (
              <motion.div
                key={id}
                animate={{
                  opacity: isActive ? 0.85 : 0.45,
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-400"
              >
                <Icon className="h-3 w-3" aria-hidden="true" />
                {name}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
