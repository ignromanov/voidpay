# Quickstart: Zustand State Management

**Feature**: `003-zustand-state-management`  
**For**: Developers implementing or integrating with the state management system

## Overview

This feature provides client-side state management using Zustand with LocalStorage persistence. Two stores manage different domains:

- **`useCreatorStore`**: Invoice drafts, templates, history, preferences, ID counter
- **`usePayerStore`**: Payment receipts

## Installation

Dependencies already in project (from Constitution tech stack):

```bash
# Already installed
- zustand@5+
- use-debounce (for auto-save)
```

## Basic Usage

### Using Creator Store

```typescript
import { useCreatorStore } from '@/entities/creator/model/useCreatorStore'

function InvoiceEditor() {
  // Select specific state (optimized re-renders)
  const activeDraft = useCreatorStore((s) => s.activeDraft)
  const updateDraft = useCreatorStore((s) => s.updateDraft)

  // Update draft (auto-saved with 500ms debounce)
  const handleFieldChange = (field: string, value: any) => {
    updateDraft({ [field]: value })
  }

  return (
    <input
      value={activeDraft?.invoiceId || ''}
      onChange={(e) => handleFieldChange('invoiceId', e.target.value)}
    />
  )
}
```

### Using Payer Store

```typescript
import { usePayerStore } from '@/entities/payer/model/usePayerStore'

function PaymentConfirmation({ txHash, invoiceData }) {
  const addReceipt = usePayerStore((s) => s.addReceipt)

  useEffect(() => {
    // After transaction confirmation
    addReceipt({
      invoiceId: invoiceData.id,
      recipientName: invoiceData.recipient.name,
      paymentAmount: `${invoiceData.total} ${invoiceData.currency}`,
      transactionHash: txHash,
      chainId: invoiceData.chainId,
      invoiceUrl: window.location.href,
    })
  }, [txHash])
}
```

### Export/Import

```typescript
import { downloadExport, importFromFile } from '@/features/data-export/lib/export'

function DataManagement() {
  const handleExport = () => {
    // Downloads voidpay-backup-2025-11-20.json
    downloadExport()
  }

  const handleImport = async (file: File) => {
    const result = await importFromFile(file)
    if (result.success) {
      console.log('Imported:', result.stats)
    } else {
      console.error('Import failed:', result.errors)
    }
  }
}
```

## Key Patterns

### Auto-Save Pattern

```typescript
import { useDebouncedCallback } from 'use-debounce'

function useAutoSave() {
  const updateDraft = useCreatorStore((s) => s.updateDraft)

  const debouncedSave = useDebouncedCallback(
    (draft: Partial<InvoiceDraft>) => {
      updateDraft(draft)
    },
    500, // 500ms delay
    { trailing: true }
  )

  return debouncedSave
}
```

### Search/Filter Pattern

```typescript
function InvoiceHistory() {
  const [query, setQuery] = useState('')
  const searchHistory = useCreatorStore((s) => s.searchHistory)

  // Memoized in store, no need for useMemo here
  const filtered = searchHistory(query)

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by ID, recipient, or amount"
      />
      {filtered.map((entry) => (
        <HistoryItem key={entry.entryId} entry={entry} />
      ))}
    </>
  )
}
```

### Template Management

```typescript
function TemplateManager() {
  const { templates, saveAsTemplate, loadTemplate, deleteTemplate } = useCreatorStore((s) => ({
    templates: s.templates,
    saveAsTemplate: s.saveAsTemplate,
    loadTemplate: s.loadTemplate,
    deleteTemplate: s.deleteTemplate,
  }))

  const handleSave = () => {
    const templateId = saveAsTemplate('My Template')
    console.log('Saved template:', templateId)
  }

  const handleLoad = (templateId: string) => {
    loadTemplate(templateId) // Prompts if active draft exists
  }
}
```

### Invoice ID Generation

