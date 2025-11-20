# Feature Specification: Client-Side State Management with Zustand

**Feature Branch**: `003-zustand-state-management`  
**Created**: 2025-11-20  
**Status**: Draft  
**Input**: User description: "Implement client-side state management using Zustand with persist middleware. Create two stores: useCreatorStore (invoice drafts, user preferences, creation history, auto-incrementing invoice ID counter) and usePayerStore (payment receipts). Add export/import functionality for data portability. CRITICAL: No server-side storage (Constitution Principle I & II). All data stored in browser LocalStorage only."

## Clarifications

### Session 2025-11-20

- Q: Should draft auto-save happen on every field change (debounced), or only when the user explicitly triggers a save action? → A: Automatic on field change (debounced 500ms) - Save automatically after user stops typing/editing for 500ms. No manual save button needed.
- Q: How should the system handle multiple concurrent drafts - should there be a limit, and how should users switch between them? → A: Single active draft + quick save (templates) - One active draft, but users can "Save as Template" to preserve current work before starting new. Templates stored separately from active draft.
- Q: What level of search/filter functionality should be provided for history and receipts? → A: Client-side text search - Simple text input that filters entries by invoice ID, recipient name, or amount. Works offline, fast for <100 entries, good enough for MVP.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Invoice Draft Persistence (Priority: P1)

As an invoice creator, I want my in-progress invoice drafts to be automatically saved to my browser so that I don't lose work if I accidentally close the tab or navigate away.

**Why this priority**: This is the most critical user story because losing invoice data mid-creation is the worst user experience. Without draft persistence, users would need to complete invoices in a single session, which is unrealistic for complex invoices with multiple line items.

**Independent Test**: Can be fully tested by creating a partial invoice, closing the browser, reopening it, and verifying the draft is restored. Delivers immediate value by preventing data loss.

**Acceptance Scenarios**:

1. **Given** I am creating a new invoice with partial information, **When** I close the browser tab without generating the URL, **Then** my active draft is automatically saved and restored when I return to `/create`
2. **Given** I am working on an active draft and want to start a new invoice, **When** I click "New Invoice", **Then** I am prompted to either save the current draft as a template, discard it, or cancel
3. **Given** I am editing the active draft, **When** I make changes to any field (line items, dates, parties), **Then** the changes are automatically persisted to LocalStorage within 500ms
4. **Given** I have completed an invoice and generated its URL, **When** the URL is generated, **Then** the active draft is automatically cleared
5. **Given** I have saved templates, **When** I navigate to the create page, **Then** I can see a list of my saved templates and select one to load into the active draft

---

### User Story 2 - Creation History Tracking (Priority: P1)

As an invoice creator, I want to see a history of invoices I've created so that I can easily access, duplicate, or reference past invoices without needing to save URLs manually.

**Why this priority**: This is essential for repeat users who create multiple invoices. Without history, users must manually save every invoice URL, creating friction and potential data loss. History enables workflow efficiency and template reuse.

**Independent Test**: Can be fully tested by creating several invoices, generating their URLs, and verifying they appear in a chronological history list with preview information. Delivers value by enabling quick access to past work.

**Acceptance Scenarios**:

1. **Given** I have generated an invoice URL, **When** the URL is created, **Then** a history entry is automatically saved to LocalStorage with timestamp, invoice ID, recipient name, and total amount
2. **Given** I have a creation history, **When** I view the history list, **Then** I see entries sorted by creation date (newest first) with key details visible
3. **Given** I select a history entry, **When** I click "Duplicate", **Then** a new draft is created with all the same details except a new invoice ID and updated dates
4. **Given** I select a history entry, **When** I click "View", **Then** I am navigated to the invoice URL
5. **Given** I have many history entries, **When** the history exceeds 100 items, **Then** the oldest entries are automatically pruned to maintain performance

---

### User Story 3 - Auto-Incrementing Invoice IDs (Priority: P2)

As an invoice creator, I want invoice IDs to automatically increment based on my previous invoices so that I maintain a sequential numbering system without manual tracking.

