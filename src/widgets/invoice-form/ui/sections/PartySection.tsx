'use client'

import { useCallback } from 'react'
import type { UseFormReturn, FormState } from 'react-hook-form'

import { WalletIcon, UsersIcon } from '@/shared/ui/icons'

import { Input } from '@/shared/ui/input'
import { AddressInput } from '@/shared/ui/address-input'
import { Textarea } from '@/shared/ui/textarea'
import { FIELD_LIMITS } from '@/shared/lib/invoice-types'

import type { InvoiceFormValues } from '../../lib/use-invoice-form'
import { getFieldError, type RequiredFieldsValidation } from '../../lib/get-field-error'
import { CollapsibleSection } from '../CollapsibleSection'
import { SectionHeading } from '../components/SectionHeading'

export interface PartySectionProps {
  partyType: 'from' | 'client'
  form: UseFormReturn<InvoiceFormValues>
  fieldValidation: RequiredFieldsValidation
  formState: FormState<InvoiceFormValues>
}

// Configuration per party type
const PARTY_CONFIG = {
  from: {
    icon: WalletIcon,
    iconColorClass: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
    title: 'From (Sender)',
    nameLabel: 'Your Name / Company *',
    namePlaceholder: 'Your Company Inc.',
    walletLabel: 'Your Wallet Address *',
    collapsibleTitle: 'Add Contact Info (Optional)',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    phoneLabel: 'Phone',
    addressLabel: 'Physical Address',
    addressPlaceholder: '123 Block St, Crypto City',
    taxIdLabel: 'Tax ID',
    // Validation keys
    nameValidationKey: 'senderName' as const,
    nameValidationMessage: 'Sender name is required',
    walletValidationKey: 'senderWallet' as const,
    walletValidationMessage: 'Valid wallet address required',
    showBorder: false,
  },
  client: {
    icon: UsersIcon,
    iconColorClass: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
    title: 'To (Recipient)',
    nameLabel: 'Client Name *',
    namePlaceholder: 'Acme Corp',
    walletLabel: 'Client Wallet',
    collapsibleTitle: 'Add Client Details (Optional)',
    emailLabel: 'Client Email',
    emailPlaceholder: 'billing@client.com',
    phoneLabel: 'Client Phone',
    addressLabel: 'Client Address',
    addressPlaceholder: '456 Chain Ln, Web3 Valley',
    taxIdLabel: 'Client Tax ID',
    // Validation keys
    nameValidationKey: 'clientName' as const,
    nameValidationMessage: 'Client name is required',
    walletValidationKey: undefined, // Client wallet is optional
    walletValidationMessage: undefined,
    showBorder: true,
  },
} as const

/**
 * Reusable party section for Sender (from) and Recipient (client).
 * Eliminates ~150 lines of duplication between the two sections.
 */
export function PartySection({ partyType, form, fieldValidation, formState }: PartySectionProps) {
  const { register, setValue, watch, trigger } = form
  const { touchedFields, errors } = formState
  const config = PARTY_CONFIG[partyType]

  // Watch wallet address for controlled AddressInput
  const walletAddress = watch(`${partyType}.walletAddress`)

  // Wallet address change handler
  const handleWalletChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(`${partyType}.walletAddress`, e.target.value)
    },
    [setValue, partyType]
  )

  // Blur handler for validation
  const handleWalletBlur = useCallback(() => {
    trigger(`${partyType}.walletAddress`)
  }, [trigger, partyType])

  // Get nested errors and touched fields
  const partyErrors = errors[partyType]
  const partyTouched = touchedFields[partyType]

  // Determine if wallet is required (only for sender)
  const walletRequired = partyType === 'from'

  return (
    <div className={config.showBorder ? 'space-y-4 border-t border-zinc-800/50 pt-4' : 'space-y-4 pt-2'}>
      <SectionHeading icon={config.icon} iconColorClass={config.iconColorClass} title={config.title} />

      <Input
        label={config.nameLabel}
        {...register(`${partyType}.name`)}
        placeholder={config.namePlaceholder}
        maxLength={FIELD_LIMITS.name}
        error={getFieldError(partyErrors?.name, fieldValidation, config.nameValidationKey, config.nameValidationMessage)}
        touched={partyTouched?.name}
      />

      {/* Wallet address - required for sender, optional collapsible for client */}
      {walletRequired ? (
        <AddressInput
          label={config.walletLabel}
          value={walletAddress || ''}
          onChange={handleWalletChange}
          onBlur={handleWalletBlur}
          placeholder="0x..."
          error={getFieldError(
            partyErrors?.walletAddress,
            fieldValidation,
            config.walletValidationKey,
            config.walletValidationMessage
          )}
          touched={partyTouched?.walletAddress}
        />
      ) : null}

      <CollapsibleSection title={config.collapsibleTitle}>
        {/* Client wallet inside collapsible */}
        {!walletRequired && (
          <AddressInput
            label={config.walletLabel}
            value={walletAddress || ''}
            onChange={handleWalletChange}
            onBlur={handleWalletBlur}
            placeholder="0x..."
            error={getFieldError(partyErrors?.walletAddress)}
            touched={partyTouched?.walletAddress}
          />
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label={config.emailLabel}
            type="email"
            placeholder={config.emailPlaceholder}
            maxLength={FIELD_LIMITS.email}
            error={getFieldError(partyErrors?.email)}
            touched={partyTouched?.email}
            {...register(`${partyType}.email`)}
          />
          <Input
            label={config.phoneLabel}
            type="tel"
            placeholder="+1..."
            maxLength={FIELD_LIMITS.phone}
            error={getFieldError(partyErrors?.phone)}
            touched={partyTouched?.phone}
            {...register(`${partyType}.phone`)}
          />
        </div>

        <Textarea
          label={config.addressLabel}
          placeholder={config.addressPlaceholder}
          {...register(`${partyType}.physicalAddress`)}
          maxLength={FIELD_LIMITS.address}
          showCount
          className="min-h-[60px]"
        />

        <Input
          label={config.taxIdLabel}
          placeholder="Tax ID / VAT Number"
          maxLength={FIELD_LIMITS.taxId}
          error={getFieldError(partyErrors?.taxId)}
          touched={partyTouched?.taxId}
          {...register(`${partyType}.taxId`)}
        />
      </CollapsibleSection>
    </div>
  )
}
