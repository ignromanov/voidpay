import type { Metadata } from 'next'
import { Web3Provider } from './providers'
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
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-50 antialiased">
        <Web3Provider>
          <>
            <Navigation />
            {children}
            <Footer />
          </>
        </Web3Provider>
      </body>
    </html>
  )
}
