# Creator Store Slices

This directory contains focused slices for the Creator Store, following the [Zustand Slice Pattern](https://docs.pmnd.rs/zustand/guides/slices-pattern).

## Architecture

The Creator Store is composed from multiple slices, each handling a specific domain:

```typescript
CreatorStore =
  DraftSlice + TemplateSlice + HistorySlice + PreferencesSlice + IdCounterSlice + UtilitySlice
```

## Slices

### 1. Draft Slice (`draftSlice.ts`)

**Responsibility**: Active draft and line items management

**State**:

- `activeDraft: DraftState | null` - Current in-progress invoice
- `lineItems: LineItem[]` - Line items with IDs for React keys

**Actions**:

- `updateDraft(data)` - Update draft data
- `clearDraft()` - Clear active draft
- `createNewDraft()` - Create new empty draft
- `updateLineItems(items)` - Update all line items
- `addLineItem()` - Add new line item
- `removeLineItem(id)` - Remove line item
- `updateLineItem(id, updates)` - Update single line item

### 2. Template Slice (`templateSlice.ts`)

**Responsibility**: Saved invoice templates

**State**:

- `templates: InvoiceTemplate[]` - Saved templates

**Actions**:

- `saveAsTemplate(name?)` - Save current draft as template
- `loadTemplate(templateId)` - Load template into draft
- `deleteTemplate(templateId)` - Delete template

### 3. History Slice (`historySlice.ts`)

**Responsibility**: Invoice creation history

**State**:

- `history: CreationHistoryEntry[]` - Creation history (auto-pruned at 100)

**Actions**:

- `addHistoryEntry(entry)` - Add new history entry
- `deleteHistoryEntry(entryId)` - Delete history entry
- `duplicateHistoryEntry(entryId)` - Duplicate as new draft
- `pruneHistory()` - Manually prune history

### 4. Preferences Slice (`preferencesSlice.ts`)

**Responsibility**: User preferences and defaults

**State**:

- `preferences: UserPreferences` - Default settings

**Actions**:

- `updatePreferences(prefs)` - Update preferences
- `resetPreferences()` - Reset to defaults

### 5. ID Counter Slice (`idCounterSlice.ts`)

**Responsibility**: Auto-incrementing invoice IDs

**State**:

- `idCounter: InvoiceIDCounter` - Counter configuration

**Actions**:

- `generateNextInvoiceId()` - Generate and increment ID
- `updateIdPrefix(prefix)` - Change ID prefix
- `resetCounter(value)` - Reset counter value

### 6. Utility Slice (`utilitySlice.ts`)

**Responsibility**: Global utility actions

**Actions**:

- `clearAllData()` - Reset entire store to initial state

## Benefits

### Separation of Concerns

Each slice focuses on a single responsibility, making code easier to understand and maintain.

### Better Testing

Slices can be tested in isolation with specific test utilities.

### Selective Subscriptions

Components can subscribe to specific slices to minimize re-renders:

```typescript
// Only re-render when draft changes
const draft = useCreatorStore((s: DraftSlice) => s.activeDraft)

// Only re-render when preferences change
const prefs = useCreatorStore((s: PreferencesSlice) => s.preferences)
```

### Easier Refactoring

Changes to one slice don't affect others, reducing risk of regressions.

### Code Organization

Related state and actions are colocated, making the codebase easier to navigate.

## Usage Examples

### Using the Store

```typescript
import { useCreatorStore } from '@/entities/creator'

// Get state
const activeDraft = useCreatorStore((s) => s.activeDraft)

// Get action
const updateDraft = useCreatorStore((s) => s.updateDraft)

// Get multiple values
const { activeDraft, updateDraft } = useCreatorStore((s) => ({
  activeDraft: s.activeDraft,
  updateDraft: s.updateDraft,
}))
```

### Selective Subscriptions with Slice Types

```typescript
import { useCreatorStore, type DraftSlice } from '@/entities/creator'

// Type-safe selective subscription
const { activeDraft, lineItems } = useCreatorStore((s: DraftSlice) => ({
  activeDraft: s.activeDraft,
  lineItems: s.lineItems,
}))
```

## Adding New Slices

1. Create slice file in `slices/` directory
2. Define slice interface with state and actions
3. Implement `createXxxSlice` using `StateCreator<CreatorStore, [], [], XxxSlice>`
4. Export from `index.ts`
5. Add to `types.ts` CreatorStore type
6. Compose in `useCreatorStore.ts`

Example:

```typescript
// newSlice.ts
export interface NewSlice {
  newState: string
  newAction: () => void
}

export const createNewSlice: StateCreator<CreatorStore, [], [], NewSlice> = (set) => ({
  newState: 'default',
  newAction: () => set({ newState: 'updated' }),
})
```

## Migration Support

The main store file (`useCreatorStore.ts`) handles migration logic separately from slices. This keeps slice code clean while maintaining backward compatibility with old localStorage data.
