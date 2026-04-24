import { WalletIcon, UsersIcon, CoinsIcon, CalendarIcon, FingerprintIcon, Share2Icon, ArrowRightIcon, PlusIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'
import { Text, Heading } from '@/shared/ui/typography'
import { cn } from '@/shared/lib/utils'

import { SectionHeading } from './components/SectionHeading'
import { ReadonlyInput } from './shared/ReadonlyInput'

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
    subtotal?: string
    total?: string
    magicDustEnabled?: boolean
    includeOgImage?: boolean
  }
  focusedField?: 'from' | 'client' | 'lineItem' | 'token' | 'network'
  showGenerateButton?: boolean
}

function focusRing(active: boolean): string {
  return active ? 'ring-2 ring-violet-500/60 ring-offset-1 ring-offset-zinc-950' : ''
}

function MetadataSectionView({
  invoiceId,
  issuedAt,
  dueAt,
}: {
  invoiceId?: string
  issuedAt?: string
  dueAt?: string
}): React.JSX.Element {
  return (
    <div className="space-y-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
      <ReadonlyInput label="Invoice No. *" value={invoiceId} placeholder="INV-2026-001" mono />
      <div className="space-y-1.5">
        <Text variant="label" className="flex items-center gap-1.5 text-zinc-400">
          <CalendarIcon size={12} /> Dates (Issue / Due) *
        </Text>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div
            className={cn(
              'rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm',
              issuedAt ? 'text-zinc-200' : 'text-zinc-600'
            )}
          >
            {issuedAt ?? 'Issue date'}
          </div>
          <div
            className={cn(
              'rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm',
              dueAt ? 'text-zinc-200' : 'text-zinc-600'
            )}
          >
            {dueAt ?? 'Due date'}
          </div>
        </div>
      </div>
    </div>
  )
}

function PartySectionView({
  partyType,
  name,
  walletAddress,
  email,
  focused,
}: {
  partyType: 'from' | 'client'
  name?: string
  walletAddress?: string
  email?: string
  focused: boolean
}): React.JSX.Element {
  const isFrom = partyType === 'from'
  const icon = isFrom ? WalletIcon : UsersIcon
  const iconColorClass = isFrom
    ? 'border-violet-500/20 bg-violet-500/10 text-violet-400'
    : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400'
  const title = isFrom ? 'From (Sender)' : 'To (Recipient)'
  const namePlaceholder = isFrom ? 'Your Company Inc.' : 'Acme Corp'
  const nameLabel = isFrom ? 'Your Name / Company *' : 'Client Name *'
  const containerClass = isFrom ? 'space-y-4 pt-2' : 'space-y-4 border-t border-zinc-800/50 pt-4'
  const ringClass = focused ? focusRing(true) : undefined

  return (
    <div className={containerClass}>
      <SectionHeading icon={icon} iconColorClass={iconColorClass} title={title} />
      <ReadonlyInput label={nameLabel} value={name} placeholder={namePlaceholder} focused={focused} focusRingClass={ringClass} />
      {isFrom && (
        <ReadonlyInput label="Your Wallet Address *" value={walletAddress} placeholder="0x..." focused={focused} focusRingClass={ringClass} mono />
      )}
      {email && (
        <ReadonlyInput label="Email" value={email} placeholder="you@example.com" focused={focused} focusRingClass={ringClass} />
      )}
    </div>
  )
}

function LineItemsViewRow({
  description,
  quantity,
  rate,
  focused,
}: {
  description?: string
  quantity?: number
  rate?: string
  focused: boolean
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-transparent bg-zinc-900/40 p-3 transition-colors',
        focused && focusRing(true)
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'min-w-0 flex-1 border-b py-1 text-base transition-colors',
            description ? 'border-zinc-800 text-zinc-200' : 'border-zinc-800 text-zinc-600'
          )}
        >
          {description ?? 'Item description'}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Qty</p>
          <div className="border-b border-zinc-800 py-2 tabular-nums text-base text-zinc-200">
            {quantity ?? 1}
          </div>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Price</p>
          <div className="border-b border-zinc-800 py-2 text-right tabular-nums text-base text-zinc-200">
            {rate ?? '0.00'}
          </div>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Total</p>
          <div className="border-b border-zinc-800 py-2 text-right tabular-nums text-base text-zinc-200">
            {rate ?? '0.00'}
          </div>
        </div>
      </div>
    </div>
  )
}

