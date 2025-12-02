/**
 * FaqSection - Accordion FAQ with JSON-LD structured data
 * Feature: 012-landing-page
 * SEO: FAQPage schema for rich snippets
 */

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Heading, Text, motion, AnimatePresence } from '@/shared/ui'

import { FAQ_ITEMS, type FaqItem } from '../constants/faq'

function FaqItem({ question, answer, isOpen, onToggle }: FaqItem & { isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-zinc-800 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-6 text-left transition-colors hover:text-zinc-100"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-zinc-100">{question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <Text variant="body" className="pb-6 text-zinc-400">
              {answer}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section
      id="faq"
      className="relative z-10 border-t border-zinc-900 bg-zinc-950/10 px-6 py-40 backdrop-blur-sm"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <Heading variant="h1" as="h2" id="faq-heading" className="mb-4">
            Frequently Asked Questions
          </Heading>
          <Text variant="large" className="text-zinc-400">
            Everything you need to know about VoidPay.
          </Text>
        </div>

        {/* FAQ Accordion */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 px-8 backdrop-blur-sm">
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
