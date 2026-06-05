'use client'

/**
 * BelowFoldSections - Consolidated below-fold content
 * Feature: 012-landing-page (Performance Optimization)
 *
 * This component groups all below-fold sections into a single dynamic chunk.
 * Benefits:
 * 1. Single network request for all below-fold content
 * 2. Framer Motion loaded here (not in initial bundle)
 * 3. Can be code-split and loaded on scroll via Intersection Observer
 *
 * All motion-dependent components are imported here to ensure
 * Framer Motion is bundled only in this chunk, not the initial load.
 *
 * comparisonTable is accepted as a ReactNode prop so ComparisonTable
 * (which has no client-side needs) can be rendered by a server-side
 * ancestor when the RSC boundary allows it.
 *
 * demoInvoices is resolved on the server (RSC / page.tsx) so encodeInvoice
 * (brotli-wasm) never runs in the browser on the landing page.
 */

import type { ReactNode } from 'react'

import { VideoSection } from '../video-section/VideoSection'
import { HowItWorks } from '../how-it-works/HowItWorks'
import { DemoSection } from '../demo-section/DemoSection'
import { WhyVoidPay } from '../why-voidpay/WhyVoidPay'
import { AudienceSection } from '../audience-section/AudienceSection'
import { FaqSection } from '../faq-section'
import { FooterCta } from '../footer-cta/FooterCta'
import type { DemoInvoice } from '../constants/demo-invoices'

interface BelowFoldSectionsProps {
  comparisonTable: ReactNode
  demoInvoices: DemoInvoice[]
}

export function BelowFoldSections({ comparisonTable, demoInvoices }: BelowFoldSectionsProps) {
  return (
    <>
      <HowItWorks />
      <VideoSection />
      <DemoSection demoInvoices={demoInvoices} />
      <WhyVoidPay />
      {comparisonTable}
      <AudienceSection />
      <FaqSection />
      <FooterCta />
    </>
  )
}
