/**
 * CreatePageFaq — below-fold FAQ for /create SEO content layer
 * RSC: no 'use client' — static, server-rendered
 * Semantic <dl><dt><dd> for crawler readability; data shared with JSON-LD via config/faq-items
 */

import { Heading, Text } from '@/shared/ui'
import { FAQ_ITEMS } from './config/faq-items'

export function CreatePageFaq() {
  return (
    <section
      aria-labelledby="create-faq-heading"
      className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-12 md:py-16"
    >
      <div className="mx-auto max-w-3xl">
        <Heading variant="h2" as="h2" id="create-faq-heading" className="mb-8 text-center">
          Common Questions
        </Heading>
        <dl className="space-y-6">
          {FAQ_ITEMS.map(({ question, answer }) => (
            <div key={question} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4">
              <dt>
                <Text variant="body" className="font-semibold text-zinc-100">
                  {question}
                </Text>
              </dt>
              <dd className="mt-2">
                <Text variant="body" className="text-zinc-400">
                  {answer}
                </Text>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
