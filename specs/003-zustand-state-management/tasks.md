# Tasks: Client-Side State Management with Zustand

**Input**: Design documents from `/specs/003-zustand-state-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT requested in the feature specification, so test tasks are excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install Zustand 5+ and use-debounce dependencies via npm | Deviation: Dependencies were already installed in package.json
- [x] T002 [P] Create shared storage utilities directory at src/shared/lib/storage/ | Deviation: None
- [x] T003 [P] Create shared config directory at src/shared/config/ | Deviation: None

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create storage key constants in src/shared/config/storage-keys.ts | Deviation: None
- [x] T005 [P] Implement LocalStorage quota check utility in src/shared/lib/storage/quota-check.ts | Deviation: None
- [x] T006 [P] Implement key namespacing utility in src/shared/lib/storage/namespace.ts | Deviation: None
- [x] T007 [P] Create base TypeScript types for InvoiceDraft in src/entities/invoice/model/types.ts | Deviation: User added InvoiceTemplate and CreationHistoryEntry types to same file (good consolidation)
- [x] T008 [P] Create LineItem interface in src/entities/invoice/model/types.ts | Deviation: Combined with T007 in same file
- [x] T009 Create debounce utility wrapper in src/shared/lib/debounce.ts | Deviation: None

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Invoice Draft Persistence (Priority: P1) 🎯 MVP

**Goal**: Automatically save in-progress invoice drafts to browser LocalStorage so users don't lose work if they close the tab or navigate away

**Independent Test**: Create a partial invoice, close the browser, reopen it, and verify the draft is restored on `/create` page

### Implementation for User Story 1

- [x] T010 [P] [US1] Create InvoiceDraft interface in src/entities/creator/model/types.ts | Deviation: Interface already existed in src/entities/invoice/model/types.ts (from Phase 2), re-exported in creator types for convenience
- [x] T011 [P] [US1] Create InvoiceTemplate interface in src/entities/creator/model/types.ts | Deviation: Interface already existed in src/entities/invoice/model/types.ts (from Phase 2), re-exported in creator types for convenience
- [x] T012 [P] [US1] Create CreatorStoreV1 interface in src/entities/creator/model/types.ts | Deviation: None
- [x] T013 [US1] Implement useCreatorStore with Zustand persist middleware in src/entities/creator/model/useCreatorStore.ts | Deviation: Used partialize option to exclude only persisted state fields (optimization not in plan.md). Added createNewDraft helper action for better UX.
- [x] T014 [US1] Implement updateDraft action with debouncing in src/entities/creator/model/useCreatorStore.ts | Deviation: Debouncing implemented in UI layer (auto-save hook) instead of store action for better separation of concerns
- [x] T015 [US1] Implement clearDraft action in src/entities/creator/model/useCreatorStore.ts | Deviation: None
- [x] T016 [US1] Implement saveAsTemplate action in src/entities/creator/model/useCreatorStore.ts | Deviation: None
- [x] T017 [US1] Implement loadTemplate action with confirmation dialog in src/entities/creator/model/useCreatorStore.ts | Deviation: Confirmation dialog handled in UI layer (NewInvoiceDialog), store action only loads template
- [x] T018 [US1] Implement deleteTemplate action in src/entities/creator/model/useCreatorStore.ts | Deviation: None
- [x] T019 [US1] Create auto-save hook using useDebouncedCallback in src/features/invoice-draft/lib/auto-save.ts | Deviation: Added useAutoSaveWithManual variant for manual flush capability
- [x] T020 [US1] Integrate auto-save hook into invoice editor component at src/app/create/page.tsx | Deviation: Integrated into simplified demo form (full invoice editor to be built later)
- [x] T021 [US1] Add draft restoration logic on page load in src/app/create/page.tsx | Deviation: None
- [x] T022 [US1] Add "New Invoice" confirmation dialog when active draft exists in src/features/invoice-draft/ui/NewInvoiceDialog.tsx | Deviation: None
- [x] T023 [US1] Add template list UI component in src/features/invoice-draft/ui/ | Deviation: Created TemplateList.tsx with delete confirmation and empty state
- [x] T024 [US1] Implement schema versioning and migration logic in src/entities/creator/model/migrations.ts | Deviation: Added validation function for migrated state (not in plan.md, improves robustness)

**Checkpoint**: At this point, User Story 1 should be fully functional - drafts auto-save, templates work, and data persists across sessions

---

## Phase 4: User Story 2 - Creation History Tracking (Priority: P1)

**Goal**: Automatically save a history of created invoices so users can easily access, duplicate, or reference past invoices

**Independent Test**: Create several invoices, generate their URLs, and verify they appear in a chronological history list with preview information

### Implementation for User Story 2

- [x] T025 [P] [US2] Create CreationHistoryEntry interface in src/entities/creator/model/types.ts | Deviation: Interface already existed in src/entities/invoice/model/types.ts (from Phase 2), re-exported in creator types for convenience
- [x] T026 [US2] Implement addHistoryEntry action in src/entities/creator/model/useCreatorStore.ts | Deviation: None
- [x] T027 [US2] Implement deleteHistoryEntry action in src/entities/creator/model/useCreatorStore.ts | Deviation: None
- [x] T028 [US2] Implement duplicateHistoryEntry action in src/entities/creator/model/useCreatorStore.ts | Deviation: None
- [x] T029 [US2] Implement pruneHistory action (auto-prune when > 100 entries) in src/entities/creator/model/useCreatorStore.ts | Deviation: Auto-pruning implemented inline in addHistoryEntry action for efficiency
- [x] T030 [US2] Create history list UI component in src/features/invoice-history/ui/ | Deviation: Created HistoryList.tsx with delete confirmation, empty state, and payment status indicator
- [x] T031 [US2] Add "Duplicate" button functionality to history entries | Deviation: Integrated into HistoryList component
- [x] T032 [US2] Add "View" button functionality to navigate to invoice URL | Deviation: Integrated into HistoryList component, opens in new tab
- [x] T033 [US2] Integrate addHistoryEntry call after invoice URL generation | Deviation: Created invoice-helpers.ts with generateAndTrackInvoice function, integrated into create page with demo button
- [x] T034 [US2] Add auto-pruning trigger when history exceeds 100 entries | Deviation: Auto-pruning implemented inline in addHistoryEntry action (same as T029)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - drafts persist and history is tracked

---

## Phase 5: User Story 3 - Auto-Incrementing Invoice IDs (Priority: P2)

**Goal**: Automatically increment invoice IDs based on previous invoices to maintain a sequential numbering system

**Independent Test**: Create multiple invoices and verify each receives a sequential ID (INV-001, INV-002, etc.)

### Implementation for User Story 3

- [ ] T035 [P] [US3] Create InvoiceIDCounter interface in src/entities/creator/model/types.ts
- [ ] T036 [US3] Implement incrementIdCounter action in src/entities/creator/model/useCreatorStore.ts
- [ ] T037 [US3] Implement generateNextInvoiceId helper function in src/entities/creator/model/useCreatorStore.ts
- [ ] T038 [US3] Add ID generation logic with padding (e.g., INV-001) in src/entities/invoice/lib/invoice-helpers.ts
- [ ] T039 [US3] Integrate auto-generated ID pre-fill in invoice editor component
- [ ] T040 [US3] Add logic to increment counter only when auto-generated ID is used
- [ ] T041 [US3] Add custom ID prefix support in preferences

**Checkpoint**: All P1 and P2 priority stories complete - drafts persist, history tracked, IDs auto-increment

---

## Phase 6: User Story 4 - User Preferences Persistence (Priority: P2)

**Goal**: Remember user's default settings (sender info, currency, tax rates, ID prefix) to reduce repetitive data entry

**Independent Test**: Set preferences, create a new invoice, and verify the preferences are pre-filled

### Implementation for User Story 4

- [ ] T042 [P] [US4] Create UserPreferences interface in src/entities/creator/model/types.ts
- [ ] T043 [US4] Implement updatePreferences action in src/entities/creator/model/useCreatorStore.ts
- [ ] T044 [US4] Add preferences initialization logic in useCreatorStore
- [ ] T045 [US4] Create preferences settings UI component in src/features/invoice-draft/ui/
- [ ] T046 [US4] Integrate preference pre-fill logic in invoice editor (sender info, currency, network, tax rate)
- [ ] T047 [US4] Add preference override capability for individual invoices
- [ ] T048 [US4] Add validation for preference fields (wallet address, chain ID, ID prefix)

**Checkpoint**: User preferences now persist and pre-fill new invoices, reducing data entry time

---

## Phase 7: User Story 5 - Payment Receipt Storage (Priority: P2)

**Goal**: Save payment receipts in browser so users can reference payment confirmations and transaction hashes later

**Independent Test**: Complete a payment, verify the receipt is saved, and access it from a receipts list

### Implementation for User Story 5

- [ ] T049 [P] [US5] Create PaymentReceipt interface in src/entities/payer/model/types.ts
- [ ] T050 [P] [US5] Create PayerStoreV1 interface in src/entities/payer/model/types.ts
- [ ] T051 [US5] Implement usePayerStore with Zustand persist middleware in src/entities/payer/model/usePayerStore.ts
- [ ] T052 [US5] Implement addReceipt action in src/entities/payer/model/usePayerStore.ts
- [ ] T053 [US5] Implement deleteReceipt action in src/entities/payer/model/usePayerStore.ts
- [ ] T054 [US5] Implement pruneReceipts action (auto-prune when > 100 entries) in src/entities/payer/model/usePayerStore.ts
- [ ] T055 [US5] Create receipt list UI component in src/features/payment-receipts/ui/
- [ ] T056 [US5] Add "View Transaction" button to navigate to block explorer
- [ ] T057 [US5] Add "View Invoice" button to navigate to invoice URL
- [ ] T058 [US5] Integrate addReceipt call after payment transaction confirmation
- [ ] T059 [US5] Add auto-pruning trigger when receipts exceed 100 entries
- [ ] T060 [US5] Implement schema versioning and migration logic in src/entities/payer/model/migrations.ts

**Checkpoint**: Payment receipts now persist and are accessible from receipts list

---

## Phase 8: User Story 6 - Data Export/Import (Priority: P3)

**Goal**: Export invoice history, drafts, and preferences to JSON file and import them on another device for data portability and backup

**Independent Test**: Export data to JSON file, clear LocalStorage, import the file, and verify all data is restored

### Implementation for User Story 6

- [ ] T061 [P] [US6] Create ExportDataV1 interface in src/features/data-export/lib/types.ts
- [ ] T062 [P] [US6] Implement exportData function in src/features/data-export/lib/export.ts
- [ ] T063 [P] [US6] Implement downloadExport function with timestamped filename in src/features/data-export/lib/export.ts
- [ ] T064 [US6] Implement importData function with validation in src/features/data-export/lib/import.ts
- [ ] T065 [US6] Implement importFromFile function in src/features/data-export/lib/import.ts
- [ ] T066 [US6] Add schema version validation in import logic
- [ ] T067 [US6] Add conflict resolution logic (merge/replace/cancel options)
- [ ] T068 [US6] Add error handling for corrupted or invalid JSON files
- [ ] T069 [US6] Create export/import UI component in src/features/data-export/ui/
- [ ] T070 [US6] Add "Export Data" button with download functionality
- [ ] T071 [US6] Add "Import Data" button with file picker
- [ ] T072 [US6] Add selective export options (history only, drafts only, preferences only, all data)
- [ ] T073 [US6] Add import success/error feedback UI

**Checkpoint**: All user stories complete - full data portability achieved

---

## Phase 9: Search & Filter (Cross-Cutting)

**Goal**: Add client-side search functionality for history and receipts

- [ ] T074 [P] Implement searchHistory function in src/features/invoice-history/lib/search.ts
- [ ] T075 [P] Implement searchReceipts function in src/features/payment-receipts/lib/search.ts
- [ ] T076 [P] Add search input UI to history list component
- [ ] T077 [P] Add search input UI to receipts list component
- [ ] T078 Integrate search with memoization for performance

**Checkpoint**: Search functionality available for both history and receipts

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T079 [P] Add LocalStorage quota warning banner component
- [ ] T080 [P] Add LocalStorage unavailable warning banner component
- [ ] T081 [P] Implement "Clear All Data" functionality with confirmation dialog
- [ ] T082 [P] Add storage quota monitoring and warning triggers
- [ ] T083 Add comprehensive error handling for QuotaExceededError
- [ ] T084 Add comprehensive error handling for storage unavailability
- [ ] T085 Add logging for all store operations (draft saves, history adds, etc.)
- [ ] T086 [P] Update documentation in quickstart.md with final API examples
- [ ] T087 Code cleanup and refactoring across all stores
- [ ] T088 Performance optimization for large datasets (100+ entries)
- [ ] T089 Validate all quickstart.md examples work correctly
- [ ] T090 Update PROGRESS.md with feature completion status and any deviations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Search & Filter (Phase 9)**: Depends on US2 (history) and US5 (receipts) completion
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 (uses same store) but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 (uses same store) but independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 (uses same store) but independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Completely independent (separate store)
- **User Story 6 (P3)**: Depends on US1-5 completion (exports all stores)

### Within Each User Story

- Type definitions before store implementation
- Store actions before UI components
- Core functionality before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T003) can run in parallel
- All Foundational tasks (T004-T009) can run in parallel
- Once Foundational phase completes:
  - US1, US3, US4 can start in parallel (all use CreatorStore but different actions)
  - US5 can start in parallel (separate PayerStore)
  - US2 should start after US1 has basic store structure (T013)
- Within each user story, tasks marked [P] can run in parallel
- Search & Filter tasks (T074-T078) can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all type definitions together:
Task: "Create InvoiceDraft interface in src/entities/creator/model/types.ts"
Task: "Create InvoiceTemplate interface in src/entities/creator/model/types.ts"
Task: "Create CreatorStoreV1 interface in src/entities/creator/model/types.ts"

# After store is created, launch UI and migration tasks together:
Task: "Create auto-save hook using useDebouncedCallback in src/features/invoice-draft/lib/auto-save.ts"
Task: "Implement schema versioning and migration logic in src/entities/creator/model/migrations.ts"
```

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational tasks together after Setup completes:
Task: "Create storage key constants in src/shared/config/storage-keys.ts"
Task: "Implement LocalStorage quota check utility in src/shared/lib/storage/quota-check.ts"
Task: "Implement key namespacing utility in src/shared/lib/storage/namespace.ts"
Task: "Create base TypeScript types for InvoiceDraft in src/entities/invoice/model/types.ts"
Task: "Create LineItem interface in src/entities/invoice/model/types.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Draft Persistence)
4. Complete Phase 4: User Story 2 (Creation History)
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Deploy/demo if ready

