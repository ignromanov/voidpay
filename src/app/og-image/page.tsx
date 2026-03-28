'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { OGInvoiceCard } from '@/features/og-image/ui/OGInvoiceCard'
import { OG_NETWORKS } from '@/features/og-image/lib/og-utils'

/**
 * OG Image Page — Screenshot target for OG images.
 *
 * Modes:
 * - /og-image                → Static branding with cascading invoice cards
 * - /og-image?mode=invoice&id=INV-001&amount=1250.00&currency=USDC&network=arb&from=Acme&to=Client
 *                            → Dynamic invoice card
 */

/** Hides root layout chrome */
function OGShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        [data-nextjs-dialog-overlay], [data-nextjs-dialog], nextjs-portal,
        #__next-build-indicator { display: none !important; }
        body { margin: 0; padding: 0; overflow: hidden; background: #09090B; }
        body > *:not(main) { display: none !important; }
        main { padding: 0 !important; margin: 0 !important; flex: unset !important; }
      `}</style>
      {children}
    </>
  )
}

/** Branding OG — product showcase with cascading invoice cards */
function BrandingOG() {
  return (
    <div
      style={{ width: 1200, height: 630 }}
      className="relative flex overflow-hidden bg-zinc-950 font-sans"
    >
      {/* Background gradients */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(124,58,237,0.08) 0%, transparent 60%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 50% 80% at 20% 80%, rgba(96,165,250,0.05) 0%, transparent 50%)',
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Left side — text content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center pl-28 pr-0">
        {/* Logo mark + wordmark */}
        <div className="mb-6 flex items-center gap-4">
          <div
            className="rounded-full border-2 border-violet-600"
            style={{
              width: 44,
              height: 44,
              background: 'radial-gradient(circle at 40% 40%, #18181B, #000)',
              boxShadow: '0 0 20px rgba(124,58,237,0.3)',
            }}
          />
          <span
            className="text-[36px] font-bold text-zinc-100"
            style={{ letterSpacing: '-0.02em' }}
          >
            VoidPay
          </span>
        </div>

        {/* Tagline */}
        <h1
          className="mb-6 text-[44px] leading-[1.1] font-bold text-zinc-100"
          style={{ letterSpacing: '-0.03em', maxWidth: 480 }}
        >
          Crypto invoices
          <br />
          <span className="text-violet-400">without the backend</span>
        </h1>

        {/* Value props */}
        <div className="flex flex-col gap-2.5">
          {[
            'All data lives in the URL',
            'No signup. No tracking.',
            'Works even if we shut down',
          ].map((text) => (
            <div key={text} className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#7C3AED' }} />
              <span className="text-[17px] text-zinc-400">{text}</span>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div className="mt-8">
          <span className="text-[15px] font-medium tracking-widest text-zinc-600">
            voidpay.xyz
          </span>
        </div>
      </div>

      {/* Right side — cascading invoice cards (centered vertically) */}
      <div className="relative flex flex-1 items-center justify-center">
        {/* Back card — Ethereum */}
        <div className="absolute" style={{ top: '50%', right: 80, transform: 'translateY(-100%)', opacity: 0.3, filter: 'blur(1.5px)' }}>
          <OGInvoiceCard
            id="INV-017"
            amount="5000.00"
            currency="ETH"
            networkCode="eth"
            tilt="rotate(5deg) scale(0.82)"
          />
        </div>

        {/* Middle card — Optimism */}
        <div className="absolute" style={{ top: '50%', right: 120, transform: 'translateY(-58%)', opacity: 0.55, filter: 'blur(0.5px)' }}>
          <OGInvoiceCard
            id="INV-003"
            amount="420.00"
            currency="USDC"
            networkCode="op"
            from="Studio X"
            tilt="rotate(2.5deg) scale(0.91)"
          />
        </div>

        {/* Front card — Arbitrum */}
        <div className="absolute" style={{ top: '50%', right: 150, transform: 'translateY(-20%)' }}>
          <OGInvoiceCard
            id="INV-042"
            amount="1250.00"
            currency="USDC"
            networkCode="arb"
            from="Acme Corp"
            to="Client Inc"
            tilt="rotate(-1.5deg)"
          />
        </div>
      </div>
    </div>
  )
}

/** Invoice OG — single prominent card with real data, reuses OGInvoiceCard */
function InvoiceOG({
  id,
  amount,
  currency,
  networkCode,
  from,
  to,
}: {
  id: string
  amount: string
  currency: string
  networkCode: string
  from?: string
  to?: string
}) {
  const net = OG_NETWORKS[networkCode.toLowerCase()] ?? { name: networkCode.toUpperCase(), color: '#A1A1AA' }

  return (
    <div
      style={{ width: 1200, height: 630 }}
      className="relative flex flex-col items-center justify-center overflow-hidden bg-zinc-950 font-sans"
    >
      {/* Network-colored background glow — primary */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 30%, ${net.color}45 0%, ${net.color}20 35%, transparent 65%)`,
        }}
      />
      {/* Network-colored glow — bottom-right */}
      <div
        className="pointer-events-none absolute -right-24 -bottom-16"
        style={{
          width: 600,
          height: 400,
          background: `radial-gradient(ellipse at center, ${net.color}20 0%, transparent 60%)`,
        }}
      />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Same card component as branding OG, just larger */}
      <OGInvoiceCard
        id={id ? `Invoice ${id}` : 'Invoice'}
        amount={amount}
        currency={currency}
        networkCode={networkCode}
        {...(from ? { from } : {})}
        {...(to ? { to } : {})}
        width={560}
      />

      {/* VoidPay branding below card */}
      <div className="mt-8 flex items-center gap-3">
        <div
          className="h-6 w-6 rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 40%, #27272A, #000)',
            border: '1.5px solid rgba(124,58,237,0.6)',
            boxShadow: '0 0 12px rgba(124,58,237,0.35)',
          }}
        />
        <span className="text-[18px] font-semibold text-zinc-400" style={{ letterSpacing: '0.02em' }}>
          VoidPay
        </span>
      </div>
    </div>
  )
}

function OGImageContent() {
  const params = useSearchParams()
  const isInvoice = params.get('mode') === 'invoice'

  return (
    <OGShell>
      {isInvoice ? (
        <InvoiceOG
          id={params.get('id') ?? ''}
          amount={params.get('amount') ?? '0'}
          currency={params.get('currency') ?? 'USDC'}
          networkCode={params.get('network') ?? 'eth'}
          {...(params.get('from') ? { from: params.get('from')! } : {})}
          {...(params.get('to') ? { to: params.get('to')! } : {})}
        />
      ) : (
        <BrandingOG />
      )}
    </OGShell>
  )
}

export default function OGImagePage() {
  return (
    <Suspense>
      <OGImageContent />
    </Suspense>
  )
}
