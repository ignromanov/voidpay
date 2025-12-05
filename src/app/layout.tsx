import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { LazyWeb3Provider } from './lazy-web3-provider'
import { Navigation } from '@/widgets/navigation/Navigation'
import { Footer } from '@/widgets/footer'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'

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
        <LazyWeb3Provider>
          <>
            <Navigation />
            <main className="pt-16 pb-10">{children}</main>
            <Footer />
          </>
        </LazyWeb3Provider>
      </body>
    </html>
  )
}
