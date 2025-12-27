import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { InvoiceSchemaV1 } from '@/entities/invoice'

interface PartyInfoProps {
  from: InvoiceSchemaV1['f']
  client: InvoiceSchemaV1['c']
}

export const PartyInfo = React.memo<PartyInfoProps>(({ from, client }) => {
  return (
    <div
      className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12"
      role="region"
      aria-label="Invoice parties information"
    >
      {/* FROM Section */}
      <div className="flex flex-col">
        <p className="mb-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">From</p>
        <p className="mb-3 text-lg font-bold text-black">{from.n || 'Your Company'}</p>
        <div className="space-y-2">
          {from.e && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" aria-hidden="true" />
              <span className="text-sm text-zinc-800">{from.e}</span>
            </div>
          )}
          {from.ph && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" aria-hidden="true" />
              <span className="text-sm text-zinc-800">{from.ph}</span>
            </div>
          )}
          {from.ads && (
            <div className="flex items-start gap-2 pt-1">
              <MapPin
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-400"
                aria-hidden="true"
              />
              <span className="text-sm whitespace-pre-line text-zinc-700">{from.ads}</span>
            </div>
          )}
        </div>
      </div>

      {/* BILL TO Section */}
      <div className="flex flex-col md:items-end">
        <p className="mb-3 text-xs font-bold tracking-widest text-zinc-400 uppercase md:text-right">
          Bill To
        </p>
        <p className="mb-3 text-lg font-bold text-black md:text-right">
          {client.n || 'Client Name'}
        </p>
        <div className="space-y-2 md:text-right">
          {client.e && (
            <div className="flex items-center gap-2 md:flex-row-reverse">
              <Mail className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" aria-hidden="true" />
              <span className="text-sm text-zinc-800">{client.e}</span>
            </div>
          )}
          {client.ph && (
            <div className="flex items-center gap-2 md:flex-row-reverse">
              <Phone className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" aria-hidden="true" />
              <span className="text-sm text-zinc-800">{client.ph}</span>
            </div>
          )}
          {client.ads && (
            <div className="flex items-start gap-2 pt-1 md:flex-row-reverse">
              <MapPin
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-400"
                aria-hidden="true"
              />
              <span className="text-sm whitespace-pre-line text-zinc-700">{client.ads}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

PartyInfo.displayName = 'PartyInfo'