**Rationale**: US1 and US2 are both P1 priority and provide the core value proposition - never lose work and access past invoices.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo (Auto-incrementing IDs)
5. Add User Story 4 → Test independently → Deploy/Demo (Preferences)
6. Add User Story 5 → Test independently → Deploy/Demo (Payment receipts)
7. Add User Story 6 → Test independently → Deploy/Demo (Export/Import)
8. Add Search & Filter → Deploy/Demo
9. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Draft Persistence)
   - Developer B: User Story 5 (Payment Receipts - independent store)
   - Developer C: Foundational UI components
3. After US1 store structure exists:
   - Developer A: User Story 2 (Creation History)
   - Developer B: User Story 3 (Auto-incrementing IDs)
   - Developer C: User Story 4 (User Preferences)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

### Deviation Tracking (Principle IX)

When marking tasks complete, **MUST** record any implementation deviations:

**Format**: `- [x] T001 [Description] | Deviation: [None | <deviation description>]`

**Record if**:

- Actual implementation differs from plan.md, spec.md, or data-model.md
- Different approach was used due to technical constraints
- Better solution discovered during implementation
- Requirements evolved during development

**Include**:

- What was planned (with artifact reference)
- What was actually done
- Why the change was made
- Impact (breaking changes, performance, security)

**Examples**:

