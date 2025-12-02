/**
 * Network icons for landing page trust signals
 * Feature: 012-landing-page
 */

import type { SVGProps } from 'react'

import type { NetworkBadge } from '../types'

// Ethereum icon (simplified diamond logo)
function EthereumIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16 4L8 16.5L16 21.5L24 16.5L16 4Z" fill="currentColor" />
      <path d="M16 4L8 16.5L16 13.5V4Z" fill="currentColor" fillOpacity="0.6" />
      <path d="M16 23L8 18L16 28L24 18L16 23Z" fill="currentColor" />
      <path d="M16 23L8 18L16 28V23Z" fill="currentColor" fillOpacity="0.6" />
    </svg>
  )
}

// Arbitrum icon (stylized A)
function ArbitrumIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16 4L6 24H11L16 14L21 24H26L16 4Z" fill="currentColor" />
      <path d="M13 20L16 14L19 20H13Z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}

// Optimism icon (stylized O)
function OptimismIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="16" r="10" fill="currentColor" />
      <circle cx="16" cy="16" r="5" fill="currentColor" fillOpacity="0.3" />
    </svg>
  )
}

// Polygon icon (hexagon)
function PolygonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M16 4L26 10V22L16 28L6 22V10L16 4Z"
        fill="currentColor"
      />
      <path
        d="M16 8L22 12V20L16 24L10 20V12L16 8Z"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  )
}

export const SUPPORTED_NETWORKS: (NetworkBadge & { id: string; activeColor: string })[] = [
  { id: 'ethereum', name: 'Ethereum', icon: EthereumIcon, activeColor: 'text-blue-400' },
  { id: 'arbitrum', name: 'Arbitrum', icon: ArbitrumIcon, activeColor: 'text-cyan-400' },
  { id: 'optimism', name: 'Optimism', icon: OptimismIcon, activeColor: 'text-red-400' },
  { id: 'polygon', name: 'Polygon', icon: PolygonIcon, activeColor: 'text-purple-400' },
]
