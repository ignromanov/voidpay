import React from 'react'
import { Invoice } from '@/entities/invoice'
import { CopyButton, MailIcon, PhoneIcon, MapPinIcon, WalletIcon, HashIcon } from '@/shared/ui'
import { InvoicePaperVariant } from '../types'

interface PartyInfoProps {
  from: Invoice['from']
  client: Invoice['client']
  variant?: InvoicePaperVariant
}

export const PartyInfo = React.memo<PartyInfoProps>(({ from, client, variant = 'default' }) => {
  const isInteractive = variant === 'full'

  return (
    <div
      className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12"
      role="region"
      aria-label="Invoice parties information"
    >
      {/* FROM Section - Order: Name → Email → Phone → Address → Wallet */}
      <div className="flex flex-col">
        <p className="mb-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">From</p>
        {from.name && <p className="mb-3 text-lg font-bold text-black">{from.name}</p>}
        <div className="space-y-2">
          {from.email && (
            <div className="flex items-center gap-2">
              <MailIcon className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" aria-hidden="true" />
              <a
                href={`mailto:${from.email}`}
                className="text-sm text-zinc-800 hover:text-zinc-600 hover:underline"
              >
                {from.email}
              </a>
            </div>
          )}
          {from.phone && (
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" aria-hidden="true" />
              <a
                href={`tel:${from.phone}`}
                className="text-sm text-zinc-800 hover:text-zinc-600 hover:underline"
              >
                {from.phone}
              </a>
            </div>
          )}
          {from.taxId && (
            <div className="flex items-center gap-2">
              <HashIcon className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" aria-hidden="true" />
              <span className="text-sm text-zinc-800">{from.taxId}</span>
            </div>
          )}
          {from.physicalAddress && (
            <div className="mt-3 flex items-start gap-2">
              <MapPinIcon
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-400"
                aria-hidden="true"
              />
              <span className="text-sm whitespace-pre-line text-zinc-700">
                {from.physicalAddress}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* BILL TO Section - Order: Name → Email → Phone → Address → Wallet */}
      <div className="flex flex-col md:items-end">
        <p className="mb-3 text-xs font-bold tracking-widest text-zinc-400 uppercase md:text-right">
          Bill To
        </p>
        {client.name && (
          <p className="mb-3 text-lg font-bold text-black md:text-right">{client.name}</p>
        )}
        <div className="space-y-2 md:text-right">
          {client.email && (
            <div className="flex items-center gap-2 md:flex-row-reverse">
              <MailIcon className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" aria-hidden="true" />
              <a
                href={`mailto:${client.email}`}
                className="text-sm text-zinc-800 hover:text-zinc-600 hover:underline"
              >
                {client.email}
              </a>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 md:flex-row-reverse">
              <PhoneIcon className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" aria-hidden="true" />
              <a
                href={`tel:${client.phone}`}
                className="text-sm text-zinc-800 hover:text-zinc-600 hover:underline"
              >
                {client.phone}
              </a>
            </div>
          )}
          {client.taxId && (
            <div className="flex items-center gap-2 md:flex-row-reverse">
              <HashIcon className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" aria-hidden="true" />
              <span className="text-sm text-zinc-800">{client.taxId}</span>
            </div>
          )}
          {client.physicalAddress && (
            <div className="mt-3 flex items-start gap-2 md:flex-row-reverse">
              <MapPinIcon
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-400"
                aria-hidden="true"
              />
              <span className="text-sm whitespace-pre-line text-zinc-700">
                {client.physicalAddress}
              </span>
            </div>
          )}
          {client.walletAddress && (
            <div className="mt-3 flex items-center gap-2 md:flex-row-reverse">
              <WalletIcon className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" aria-hidden="true" />
              <span
                className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-800"
                title={client.walletAddress}
              >
                {client.walletAddress}
              </span>
              {isInteractive && (
                <CopyButton
                  value={client.walletAddress}
                  size="xs"
                  className="flex-shrink-0"
                  aria-label="Copy client wallet address"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

PartyInfo.displayName = 'PartyInfo'
