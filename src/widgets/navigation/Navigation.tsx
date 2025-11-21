'use client'

/**
 * Navigation Component
 *
 * Simple navigation bar for the application.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/' as const, label: 'Home' },
    { href: '/create' as const, label: 'Create Invoice' },
    { href: '/history' as const, label: 'History' },
  ]

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-100">
              VoidPay
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={link.href as any}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
