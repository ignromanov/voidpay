'use client'

/**
 * Navigation Component
 *
 * Main navigation bar matching design v3 with:
 * - VoidLogo + brand name
 * - Nav links (Home, History, Blocked)
 * - Create button
 * - GitHub link
 * - Connect wallet button
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, Github, ShieldAlert } from 'lucide-react'
import { SOCIAL_URLS } from '@/shared/config'
import { VoidLogo } from '@/shared/ui/void-logo'
import { Button } from '@/shared/ui/button'
import { LazyWalletButton as WalletButton } from '@/shared/ui/wallet-button-lazy'

export function Navigation() {
  const pathname = usePathname()

  const navLinks = [
    { href: '/' as const, label: 'Home' },
    { href: '/history' as const, label: 'History' },
  ]

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-zinc-800/30 bg-zinc-950/60 backdrop-blur-xl print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <VoidLogo size="sm" />
            <span className="text-lg font-semibold text-zinc-50">VoidPay</span>
          </Link>

          {/* Center Navigation */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-50'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            {/* Blocked link with warning style */}
            <a
              href="#"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-zinc-800/50 hover:text-red-300"
            >
              <ShieldAlert className="h-4 w-4" />
              Blocked
            </a>

            {/* Separator */}
            <div className="mx-2 h-6 w-px bg-zinc-800" />

            {/* Create Button */}
            <Link href="/create">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </Link>

            {/* GitHub Link */}
            <a
              href={SOCIAL_URLS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-50"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>

          {/* Connect Wallet Button */}
          <WalletButton />
        </div>
      </div>
    </nav>
  )
}
