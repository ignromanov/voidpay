# Research: Client-Side State Management with Zustand

**Feature**: `003-zustand-state-management`  
**Date**: 2025-11-20  
**Status**: Complete

## Research Questions

This document resolves technical clarifications identified in the Technical Context section of `plan.md`.

---

## R1: Zustand Persist Middleware Configuration

**Question**: How should Zustand persist middleware be configured for optimal performance and reliability with LocalStorage?

**Decision**: Use Zustand's built-in `persist` middleware with custom configuration

**Rationale**:

- Zustand 5+ provides stable `persist` middleware with LocalStorage adapter
- Supports custom serialization, versioning, and migration
- Automatic hydration on store initialization
- Built-in storage event listener for cross-tab synchronization

**Implementation Approach**:

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useCreatorStore = create(
  persist(
    (set, get) => ({
      // store state and actions
    }),
    {
      name: 'voidpay:creator', // namespaced key
      storage: createJSONStorage(() => localStorage),
      version: 1, // schema version
      migrate: (persistedState, version) => {
        // migration logic for future versions
      },
      partialize: (state) => ({
        // select which fields to persist
      }),
    }
  )
)
```

**Alternatives Considered**:

- Custom LocalStorage wrapper: Rejected - reinventing the wheel, Zustand persist is battle-tested
- Redux Persist: Rejected - unnecessary complexity, Zustand is simpler and sufficient
- Jotai with atomWithStorage: Rejected - less mature ecosystem, team unfamiliar

**References**:

- [Zustand Persist Middleware Docs](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [Zustand v5 Migration Guide](https://github.com/pmndrs/zustand/blob/main/docs/migrations/migrating-to-v5.md)

---

## R2: Schema Versioning and Migration Strategy

**Question**: How should schema versioning be implemented to support future migrations while maintaining backward compatibility?

**Decision**: Embed version number in persisted state + migration function in persist config

**Rationale**:

- Zustand persist middleware has built-in `version` and `migrate` options
- Migration runs automatically on hydration when version mismatch detected
- Allows additive schema changes without breaking existing users
- Aligns with Constitution Principle IV (Backward Compatibility)

**Implementation Approach**:

```typescript
// Version 1 (initial)
interface CreatorStoreV1 {
  version: 1
  activeDraft: InvoiceDraft | null
  templates: InvoiceTemplate[]
  history: CreationHistoryEntry[]
  preferences: UserPreferences
  idCounter: InvoiceIDCounter
}

// Future Version 2 (example)
interface CreatorStoreV2 extends Omit<CreatorStoreV1, 'version'> {
  version: 2
  tags: string[] // new field
}

// Migration function
const migrate = (persistedState: any, version: number) => {
  if (version === 0) {
    // Migrate from v0 (no version) to v1
    return { ...persistedState, version: 1 }
  }
  if (version === 1) {
    // Migrate from v1 to v2
    return { ...persistedState, version: 2, tags: [] }
  }
  return persistedState
}
```

**Alternatives Considered**:

- Manual version checking in store actions: Rejected - error-prone, easy to forget
- Separate migration service: Rejected - over-engineering for this use case
- No versioning: Rejected - violates Constitution Principle IV

**References**:

- [Zustand Persist Migration Example](https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#migrate)

---

## R3: LocalStorage Quota Detection and Handling

**Question**: How should the system detect and handle LocalStorage quota exceeded errors?

**Decision**: Try-catch on storage operations + quota estimation utility

**Rationale**:

- LocalStorage quota varies by browser (5-10MB typical)
- `QuotaExceededError` is thrown when limit reached
- Proactive quota checking prevents silent failures
- User warning + export prompt provides recovery path

**Implementation Approach**:

```typescript
// Quota check utility
function getLocalStorageSize(): number {
  let total = 0
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length
    }
  }
  return total // bytes
}

function isQuotaNearLimit(): boolean {
  const size = getLocalStorageSize()
  const limit = 5 * 1024 * 1024 // 5MB conservative estimate
  return size > limit * 0.8 // 80% threshold
}

// In store actions
try {
  localStorage.setItem(key, value)
} catch (e) {
  if (e instanceof DOMException && e.name === 'QuotaExceededError') {
    // Show warning banner
    // Prompt user to export data and clear old entries
  }
}
```

**Alternatives Considered**:

- IndexedDB for larger storage: Rejected - unnecessary complexity for MVP, LocalStorage sufficient
- Automatic silent pruning: Rejected - data loss without user consent
- Cloud backup: Rejected - violates Constitution Principle I & II

**References**:

- [MDN: StorageManager API](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager)
- [LocalStorage Quota Limits](https://web.dev/storage-for-the-web/)

---

## R4: Debouncing Strategy for Auto-Save

**Question**: What debouncing approach should be used for 500ms auto-save delay?

**Decision**: Use `useDebouncedCallback` from `use-debounce` library

**Rationale**:

- Mature, well-tested library (8M+ weekly downloads)
- React-specific hook with proper cleanup
- Supports leading/trailing edge configuration
- Lightweight (2KB gzipped)

**Implementation Approach**:

```typescript
import { useDebouncedCallback } from 'use-debounce'