- `- [x] T015 [US1] Implement clearDraft action | Deviation: None`
- `- [x] T013 [US1] Implement useCreatorStore | Deviation: Used partialize option to exclude computed fields from persistence (not mentioned in plan.md). Reason: Reduces storage size and prevents stale computed values. Impact: None, improves performance.`

**After feature completion**: Review all deviations to update spec.md, plan.md, or data-model.md accordingly.

### PROGRESS.md Updates (Principle IX)

Upon completing this feature, **MUST** update `.specify/memory/PROGRESS.md`:

**Required Information**:

- Feature completion status: `🟢 **Completed**: YYYY-MM-DD`
- Brief implementation summary (what was built)
- Key deviations from original plan (if any)
- Feature folder reference: `specs/003-zustand-state-management/`
- Technical decisions or constraints encountered

**Example**:

```markdown
#### P0.3 - Client-Side State Management with Zustand

**Status**: 🟢 **Completed**: 2025-11-20

**Implemented**:

- ✅ useCreatorStore with draft persistence, templates, history, preferences, ID counter
- ✅ usePayerStore with payment receipt storage
- ✅ Auto-save with 500ms debouncing
- ✅ Export/import with schema versioning
- ✅ Client-side search for history and receipts
- ✅ LocalStorage quota handling

**Differences from Plan**:

- Used partialize option in Zustand persist to optimize storage size
- Added storage quota warning banner (not in original spec, UX improvement)

**Notes**:

- All data stored client-side only (Constitution Principle I & II)
- Schema versioning implemented for future migrations (Constitution Principle IV)
- Auto-pruning at 100 entries prevents quota issues

**Feature Folder**: `specs/003-zustand-state-management/`
```

