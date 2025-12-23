/**
 * Landing Page Widget Types
 * Feature: 012-landing-page
 */

import type { ComponentType, SVGProps } from 'react'
import type { NetworkTheme } from '@/shared/ui/constants/brand-tokens'

/**
 * Feature card for WhyVoidPay section
 */
export type FeatureCard = {
  id: string
  title: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  iconColor?: string
}

/**
 * Workflow step for HowItWorks section
 */
export type WorkflowStep = {
  step: number
  title: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

/**
 * Supported network for trust signals
 */
export type NetworkBadge = {
  name: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

/**
 * Demo invoice for rotating display
 */
export type DemoInvoice = {
  id: string
  network: NetworkTheme
  recipient: string
  amount: string
  token: string
  description: string
  items: DemoLineItem[]
}

/**
 * Demo line item
 */
export type DemoLineItem = {
  description: string
  quantity: number
  unitPrice: string
}
