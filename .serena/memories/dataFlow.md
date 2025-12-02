# Data Flow & State Topology

> Maps global state, data flow, and store ownership in VoidPay.
> Consult BEFORE creating new state or connecting to stores.

---

## State Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         URL STATE                                │
│   (Invoice data encoded in URL - source of truth for /pay)      │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORES                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ useCreatorStore │  │  usePayerStore  │  │useUserPreferences│ │
│  │  (LocalStorage) │  │  (LocalStorage) │  │  (Reserved)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TANSTACK QUERY CACHE                          │
│   (Token prices, network status, transaction history)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Global Stores Registry

### 1. `useCreatorStore` (Creator Side)

| Property        | Description                                     |
| --------------- | ----------------------------------------------- |
| **Location**    | `entities/creator/model/useCreatorStore.ts`     |
| **Persistence** | LocalStorage (`voidpay:creator`)                |
| **Purpose**     | Invoice drafts, templates, history, preferences |

**State Schema:**

```typescript
type CreatorStoreV1 = {
  version: 1
  activeDraft: InvoiceDraft | null
  templates: InvoiceTemplate[]
  history: CreationHistoryEntry[]
  preferences: UserPreferences
  idCounter: InvoiceIDCounter
}
```

**Write Access:**
| Slice | Can Write | Actions |
|-------|-----------|---------|
| `features/invoice-draft` | ✅ | `updateDraft`, `clearDraft`, `createNewDraft` |
| `features/invoice-draft` | ✅ | `saveAsTemplate`, `loadTemplate`, `deleteTemplate` |
| `features/invoice-history` | ✅ | `addHistoryEntry`, `deleteHistoryEntry`, `duplicateHistoryEntry` |
| `features/data-export` | ✅ | `updatePreferences` (via import) |
| `app/create` | ✅ | All creation actions |

---

### 2. `usePayerStore` (Payer Side)

| Property        | Description                          |
| --------------- | ------------------------------------ |
| **Location**    | `entities/user/model/payer-store.ts` |
| **Persistence** | LocalStorage (`voidpay:payer`)       |
| **Purpose**     | Payment receipts                     |

**State Schema:**

```typescript
type PayerStoreState = {
  version: number
  receipts: PaymentReceipt[]
}
```

**Write Access:**
| Slice | Can Write | Actions |
|-------|-----------|---------|
| `features/data-export` | ✅ | `addReceipt` (via import) |
| `widgets/payment-terminal` | ✅ | `addReceipt` |

---

### 3. `useUserPreferences` (Reserved)

| Property        | Description                                   |
| --------------- | --------------------------------------------- |
| **Location**    | `entities/user/model/store.ts`                |
| **Persistence** | LocalStorage (`voidpay-preferences`)          |
| **Purpose**     | Reserved for future: theme, language, display |
| **Status**      | ⚠️ Not currently used in codebase             |

**State Schema:**

```typescript
type UserPreferences = {
  theme: 'light' | 'dark' | 'system'
  currency: FiatCurrency
  locale: string
}
```

---

### 4. `NetworkThemeContext` (Landing Page Only)

| Property        | Description                                          |
| --------------- | ---------------------------------------------------- |
| **Location**    | `widgets/landing/context/network-theme-context.tsx`  |
| **Persistence** | None (React Context, memory only)                    |
| **Purpose**     | Sync active network between DemoSection and landing page visuals |

**State Schema:**

```typescript
type NetworkTheme = 'ethereum' | 'arbitrum' | 'optimism' | 'polygon'

type NetworkThemeContextValue = {
  theme: NetworkTheme
  setTheme: (theme: NetworkTheme) => void
}
```

**Write Access:**
| Slice | Can Write | Actions |
|-------|-----------|---------|
| `widgets/landing/DemoSection` | ✅ | `setTheme` (when network changes in demo invoice) |

**Read Access:**
| Slice | Reads | Purpose |
|-------|-------|---------|
| `widgets/network-background` | `theme` | Animates background shapes per network |
| `widgets/landing/HeroSection` | `theme` | Highlights active network badge |

---

## Data Flow Patterns

### Pattern 1: Invoice Creation Flow

```
Creator Input → useCreatorStore → URL Encoding → Shareable Link
```

### Pattern 2: Payment Flow

```
URL Decode → Invoice Entity → usePayerStore → Wallet Connect → Transaction
```

### Pattern 3: Price Updates

```
TanStack Query → Token Prices API → Cache (5min) → UI Components
```

---

## Rules

1. **NO prop drilling** — If data needed in 3+ levels, use store
2. **NO duplicate stores** — Check this file before creating new store
3. **Feature isolation** — Features can't read other features' stores
4. **Entity stores only** — Stores live in `entities/*/model/`
5. **URL is truth** — For invoice data, URL params are source of truth

---

**Update Protocol**: When creating new store or modifying store access, update this file.