**Update Location**: Move feature from "📋 Planned Features" to "✅ Completed Features" section.

---

## Summary

**Total Tasks**: 90
**MVP Tasks** (US1 + US2): 34 tasks (T001-T034)
**Full Feature Tasks**: 90 tasks

**Task Breakdown by User Story**:

- Setup: 3 tasks
- Foundational: 6 tasks
- US1 (Draft Persistence): 15 tasks
- US2 (Creation History): 10 tasks
- US3 (Auto-incrementing IDs): 7 tasks
- US4 (User Preferences): 7 tasks
- US5 (Payment Receipts): 12 tasks
- US6 (Export/Import): 13 tasks
- Search & Filter: 5 tasks
- Polish: 12 tasks

**Parallel Opportunities**:

- Setup phase: 2 parallel tasks
- Foundational phase: 5 parallel tasks
- User stories: US1, US3, US4, US5 can all start in parallel after Foundational
- Search & Filter: 4 parallel tasks
- Polish: 4 parallel tasks

**Suggested MVP Scope**: User Stories 1 & 2 (34 tasks) - Provides core value of draft persistence and creation history

**Independent Test Criteria**:

- US1: Create draft, close browser, reopen, verify restoration
- US2: Create invoices, verify history list with details
- US3: Create multiple invoices, verify sequential IDs
- US4: Set preferences, create invoice, verify pre-fill
- US5: Complete payment, verify receipt saved
- US6: Export data, clear storage, import, verify restoration

**Format Validation**: ✅ All tasks follow checklist format (checkbox, ID, labels, file paths)