function InvoiceEditor() {
  const updateDraft = useCreatorStore((s) => s.updateDraft)

  const debouncedSave = useDebouncedCallback(
    (draft: InvoiceDraft) => {
      updateDraft(draft)
    },
    500, // 500ms delay
    { trailing: true } // save after user stops typing
  )

  const handleFieldChange = (field: string, value: any) => {
    // Update local state immediately (optimistic UI)
    setLocalDraft({ ...localDraft, [field]: value })
    // Debounced save to store
    debouncedSave({ ...localDraft, [field]: value })
  }
}
```

**Alternatives Considered**:

- Custom debounce with setTimeout: Rejected - reinventing the wheel, cleanup complexity
- Lodash debounce: Rejected - not React-specific, requires manual cleanup
- No debouncing (save immediately): Rejected - performance impact, excessive writes

**References**:

- [use-debounce npm](https://www.npmjs.com/package/use-debounce)
- [React Debouncing Best Practices](https://dmitripavlutin.com/react-throttle-debounce/)

---

## R5: Export/Import Data Format

**Question**: What JSON structure should be used for export/import to ensure data integrity and versioning?

**Decision**: Versioned envelope format with separate store sections

**Rationale**:

- Clear schema version for future migrations
- Timestamp for user reference
- Separate sections for creator/payer stores
- Easy to validate and parse

**Implementation Approach**:

```typescript
interface ExportDataV1 {
  version: 1
  exportedAt: string // ISO 8601 timestamp
  creator: {
    activeDraft: InvoiceDraft | null
    templates: InvoiceTemplate[]
    history: CreationHistoryEntry[]
    preferences: UserPreferences
    idCounter: InvoiceIDCounter
  }
  payer: {
    receipts: PaymentReceipt[]
  }
}

// Export
function exportData(): ExportDataV1 {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    creator: useCreatorStore.getState(),
    payer: usePayerStore.getState(),
  }
}

// Import with validation
function importData(json: string): void {
  const data = JSON.parse(json)

  // Validate version
  if (data.version !== 1) {
    throw new Error('Unsupported export version')
  }

  // Validate structure
  if (!data.creator || !data.payer) {
    throw new Error('Invalid export format')
  }

  // Restore stores
  useCreatorStore.setState(data.creator)
  usePayerStore.setState(data.payer)
}
```

**Alternatives Considered**:

- Raw store dump: Rejected - no versioning, hard to validate
- Separate files per store: Rejected - UX friction, multiple downloads
- Binary format: Rejected - not human-readable, harder to debug

**References**:

- [JSON Schema for validation](https://json-schema.org/)

---

## R6: Client-Side Search Implementation

**Question**: How should client-side search/filter be implemented for history and receipts?

**Decision**: Simple string matching with Array.filter() + memoization

**Rationale**:

- < 100 entries per spec, Array.filter() is fast enough
- No need for complex search libraries (Fuse.js, etc.)
- Case-insensitive matching covers most use cases
- React.useMemo prevents re-filtering on unrelated renders

**Implementation Approach**:

```typescript
function useSearchHistory(query: string) {
  const history = useCreatorStore((s) => s.history)

  return useMemo(() => {
    if (!query.trim()) return history

    const lowerQuery = query.toLowerCase()
    return history.filter(
      (entry) =>
        entry.invoiceId.toLowerCase().includes(lowerQuery) ||
        entry.recipientName.toLowerCase().includes(lowerQuery) ||
        entry.totalAmount.toString().includes(lowerQuery)
    )
  }, [history, query])
}
```

**Alternatives Considered**:

- Fuse.js fuzzy search: Rejected - overkill for < 100 entries, adds 10KB
- Full-text search library: Rejected - unnecessary complexity
- Backend search API: Rejected - violates Constitution Principle I

**References**:

- [React useMemo](https://react.dev/reference/react/useMemo)

---

## R7: Cross-Tab Synchronization

**Question**: How should state synchronization work across multiple browser tabs?

**Decision**: Rely on Zustand persist's built-in storage event handling

**Rationale**:

- Zustand persist automatically listens to `storage` events
- When one tab updates LocalStorage, other tabs receive event and rehydrate
- "Last write wins" is acceptable for this use case (per spec edge cases)
- No additional implementation needed

**Implementation Approach**:

- Zustand persist middleware handles this automatically
- No custom code required
- Document behavior in user-facing help/FAQ

**Alternatives Considered**:

- BroadcastChannel API: Rejected - unnecessary, storage events sufficient
- Manual storage event listeners: Rejected - Zustand already handles this
- Conflict resolution logic: Rejected - over-engineering, last write wins is acceptable

**References**:

- [MDN: Window storage event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)
- [Zustand persist cross-tab sync](https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#how-can-i-use-a-custom-storage-engine)

---

## Summary

All technical clarifications resolved. Key decisions:

1. **Zustand persist middleware** with custom configuration for LocalStorage
2. **Schema versioning** via persist `version` + `migrate` options
3. **Quota handling** via try-catch + proactive size estimation
4. **Debouncing** via `use-debounce` library (500ms trailing)
5. **Export format** as versioned JSON envelope
6. **Search** via Array.filter() + useMemo (sufficient for < 100 entries)
7. **Cross-tab sync** handled automatically by Zustand persist

Ready to proceed to Phase 1: Data Model & Contracts.
