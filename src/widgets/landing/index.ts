/**
 * Landing Page Widgets - Public API
 * Feature: 012-landing-page
 */

// Widgets
export { HeroSection } from './hero-section'
export { HowItWorks } from './how-it-works'
export { WhyVoidPay } from './why-voidpay'
export { AudienceSection } from './audience-section'
export { DemoSection } from './demo-section'
export { FooterCta } from './footer-cta'
export { LandingContent } from './ui/LandingContent'

// Context
export { NetworkThemeProvider, useNetworkTheme } from './context/network-theme-context'

// Hooks (for testing)
export { useDemoRotation, type UseDemoRotationOptions, type UseDemoRotationReturn } from './hooks/use-demo-rotation'
export { useInterval } from './hooks/use-interval'

// Types
export type { DemoInvoice, DemoLineItem, FeatureCard, NetworkBadge, WorkflowStep } from './types'
