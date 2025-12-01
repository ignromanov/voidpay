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
│  │  (LocalStorage) │  │   (Session)     │  │  (LocalStorage)  │ │
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

| Property        | Description                                 |
| --------------- | ------------------------------------------- |
| **Location**    | `entities/user/model/creator-store.ts`      |
| **Persistence** | LocalStorage (`voidpay-creator`)            |
| **Purpose**     | Invoice creation state, creator preferences |

**State Schema:**

```typescript
type CreatorStoreState = {
  preferences: UserPreferences
  invoiceCounter: InvoiceIDCounter
}
```

**Write Access:**
| Slice | Can Write | Actions |
|-------|-----------|---------|
| `features/create-invoice` | ✅ | `incrementCounter`, `updatePreferences` |
| `widgets/invoice-editor` | ✅ | `updatePreferences` |

---

### 2. `usePayerStore` (Payer Side)

| Property        | Description                                |
| --------------- | ------------------------------------------ |
| **Location**    | `entities/user/model/payer-store.ts`       |
| **Persistence** | Session only (no LocalStorage)             |
| **Purpose**     | Payment flow state, selected token/network |

**State Schema:**

```typescript
type PayerStoreState = {
  selectedToken: Token | null
  selectedNetwork: Network | null
  paymentStatus: PaymentStatus
}
```

**Write Access:**
| Slice | Can Write | Actions |
|-------|-----------|---------|
| `features/process-payment` | ✅ | All actions |
| `widgets/payment-flow` | ✅ | `setSelectedToken`, `setSelectedNetwork` |

---

### 3. `useUserPreferences` (Global Preferences)

| Property        | Description                          |
| --------------- | ------------------------------------ |
| **Location**    | `entities/user/model/store.ts`       |
| **Persistence** | LocalStorage (`voidpay-preferences`) |
| **Purpose**     | Theme, language, display preferences |

**State Schema:**

```typescript
type UserPreferences = {
  theme: 'light' | 'dark' | 'system'
  currency: FiatCurrency
  locale: string
}
```

**Write Access:**
| Slice | Can Write | Actions |
|-------|-----------|---------|
| `widgets/settings` | ✅ | All actions |
| `app/providers` | Read only | — |

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

## ⚠️ Known Issues

| Issue                    | Location                              | Status              |
| ------------------------ | ------------------------------------- | ------------------- |
| Duplicate creator stores | `entities/user` vs `entities/creator` | Needs consolidation |

---

**Update Protocol**: When creating new store or modifying store access, update this file.
