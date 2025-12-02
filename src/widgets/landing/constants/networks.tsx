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
      <path d="M16 4L8 16.5L16 21.5L24 16.5L16 4Z" fill="#627EEA" />
      <path d="M16 4L8 16.5L16 13.5V4Z" fill="#8C9FEA" />
      <path d="M16 23L8 18L16 28L24 18L16 23Z" fill="#627EEA" />
      <path d="M16 23L8 18L16 28V23Z" fill="#8C9FEA" />
    </svg>
  )
}

// Arbitrum icon (stylized A)
function ArbitrumIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M16 4L6 24H11L16 14L21 24H26L16 4Z"
        fill="#28A0F0"
        stroke="#213147"
        strokeWidth="1"
      />
      <path d="M13 20L16 14L19 20H13Z" fill="#213147" />
    </svg>
  )
}

// Optimism icon (stylized O)
function OptimismIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="16" r="10" fill="#FF0420" />
      <circle cx="16" cy="16" r="5" fill="#1A1A1A" />
    </svg>
  )
}

export const SUPPORTED_NETWORKS: NetworkBadge[] = [
  { name: 'Ethereum', icon: EthereumIcon },
  { name: 'Arbitrum', icon: ArbitrumIcon },
  { name: 'Optimism', icon: OptimismIcon },
]
