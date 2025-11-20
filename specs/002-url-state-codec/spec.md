# Feature Specification: URL State Codec System

**Feature Branch**: `002-url-state-codec`
**Created**: 2025-11-19
**Status**: Draft
**Input**: User description: "Implement URL state codec system for invoice data. Create TypeScript interfaces for InvoiceSchemaV1 with all fields (v, id, iss, due, nt, net, cur, t, dec, f, c, it, tax, dsc). Implement compression using lz-string library with validation for 2000 byte limit. Include schema versioning support for future migrations. CRITICAL: Follow Constitution Principle IV - schema v1 must be immutable once deployed. Include reserved fields for extensibility."

## Clarifications

### Session 2025-11-19
- Q: Nested Field Keys Strategy → A: Abbreviated Keys (Option A) - Use short keys for nested objects (e.g., `f.n`, `it.q`) to maximize URL capacity.
- Q: Amount Representation → A: BigInt + Decimals (Option A) - Store amounts as BigInts (serialized as strings) combined with `dec` field to ensure precision.
- Q: Tax & Discount Logic → A: Flexible Strings (Option A) - Use suffixes (e.g., `"10%"` vs `"50"`) to distinguish between percentage and fixed amounts.
- Q: Date Format → A: Unix Timestamp (Option A) - Use seconds (integer) for dates (e.g., `1732070000`) to save space.
- Q: Network ID Format → A: Numeric Chain ID (Option A) - Use integer chain IDs (e.g., `1`, `137`) for compact network identification.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create and Share Invoice URL (Priority: P1)

A freelancer creates an invoice for a client and shares it via a URL. The invoice data must be fully encoded in the URL so the client can view and pay it without any backend database.

**Why this priority**: This is the core value proposition of the stateless invoicing platform. Without URL encoding, the entire architecture fails.

**Independent Test**: Can be fully tested by creating an invoice with all fields populated, generating a URL, copying the URL to a new browser session, and verifying all invoice data displays correctly.

**Acceptance Scenarios**:

1. **Given** an invoice with all required fields (sender, client, line items, amounts), **When** the user generates a shareable URL, **Then** the URL contains all invoice data in compressed format under 2000 bytes
2. **Given** a generated invoice URL, **When** the URL is opened in a different browser or device, **Then** all invoice details display exactly as entered (sender info, client info, line items, amounts, dates, notes)
3. **Given** an invoice with maximum allowed content (280 char notes, multiple line items), **When** generating the URL, **Then** the system validates the compressed size and either succeeds (≤2000 bytes) or shows a clear error message

---

### User Story 2 - Future-Proof Invoice URLs (Priority: P1)

An invoice URL created today must remain functional indefinitely, even as the application evolves with new features and schema changes.

**Why this priority**: Principle IV (Backward Compatibility) is non-negotiable. Breaking old URLs destroys user trust and creates data loss.

**Independent Test**: Can be tested by creating a v1 invoice URL, simulating a future schema version (v2) in code, and verifying the v1 URL still parses and displays correctly using the v1 parser.

**Acceptance Scenarios**:

1. **Given** a v1 invoice URL created today, **When** the application is updated with schema v2 support, **Then** the v1 URL continues to parse and display correctly using the immutable v1 parser
2. **Given** a schema version field in the URL, **When** parsing an invoice, **Then** the system routes to the correct version-specific parser
3. **Given** reserved fields in schema v1 (`meta`, `_future`), **When** future versions need new capabilities, **Then** these fields can be used for backward-compatible extensions

---

### User Story 3 - Validate Invoice Data Integrity (Priority: P2)

When an invoice URL is opened, the system must validate that the data is well-formed and complete before displaying it to prevent errors or security issues.

**Why this priority**: Malformed URLs could cause runtime errors or display incorrect payment information, leading to failed transactions.

**Independent Test**: Can be tested by creating various malformed URLs (corrupted compression, missing required fields, invalid dates) and verifying appropriate error messages are shown.

**Acceptance Scenarios**:

1. **Given** a URL with corrupted compression data, **When** attempting to parse, **Then** the system shows a user-friendly error message indicating the URL is invalid
2. **Given** a URL missing required fields (e.g., no `v` version field), **When** parsing, **Then** the system rejects the URL with a clear error message
3. **Given** a URL with invalid data types (e.g., string where number expected), **When** parsing, **Then** the system validates types and shows appropriate error messages

