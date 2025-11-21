# Data Model: Client-Side State Management

**Feature**: `003-zustand-state-management`  
**Date**: 2025-11-20  
**Version**: 1.0

## Overview

This document defines the TypeScript data models for client-side state management using Zustand. All entities are stored in browser LocalStorage via Zustand persist middleware.

---

## Store Schemas

### CreatorStore (v1)

**Purpose**: Manages invoice creation workflow state (drafts, templates, history, preferences, ID counter)

**Storage Key**: `voidpay:creator`

```typescript
interface CreatorStoreV1 {
  version: 1

  // Active draft (single)
  activeDraft: InvoiceDraft | null

  // Saved templates
  templates: InvoiceTemplate[]

  // Creation history
  history: CreationHistoryEntry[]

  // User preferences
  preferences: UserPreferences

  // Auto-incrementing ID counter
  idCounter: InvoiceIDCounter
}
```

**Actions**:

- `updateDraft(draft: Partial<InvoiceDraft>)` - Update active draft (debounced)
- `clearDraft()` - Clear active draft after URL generation
- `saveAsTemplate(name: string)` - Save active draft as template
- `loadTemplate(templateId: string)` - Load template into active draft
- `deleteTemplate(templateId: string)` - Delete template
- `addHistoryEntry(entry: CreationHistoryEntry)` - Add to history
- `deleteHistoryEntry(entryId: string)` - Delete history entry
- `duplicateHistoryEntry(entryId: string)` - Create draft from history
- `updatePreferences(prefs: Partial<UserPreferences>)` - Update preferences
- `incrementIdCounter()` - Increment counter, return new ID
- `pruneHistory()` - Auto-prune when > 100 entries

---

### PayerStore (v1)

**Purpose**: Manages payment receipt storage

**Storage Key**: `voidpay:payer`

```typescript
interface PayerStoreV1 {
  version: 1

  // Payment receipts
  receipts: PaymentReceipt[]
}
```

**Actions**:

- `addReceipt(receipt: PaymentReceipt)` - Add receipt after payment confirmation
- `deleteReceipt(receiptId: string)` - Delete receipt
- `pruneReceipts()` - Auto-prune when > 100 entries

---

## Entity Definitions

### InvoiceDraft

**Description**: Represents the single active in-progress invoice

```typescript
interface InvoiceDraft {
  draftId: string // UUID v4
  lastModified: string // ISO 8601 timestamp

  // Invoice fields (matches InvoiceSchemaV1 structure)
  invoiceId: string
  issueDate: string // ISO 8601
  dueDate: string // ISO 8601
  notes?: string // Max 280 chars

  // Network & currency
  chainId: number
  currencySymbol: string
  tokenAddress?: string // undefined = native token
  decimals: number

  // Parties
  sender: {
    name: string
    wallet: string
    email?: string
    address?: string
  }

  recipient: {
    name: string
    wallet?: string
    email?: string
    address?: string
  }

  // Line items
  lineItems: LineItem[]

  // Calculations
  taxRate: string // e.g. "10%" or "50"
  discountAmount: string // e.g. "10%" or "50"
}

interface LineItem {
  id: string // UUID v4
  description: string
  quantity: number
  rate: string // Decimal string
}
```

**Validation Rules**:

- `draftId`: Must be valid UUID v4
- `invoiceId`: Required, max 50 chars
- `issueDate`, `dueDate`: Must be valid ISO 8601 dates
- `notes`: Max 280 characters (enforced in UI)
- `sender.wallet`, `recipient.wallet`: Must be valid Ethereum addresses (checksum)
- `chainId`: Must be in supported networks list (1, 10, 42161, 137)
- `lineItems`: At least 1 item required
- `quantity`: Must be > 0
- `rate`: Must be valid decimal string

---

### InvoiceTemplate

**Description**: Saved invoice template for reuse

```typescript
interface InvoiceTemplate {
  templateId: string // UUID v4
  name: string // User-provided or auto-generated
  createdAt: string // ISO 8601 timestamp

  // Full invoice data (same structure as InvoiceDraft, minus draftId/lastModified)
  invoiceData: Omit<InvoiceDraft, 'draftId' | 'lastModified'>
}
```

**Validation Rules**:

- `templateId`: Must be valid UUID v4
- `name`: Required, max 100 chars
- `invoiceData`: Must pass InvoiceDraft validation

**Auto-generated Name Format**: `{recipient.name} - {issueDate}` (e.g., "Acme Corp - 2025-11-20")

---

### CreationHistoryEntry

**Description**: Record of a completed invoice

```typescript
interface CreationHistoryEntry {
  entryId: string // UUID v4
  createdAt: string // ISO 8601 timestamp

  // Key details for display
  invoiceId: string
  recipientName: string
  totalAmount: string // Decimal string with currency symbol (e.g., "1250.50 USDC")

  // Full URL for quick access
  invoiceUrl: string // Full URL with compressed params
}
```

