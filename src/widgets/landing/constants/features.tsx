/**
 * Feature cards and workflow steps data
 * Feature: 012-landing-page
 */

import {
  DatabaseIcon,
  GlobeIcon,
  LayersIcon,
  LayoutTemplateIcon,
  MousePointerClickIcon,
  Share2Icon,
  ShieldIcon,
  WalletIcon,
  ZapIcon,
} from '@/shared/ui/icons'

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
    icon: DatabaseIcon,
    iconColor: 'text-violet-500',
  },
  {
    id: 'multichain',
    title: 'Multi-Chain Native',
    description:
      'Ethereum, Base, Arbitrum, Optimism, Polygon. The UI vibes with your network.',
    icon: GlobeIcon,
    iconColor: 'text-cyan-500',
  },
  {
    id: 'immutable',
    title: 'Immutable',
    description:
      "Once you share an invoice link, the details can't be altered. The data is baked into the URL — tamper with it and it simply won't open.",
    icon: ShieldIcon,
    iconColor: 'text-emerald-500',
  },
  {
    id: 'no-bloat',
    title: 'No Bloat',
    description:
      'One tool. One purpose. No CRM, no upsells, no subscriptions. Just send the link.',
    icon: LayoutTemplateIcon,
    iconColor: 'text-pink-500',
  },
  {
    id: 'instant',
    title: 'One-Click Payments',
    description:
      'Your client opens the link, connects wallet, pays. No sign-up for either party.',
    icon: ZapIcon,
    iconColor: 'text-yellow-500',
  },
  {
    id: 'open',
    title: 'Open Standard',
    description:
      'Built on open web standards. Export to PDF, verify on-chain, and integrate with your existing workflow.',
    icon: LayersIcon,
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
    icon: MousePointerClickIcon,
  },
  {
    step: 2,
    title: 'Share',
    description: 'Get a permanent URL. No attachments needed.',
    icon: Share2Icon,
  },
  {
    step: 3,
    title: 'Get Paid',
    description: 'Client connects wallet and pays. One click.',
    icon: WalletIcon,
  },
]