function LineItemsSectionView({
  lineItems,
  focused,
}: {
  lineItems: InvoiceFormViewProps['value']['lineItems']
  focused: boolean
}): React.JSX.Element {
  const items = lineItems?.length ? lineItems : [{}]

  return (
    <div className="space-y-4 border-t border-zinc-800/50 pt-4">
      <div className="flex items-center justify-between">
        <Text variant="label" className="text-zinc-500">
          Line Items *
        </Text>
        <Button variant="ghost" size="sm" className="min-h-[44px] text-violet-400 hover:text-violet-300" disabled>
          <PlusIcon size={12} className="mr-1" />
          Add Item
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <LineItemsViewRow
            key={i}
            {...(item.description !== undefined && { description: item.description })}
            {...(item.quantity !== undefined && { quantity: item.quantity })}
            {...(item.rate !== undefined && { rate: item.rate })}
            focused={focused}
          />
        ))}
      </div>
    </div>
  )
}

function PaymentSectionView({
  networkLabel,
  tokenSymbol,
  focusedField,
}: {
  networkLabel?: string
  tokenSymbol?: string
  focusedField?: InvoiceFormViewProps['focusedField']
}): React.JSX.Element {
  return (
    <div className="space-y-4 border-t border-zinc-800/50 pt-4">
      <div className="mb-2 flex items-center gap-2">
        <CoinsIcon size={16} className="text-zinc-500" />
        <Heading variant="h4" className="text-zinc-500">
          Token & Network
        </Heading>
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">Network</label>
        <div
          className={cn(
            'rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm',
            networkLabel ? 'text-zinc-200' : 'text-zinc-600',
            focusedField === 'network' && focusRing(true)
          )}
        >
          {networkLabel ?? 'Select network'}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">Token</label>
        <div
          className={cn(
            'rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm',
            tokenSymbol ? 'text-zinc-200' : 'text-zinc-600',
            focusedField === 'token' && focusRing(true)
          )}
        >
          {tokenSymbol ?? 'Select token'}
        </div>
      </div>
    </div>
  )
}

function MagicDustView({ enabled }: { enabled: boolean }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FingerprintIcon size={16} className={enabled ? 'text-violet-400' : 'text-zinc-600'} />
          <Text variant="tiny" className="font-bold text-zinc-300">
            Magic Dust Verification
          </Text>
        </div>
        <div
          className={cn(
            'h-5 w-9 rounded-full transition-colors',
            enabled ? 'bg-violet-600' : 'bg-zinc-700'
          )}
        >
          <div
            className={cn(
              'mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
              enabled ? 'translate-x-4.5 ml-0.5' : 'ml-0.5 translate-x-0'
            )}
          />
        </div>
      </div>
      <div className="mt-2 border-t border-zinc-800/50 pt-2">
        <Text variant="tiny" className="leading-tight">
          Adds a tiny random amount (e.g. 0.000042) to the total to{' '}
          <strong className="text-zinc-400">instantly verify payment</strong> on-chain without a database.
        </Text>
      </div>
    </div>
  )
}

/**
 * InvoiceFormView — pure presentational sibling of InvoiceForm.
 *
 * Accepts flat props and renders the same visual layout as the real form
 * without react-hook-form, useCreatorStore, or any browser-only hooks.
 * Safe to render in Remotion, SSR, OG-image generators, and Storybook.
 */
export function InvoiceFormView({
  className,
  value,
  focusedField,
  showGenerateButton = false,
}: InvoiceFormViewProps): React.JSX.Element {
  const {
    invoiceId,
    issuedAt,
    dueAt,
    from,
    client,
    lineItems,
    networkLabel,
    tokenSymbol,
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
        {...(focusedField !== undefined && { focusedField })}
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

      <div className="space-y-3 border-t border-zinc-800/50 pt-4">
        <MagicDustView enabled={magicDustEnabled} />
      </div>

      {showGenerateButton && (
        <div className="pt-4">
          <Button variant="glow" className="h-14 w-full cursor-pointer text-base" disabled>
            <Share2Icon size={20} className="mr-2" />
            Generate Invoice Link
            <ArrowRightIcon size={16} className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
