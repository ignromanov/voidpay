/**
 * Privacy Policy Page
 * Feature: SEO & E-E-A-T improvements
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { ArrowLeftIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'
import { Heading, Text } from '@/shared/ui/typography'

import { privacyContent } from './content'

export const metadata: Metadata = {
  title: privacyContent.meta.title,
  description: privacyContent.meta.description,
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  const { meta, sections } = privacyContent

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
            Privacy Policy
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

                {'content' in section && (
                  <Text className="mb-4 text-zinc-400">{section.content}</Text>
                )}

                {'codeExample' in section && (
                  <div className="mb-4 overflow-x-auto rounded-lg bg-zinc-900 p-4">
                    <code className="text-sm text-zinc-300">
                      {section.id === 'architecture' && (
                        <>
                          https://voidpay.xyz/pay
                          <span className="text-violet-400">#N4IgbghgTg9g...</span>
                        </>
                      )}
                      {section.id === 'og-preview' && (
                        <>
                          https://voidpay.xyz/pay?
                          <span className="text-amber-400">og=INV-001_1250_USDC_arb_Acme</span>
                          <span className="text-violet-400">#N4Ig...</span>
                        </>
                      )}
                    </code>
                  </div>
                )}

                {'additionalContent' in section && (
                  <Text className="mb-4 text-zinc-400">
                    {section.id === 'architecture' && (
                      <>
                        Here&apos;s the key:{' '}
                        <strong className="text-zinc-200">
                          hash fragments are never sent to web servers
                        </strong>
                        . This is a fundamental property of how URLs work in web browsers (defined
                        in RFC 3986). When you open an invoice link, your browser keeps the hash
                        fragment local and only sends the base URL to our server.
                      </>
                    )}
                    {section.id === 'og-preview' && (
                      <>
                        The{' '}
                        <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-amber-400">
                          ?og=
                        </code>{' '}
                        parameter contains only: invoice ID, amount, currency, network, and sender
                        name.
                        <strong className="text-zinc-200">
                          {' '}
                          This is the only data that our server can see
                        </strong>
                        , and only if you choose to include it. The full invoice details remain
                        private in the hash fragment.
                      </>
                    )}
                  </Text>
                )}

                {'note' in section && (
                  <Text className="text-zinc-400">
                    <strong className="text-zinc-200">{section.note}</strong>
                  </Text>
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

                {'services' in section && (
                  <div className="space-y-4">
                    {section.services.map((service) => (
                      <div key={service.name} className="rounded-lg border border-zinc-800 p-4">
                        <Text className="mb-2 font-medium text-zinc-200">{service.name}</Text>
                        <Text className="text-sm text-zinc-400">
                          {service.description}
                          {'link' in service && (
                            <>
                              {' '}
                              See{' '}
                              <a
                                href={service.link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-400 hover:text-violet-300"
                              >
                                {service.link.text}
                              </a>{' '}
                              for their data practices.
                            </>
                          )}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}

                {'github' in section && (
                  <div className="mt-4">
                    <a
                      href={section.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      View Source Code
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
          <Link href="/terms" className="text-sm text-zinc-500 hover:text-zinc-300">
            Terms of Service
          </Link>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
