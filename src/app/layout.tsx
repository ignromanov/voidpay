import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navigation } from '@/widgets/navigation/Navigation'
import { Footer } from '@/widgets/footer'
import './globals.css'

/**
 * RootLayout - Application shell without global Web3 provider
 *
 * PERFORMANCE OPTIMIZATION:
 * Web3Provider has been removed from the global layout.
 * Each component that needs Web3 (WalletButton, PaymentFlow, etc.)
 * now loads its own scoped Web3Provider on-demand.
 *
 * This reduces initial bundle by ~500KB and improves LCP by ~2.5s.
 *
 * RainbowKit styles are loaded dynamically with Web3Provider
 * via wallet-button-lazy.tsx to avoid blocking initial render.
 */

export const metadata: Metadata = {
  title: 'VoidPay',
  description: 'Stateless Invoicing Platform',
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
      {/*
        Font preload is handled automatically by next/font (geist package).
        GeistSans and GeistMono are self-hosted with optimal loading strategy.
      */}
      <body className="overflow-x-hidden bg-zinc-950 text-zinc-50 antialiased font-sans">
        <Navigation />
        <main className="pt-16 pb-10">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
