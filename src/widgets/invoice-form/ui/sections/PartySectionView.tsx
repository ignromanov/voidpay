import React from 'react'
import { WalletIcon, UsersIcon } from '@/shared/ui/icons'
import { Input } from '@/shared/ui/input'

import { SectionHeading } from '../components/SectionHeading'

export interface PartySectionViewProps {
  partyType: 'from' | 'client'
  name?: string
  walletAddress?: string
  email?: string
  focused?: boolean
}

const PARTY_CONFIG = {
  from: {
    icon: WalletIcon,
    iconColorClass: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
    title: 'From (Sender)',
    nameLabel: 'Your Name / Company *',
    namePlaceholder: 'Your Company Inc.',
    walletLabel: 'Your Wallet Address *',
    emailLabel: 'Email',
    containerClass: 'space-y-4 pt-2',
  },
  client: {
    icon: UsersIcon,
    iconColorClass: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
    title: 'To (Recipient)',
    nameLabel: 'Client Name *',
    namePlaceholder: 'Acme Corp',
    walletLabel: 'Client Wallet',
    emailLabel: 'Client Email',
    containerClass: 'space-y-4 border-t border-zinc-800/50 pt-4',
  },
} as const

/**
 * PartySectionView — pure presentational display of a party (sender or client).
 *
 * No react-hook-form, no browser hooks. Safe for Remotion, SSR, Storybook.
 * Shows name, wallet address, and email. No collapsible, no phone/address/taxId.
 * Container: PartySection.tsx
 */
export const PartySectionView = React.memo(function PartySectionView({
  partyType,
  name,
  walletAddress,
  email,
  focused = false,
}: PartySectionViewProps) {
  const config = PARTY_CONFIG[partyType]
  const ringClass = focused ? 'ring-2 ring-violet-500/60 ring-offset-1 ring-offset-zinc-950' : undefined

  return (
    <div className={config.containerClass}>
      <SectionHeading icon={config.icon} iconColorClass={config.iconColorClass} title={config.title} />

      <Input
        label={config.nameLabel}
        value={name ?? ''}
        placeholder={config.namePlaceholder}
        readOnly
        className={ringClass}
      />

      {(partyType === 'from' || walletAddress) && (
        <Input
          label={config.walletLabel}
          value={walletAddress ?? ''}
          placeholder="0x..."
          readOnly
          className={`font-mono${ringClass ? ` ${ringClass}` : ''}`}
        />
      )}

      {email && (
        <Input
          label={config.emailLabel}
          value={email}
          placeholder="you@example.com"
          readOnly
          className={ringClass}
        />
      )}
    </div>
  )
})
