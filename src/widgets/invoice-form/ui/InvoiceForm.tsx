'use client'

import { useCallback, useMemo } from 'react'
import { Calendar, Wallet, Users, Coins, Plus, Share2, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'

import { useCreatorStore } from '@/entities/creator'
import { Input, AddressInput, Text, Heading, Button, Textarea } from '@/shared/ui'
import { NetworkSelect } from '@/features/wallet-connect'
import { TokenSelect, type TokenInfo } from '@/features/invoice'
import { cn } from '@/shared/lib/utils'

import { useFormValidation } from '../lib/use-form-validation'
import { useDebouncedDraftUpdate } from '../lib/use-debounced-draft-update'
import { InvoiceItemRow } from './InvoiceItemRow'
import { CollapsibleSection } from './CollapsibleSection'

export interface InvoiceFormProps {
  className?: string
  onGenerate?: () => void
}

/**
 * InvoiceForm Widget
 *
 * Main form for creating invoices. Implements US1: Create Basic Invoice.
 * Renders metadata, sender, recipient, line items, and payment sections.
 *
 * @example
 * ```tsx
 * <InvoiceForm onGenerate={() => toast('Coming soon')} />
 * ```
 */
export function InvoiceForm({ className, onGenerate }: InvoiceFormProps) {
  // Store selectors
  const activeDraft = useCreatorStore((s) => s.activeDraft)
  const lineItems = useCreatorStore((s) => s.lineItems)
  const addLineItem = useCreatorStore((s) => s.addLineItem)
  const updateLineItem = useCreatorStore((s) => s.updateLineItem)
  const removeLineItem = useCreatorStore((s) => s.removeLineItem)
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)

  // Debounced draft updates (500ms delay to prevent excessive localStorage writes)
  const updateDraft = useDebouncedDraftUpdate()

  // Validation
  const { canGenerate, fieldValidation } = useFormValidation(activeDraft, lineItems)

  // Validation error messages (only show for invalid filled fields)
  const getFieldError = useCallback(
    (
      fieldKey: keyof typeof fieldValidation,
      value: unknown,
      message: string
    ): string | undefined => {
      // Only show error if field has been touched (has value) but is invalid
      const hasValue = Boolean(value && (typeof value === 'string' ? value.length > 0 : true))
      const isValid = fieldValidation[fieldKey]
      return hasValue && !isValid ? message : undefined
    },
    [fieldValidation]
  )

  // Field handlers with store updates
  const handleFieldChange = useCallback(
    (field: string, value: unknown) => {
      updateDraft({ [field]: value })
    },
    [updateDraft]
  )

  const handleFromChange = useCallback(
    (field: string, value: string) => {
      updateDraft({
        from: {
          ...activeDraft?.data.from,
          [field]: value,
        },
      })
    },
    [activeDraft?.data.from, updateDraft]
  )

  const handleClientChange = useCallback(
    (field: string, value: string) => {
      updateDraft({
        client: {
          ...activeDraft?.data.client,
          [field]: value,
        },
      })
    },
    [activeDraft?.data.client, updateDraft]
  )

  const handleNetworkChange = useCallback(
    (chainId: number) => {
      updateDraft({ networkId: chainId })
      // Sync network theme for NetworkBackground
      const themeMap: Record<number, 'ethereum' | 'arbitrum' | 'optimism' | 'polygon'> = {
        1: 'ethereum',
        42161: 'arbitrum',
        10: 'optimism',
        137: 'polygon',
      }
      const theme = themeMap[chainId]
      if (theme) setNetworkTheme(theme)
    },
    [updateDraft, setNetworkTheme]
  )

  const handleTokenChange = useCallback(
    (token: TokenInfo) => {
      updateDraft({
        currency: token.symbol,
        tokenAddress: token.address ? (token.address as `0x${string}`) : undefined,
        decimals: token.decimals,
      })
    },
    [updateDraft]
  )

  const data = activeDraft?.data

  // Memoize validation errors to avoid repetitive checks
  const validationErrors = useMemo(() => {
    return {
      invoiceId: getFieldError('invoiceId', data?.invoiceId, 'Invoice number is required'),
      senderName: getFieldError('senderName', data?.from?.name, 'Sender name is required'),
      senderWallet: getFieldError(
        'senderWallet',
        data?.from?.walletAddress,
        'Valid wallet address required'
      ),
      clientName: getFieldError('clientName', data?.client?.name, 'Client name is required'),
    }
  }, [
    data?.invoiceId,
    data?.from?.name,
    data?.from?.walletAddress,
    data?.client?.name,
    getFieldError,
  ])

  return (
    <div className={cn('space-y-8', className)}>
      {/* Metadata Section */}
      <div className="space-y-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
        <Input
          label="Invoice No. *"
          value={data?.invoiceId || ''}
          onChange={(e) => handleFieldChange('invoiceId', e.target.value)}
          className="font-mono"
          placeholder="INV-001"
          {...(validationErrors.invoiceId && { error: validationErrors.invoiceId })}
        />

        <div className="space-y-1.5">
          <Text variant="label" className="flex items-center gap-1.5 text-zinc-400">
            <Calendar className="h-3 w-3" /> Dates (Issue / Due) *
          </Text>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={
                data?.issuedAt ? new Date(data.issuedAt * 1000).toISOString().split('T')[0] : ''
              }
              onChange={(e) => {
                const unix = e.target.value
                  ? Math.floor(new Date(e.target.value).getTime() / 1000)
                  : undefined
                handleFieldChange('issuedAt', unix)
              }}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-2 py-2.5 font-mono text-xs text-zinc-300 transition-shadow outline-none focus:text-white focus:shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            />
            <input
              type="date"
              value={data?.dueAt ? new Date(data.dueAt * 1000).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const unix = e.target.value
                  ? Math.floor(new Date(e.target.value).getTime() / 1000)
                  : undefined
                handleFieldChange('dueAt', unix)
              }}
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
          value={data?.from?.name || ''}
          onChange={(e) => handleFromChange('name', e.target.value)}
          placeholder="Your Company Inc."
          {...(validationErrors.senderName && { error: validationErrors.senderName })}
        />

        <AddressInput
          label="Your Wallet Address *"
          value={data?.from?.walletAddress || ''}
          onChange={(e) => handleFromChange('walletAddress', e.target.value)}
          placeholder="0x..."
          {...(validationErrors.senderWallet && { error: validationErrors.senderWallet })}
        />

        <CollapsibleSection title="Add Contact Info (Optional)">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={data?.from?.email || ''}
              onChange={(e) => handleFromChange('email', e.target.value)}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+1..."
              value={data?.from?.phone || ''}
              onChange={(e) => handleFromChange('phone', e.target.value)}
            />
          </div>
          <Textarea
            label="Physical Address"
            placeholder="123 Block St, Crypto City"
            value={data?.from?.physicalAddress || ''}
            onChange={(e) => handleFromChange('physicalAddress', e.target.value)}
            className="min-h-[60px]"
          />
          <Input
            label="Tax ID"
            placeholder="Tax ID / VAT Number"
            value={data?.from?.taxId || ''}
            onChange={(e) => handleFromChange('taxId', e.target.value)}
          />
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
          value={data?.client?.name || ''}
          onChange={(e) => handleClientChange('name', e.target.value)}
          {...(validationErrors.clientName && { error: validationErrors.clientName })}
        />

        <CollapsibleSection title="Add Client Details (Optional)">
          <AddressInput
            label="Client Wallet"
            value={data?.client?.walletAddress || ''}
            onChange={(e) => handleClientChange('walletAddress', e.target.value)}
            placeholder="0x..."
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Client Email"
              type="email"
              placeholder="billing@client.com"
              value={data?.client?.email || ''}
              onChange={(e) => handleClientChange('email', e.target.value)}
            />
            <Input
              label="Client Phone"
              type="tel"
              placeholder="+1..."
              value={data?.client?.phone || ''}
              onChange={(e) => handleClientChange('phone', e.target.value)}
            />
          </div>
          <Textarea
            label="Client Address"
            placeholder="456 Chain Ln, Web3 Valley"
            value={data?.client?.physicalAddress || ''}
            onChange={(e) => handleClientChange('physicalAddress', e.target.value)}
            className="min-h-[60px]"
          />
          <Input
            label="Client Tax ID"
            placeholder="Tax ID / VAT Number"
            value={data?.client?.taxId || ''}
            onChange={(e) => handleClientChange('taxId', e.target.value)}
          />
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

        <div className="space-y-3">
          <AnimatePresence>
            {lineItems.map((item) => (
              <InvoiceItemRow
                key={item.id}
                item={item}
                currency={data?.currency || 'USDC'}
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
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="0"
            value={data?.tax || ''}
            onChange={(e) => updateDraft({ tax: e.target.value || undefined })}
            className="text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Discount (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="0"
            value={data?.discount || ''}
            onChange={(e) => updateDraft({ discount: e.target.value || undefined })}
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
          <label className="block text-xs font-medium tracking-wide text-zinc-400 uppercase">
            Network
          </label>
          <NetworkSelect
            value={data?.networkId || 42161}
            onChange={handleNetworkChange}
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium tracking-wide text-zinc-400 uppercase">
            Token
          </label>
          <TokenSelect
            chainId={data?.networkId || 42161}
            value={
              data?.currency
                ? {
                    symbol: data.currency,
                    address: data.tokenAddress ?? null,
                    decimals: data.decimals || 18,
                    name: data.currency,
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
        <CollapsibleSection title="Add Notes / Memo (Optional)">
          <div className="relative">
            <Textarea
              value={data?.notes || ''}
              onChange={(e) => {
                const value = e.target.value.slice(0, 280)
                handleFieldChange('notes', value)
              }}
              placeholder="Additional information for the invoice..."
              className="min-h-[80px] resize-none pr-16"
              maxLength={280}
            />
            <div className="pointer-events-none absolute right-2 bottom-2 font-mono text-[10px] text-zinc-500">
              {data?.notes?.length || 0}/280
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
