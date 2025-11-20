# Research & Technical Decisions

**Feature**: URL State Codec
**Date**: 2025-11-19

## Key Decisions

### 1. Compression Algorithm: `lz-string`
- **Decision**: Use `lz-string` library (LZW-based).
- **Rationale**:
  - Optimized for UTF-16 storage (localStorage/URL safe).
  - Proven track record in similar "state-in-URL" apps (e.g., Mermaid Live Editor).
  - Better compression ratio for JSON than raw Base64.
- **Alternatives Considered**:
  - `pako` (Deflate): Good but requires Base64 encoding which increases size by 33%, negating some gains.
  - `Brotli`: Better ratio but lacks ubiquitous client-side JS support without WASM overhead.

### 2. Data Representation: Abbreviated Keys
- **Decision**: Map descriptive keys to 1-2 char codes (e.g., `issueDate` -> `iss`).
- **Rationale**:
  - JSON keys consume significant space.
  - Essential to fit complex invoices within 2000 bytes.
- **Trade-off**: Reduced readability of raw JSON, handled by strong TypeScript interfaces.

### 3. Numeric Precision: Stringified BigInts
- **Decision**: Store monetary values as strings representing BigInts.
- **Rationale**:
  - JavaScript `number` (IEEE 754) loses precision for large integers (safe up to 2^53).
  - Crypto amounts (Wei) often exceed this limit.
  - `BigInt` is not JSON serializable by default, so string serialization is required.

### 4. Date Format: Unix Timestamp (Seconds)
- **Decision**: Use integer seconds for `iss` and `due`.
- **Rationale**:
  - ISO 8601 strings (`2025-11-19T...`) take ~24 bytes.
  - Unix timestamp (`1732070000`) takes ~10 bytes.
  - Seconds precision is sufficient for invoice dates.