**Validation Rules**:

- `entryId`: Must be valid UUID v4
- `invoiceId`: Required
- `recipientName`: Required
- `totalAmount`: Required, decimal string
- `invoiceUrl`: Required, must start with base URL

**Pruning**: When history exceeds 100 entries, oldest entries are removed first (FIFO)

---

### UserPreferences

**Description**: Default settings for invoice creation

```typescript
interface UserPreferences {
  // Sender defaults
  defaultSenderName?: string
  defaultSenderWallet?: string
  defaultSenderEmail?: string
  defaultSenderAddress?: string

  // Currency defaults
  defaultCurrency?: string // e.g., "USDC"
  defaultChainId?: number // e.g., 42161 (Arbitrum)

  // Invoice defaults
  defaultTaxRate?: string // e.g., "10%"
  defaultIdPrefix?: string // e.g., "ACME" → "ACME-001"
}
```

**Validation Rules**:

- All fields optional (empty preferences = no defaults)
- `defaultSenderWallet`: Must be valid Ethereum address if provided
- `defaultChainId`: Must be in supported networks if provided
- `defaultIdPrefix`: Max 10 chars, alphanumeric only

---

### InvoiceIDCounter

**Description**: Auto-incrementing counter for invoice IDs

```typescript
interface InvoiceIDCounter {
  currentValue: number // Current counter (starts at 1)
  prefix: string // ID prefix (default: "INV")
}
```

**Validation Rules**:

- `currentValue`: Must be >= 1
- `prefix`: Max 10 chars, alphanumeric only

**ID Generation Logic**:

```typescript
function generateNextId(counter: InvoiceIDCounter): string {
  const paddedNumber = counter.currentValue.toString().padStart(3, '0')
  return `${counter.prefix}-${paddedNumber}` // e.g., "INV-001"
}
```

**Increment Behavior**:

- Counter increments ONLY when auto-generated ID is used
- Manual ID edits do NOT increment counter
- Counter persists across sessions

---

### PaymentReceipt

**Description**: Record of a completed payment

```typescript
interface PaymentReceipt {
  receiptId: string // UUID v4
  paidAt: string // ISO 8601 timestamp

  // Invoice details
  invoiceId: string
  recipientName: string
  paymentAmount: string // Decimal string with currency (e.g., "1250.50 USDC")

  // Transaction details
  transactionHash: string // 0x... hash
  chainId: number

  // Original invoice URL
  invoiceUrl: string
}
```

**Validation Rules**:

- `receiptId`: Must be valid UUID v4
- `transactionHash`: Must be valid Ethereum tx hash (0x + 64 hex chars)
- `chainId`: Must be in supported networks
- `invoiceUrl`: Required

**Pruning**: When receipts exceed 100 entries, oldest entries are removed first (FIFO)

---

## Export/Import Schema

### ExportDataV1

**Description**: Envelope format for data export/import

```typescript
interface ExportDataV1 {
  version: 1
  exportedAt: string // ISO 8601 timestamp

  creator: CreatorStoreV1
  payer: PayerStoreV1
}
```

**Validation Rules**:

- `version`: Must be 1 (for v1 exports)
- `exportedAt`: Must be valid ISO 8601 timestamp
- `creator`, `payer`: Must match store schemas

**File Naming**: `voidpay-backup-{YYYY-MM-DD}.json`

---

## Migration Strategy

### Version 1 → Version 2 (Future Example)

When schema changes are needed:

1. Create new interface (e.g., `CreatorStoreV2`)
2. Implement migration function in `persist` config
3. Update store type to new version
4. Test migration with v1 data

```typescript
// Example migration
const migrate = (persistedState: any, version: number) => {
  if (version === 1) {
    // Migrate v1 → v2
    return {
      ...persistedState,
      version: 2,
      newField: defaultValue, // Add new field
    }
  }
  return persistedState
}
```

**Migration Rules** (Constitution Principle IV):

- Migrations MUST be additive only (no field removal)
- Old data MUST remain functional after migration
- Migration MUST be tested with real v1 data
- Migration errors MUST be logged and handled gracefully

---

## Storage Keys

**Namespacing**: All LocalStorage keys prefixed with `voidpay:` to prevent conflicts

- `voidpay:creator` - CreatorStore state
- `voidpay:payer` - PayerStore state

**Key Management**: Centralized in `src/shared/config/storage-keys.ts`

---

## Size Estimates

**Typical Storage Usage**:

- Active draft: ~2-5 KB
- Template (10 items): ~20-50 KB
- History entry: ~500 bytes
- Receipt: ~400 bytes
- Preferences: ~500 bytes

**Maximum Estimates** (100 entries):

- 100 history entries: ~50 KB
- 100 receipts: ~40 KB
- 10 templates: ~50 KB
- Total: ~150 KB (well under 5MB LocalStorage limit)

**Quota Safety Margin**: Auto-pruning at 100 entries ensures < 200 KB total usage, leaving ample headroom.