```typescript
function NewInvoiceButton() {
  const generateNextInvoiceId = useCreatorStore((s) => s.generateNextInvoiceId)
  const createNewDraft = useCreatorStore((s) => s.createNewDraft)

  const handleNewInvoice = () => {
    const draftId = createNewDraft()
    const invoiceId = generateNextInvoiceId() // "INV-001", "INV-002", etc.
    console.log('Created draft:', draftId, 'with ID:', invoiceId)
  }
}
```

## Storage Management

### Check Quota

```typescript
function StorageWarning() {
  const isNearLimit = useCreatorStore((s) => s.isStorageNearLimit())

  if (isNearLimit) {
    return (
      <Alert>
        Storage is near limit. Please export your data and clear old entries.
      </Alert>
    )
  }
  return null
}
```

### Manual Pruning

```typescript
function SettingsPage() {
  const pruneHistory = useCreatorStore((s) => s.pruneHistory)
  const pruneReceipts = usePayerStore((s) => s.pruneReceipts)

  const handleCleanup = () => {
    pruneHistory() // Removes oldest entries if > 100
    pruneReceipts()
  }
}
```

## Testing

### Unit Test Example

```typescript
import { renderHook, act } from '@testing-library/react'
import { useCreatorStore } from '@/entities/creator/model/useCreatorStore'

describe('useCreatorStore', () => {
  beforeEach(() => {
    // Clear store before each test
    useCreatorStore.getState().clearAllData()
  })

  it('should update draft', () => {
    const { result } = renderHook(() => useCreatorStore())

    act(() => {
      result.current.createNewDraft()
      result.current.updateDraft({ invoiceId: 'TEST-001' })
    })

    expect(result.current.activeDraft?.invoiceId).toBe('TEST-001')
  })

  it('should auto-increment invoice IDs', () => {
    const { result } = renderHook(() => useCreatorStore())

    const id1 = result.current.generateNextInvoiceId()
    const id2 = result.current.generateNextInvoiceId()

    expect(id1).toBe('INV-001')
    expect(id2).toBe('INV-002')
  })
})
```

## Migration Example

When schema changes are needed in the future:

```typescript
// In useCreatorStore.ts
const useCreatorStore = create(
  persist(
    (set, get) => ({
      /* ... */
    }),
    {
      name: 'voidpay:creator',
      version: 2, // Increment version
      migrate: (persistedState: any, version: number) => {
        if (version === 1) {
          // Migrate v1 → v2
          return {
            ...persistedState,
            version: 2,
            newField: defaultValue, // Add new field
          }
        }
        return persistedState
      },
    }
  )
)
```

## Troubleshooting

### Store not persisting

- Check browser LocalStorage is enabled
- Check for QuotaExceededError in console
- Verify storage key namespace: `voidpay:creator` or `voidpay:payer`

### Cross-tab sync not working

- Zustand persist uses storage events (automatic)
- Ensure both tabs are on same origin
- Last write wins (expected behavior)

### Import failing

- Validate JSON structure with `validateExportData()`
- Check version compatibility
- Ensure file is not corrupted

## File Locations

```
src/
├── entities/
│   ├── creator/model/
│   │   ├── useCreatorStore.ts    # Main store
│   │   ├── types.ts               # TypeScript types
│   │   └── migrations.ts          # Migration logic
│   └── payer/model/
│       ├── usePayerStore.ts       # Main store
│       └── types.ts               # TypeScript types
│
├── features/
│   ├── invoice-draft/lib/
│   │   └── auto-save.ts           # Auto-save hook
│   ├── data-export/lib/
│   │   ├── export.ts              # Export logic
│   │   └── import.ts              # Import logic
│   └── invoice-history/lib/
│       └── search.ts              # Search utilities
│
└── shared/lib/storage/
    ├── quota-check.ts             # Quota utilities
    └── namespace.ts               # Key namespacing
```

## Next Steps

1. Implement `useCreatorStore` with persist middleware
2. Implement `usePayerStore` with persist middleware
3. Add auto-save hook with debouncing
4. Implement export/import functionality
5. Add quota checking utilities
6. Integrate stores into UI components
7. Write unit tests for stores and migrations

## References

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [use-debounce](https://www.npmjs.com/package/use-debounce)
- [Feature Spec](./spec.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/)
