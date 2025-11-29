# Implementation Plan: Form Components (Invoice Editor)

**Branch**: `010-form-components` | **Date**: 2025-11-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-form-components/spec.md`
**Design Reference**: `assets/aistudio/v3/` (main repo, not in worktree)

## Summary

Implement 4 form components for invoice creation: AddressInput (blockie visualization), NetworkSelect (Wagmi-integrated chain switcher), TokenSelect (per-network token lists + custom), InvoiceItemRow (animated line item). Components adapt AI Studio v3 designs to existing Radix UI + CVA patterns.

## Technical Context

**Language/Version**: TypeScript 5.x+ (strict mode)
**Primary Dependencies**: React 19.0.0+, Wagmi 2.19.4+, Viem 2.39.3+, Radix UI Select, CVA 0.7.1+, Framer Motion 12.x+
**Storage**: N/A (component state, form values managed by parent)
**Testing**: Vitest 3.x+, @testing-library/react 16.3.0+
**Target Platform**: Web (Next.js 16.0.3+, browser)
**Project Type**: Web application (Next.js App Router, FSD structure)
**Performance Goals**: <100ms address validation, <200ms token list display
**Constraints**: No ENS, mocked RPC in tests, 80%+ coverage
**Scale/Scope**: 4 components, 20 FRs, 4 mainnet networks, ~4-5 tokens/network

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] No backend database introduced (I) - _Client-side components only_
- [x] No user authentication/registration added (III) - _Components are stateless_
- [x] Schema changes follow versioning rules (IV) - _No schema changes_
- [x] New features preserve privacy-first approach (II) - _No analytics/tracking_
- [x] Security mechanisms not bypassed (V) - _Address validation uses existing regex_
- [x] Documentation follows context efficiency guidelines (VIII) - _Concise, structured_
- [x] UI follows Hybrid Theme Strategy: dark desk (`zinc-950`), light paper (`white`) (XII)
- [x] Document representations maintain ISO 216 (A4) aspect ratio `1:1.414` (XII) - _N/A form components_
- [x] All TypeScript/Markdown navigation uses Serena tools first (XIII)
- [x] Serena memories consulted before planning via `mcp__serena__*` tools (XIV) - _Read development-status_
- [x] Memory update plan identified (XIV) - _Update development-status after completion_
- [x] Following SpecKit workflow phases: specify -> plan -> tasks -> implement (XV)
- [x] TDD cycle planned: Red -> Green -> Refactor with 80%+ coverage target (XVI)

## Project Structure

### Documentation (this feature)

```text
specs/010-form-components/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (FSD Structure)

```text
src/
├── shared/
│   └── ui/
│       ├── address-input.tsx         # NEW: AddressInput (extends Input)
│       ├── __tests__/
│       │   └── address-input.test.tsx
│       └── index.ts                   # UPDATE: export AddressInput
│
├── features/
│   ├── wallet-connect/               # EXISTING
│   │   ├── ui/
│   │   │   ├── NetworkSelect.tsx     # NEW: uses Wagmi hooks
│   │   │   └── __tests__/
│   │   │       └── NetworkSelect.test.tsx
│   │   └── index.ts                  # UPDATE: export
│   │
│   └── invoice/                      # NEW FEATURE SLICE
│       ├── ui/
│       │   ├── TokenSelect.tsx       # NEW
│       │   ├── InvoiceItemRow.tsx    # NEW
│       │   └── __tests__/
│       │       ├── TokenSelect.test.tsx
│       │       └── InvoiceItemRow.test.tsx
│       ├── model/
│       │   └── tokens.ts             # NEW: token lists per network
│       └── index.ts
│
└── entities/
    └── invoice/
        └── model/
            └── types.ts              # EXISTING: LineItem (already defined)
```

## Design Reference Analysis

Design files located at: `/Users/ignat/Documents/Repository/stateless-invoicing-platform/assets/aistudio/v3/`

| Component      | Design File                              | Key Patterns                                                      |
| -------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| AddressInput   | `shared/ui/AddressInput.tsx`             | Blockie: HSL gradient from address hash, monospace font           |
| NetworkSelect  | `shared/ui/NetworkSelect.tsx`            | Framer Motion dropdown, network icons (Lucide), color per network |
| TokenSelect    | `shared/ui/TokenSelect.tsx`              | Token list + custom entry, mock fetch simulation                  |
| InvoiceItemRow | `features/invoice/ui/InvoiceItemRow.tsx` | motion.div layout animation, 12-col grid, Trash2 icon             |

### Design Adaptations Required

1. **AddressInput**: Use existing `Input` component as base, add blockie icon
2. **NetworkSelect**: Replace custom dropdown with Radix Select + Framer Motion content
3. **TokenSelect**: Integrate with Wagmi `readContract` for real ERC-20 fetch (design has mock)
4. **InvoiceItemRow**: Adapt `InvoiceItem` interface to existing `LineItem` (rate vs price)

## Complexity Tracking

> No Constitution violations requiring justification.

| Component      | Complexity | Notes                              |
| -------------- | ---------- | ---------------------------------- |
| AddressInput   | Low        | Extends Input, adds blockie hash   |
| NetworkSelect  | Medium     | Wagmi useSwitchChain, Radix Select |
| TokenSelect    | Medium     | Token registry, optional RPC fetch |
| InvoiceItemRow | Low        | Form fields + Framer Motion        |

## Phase 0 Decisions

### Technical Decisions

