/**
 * Terms of Service Page
 * Feature: SEO & E-E-A-T improvements
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { ArrowLeftIcon, Button, Heading, Text } from '@/shared/ui'

import { termsContent } from './content'

export const metadata: Metadata = {
  title: termsContent.meta.title,
  description: termsContent.meta.description,
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  const { meta, sections } = termsContent

  return (
    <main className="min-h-screen px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon size={16} />
            Back to Home
          </Button>
        </Link>

        <article className="prose prose-invert prose-zinc max-w-none">
          <Heading variant="h1" as="h1" className="mb-4">
            Terms of Service
          </Heading>
          <Text variant="small" className="mb-8 text-zinc-500">
            Last updated: {meta.lastUpdated}
          </Text>

          <section className="space-y-8">
            {sections.map((section) => (
              <div key={section.id}>
                <Heading variant="h2" as="h2" className="mb-3 text-xl">
                  {section.title}
                </Heading>

                {'disclaimer' in section && (
                  <div className="mb-4 rounded-lg border border-amber-800/50 bg-amber-950/30 p-4">
                    <Text className="font-medium text-amber-200">{section.disclaimer.title}</Text>
                    <Text className="mt-2 text-sm text-amber-100/80">
                      {section.disclaimer.content}
                    </Text>
                  </div>
                )}

                {'content' in section && (
                  <Text className="mb-4 text-zinc-400">{section.content}</Text>
                )}

                {'legalText' in section && (
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
                    <Text className="text-sm tracking-wide text-zinc-300 uppercase">
                      {section.legalText}
                    </Text>
                    {'liabilityItems' in section && (
                      <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-zinc-400">
                        {section.liabilityItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {'items' in section && (
                  <ul className="list-disc space-y-2 pl-6 text-zinc-400">
                    {section.items.map((item, i) => (
                      <li key={i}>
                        {'label' in item && <strong className="text-zinc-200">{item.label}</strong>}
                        {'label' in item && item.description && ' — '}
                        {item.description}
                      </li>
                    ))}
                  </ul>
                )}

                {'note' in section && (
                  <Text className="mt-4 text-zinc-400">
                    <strong className="text-zinc-200">
                      {section.id === 'payment-verification' ? 'Important: ' : ''}
                    </strong>
                    {section.note}
                  </Text>
                )}

                {'github' in section && (
                  <div className="mt-4">
                    <a
                      href={section.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300"
                    >
                      View the source code on GitHub →
                    </a>
                  </div>
                )}

                {'links' in section && (
                  <ul className="mt-4 list-none space-y-2 pl-0 text-zinc-400">
                    {section.links.map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-400 hover:text-violet-300"
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        </article>

        <div className="mt-12 flex gap-6 border-t border-zinc-800 pt-8">
          <Link href="/privacy" className="text-sm text-zinc-500 hover:text-zinc-300">
            Privacy Policy
          </Link>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
