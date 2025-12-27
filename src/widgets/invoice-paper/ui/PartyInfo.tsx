import React from 'react'
import { InvoiceSchemaV1 } from '@/entities/invoice'
import { HyperText } from '@/shared/ui/hyper-text'

interface PartyInfoProps {
  client: InvoiceSchemaV1['c']
  animated?: boolean
}

export const PartyInfo: React.FC<PartyInfoProps> = ({ client, animated = true }) => {
  const AnimatedText = ({
    text,
    className = '',
  }: {
    text: string | undefined
    className?: string
  }) => {
    const str = text || ''
    if (animated && str) {
      return <HyperText text={str} className={className} />
    }
    return <span className={className}>{str}</span>
  }

  return (
    <div className="py-8">
      <p className="mb-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">Bill To</p>
      <p className="mb-1 text-lg font-bold text-black">
        <AnimatedText text={client.n || 'Client Name'} />
      </p>
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
          <p className="font-mono text-xs break-all text-zinc-800">
            <AnimatedText text={client.a} />
          </p>
        </div>
      )}
    </div>
  )
}