---

### Edge Cases

- What happens when the compressed URL exceeds 2000 bytes?
  - System must block URL generation and show error: "Invoice too large. Reduce notes or line items."
- What happens when lz-string decompression fails (corrupted data)?
  - System must catch error and show: "Invalid invoice URL. The link may be corrupted."
- What happens when an unknown schema version is encountered (e.g., v99)?
  - System must show: "This invoice requires a newer version of the application. Please update."
- What happens when reserved fields contain unexpected data?
  - System must ignore unknown reserved field contents gracefully (forward compatibility)
- What happens when notes exceed 280 characters?
  - System must enforce limit in UI and truncate/reject during encoding

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST define a TypeScript interface `InvoiceSchemaV1` with all specified fields: `v` (version), `id` (invoice ID), `iss` (issue date), `due` (due date), `nt` (notes), `net` (network/chain ID), `cur` (currency symbol), `t` (token address), `dec` (decimals), `f` (sender info), `c` (client info), `it` (line items), `tax` (tax rate), `dsc` (discount). Amounts MUST be stored as strings representing BigInts.
- **FR-002**: System MUST include a version field (`v: number`) in every encoded invoice URL to enable schema versioning
- **FR-003**: System MUST implement URL encoding using the lz-string library (LZW compression algorithm)
- **FR-004**: System MUST validate that compressed URL payload does not exceed 2000 bytes before allowing URL generation
- **FR-005**: System MUST implement URL decoding that decompresses lz-string data and parses JSON into the schema interface
- **FR-006**: System MUST include reserved fields (`meta?: any`, `_future?: any`) in schema v1 for future extensibility
- **FR-007**: System MUST enforce immutability of schema v1 parser logic (Principle IV) - once deployed, v1 parsing code cannot be modified
- **FR-008**: System MUST support schema versioning architecture that allows adding new schema versions (v2, v3, etc.) without breaking existing URLs
- **FR-009**: System MUST validate required fields are present during decoding (at minimum: `v`, `id`, `iss`, `due`, `net`, `cur`, `dec`, `f`, `c`, `it`)
- **FR-010**: System MUST enforce notes field (`nt`) maximum length of 280 characters during encoding
- **FR-011**: System MUST handle decoding errors gracefully with user-friendly error messages (no stack traces or technical details exposed)
- **FR-012**: System MUST use abbreviated field names (e.g., `iss` not `issueDate`) to minimize URL payload size
- **FR-013**: System MUST support flexible tax/discount values using string suffixes (e.g., `"10%"` for percentage, `"50"` for fixed amount).
- **FR-014**: System MUST use Unix timestamp (seconds) for all date fields (`iss`, `due`).
- **FR-015**: System MUST use numeric Chain ID (integer) for the `net` field (e.g., `1` for Mainnet, `137` for Polygon).

### Key Entities _(include if feature involves data)_

- **InvoiceSchemaV1**: The immutable v1 invoice data structure containing all invoice fields (sender, client, line items, amounts, dates, payment details). Includes version field for routing to correct parser and reserved fields for future extensibility.
- **Sender Info (`f`)**: `n` (name), `a` (wallet address), `e` (email), `ads` (physical address), `ph` (phone)
- **Client Info (`c`)**: `n` (name), `a` (wallet address), `e` (email), `ads` (physical address), `ph` (phone)
- **Line Items (`it`)**: Array of items with `d` (desc), `q` (qty), `r` (rate/price)
- **Compression Metadata**: Tracks compressed payload size to enforce 2000 byte limit

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create an invoice URL with all fields populated and share it, with the recipient able to view all invoice details without any backend database
- **SC-002**: Compressed invoice URLs remain under 2000 bytes for typical invoices (up to 5 line items, 280 character notes)
- **SC-003**: Invoice URLs created with schema v1 remain functional indefinitely, even after future schema versions (v2, v3) are deployed
- **SC-004**: System rejects URL generation attempts that would exceed 2000 bytes with a clear error message within 100ms
- **SC-005**: Malformed or corrupted invoice URLs display user-friendly error messages (not technical stack traces) 100% of the time
- **SC-006**: Schema v1 parser code remains unchanged after initial deployment, with new schema versions added as separate parsers