**Why this priority**: Professional invoicing requires sequential IDs for accounting and record-keeping. Manual ID management is error-prone and creates duplicate ID risks. Auto-increment provides a polished, professional experience.

**Independent Test**: Can be fully tested by creating multiple invoices and verifying each receives a sequential ID (INV-001, INV-002, etc.). Delivers value by automating bookkeeping best practices.

**Acceptance Scenarios**:

1. **Given** I am creating my first invoice, **When** the create page loads, **Then** the invoice ID field is pre-filled with "INV-001"
2. **Given** I have created 5 invoices previously, **When** I start a new invoice, **Then** the invoice ID is automatically set to "INV-006"
3. **Given** I manually edit the invoice ID to a custom value, **When** I generate the invoice URL, **Then** the counter does not increment (custom IDs don't affect the sequence)
4. **Given** I use the auto-generated ID, **When** I generate the invoice URL, **Then** the counter increments by 1 for the next invoice
5. **Given** I have a custom ID prefix preference set, **When** a new invoice is created, **Then** the ID uses my custom prefix (e.g., "ACME-001" instead of "INV-001")

---

### User Story 4 - User Preferences Persistence (Priority: P2)

As an invoice creator, I want my default settings (sender information, preferred currency, tax rates, ID prefix) to be remembered so that I don't need to re-enter them for every invoice.

**Why this priority**: Repeat users create multiple invoices with similar settings. Remembering preferences dramatically reduces data entry time and improves user experience. This is a quality-of-life feature that increases user retention.

**Independent Test**: Can be fully tested by setting preferences, creating a new invoice, and verifying the preferences are pre-filled. Delivers value by reducing repetitive data entry.

**Acceptance Scenarios**:

1. **Given** I have set my default sender information (name, wallet, email), **When** I create a new invoice, **Then** the sender fields are pre-filled with my saved values
2. **Given** I have set a preferred currency and network, **When** I create a new invoice, **Then** the currency and network dropdowns default to my preferences
3. **Given** I have set a default tax rate, **When** I add line items, **Then** the tax field is pre-filled with my saved rate
4. **Given** I update my preferences, **When** I save the changes, **Then** all future invoices use the updated preferences
5. **Given** I want to override my preferences for a specific invoice, **When** I manually change any field, **Then** the change applies only to the current invoice without affecting saved preferences

---

### User Story 5 - Payment Receipt Storage (Priority: P2)

As a payer, I want a record of invoices I've paid to be saved in my browser so that I can reference payment confirmations and transaction hashes later.

**Why this priority**: Payment receipts provide proof of payment and are essential for accounting and dispute resolution. Without local storage, users must manually save transaction hashes, creating friction and potential data loss.

**Independent Test**: Can be fully tested by completing a payment, verifying the receipt is saved, and accessing it from a receipts list. Delivers value by providing payment history and proof of payment.

**Acceptance Scenarios**:

1. **Given** I have completed a payment, **When** the transaction is confirmed on-chain, **Then** a receipt is automatically saved to LocalStorage with invoice details, transaction hash, timestamp, and payment amount
2. **Given** I have payment receipts, **When** I view the receipts list, **Then** I see entries sorted by payment date with invoice ID, recipient, amount, and network
3. **Given** I select a receipt, **When** I click "View Transaction", **Then** I am navigated to the block explorer for that transaction hash
4. **Given** I select a receipt, **When** I click "View Invoice", **Then** I am navigated to the original invoice URL
5. **Given** I have many receipts, **When** the receipt count exceeds 100 items, **Then** the oldest receipts are automatically pruned to maintain performance

---

### User Story 6 - Data Export/Import (Priority: P3)

As a user, I want to export my invoice history, drafts, and preferences to a JSON file and import them on another device or browser so that I can maintain data portability and backup.

**Why this priority**: Browser LocalStorage can be cleared accidentally or when switching devices. Export/import provides data portability, backup capability, and multi-device workflows. This is essential for power users and aligns with self-custody principles.

**Independent Test**: Can be fully tested by exporting data to a JSON file, clearing LocalStorage, importing the file, and verifying all data is restored. Delivers value by enabling backup and device migration.

**Acceptance Scenarios**:

1. **Given** I have creation history, drafts, and preferences, **When** I click "Export Data", **Then** a JSON file is downloaded containing all my LocalStorage data with a timestamp in the filename
2. **Given** I have an exported JSON file, **When** I click "Import Data" and select the file, **Then** all data is restored to LocalStorage and immediately reflected in the UI
3. **Given** I import data that conflicts with existing data, **When** the import is processed, **Then** I am prompted to choose between merging, replacing, or canceling the import
4. **Given** I import a corrupted or invalid JSON file, **When** the import fails validation, **Then** I see a clear error message and my existing data remains unchanged
5. **Given** I want to export only specific data types, **When** I access export options, **Then** I can choose to export only history, only drafts, only preferences, or all data

---

### Edge Cases

- **What happens when LocalStorage is full?** System must detect quota exceeded errors and display a persistent warning banner at the top of the page with "Export Data" and "Clear Old Entries" action buttons. Auto-pruning should prevent this in normal usage.
- **What happens when LocalStorage is disabled or unavailable?** System must gracefully degrade, showing a warning banner that persistence is unavailable and data will be lost on page refresh. Core invoice creation/payment functionality must still work.
- **What happens when importing data from a different schema version?** Import logic must detect schema version mismatches. For additive changes (new optional fields), migration happens automatically. For breaking changes (field removal, type changes), user must confirm migration with clear warning about potential data loss. If migration is not possible, show clear error message.
- **What happens when the invoice ID counter overflows (e.g., exceeds 999999)?** System should continue incrementing without limit, but display a warning if the ID becomes excessively long (e.g., > 10 characters).
- **What happens when a user manually sets an invoice ID that conflicts with a future auto-generated ID?** System should allow the conflict (user choice takes precedence) but skip that number in the auto-increment sequence.
- **What happens when history/receipts pruning removes an entry the user wanted to keep?** Export functionality should be prominently displayed with a recommendation to export data regularly. Pruning should be conservative (100+ items) to minimize data loss.
- **What happens when multiple browser tabs modify the same store simultaneously?** Zustand persist middleware handles this via storage events, but race conditions may occur. Last write wins is the accepted behavior for MVP. Known limitation: concurrent edits in multiple tabs may result in data loss. Mitigation: prominent "Export data regularly" recommendation in UI.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a `useCreatorStore` Zustand store with persist middleware that stores invoice drafts, user preferences, creation history, and an auto-incrementing invoice ID counter in browser LocalStorage
- **FR-002**: System MUST provide a `usePayerStore` Zustand store with persist middleware that stores payment receipts in browser LocalStorage
- **FR-003**: System MUST automatically save invoice drafts to LocalStorage whenever any field changes, using a 500ms debounce delay. No manual "Save Draft" button is required; saving is fully automatic after the user stops editing.
- **FR-004**: System MUST save a creation history entry to LocalStorage whenever an invoice URL is successfully generated, including timestamp, invoice ID, recipient name, total amount, and the full URL
- **FR-005**: System MUST increment the invoice ID counter by 1 each time an auto-generated invoice ID is used to create an invoice URL
- **FR-006**: System MUST pre-fill new invoice forms with user preferences (sender info, currency, network, tax rate, ID prefix) when available
- **FR-007**: System MUST save a payment receipt to LocalStorage when a payment transaction is confirmed on-chain, including invoice details, transaction hash, timestamp, payment amount, and network
- **FR-008**: System MUST provide export functionality that generates a JSON file containing all LocalStorage data (stores state) with a timestamped filename (e.g., `voidpay-backup-2025-11-20.json`)
- **FR-009**: System MUST provide import functionality that reads a JSON file and restores data to LocalStorage, with validation to ensure data integrity
- **FR-010**: System MUST handle LocalStorage quota exceeded errors gracefully by displaying a persistent warning banner at the top of the page with "Export Data" and "Clear Old Entries" action buttons
- **FR-011**: System MUST handle LocalStorage unavailability (disabled or unsupported) by displaying a warning banner and allowing core functionality to continue without persistence
- **FR-012**: System MUST automatically prune creation history and payment receipts when they exceed 100 entries, removing the oldest entries first
- **FR-013**: System MUST allow users to manually delete individual drafts, history entries, and receipts
- **FR-014**: System MUST allow users to duplicate a history entry, creating a new draft with the same details but a new invoice ID and updated dates
- **FR-015**: System MUST NOT send any LocalStorage data to a server or third-party service (Constitution Principle I & II compliance)
- **FR-016**: System MUST namespace LocalStorage keys to prevent conflicts with other applications (e.g., `voidpay:creator`, `voidpay:payer`)
- **FR-017**: System MUST include schema versioning in persisted data to enable future migrations (e.g., `{ version: 1, data: {...} }`)
- **FR-018**: Import functionality MUST detect schema version mismatches and handle them based on change type: automatic migration for additive changes (new optional fields), user confirmation for breaking changes (field removal, type changes), or clear error message if migration is not possible
- **FR-019**: Export/import functionality MUST preserve all data types correctly (dates as ISO strings, numbers as numbers, etc.)
- **FR-020**: System MUST provide a "Clear All Data" option with a confirmation dialog to allow users to reset their LocalStorage state
- **FR-021**: System MUST maintain a single active draft that is automatically saved and restored on page load
- **FR-022**: System MUST provide a "Save as Template" action that saves the current active draft to a separate templates collection without clearing the active draft
- **FR-023**: System MUST allow users to load a saved template into the active draft, replacing the current active draft content (with confirmation if active draft has unsaved changes)
- **FR-024**: System MUST allow users to delete individual saved templates
- **FR-025**: System MUST store templates with a name (user-provided or auto-generated from recipient/date), creation timestamp, and full invoice data
- **FR-026**: System MUST provide client-side text search functionality for creation history and payment receipts that filters entries by invoice ID, recipient name, or amount in real-time as the user types

### Key Entities _(include if feature involves data)_

- **InvoiceDraft**: Represents the single active in-progress invoice that has not yet been finalized. Contains all invoice fields (parties, line items, dates, currency, etc.), a draft ID, and a last-modified timestamp. Only one active draft exists at a time.
- **InvoiceTemplate**: Represents a saved invoice template that users can reuse. Contains all invoice fields, a template name, template ID, and creation timestamp. Multiple templates can exist simultaneously.
- **CreationHistoryEntry**: Represents a completed invoice. Contains invoice ID, recipient name, total amount, creation timestamp, and the full invoice URL for quick access.
- **UserPreferences**: Represents saved default settings for invoice creation. Contains sender information (name, wallet, email, address), preferred currency, preferred network, default tax rate, and invoice ID prefix.
- **InvoiceIDCounter**: Represents the auto-incrementing counter for invoice IDs. Contains the current counter value (integer) and the ID prefix (string).
- **PaymentReceipt**: Represents a completed payment. Contains invoice ID, recipient name, payment amount, transaction hash, payment timestamp, network, and the original invoice URL.
- **ExportData**: Represents the complete exportable state. Contains schema version, export timestamp, creator store data, and payer store data.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create an invoice draft, close the browser, reopen it, and see their draft restored within 1 second of page load
- **SC-002**: Users can create 10 invoices in succession and see each receive a sequential auto-incremented ID without manual intervention
- **SC-003**: Users can set default preferences once and have them pre-fill in all subsequent invoices, reducing data entry time by at least 50% for repeat invoices
- **SC-004**: Users can export their complete data (100 history entries, 10 drafts, preferences) to a JSON file and import it on a different browser, with 100% data fidelity
- **SC-005**: System handles LocalStorage quota exceeded errors gracefully, displaying a clear warning and allowing the user to resolve the issue without data corruption
- **SC-006**: System continues to function (invoice creation and payment) even when LocalStorage is disabled, with appropriate warnings displayed
- **SC-007**: Payment receipts are automatically saved within 5 seconds of transaction confirmation, providing immediate proof of payment
- **SC-008**: Users can access their creation history and payment receipts at any time, with entries sorted chronologically and filterable via client-side text search (by invoice ID, recipient name, or amount) with results appearing instantly as they type
