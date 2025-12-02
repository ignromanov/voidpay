/**
 * Landing Page Widgets - Public API
 * Feature: 012-landing-page
 */

// Widgets
export { HeroSection } from './hero-section'
export { HowItWorks } from './how-it-works'
export { WhyVoidPay } from './why-voidpay'
export { DemoSection } from './demo-section'
export { FooterCta } from './footer-cta'

// Hooks (for testing)
export { useDemoRotation, type UseDemoRotationOptions, type UseDemoRotationReturn } from './hooks/use-demo-rotation'
export { useInterval } from './hooks/use-interval'

// Types
export type { DemoInvoice, DemoLineItem, FeatureCard, NetworkBadge, WorkflowStep } from './types'
