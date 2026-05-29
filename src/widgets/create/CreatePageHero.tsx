/**
 * CreatePageHero — above-fold hero for /create SEO content layer
 * RSC: no 'use client' — static, server-rendered
 */

import { Heading, Text } from '@/shared/ui'

export function CreatePageHero() {
  return (
    <div className="px-4 pt-8 pb-2 text-center">
      <Heading variant="h2" as="h1" className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">
        Crypto Invoice Generator — No Signup, No Backend
      </Heading>
      <Text variant="body" className="mx-auto max-w-2xl text-zinc-400">
        Fill the form, get a shareable link. The invoice lives in the URL — no account, no server,
        no data left behind. Works on Ethereum, Base, Arbitrum, Optimism, and Polygon.
      </Text>
    </div>
  )
}
