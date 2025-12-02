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
    title: 'No Database',
    description:
      "We don't store your data. Your invoice information is encoded directly into the URL, making it truly stateless and private.",
    icon: Database,
    iconColor: 'text-violet-500',
  },
  {
    id: 'multichain',
    title: 'Multi-Chain',
    description:
      'Support for Ethereum, Arbitrum, Optimism, Polygon, and Base. The UI adapts to the network vibe automatically.',
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
    id: 'aesthetic',
    title: 'Aesthetic First',
    description:
      "Designed with a 'Floating Workspace' philosophy. Dark mode by default. Stark white paper contrast. Beautiful typography.",
    icon: LayoutTemplate,
    iconColor: 'text-pink-500',
  },
  {
    id: 'instant',
    title: 'Instant Pay',
    description:
      'Recipients can connect their wallet and pay instantly. No sign-ups required for either party.',
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
    description:
      'Fill out the invoice details in our beautiful editor. Select your preferred network and token.',
    icon: MousePointerClick,
  },
  {
    step: 2,
    title: 'Share',
    description: 'Generate a unique, immutable link. No PDF attachments, just a sleek web link.',
    icon: Share2,
  },
  {
    step: 3,
    title: 'Get Paid',
    description: 'Your client connects their wallet and pays instantly in the requested token.',
    icon: Wallet,
  },
]
