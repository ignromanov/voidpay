import React from 'react'
import { Text } from '@/shared/ui/typography'
import { cn } from '@/shared/lib/utils'

import { MetadataSectionView } from './sections/MetadataSectionView'
import { PartySectionView } from './sections/PartySectionView'
import { LineItemsSectionView } from './sections/LineItemsSectionView'
import { PaymentSectionView } from './sections/PaymentSectionView'
import { LinkOptionsSectionView } from './sections/LinkOptionsSectionView'
import { GenerateButtonView } from './sections/GenerateButtonView'

export interface InvoiceFormViewProps {
  className?: string
  value: {
    invoiceId?: string
    issuedAt?: string
    dueAt?: string
    from?: {
      name?: string
      walletAddress?: string
      email?: string
    }
    client?: {
      name?: string
      email?: string
    }
    lineItems?: Array<{
      description?: string
      quantity?: number
      rate?: string
    }>
    networkLabel?: string
    tokenSymbol?: string
    /** Chain ID for rendering the network icon (e.g. 42161 for Arbitrum) */
    chainId?: number
    total?: string
    magicDustEnabled?: boolean
  }
  focusedField?: 'from' | 'client' | 'lineItem' | 'token' | 'network'
  showGenerateButton?: boolean
}

/**
 * InvoiceFormView — pure presentational composer for InvoiceForm.
 *
 * Accepts flat props and renders the same visual layout as the real form
 * without react-hook-form, useCreatorStore, or any browser-only hooks.
 * Safe to render in Remotion, SSR, OG-image generators, and Storybook.
 *
 * Composed from *SectionView components — no inline subviews.
 */
export const InvoiceFormView = React.memo(function InvoiceFormView({
  className,
  value,
  focusedField,
  showGenerateButton = false,
}: InvoiceFormViewProps) {
  const {
    invoiceId,
    issuedAt,
    dueAt,
    from,
    client,
    lineItems,
    networkLabel,
    tokenSymbol,
    chainId,
    total,
    magicDustEnabled = true,
  } = value

  return (
    <div className={cn('space-y-8', className)}>
      <MetadataSectionView
        {...(invoiceId !== undefined && { invoiceId })}
        {...(issuedAt !== undefined && { issuedAt })}
        {...(dueAt !== undefined && { dueAt })}
      />

      <PartySectionView
        partyType="from"
        {...(from?.name !== undefined && { name: from.name })}
        {...(from?.walletAddress !== undefined && { walletAddress: from.walletAddress })}
        {...(from?.email !== undefined && { email: from.email })}
        focused={focusedField === 'from'}
      />

      <PartySectionView
        partyType="client"
        {...(client?.name !== undefined && { name: client.name })}
        {...(client?.email !== undefined && { email: client.email })}
        focused={focusedField === 'client'}
      />

      <LineItemsSectionView lineItems={lineItems} focused={focusedField === 'lineItem'} />

      <PaymentSectionView
        {...(networkLabel !== undefined && { networkLabel })}
        {...(tokenSymbol !== undefined && { tokenSymbol })}
        {...(chainId !== undefined && { chainId })}
        {...(focusedField === 'token' && { focusedField })}
        {...(focusedField === 'network' && { focusedField })}
      />

      {total && (
        <div className="border-t border-zinc-800/50 pt-4">
          <div className="flex items-center justify-between">
            <Text variant="label" className="text-zinc-400">
              Total
            </Text>
            <Text variant="label" className="font-mono text-zinc-200">
              {total}
            </Text>
          </div>
        </div>
      )}

      <LinkOptionsSectionView magicDustEnabled={magicDustEnabled} />

      {showGenerateButton && (
        <GenerateButtonView
          onGenerate={undefined}
          canGenerate={false}
          isGenerating={false}
        />
      )}
    </div>
  )
})
