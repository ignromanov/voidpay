# Data Model: Form Components

**Feature**: 010-form-components
**Date**: 2025-11-29

## Entities

### TokenInfo

Token representation for selector components.

```typescript
// src/features/invoice/model/tokens.ts

export interface TokenInfo {
  /** Token symbol (e.g., "USDC") */
  symbol: string

  /** Human-readable name (e.g., "USD Coin") */
  name: string

  /** Contract address, null for native tokens */
  address: `0x${string}` | null

  /** Token decimals (e.g., 6 for USDC, 18 for ETH) */
  decimals: number

  /** Tailwind color class for icon background */
  iconColor: string
}
```

### LineItem (Existing)

Already defined in `entities/invoice/model/types.ts`:

```typescript
export interface LineItem {
  /** Unique identifier (UUID v4) */
  id: string

  /** Item description */
  description: string

  /** Quantity (must be > 0) */
  quantity: number

  /** Rate per unit (decimal string) */
  rate: string
}
```

## Static Data

### Network Token Registry

```typescript
// src/features/invoice/model/tokens.ts

export const NETWORK_TOKENS: Record<number, TokenInfo[]> = {
  // Ethereum Mainnet (chainId: 1)
  1: [
    { symbol: 'ETH', name: 'Ethereum', address: null, decimals: 18, iconColor: 'bg-zinc-100' },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      decimals: 6,
      iconColor: 'bg-emerald-500',
    },
    {
      symbol: 'DAI',
      name: 'Dai',
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      decimals: 18,
      iconColor: 'bg-yellow-500',
    },
  ],

  // Arbitrum One (chainId: 42161)
  42161: [
    { symbol: 'ETH', name: 'Ethereum', address: null, decimals: 18, iconColor: 'bg-zinc-100' },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      address: '0xfd086bc7cd5c481dcc9c85eb481dad005539f586',
      decimals: 6,
      iconColor: 'bg-emerald-500',
    },
    {
      symbol: 'ARB',
      name: 'Arbitrum',
      address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
      decimals: 18,
      iconColor: 'bg-cyan-500',
    },
  ],

  // Optimism (chainId: 10)
  10: [
    { symbol: 'ETH', name: 'Ethereum', address: null, decimals: 18, iconColor: 'bg-zinc-100' },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      address: '0x94b008aa00579c1307b0ef2c499ad98a8ce98e26',
      decimals: 6,
      iconColor: 'bg-emerald-500',
    },
    {
      symbol: 'OP',
      name: 'Optimism',
      address: '0x4200000000000000000000000000000000000042',
      decimals: 18,
      iconColor: 'bg-red-500',
    },
  ],

  // Polygon PoS (chainId: 137)
  137: [
    { symbol: 'POL', name: 'Polygon', address: null, decimals: 18, iconColor: 'bg-purple-500' },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      decimals: 6,
      iconColor: 'bg-emerald-500',
    },
  ],
}
```

### Network Configuration

```typescript
// src/features/invoice/model/tokens.ts

import { Hexagon, Triangle, Zap } from 'lucide-react'

export interface NetworkConfig {
  chainId: number
  name: string
  icon: React.ComponentType<{ className?: string }>
  iconFilled: boolean
  colorClass: string
}

export const NETWORK_CONFIG: NetworkConfig[] = [
  { chainId: 1, name: 'Ethereum', icon: Hexagon, iconFilled: false, colorClass: 'text-indigo-400' },
  {
    chainId: 42161,
    name: 'Arbitrum',
    icon: Triangle,
    iconFilled: true,
    colorClass: 'text-blue-400',
  },
  { chainId: 10, name: 'Optimism', icon: Zap, iconFilled: true, colorClass: 'text-red-400' },
  { chainId: 137, name: 'Polygon', icon: Hexagon, iconFilled: true, colorClass: 'text-purple-400' },
]
```

## Component Props

### AddressInput

```typescript
// src/shared/ui/address-input.tsx

import { InputProps } from './input'

export interface AddressInputProps extends Omit<InputProps, 'type' | 'icon' | 'iconPosition'> {
  /** Current address value */
  value: string

  /** Change handler */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void

  /** Optional callback when validity changes */
  onValidChange?: (isValid: boolean) => void
}
```

### NetworkSelect

```typescript
// src/features/wallet-connect/ui/NetworkSelect.tsx

export interface NetworkSelectProps {
  /** Currently selected chain ID */
  value: number

  /** Selection change handler */
  onChange: (chainId: number) => void

  /** Disable selector */
  disabled?: boolean

  /** Additional CSS classes */
  className?: string
}
```

### TokenSelect

```typescript
// src/features/invoice/ui/TokenSelect.tsx

import { TokenInfo } from '../model/tokens'

export interface TokenSelectProps {
  /** Chain ID to filter tokens */
  chainId: number

  /** Currently selected token */
  value: TokenInfo | null

  /** Selection change handler */
  onChange: (token: TokenInfo) => void

  /** Allow custom token entry (default: true) */
  allowCustom?: boolean

  /** Additional CSS classes */
  className?: string
}
```

### InvoiceItemRow

```typescript
// src/features/invoice/ui/InvoiceItemRow.tsx

import { LineItem } from '@/entities/invoice/model/types'

export interface InvoiceItemRowProps {
  /** Line item data */
  item: LineItem

  /** Currency symbol for display (e.g., "USDC") */
  currencySymbol: string

  /** Item update handler */
  onUpdate: (item: LineItem) => void

  /** Item remove handler */
  onRemove: () => void
}
```

## Validation Rules

### Address Validation

```typescript
// Reuse from entities/invoice/lib/validation.ts
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

const isValidAddress = (value: string): boolean => ETH_ADDRESS_REGEX.test(value)
```

### Token Address Validation

Same regex, applied to custom token entry.

### Line Item Validation

| Field         | Rule                 |
| ------------- | -------------------- |
| `description` | Non-empty string     |
| `quantity`    | Number > 0           |
| `rate`        | Valid decimal string |

## State Transitions

### TokenSelect Custom Mode

```
[List View] --"Add Custom Token"--> [Custom Entry]
[Custom Entry] --"Cancel"--> [List View]
[Custom Entry] --"Add Token"--> [List View] (with custom token selected)
```

### InvoiceItemRow Lifecycle

```
[Created] --animation--> [Visible]
[Visible] --"Remove"--> [Animating Out] --complete--> [Removed]
```

## Relationships

```
┌─────────────────┐
│  NetworkSelect  │
│  (chainId)      │
└────────┬────────┘
         │ determines available tokens
         ▼
┌─────────────────┐
│   TokenSelect   │
│   (TokenInfo)   │
└────────┬────────┘
         │ provides currency context
         ▼
┌─────────────────┐
│ InvoiceItemRow  │
│ (currencySymbol)│
└─────────────────┘

┌─────────────────┐
│  AddressInput   │◄───── Independent (shared component)
└─────────────────┘
```
