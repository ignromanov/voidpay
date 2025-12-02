/**
 * Feature cards and workflow steps data
 * Feature: 012-landing-page
 */

import {
  Database,
  Globe2,
  Layers,
  LayoutTemplate,
  MousePointerClick,
  Share2,
  Shield,
  Wallet,
  Zap,
} from 'lucide-react'

import type { FeatureCard, WorkflowStep } from '../types'

/**
 * "Why VoidPay?" feature cards with distinct icon colors
 */
export const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'no-database',
    title: 'Zero Storage, Zero Risk',
    description:
      "If we get hacked, there's nothing to steal. Your invoice data exists only in your URL.",
    icon: Database,
    iconColor: 'text-violet-500',
  },
  {
    id: 'multichain',
    title: 'Multi-Chain Native',
    description:
      'Ethereum, Arbitrum, Optimism, Polygon. The UI vibes with your network.',
    icon: Globe2,
    iconColor: 'text-cyan-500',
  },
  {
    id: 'immutable',
    title: 'Immutable',
    description:
      'Once an invoice link is generated, it cannot be changed. The data is cryptographically secure within the link itself.',
    icon: Shield,
    iconColor: 'text-emerald-500',
  },
  {
    id: 'no-bloat',
    title: 'No Bloat',
    description:
      'One tool. One purpose. No CRM, no upsells, no subscriptions. Just send the link.',
    icon: LayoutTemplate,
    iconColor: 'text-pink-500',
  },
  {
    id: 'instant',
    title: 'One-Click Payments',
    description:
      'Your client opens the link, connects wallet, pays. No sign-up for either party.',
    icon: Zap,
    iconColor: 'text-yellow-500',
  },
  {
    id: 'open',
    title: 'Open Standard',
    description:
      'Built on open web standards. Export to PDF, verify on-chain, and integrate with your existing workflow.',
    icon: Layers,
    iconColor: 'text-orange-500',
  },
]

/**
 * "How It Works" workflow steps
 */
export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    title: 'Create',
    description: 'Add invoice details. Pick network and token.',
    icon: MousePointerClick,
  },
  {
    step: 2,
    title: 'Share',
    description: 'Get a permanent URL. No attachments needed.',
    icon: Share2,
  },
  {
    step: 3,
    title: 'Get Paid',
    description: 'Client connects wallet and pays. One click.',
    icon: Wallet,
  },
]
