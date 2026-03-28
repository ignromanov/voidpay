import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navigation } from '@/widgets/navigation'
import { Footer } from '@/widgets/footer'
import { NetworkBackground } from '@/widgets/network-background'
import { Toaster } from '@/shared/ui/toaster'
import { UmamiScript } from '@/features/analytics'
import './globals.css'

/**
 * RootLayout - Server Component application shell
 *
 * Architecture:
 * - Static zinc-950 background (no client JS)
 * - Fixed Navigation (z-50) and Footer (z-40)
 * - Content area with proper padding for fixed elements
 * - Dynamic NetworkBackground rendered by pages (client-side)
 *
 * PERFORMANCE OPTIMIZATION:
 * Web3Provider has been removed from the global layout.
 * Each component that needs Web3 loads its own scoped provider on-demand.
 * This reduces initial bundle by ~500KB and improves LCP by ~2.5s.
 */

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'https://voidpay.xyz'),
  ),
  title: 'VoidPay — Stateless Crypto Invoicing. No Backend, Just Links.',
  description: 'Create privacy-first crypto invoices in seconds. All data lives in the URL — no backend, no signup, no tracking. Works even if we shut down.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'VoidPay — Crypto Invoices Without the Backend. Just Share a Link.',
    description: 'Create privacy-first crypto invoices in seconds. All data lives in the URL — no backend, no signup, no tracking. Pay with any wallet on Ethereum, Arbitrum, Optimism, or Polygon.',
    url: 'https://voidpay.xyz',
    siteName: 'VoidPay',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'VoidPay — Stateless Crypto Invoicing', type: 'image/png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoidPay — Crypto Invoices Without the Backend. Just Share a Link.',
    description: 'Create privacy-first crypto invoices in seconds. All data lives in the URL — no backend, no signup, no tracking. Pay with any wallet on Ethereum, Arbitrum, Optimism, or Polygon.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'VoidPay — Stateless Crypto Invoicing' }],
  },
  appleWebApp: {
    title: 'VoidPay',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090B',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} overflow-x-hidden`}
      style={{ backgroundColor: '#09090b' }}
    >
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-zinc-950 font-sans text-zinc-50 antialiased pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {/* Layer 0: Static background (Server-rendered, no JS) */}
        <div className="fixed inset-0 z-0 bg-zinc-950 print:hidden" aria-hidden="true" />

        {/* Layer 1: Dynamic network-themed background (Client, reads theme from store) */}
        <NetworkBackground />

        {/* Navigation and Footer are fixed, content flows between them */}
        <Navigation />

        {/* Main content area — pages render NetworkBackground + content here */}
        <main className="relative z-10 flex-1 pt-[calc(4rem_+_env(safe-area-inset-top,0px))] pb-10 print:pt-0 print:pb-0">
          {children}
        </main>

        <Footer />
        <Toaster />
        <UmamiScript />
      </body>
    </html>
  )
}
