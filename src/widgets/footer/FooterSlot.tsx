'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './Footer'

const APP_ROUTE_PREFIXES = ['/create', '/pay', '/invoice'] as const

export function FooterSlot() {
  const pathname = usePathname()
  const isAppRoute = APP_ROUTE_PREFIXES.some((p) => pathname?.startsWith(p))
  if (isAppRoute) return null
  return <Footer />
}
