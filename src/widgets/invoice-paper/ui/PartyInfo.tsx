import React from 'react'
import { InvoiceSchemaV1 } from '@/entities/invoice'

interface PartyInfoProps {
  client: InvoiceSchemaV1['c']
}

export const PartyInfo = React.memo<PartyInfoProps>(({ client }) => {
  return (
    <div className="py-8">
      <p className="mb-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">Bill To</p>
      <p className="mb-1 text-lg font-bold text-black">{client.n || 'Client Name'}</p>
      <div className="space-y-0.5 text-sm text-zinc-600">
        <p>{client.e}</p>
        {client.ph && <p>{client.ph}</p>}
        {client.ads && <p className="pt-2 whitespace-pre-line text-zinc-500">{client.ads}</p>}
      </div>

      {client.a && (
        <div className="mt-6">
          <p className="mb-1 text-xs font-bold tracking-widest text-zinc-400 uppercase">
            Client Wallet
          </p>
          <p className="font-mono text-xs break-all text-zinc-800">{client.a}</p>
        </div>
      )}
    </div>
  )
})

PartyInfo.displayName = 'PartyInfo'
