'use client'

/**
 * LandingContent - Client-side wrapper for landing page content
 * Feature: 012-landing-page
 *
 * Provides NetworkThemeProvider to synchronize background theme
 * with the active invoice network in DemoSection.
 *
 * Performance Strategy:
 * - Above the fold (immediate): HeroSection, SocialProofStrip
 * - Below the fold (lazy): All other sections
 *
 * This reduces initial JS bundle and improves LCP/TBT metrics.
 */

import dynamic from 'next/dynamic'
import { NetworkBackground } from '@/widgets/network-background'
import { NetworkThemeProvider, useNetworkTheme } from '../context/network-theme-context'
import { HeroSection } from '../hero-section/HeroSection'
import { SocialProofStrip } from '../social-proof'

// Lazy load below-fold sections for better LCP/TBT
// ssr: true ensures content is still rendered on server for SEO
const HowItWorks = dynamic(
  () => import('../how-it-works/HowItWorks').then((m) => m.HowItWorks),
  { ssr: true }
)

const DemoSection = dynamic(
  () => import('../demo-section/DemoSection').then((m) => m.DemoSection),
  { ssr: true }
)

const WhyVoidPay = dynamic(
  () => import('../why-voidpay/WhyVoidPay').then((m) => m.WhyVoidPay),
  { ssr: true }
)

const AudienceSection = dynamic(
  () => import('../audience-section/AudienceSection').then((m) => m.AudienceSection),
  { ssr: true }
)

const FaqSection = dynamic(
  () => import('../faq-section').then((m) => m.FaqSection),
  { ssr: true }
)

const FooterCta = dynamic(
  () => import('../footer-cta/FooterCta').then((m) => m.FooterCta),
  { ssr: true }
)

function LandingBackground() {
  const { theme } = useNetworkTheme()
  return <NetworkBackground theme={theme} className="fixed inset-0 -z-10" />
}

function LandingSections() {
  return (
    <>
      <HeroSection />
      <SocialProofStrip />
      <HowItWorks />
      <DemoSection />
      <WhyVoidPay />
      <AudienceSection />
      {/* <ComparisonTable /> */}
      <FaqSection />
      <FooterCta />
    </>
  )
}

export function LandingContent() {
  return (
    <NetworkThemeProvider defaultTheme="ethereum">
      <LandingBackground />
      <LandingSections />
    </NetworkThemeProvider>
  )
}
