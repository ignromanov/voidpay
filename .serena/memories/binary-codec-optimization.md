# Binary Codec URL Compression Optimization

**Status**: Experimental (P1.42 in Roadmap)
**Location**: `.specify/memory/brainstorm/09-binary-codec-optimization.md`
**Implementation**: `src/shared/lib/binary-codec/` (untracked, experimental)

## Quick Summary

Custom binary packing algorithm that achieves **45-50% better compression** than current LZ-String approach.

**Current Problem**: LZ-String limits to 2-3 invoice line items within 2000-byte URL constraint.

**Solution**: Binary Codec V3 (Hybrid Strategy)
- Binary packing for structured data (UUID, addresses, timestamps)
- Dictionary compression for common tokens/currencies
- Selective deflate compression for text fields
- Base62 encoding (URL-safe)

**Results**:
- Typical invoice: ~330 bytes (vs 612 bytes LZ-String) = 46% improvement
- Capacity: 5-7 line items (vs 2-3 current) = 2-3x more content

**Implementation Files**:
- `encoder-v3.ts`, `decoder-v3.ts` - V3 Hybrid codec
- `encoder-v2.ts`, `decoder-v2.ts` - V2 Enhanced (dictionary)
- `encoder.ts`, `decoder.ts` - V1 Basic binary
- `dictionary.ts` - Currency/token dictionaries
- `base62.ts` - URL-safe encoding
- `utils.ts` - Binary serialization utilities

**Backward Compatibility**: 
- Current URLs: `/pay?d=<lz-string>` (preserved forever)
- Binary URLs: `/pay?b=<base62>` (new parameter)
- Version detection: Prefix + byte 0 → routes to correct parser

**Key Techniques**:
- UUID: 36 chars → 16 bytes (55% savings)
- Addresses: 42 chars → 20 bytes (52% savings)
- Timestamps: 10 chars → 4 bytes (60% savings)
- Bit-packing: 11 flags → 2 bytes (9 bytes saved)
- Delta encoding: Due date as offset from issue date
- Dictionary: USDC/USDT/DAI → 1 byte codes
- pako.deflate: Text compression when beneficial (>100 bytes)

**Constitutional Compliance**: Principle IV (Backward Compatibility) - old parsers never modified, only additive.

**Developer Tools**: `/compare` page for visual comparison between LZ-String and Binary V1/V2/V3.

See full documentation in brainstorm file for implementation details, benchmarks, and integration plan.
