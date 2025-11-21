import type { Metadata } from 'next'
import { Web3Provider } from './providers'
import { Navigation } from '@/widgets/navigation/Navigation'
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
      <body className="antialiased">
        <Web3Provider>
          <Navigation />
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
