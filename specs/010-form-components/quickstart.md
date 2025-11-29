# Quickstart: Form Components

**Feature**: 010-form-components
**Branch**: `010-form-components`
**Worktree**: `worktrees/010-form-components/`

## Prerequisites

```bash
# Navigate to worktree
cd worktrees/010-form-components

# Install dependencies (if needed)
pnpm install

# Verify tests pass
pnpm test
```

## Component Usage

### AddressInput

```tsx
import { AddressInput } from '@/shared/ui'

function MyForm() {
  const [address, setAddress] = useState('')
  const [isValid, setIsValid] = useState(false)

  return (
    <AddressInput
      label="Wallet Address"
      value={address}
      onChange={(e) => setAddress(e.target.value)}
      onValidChange={setIsValid}
      error={!isValid && address.length > 0 ? 'Invalid address format' : undefined}
    />
  )
}
```

### NetworkSelect

```tsx
import { NetworkSelect } from '@/features/wallet-connect'

function PaymentForm() {
  const [chainId, setChainId] = useState(1) // Ethereum

  return <NetworkSelect value={chainId} onChange={setChainId} />
}
```

### TokenSelect

```tsx
import { TokenSelect, TokenInfo } from '@/features/invoice'

function CurrencyPicker({ chainId }: { chainId: number }) {
  const [token, setToken] = useState<TokenInfo | null>(null)

  return <TokenSelect chainId={chainId} value={token} onChange={setToken} allowCustom={true} />
}
```

### InvoiceItemRow

```tsx
import { InvoiceItemRow } from '@/features/invoice'
import { LineItem } from '@/entities/invoice/model/types'
import { AnimatePresence } from 'framer-motion'

function LineItems() {
  const [items, setItems] = useState<LineItem[]>([])

  const updateItem = (updated: LineItem) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <AnimatePresence>
      {items.map((item) => (
        <InvoiceItemRow
          key={item.id}
          item={item}
          currencySymbol="USDC"
          onUpdate={updateItem}
          onRemove={() => removeItem(item.id)}
        />
      ))}
    </AnimatePresence>
  )
}
```

## File Locations

| Component      | Location                                           |
| -------------- | -------------------------------------------------- |
| AddressInput   | `src/shared/ui/address-input.tsx`                  |
| NetworkSelect  | `src/features/wallet-connect/ui/NetworkSelect.tsx` |
| TokenSelect    | `src/features/invoice/ui/TokenSelect.tsx`          |
| InvoiceItemRow | `src/features/invoice/ui/InvoiceItemRow.tsx`       |
| Token Registry | `src/features/invoice/model/tokens.ts`             |

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode (development)
pnpm test:watch

# Run specific component tests
pnpm test address-input
pnpm test NetworkSelect
pnpm test TokenSelect
pnpm test InvoiceItemRow
```

## Development Workflow

1. **Tests First (TDD)**:

   ```bash
   # Create test file, write failing tests
   # Run in watch mode
   pnpm test:watch src/shared/ui/__tests__/address-input.test.tsx
   ```

2. **Implementation**:

   ```bash
   # Implement component to make tests pass
   # Check types
   pnpm typecheck
   ```

3. **Refactor**:
   ```bash
   # Refactor, ensure tests still pass
   pnpm test
   pnpm lint
   ```

## Design Reference

Design files at: `assets/aistudio/v3/` (main repo)

| Component      | Design File                              |
| -------------- | ---------------------------------------- |
| AddressInput   | `shared/ui/AddressInput.tsx`             |
| NetworkSelect  | `shared/ui/NetworkSelect.tsx`            |
| TokenSelect    | `shared/ui/TokenSelect.tsx`              |
| InvoiceItemRow | `features/invoice/ui/InvoiceItemRow.tsx` |

## Next Steps

Run `/speckit.tasks` to generate TDD task list.
