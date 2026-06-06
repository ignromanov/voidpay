/**
 * CreatePageHowItWorks — below-fold how-it-works for /create SEO content layer
 * RSC: no 'use client' — static, server-rendered
 */

import { Heading, Text } from '@/shared/ui'

const STEPS = [
  {
    step: 1,
    text: 'Fill the form — recipient address, amount, token, network, optional note.',
  },
  {
    step: 2,
    text: 'Copy the link — the full invoice encodes into the URL. No account needed.',
  },
  {
    step: 3,
    text: 'Send it anywhere — Telegram, email, Discord. Payer opens the link and pays directly to your wallet.',
  },
] as const

export function CreatePageHowItWorks() {
  return (
    <section
      aria-labelledby="create-how-it-works-heading"
      className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-12 md:py-16"
    >
      <div className="mx-auto max-w-3xl">
        <Heading variant="h2" as="h2" id="create-how-it-works-heading" className="mb-8 text-center">
          How It Works
        </Heading>
        <ol className="space-y-4">
          {STEPS.map(({ step, text }) => (
            <li key={step} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white"
              >
                {step}
              </span>
              <Text variant="body" className="pt-1 text-zinc-400">
                {text}
              </Text>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
