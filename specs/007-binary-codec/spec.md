# Feature Specification: Binary Codec URL Compression

**Feature Branch**: `007-binary-codec`
**Created**: 2025-11-27
**Status**: Draft
**Input**: User description: "Implement Binary Codec URL compression for compact invoice URLs"
**Research**: `.specify/memory/brainstorm/09-binary-codec-optimization.md`

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Invoice Creator with Many Line Items (Priority: P1)

A freelancer creates a detailed invoice with 5-7 line items, client details, notes, and payment terms. Currently, such invoices often exceed the 2000-byte URL limit and cannot be shared.

**Why this priority**: This is the core problem being solved. Without this, users are forced to delete content or split invoices, degrading the user experience.

**Independent Test**: Create an invoice with 6 line items, all optional fields filled, and verify the generated URL is under 2000 bytes and can be decoded correctly.

**Acceptance Scenarios**:

1. **Given** an invoice with 6 line items and all optional fields, **When** the user generates a payment link, **Then** the URL is under 2000 bytes and encodes all data correctly
2. **Given** an invoice with 7 line items, **When** the URL approaches the limit, **Then** the system shows remaining capacity and warns before overflow
3. **Given** any generated Binary Codec URL, **When** the URL is opened in a browser, **Then** the invoice displays identically to the original

---

### User Story 2 - Recipient Opens Binary Codec URL (Priority: P1)

A client receives an invoice link using the new Binary Codec format (`?b=...`). The payment page must decode and display the invoice correctly without any user intervention.

**Why this priority**: If recipients cannot decode new URLs, the feature is unusable. This must work seamlessly.

**Independent Test**: Generate a Binary Codec URL, open it in a fresh browser session, and verify the invoice renders correctly with all fields intact.

**Acceptance Scenarios**:

1. **Given** a Binary Codec URL (`?b=H...`), **When** opened in any modern browser, **Then** the invoice displays with all original data
2. **Given** a URL with V1, V2, or V3 binary encoding, **When** the decoder runs, **Then** it automatically detects the version and uses the correct parser

---

### User Story 3 - Backward Compatibility with Old URLs (Priority: P1)

Users who have shared old LZ-String URLs (`?d=...`) must continue to access their invoices indefinitely. Breaking old URLs violates Constitutional Principle IV.

**Why this priority**: This is a constitutional requirement. Backward compatibility is non-negotiable.

**Independent Test**: Collect 10 existing `?d=` URLs from previous testing, verify all still decode correctly after Binary Codec integration.

**Acceptance Scenarios**:

1. **Given** an old LZ-String URL (`?d=...`), **When** opened after Binary Codec deployment, **Then** the invoice displays correctly using the LZ-String decoder
2. **Given** a mixed set of old and new URLs, **When** the decoder processes them, **Then** it correctly routes each to the appropriate parser based on parameter (`d` vs `b`)

---

### User Story 4 - Developer Compares Compression Methods (Priority: P3)

A developer wants to understand the compression benefits and verify the codec is working correctly. A comparison page shows side-by-side metrics.

**Why this priority**: This is a developer tool, not a user-facing feature. Nice to have for debugging and optimization validation.

**Independent Test**: Open `/compare` page, generate random invoices, verify compression ratios match expected benchmarks.

**Acceptance Scenarios**:

1. **Given** the comparison page, **When** a random invoice is generated, **Then** the page shows byte sizes for LZ-String, Binary V1, V2, and V3
2. **Given** the comparison metrics, **When** reviewing V3 vs LZ-String, **Then** V3 shows 40-50% smaller size for typical invoices

---

### Edge Cases

- What happens when text fields contain only ASCII vs Unicode characters? (Compression efficiency varies)
- How does the system handle malformed binary data in URL? (Graceful error with user-friendly message)
- What happens when a V3 URL is generated with pako unavailable? (Fallback to V2 or error)
- How does the system handle invoices at exactly 2000-byte boundary? (Strict validation prevents overflow)
- What if token address is not in dictionary but is a valid hex string? (Fallback to raw 20-byte encoding)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST generate Binary Codec URLs using `?b=` parameter for new invoices
- **FR-002**: System MUST decode both `?d=` (LZ-String) and `?b=` (Binary) URLs automatically based on parameter
- **FR-003**: System MUST preserve 100% of invoice data through encode/decode round-trip (bit-perfect)
- **FR-004**: System MUST detect binary codec version from encoded data and route to correct parser
- **FR-005**: System MUST compress UUIDs from 36 characters to 16 bytes
- **FR-006**: System MUST compress Ethereum addresses from 42 characters to 20 bytes
- **FR-007**: System MUST use varint encoding for small integers (chain ID, decimals)
- **FR-008**: System MUST use dictionary compression for common currencies (USDC, USDT, DAI, ETH, etc.)
- **FR-009**: System MUST use dictionary compression for common token addresses (top 10 ERC-20)
- **FR-010**: System MUST apply text compression only when beneficial (>100 bytes AND compressed < raw)
- **FR-011**: System MUST validate URL length before generation and block if exceeding 2000 bytes
- **FR-012**: System MUST display user-friendly error messages for malformed URLs (no stack traces)
- **FR-013**: System MUST support all existing InvoiceSchemaV1 fields without modification
- **FR-014**: System MUST never modify existing LZ-String decoder logic (Constitutional Principle IV)

### Key Entities

- **BinaryBuffer**: Byte array accumulator for building encoded data, with varint/fixed-width writers
- **Dictionary**: Mapping of common values (currencies, tokens) to 1-byte codes for compression
- **VersionedCodec**: Abstraction for V1/V2/V3 encoders and decoders with version detection
- **CompressionResult**: Encoded string with metadata (version, size, prefix character)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Typical invoice (5 line items) URL size is under 400 bytes (down from ~800+ bytes with LZ-String)
- **SC-002**: Binary V3 achieves 45-50% compression improvement over LZ-String for typical invoices
- **SC-003**: 100% of existing `?d=` URLs continue to decode correctly (backward compatibility)
- **SC-004**: Invoice URL capacity increases from 2-3 line items to 5-7 line items within 2000-byte limit
- **SC-005**: URL generation and decoding completes in under 100ms on standard devices
- **SC-006**: Round-trip accuracy is 100% (decoded invoice matches original in all fields)
- **SC-007**: All binary codec URLs pass validation and load successfully on first attempt

## Assumptions

- Users have modern browsers with TextEncoder/TextDecoder support (ES2015+)
- pako library is available for deflate/inflate compression
- Invoice schema remains at V1 for this feature (no schema changes)
- Dictionary values (currencies, tokens) are stable and curated based on common usage
- Text compression threshold of 100 bytes is optimal for typical invoice content
- Base62 encoding is preferred over Base64 for URL safety without escaping

## Dependencies

- P0.2 (URL State Codec) - Existing LZ-String implementation to preserve
- Constitutional Principle IV (Backward Compatibility) - Must not break old URLs
- pako library for deflate compression in V3

## Out of Scope

- Modifying InvoiceSchemaV1 structure
- Supporting new invoice fields or schema versions
- Mobile app or native implementations (web only)
- Offline/PWA compression caching
- Analytics or telemetry on compression performance