| Decision           | Choice                            | Rationale                                |
| ------------------ | --------------------------------- | ---------------------------------------- |
| Blockie algorithm  | HSL gradient from char sum        | Design pattern, lightweight (no library) |
| Address validation | `ETH_ADDRESS_REGEX` from entities | Reuse existing, FR-005                   |
| Network icons      | Lucide (Hexagon, Triangle, Zap)   | Design pattern, already installed        |
| Token lists        | Static per-network registry       | No RPC for common tokens                 |
| Custom token       | Viem `readContract`               | Wagmi configured, fallback to manual     |
| Animations         | Framer Motion AnimatePresence     | Design pattern, already installed        |

### Interface Mapping

Design uses `InvoiceItem` with `price`, codebase has `LineItem` with `rate`:

```typescript
// Design (assets/aistudio/v3)
interface InvoiceItem {
  id
  description
  quantity
  price
}

// Codebase (entities/invoice)
interface LineItem {
  id
  description
  quantity
  rate: string
}
```

Decision: Use existing `LineItem`, rename `price` -> `rate` in component.

## Phase 1 Data Model

### Token Registry

```typescript
// src/features/invoice/model/tokens.ts
interface TokenInfo {
  symbol: string // "USDC"
  name: string // "USD Coin"
  address: `0x${string}` | null // null = native
  decimals: number // 6
  iconColor: string // "bg-blue-500"
}

const NETWORK_TOKENS: Record<number, TokenInfo[]> = {
  1: [
    // Ethereum
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
  42161: [
    // Arbitrum
    { symbol: 'ETH', name: 'Ethereum', address: null, decimals: 18, iconColor: 'bg-zinc-100' },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
    {
      symbol: 'ARB',
      name: 'Arbitrum',
      address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
      decimals: 18,
      iconColor: 'bg-cyan-500',
    },
  ],
  10: [
    // Optimism
    { symbol: 'ETH', name: 'Ethereum', address: null, decimals: 18, iconColor: 'bg-zinc-100' },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
    {
      symbol: 'OP',
      name: 'Optimism',
      address: '0x4200000000000000000000000000000000000042',
      decimals: 18,
      iconColor: 'bg-red-500',
    },
  ],
  137: [
    // Polygon
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

### Component Props

```typescript
// AddressInput
interface AddressInputProps extends Omit<InputProps, 'type' | 'icon'> {
  // Inherits: value, onChange, label, error, className
  onValidChange?: (isValid: boolean) => void
}

// NetworkSelect
interface NetworkSelectProps {
  value: number // chain ID
  onChange: (chainId: number) => void
  disabled?: boolean
  className?: string
}

// TokenSelect
interface TokenSelectProps {
  chainId: number
  value: TokenInfo | null
  onChange: (token: TokenInfo) => void
  allowCustom?: boolean // default true
  className?: string
}

// InvoiceItemRow
interface InvoiceItemRowProps {
  item: LineItem // from entities/invoice
  currencySymbol: string
  onUpdate: (item: LineItem) => void
  onRemove: () => void
}
```

## Test Strategy (TDD - Constitutional XVI)

### Test Matrix

| Component      | Unit Tests              | Integration | Snapshot |
| -------------- | ----------------------- | ----------- | -------- |
| AddressInput   | 8 (validation, blockie) | -           | 1        |
| NetworkSelect  | 6 (selection, icons)    | 2 (wagmi)   | 1        |
| TokenSelect    | 6 (list, custom)        | 2 (fetch)   | 1        |
| InvoiceItemRow | 6 (fields, animation)   | -           | 1        |
| **Total**      | **26**                  | **4**       | **4**    |

Target: ~34 tests, 80%+ coverage

### Mocking Strategy

```typescript
// Wagmi hooks
vi.mock('wagmi', () => ({
  useChainId: vi.fn(() => 1),
  useSwitchChain: vi.fn(() => ({ switchChain: vi.fn() })),
}))

// Viem readContract (for custom token)
vi.mock('viem', async () => ({
  ...(await vi.importActual('viem')),
  readContract: vi.fn(),
}))
```

## Dependencies

### Reuse from Codebase

| Module              | Path                                       | Usage                     |
| ------------------- | ------------------------------------------ | ------------------------- |
| `ETH_ADDRESS_REGEX` | `entities/invoice/lib/validation.ts`       | Address validation        |
| `LineItem`          | `entities/invoice/model/types.ts`          | InvoiceItemRow props      |
| `MAINNET_CHAINS`    | `features/wallet-connect/config/chains.ts` | NetworkSelect options     |
| `Input`             | `shared/ui/input.tsx`                      | AddressInput base         |
| `Select*`           | `shared/ui/select.tsx`                     | NetworkSelect/TokenSelect |
| `cn`                | `shared/lib/utils.ts`                      | Class merging             |

### New Dependencies

None - all required packages already installed (Framer Motion, Radix UI, Lucide).

## Risks & Mitigations

| Risk                     | Mitigation                           |
| ------------------------ | ------------------------------------ |
| Custom token fetch fails | Manual entry fallback (FR-015)       |
| Network icons mismatch   | Use exact Lucide icons from design   |
| Wallet not connected     | Show selector, skip switchChain call |

## Next Steps

1. Run `/speckit.tasks` to generate tasks.md with TDD pairs
2. Implement order: AddressInput -> NetworkSelect -> TokenSelect -> InvoiceItemRow
3. Each: Tests (Red) -> Implementation (Green) -> Refactor
4. Update `development-status` memory after completion
