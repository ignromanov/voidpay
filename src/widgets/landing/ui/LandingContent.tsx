'use client'

/**
 * LandingContent - Client-side wrapper for landing page content
 * Feature: 012-landing-page
 *
 * Provides NetworkThemeProvider to synchronize background theme
 * with the active invoice network in DemoSection.
 */

import { NetworkBackground } from '@/widgets/network-background'
import { ComparisonTable } from '../comparison'
import { NetworkThemeProvider, useNetworkTheme } from '../context/network-theme-context'
import { DemoSection } from '../demo-section/DemoSection'
import { FaqSection } from '../faq-section'
import { FooterCta } from '../footer-cta/FooterCta'
import { HeroSection } from '../hero-section/HeroSection'
import { HowItWorks } from '../how-it-works/HowItWorks'
import { SocialProofStrip } from '../social-proof'
import { WhyVoidPay } from '../why-voidpay/WhyVoidPay'

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
      <ComparisonTable />
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
