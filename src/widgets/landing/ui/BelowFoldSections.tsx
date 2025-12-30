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
 */

import { HowItWorks } from '../how-it-works/HowItWorks'
import { DemoSection } from '../demo-section/DemoSection'
import { WhyVoidPay } from '../why-voidpay/WhyVoidPay'
import { ComparisonTable } from '../comparison/ComparisonTable'
import { AudienceSection } from '../audience-section/AudienceSection'
import { FaqSection } from '../faq-section'
import { FooterCta } from '../footer-cta/FooterCta'

export function BelowFoldSections() {
  return (
    <>
      <HowItWorks />
      <DemoSection />
      <WhyVoidPay />
      <ComparisonTable />
      <AudienceSection />
      <FaqSection />
      <FooterCta />
    </>
  )
}
