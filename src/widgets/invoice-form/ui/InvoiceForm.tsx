'use client'

import { useCallback } from 'react'
import { Calendar, Wallet, Users, Coins, Plus, Share2, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'

import { useCreatorStore } from '@/entities/creator'
import { Input, AddressInput, Text, Heading, Button, Textarea } from '@/shared/ui'
import { NetworkSelect } from '@/features/wallet-connect'
import { TokenSelect, type TokenInfo } from '@/features/invoice'
import { cn } from '@/shared/lib/utils'

import { useInvoiceForm } from '../lib/use-invoice-form'
import { InvoiceItemRow } from './InvoiceItemRow'
import { CollapsibleSection } from './CollapsibleSection'

export interface InvoiceFormProps {
  className?: string
  onGenerate?: () => void
}

/**
 * InvoiceForm Widget
 *
 * Main form for creating invoices using react-hook-form for performant input handling.
 * Form has its own internal state (uncontrolled inputs) and syncs to Zustand store with debounce.
 *
 * Architecture:
 * - useInvoiceForm: manages form state + debounced sync to store
 * - register(): uncontrolled inputs = no re-render on keystroke
 * - LineItems: managed separately via updateLineItem (direct store calls)
 */
export function InvoiceForm({ className, onGenerate }: InvoiceFormProps) {
  // Form with debounced store sync
  const { form, fieldValidation, canGenerate } = useInvoiceForm()
  const { register, setValue, watch } = form

  // Watch values for controlled components (selects, dates)
  const networkId = watch('networkId')
  const currency = watch('currency')
  const tokenAddress = watch('tokenAddress')
  const decimals = watch('decimals')
  const issuedAt = watch('issuedAt')
  const dueAt = watch('dueAt')
  const notes = watch('notes')

  // Store selectors for line items (managed separately)
  const lineItems = useCreatorStore((s) => s.lineItems)
  const addLineItem = useCreatorStore((s) => s.addLineItem)
  const updateLineItem = useCreatorStore((s) => s.updateLineItem)
  const removeLineItem = useCreatorStore((s) => s.removeLineItem)
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)

  // Network change handler (also updates theme)
  const handleNetworkChange = useCallback(
    (chainId: number) => {
      setValue('networkId', chainId)
      const themeMap: Record<number, 'ethereum' | 'arbitrum' | 'optimism' | 'polygon'> = {
        1: 'ethereum',
        42161: 'arbitrum',
        10: 'optimism',
        137: 'polygon',
      }
      const theme = themeMap[chainId]
      if (theme) setNetworkTheme(theme)
    },
    [setValue, setNetworkTheme]
  )

  // Token change handler
  const handleTokenChange = useCallback(
    (token: TokenInfo) => {
      setValue('currency', token.symbol)
      setValue('tokenAddress', token.address ?? undefined)
      setValue('decimals', token.decimals)
    },
    [setValue]
  )

  // Date change handlers (unix timestamps)
  const handleIssuedAtChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const unix = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : undefined
      setValue('issuedAt', unix)
    },
    [setValue]
  )

  const handleDueAtChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const unix = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : undefined
      setValue('dueAt', unix)
    },
    [setValue]
  )

  // Notes handler with maxLength
  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value.slice(0, 280)
      setValue('notes', value)
    },
    [setValue]
  )

  // Watch wallet addresses for controlled AddressInput components
  const senderWallet = watch('from.walletAddress')
  const clientWallet = watch('client.walletAddress')

  // Wallet address change handlers
  const handleSenderWalletChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue('from.walletAddress', e.target.value)
    },
    [setValue]
  )

  const handleClientWalletChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue('client.walletAddress', e.target.value)
    },
    [setValue]
  )

  // Validation error messages (returns empty string if no error for exactOptionalPropertyTypes)
  const getError = (field: keyof typeof fieldValidation, message: string): string => {
    const fieldMap: Record<keyof typeof fieldValidation, string> = {
      senderName: 'from.name',
      senderWallet: 'from.walletAddress',
      clientName: 'client.name',
      invoiceId: 'invoiceId',
    }
    const value = watch(fieldMap[field] as 'from.name' | 'from.walletAddress' | 'client.name' | 'invoiceId')
    const hasValue = Boolean(value && (typeof value === 'string' ? value.length > 0 : true))
    return hasValue && !fieldValidation[field] ? message : ''
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Metadata Section */}
      <div className="space-y-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
        <Input
          label="Invoice No. *"
          {...register('invoiceId')}
          className="font-mono"
          placeholder="INV-001"
          error={getError('invoiceId', 'Invoice number is required')}
        />

        <div className="space-y-1.5">
          <Text variant="label" className="flex items-center gap-1.5 text-zinc-400">
            <Calendar className="h-3 w-3" /> Dates (Issue / Due) *
          </Text>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={issuedAt ? new Date(issuedAt * 1000).toISOString().split('T')[0] : ''}
              onChange={handleIssuedAtChange}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-2 py-2.5 font-mono text-xs text-zinc-300 transition-shadow outline-none focus:text-white focus:shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            />
            <input
              type="date"
              value={dueAt ? new Date(dueAt * 1000).toISOString().split('T')[0] : ''}
              onChange={handleDueAtChange}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-2 py-2.5 font-mono text-xs text-zinc-300 transition-shadow outline-none focus:text-white focus:shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            />
          </div>
        </div>
      </div>

      {/* Sender Section */}
      <div className="space-y-4 pt-2">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded border border-violet-500/20 bg-violet-500/10 p-1.5 text-violet-400">
            <Wallet className="h-4 w-4" />
          </div>
          <Heading variant="h4" className="text-zinc-300">
            From (Sender)
          </Heading>
        </div>

        <Input
          label="Your Name / Company *"
          {...register('from.name')}
          placeholder="Your Company Inc."
          error={getError('senderName', 'Sender name is required')}
        />

        <AddressInput
          label="Your Wallet Address *"
          value={senderWallet || ''}
          onChange={handleSenderWalletChange}
          placeholder="0x..."
          error={getError('senderWallet', 'Valid wallet address required')}
        />

        <CollapsibleSection title="Add Contact Info (Optional)">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Email" type="email" placeholder="you@example.com" {...register('from.email')} />
            <Input label="Phone" type="tel" placeholder="+1..." {...register('from.phone')} />
          </div>
          <Textarea
            label="Physical Address"
            placeholder="123 Block St, Crypto City"
            {...register('from.physicalAddress')}
            className="min-h-[60px]"
          />
          <Input label="Tax ID" placeholder="Tax ID / VAT Number" {...register('from.taxId')} />
        </CollapsibleSection>
      </div>

      {/* Recipient Section */}
      <div className="space-y-4 border-t border-zinc-800/50 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded border border-cyan-500/20 bg-cyan-500/10 p-1.5 text-cyan-400">
            <Users className="h-4 w-4" />
          </div>
          <Heading variant="h4" className="text-zinc-300">
            To (Recipient)
          </Heading>
        </div>

        <Input
          label="Client Name *"
          type="text"
          placeholder="Acme Corp"
          {...register('client.name')}
          error={getError('clientName', 'Client name is required')}
        />

        <CollapsibleSection title="Add Client Details (Optional)">
          <AddressInput label="Client Wallet" value={clientWallet || ''} onChange={handleClientWalletChange} placeholder="0x..." />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Client Email" type="email" placeholder="billing@client.com" {...register('client.email')} />
            <Input label="Client Phone" type="tel" placeholder="+1..." {...register('client.phone')} />
          </div>
          <Textarea
            label="Client Address"
            placeholder="456 Chain Ln, Web3 Valley"
            {...register('client.physicalAddress')}
            className="min-h-[60px]"
          />
          <Input label="Client Tax ID" placeholder="Tax ID / VAT Number" {...register('client.taxId')} />
        </CollapsibleSection>
      </div>

      {/* Line Items Section */}
      <div className="space-y-4 border-t border-zinc-800/50 pt-4">
        <div className="flex items-center justify-between">
          <Text variant="label" className="text-zinc-500">
            Line Items *
          </Text>
          <motion.div layout>
            <Button
              onClick={addLineItem}
              variant="ghost"
              size="sm"
              className="text-violet-400 hover:text-violet-300"
              disabled={lineItems.length >= 5}
              title={lineItems.length >= 5 ? 'Maximum 5 items' : undefined}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Item
            </Button>
          </motion.div>
        </div>

        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-3 text-right">Price</div>
            <div className="col-span-1" />
          </div>

          <AnimatePresence>
            {lineItems.map((item) => (
              <InvoiceItemRow
                key={item.id}
                item={item}
                currency={currency || 'USDC'}
                onUpdate={(updates) => updateLineItem(item.id, updates)}
                onRemove={() => removeLineItem(item.id)}
                canRemove={lineItems.length > 1}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Tax & Discount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Tax (%)</label>
          <Input type="number" min="0" max="100" step="0.01" placeholder="0" {...register('tax')} className="text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Discount (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="0"
            {...register('discount')}
            className="text-sm"
          />
        </div>
      </div>

      {/* Payment Section */}
      <div className="space-y-4 border-t border-zinc-800/50 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <Coins className="h-4 w-4 text-zinc-500" />
          <Heading variant="h4" className="text-zinc-500">
            Token & Network
          </Heading>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium tracking-wide text-zinc-400 uppercase">Network</label>
          <NetworkSelect value={networkId || 42161} onChange={handleNetworkChange} className="w-full" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium tracking-wide text-zinc-400 uppercase">Token</label>
          <TokenSelect
            chainId={networkId || 42161}
            value={
              currency
                ? {
                    symbol: currency,
                    address: tokenAddress ?? null,
                    decimals: decimals || 18,
                    name: currency,
                    iconColor: 'bg-violet-500',
                  }
                : null
            }
            onChange={handleTokenChange}
            className="w-full"
          />
        </div>
      </div>

      {/* Notes Section */}
      <div className="border-t border-zinc-800/50 pt-4">
        <CollapsibleSection title="Add Notes / Memo (Optional)" defaultOpen>
          <div className="relative">
            <Textarea
              value={notes || ''}
              onChange={handleNotesChange}
              placeholder="Additional information for the invoice..."
              className="min-h-[80px] resize-none pr-16"
              maxLength={280}
            />
            <div className="pointer-events-none absolute right-2 bottom-2 font-mono text-[10px] text-zinc-500">
              {notes?.length || 0}/280
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Generate Button */}
      <div className="pt-6">
        <Button
          onClick={() => {
            if (onGenerate) {
              onGenerate()
            } else {
              toast.info('Coming soon', {
                description: 'Invoice generation will be available in the next update',
              })
            }
          }}
          disabled={!canGenerate}
          variant="glow"
          className="h-14 w-full text-base"
        >
          <Share2 className="mr-2 h-5 w-5" />
          Generate Invoice Link
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
