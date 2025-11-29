# Research: Form Components (Invoice Editor)

**Feature**: 010-form-components
**Date**: 2025-11-29

## Research Summary

All NEEDS CLARIFICATION items from planning resolved. No external research required - design patterns established in AI Studio v3 prototype.

## Decisions

### 1. Blockie Algorithm

**Decision**: HSL gradient from character code sum (design pattern)

**Rationale**:

- Design file uses simple hash: `value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)`
- Generates 2 HSL colors: `hue1 = hash % 360`, `hue2 = (hash * 13) % 360`
- Renders as linear gradient: `linear-gradient(135deg, color1, color2)`

**Alternatives Rejected**:

- `ethereum-blockies` library: Larger bundle, not needed for simple visualization
- `jazzicon`: Same issue, unnecessary dependency

### 2. Address Validation

**Decision**: Reuse `ETH_ADDRESS_REGEX` from `entities/invoice/lib/validation.ts`

**Rationale**:

- Already exists: `/^0x[a-fA-F0-9]{40}$/`
- Covers FR-005 requirement: "use existing platform validation logic"
- No need for checksum validation in MVP (spec assumption #5: no ENS)

**Alternatives Rejected**:

- Viem `isAddress()`: Overkill for client-side validation, already have regex
- Custom implementation: DRY violation

### 3. Network Icons

**Decision**: Lucide icons matching design

| Network  | Icon                | Color Class       |
| -------- | ------------------- | ----------------- |
| Ethereum | `Hexagon`           | `text-indigo-400` |
| Arbitrum | `Triangle` (filled) | `text-blue-400`   |
| Optimism | `Zap` (filled)      | `text-red-400`    |
| Polygon  | `Hexagon` (filled)  | `text-purple-400` |

**Rationale**: Exact match to design file, Lucide already installed

### 4. Token List Strategy

**Decision**: Static curated list per network, no RPC for common tokens

**Rationale**:

- Spec assumption #3: "Curated list of common tokens per network"
- Common tokens (USDC, USDT, DAI, native) have known addresses/decimals
- RPC only needed for custom token entry (FR-015)

**Token Data Source**: Design file `COMMON_TOKENS` object (verified addresses)

### 5. Custom Token Fetch

**Decision**: Viem `readContract` with ERC-20 ABI, manual fallback

**Rationale**:

- Wagmi/Viem already configured in project
- ERC-20 standard ABI for `symbol()`, `decimals()` calls
- Design has mock simulation; replace with real RPC via proxy
- Manual entry always available (FR-015: "manual fallback")

**Implementation**:

```typescript
const fetchTokenMetadata = async (address: `0x${string}`) => {
  const [symbol, decimals] = await Promise.all([
    readContract({ address, abi: erc20Abi, functionName: 'symbol' }),
    readContract({ address, abi: erc20Abi, functionName: 'decimals' }),
  ])
  return { symbol, decimals }
}
```

### 6. Animation Library

**Decision**: Framer Motion (already installed v12.23.24)

**Usage**:

- `AnimatePresence` for dropdown enter/exit
- `motion.div` with `layout` for InvoiceItemRow
- Transitions: `{ duration: 0.1 }` for dropdowns, `{ duration: 0.2 }` for rows

### 7. Interface Alignment

**Decision**: Use existing `LineItem` interface, adapt design's `InvoiceItem`

**Mapping**:
| Design (`InvoiceItem`) | Codebase (`LineItem`) |
|------------------------|----------------------|
| `id: string` | `id: string` |
| `description: string` | `description: string` |
| `quantity: number` | `quantity: number` |
| `price: number` | `rate: string` |

**Note**: `rate` is string in codebase for decimal precision (Constitutional VII: Web3 Safety).

## Dependencies Verification

All required dependencies already installed:

| Package                | Version  | Status    |
| ---------------------- | -------- | --------- |
| framer-motion          | 12.23.24 | Installed |
| @radix-ui/react-select | 2.2.6    | Installed |
| lucide-react           | latest   | Installed |
| wagmi                  | 2.19.4   | Installed |
| viem                   | 2.39.3   | Installed |

## Open Questions

None. All clarifications resolved from design reference.
