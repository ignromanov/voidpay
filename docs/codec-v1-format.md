# VoidPay Invoice Codec v1 — Format Specification

> **Version**: 1.2 (optimized)
> **Status**: Stable (format locked)
> **Date**: 2026-03-19
> **Reference Implementation**: `@voidpay/codec` (TypeScript)

---

## 1. Overview

VoidPay Codec v1 is a binary TLV (Type-Length-Value) format for encoding crypto invoices into URL-safe strings. The entire invoice is encoded into a URL hash fragment — **no server ever sees the data**.

```
https://voidpay.xyz/pay#<Base64url-encoded binary>
                        └─ Hash fragment (never sent to server)
```

### Design Principles

- **Self-describing**: Each field carries its own type tag — decoders skip unknown fields gracefully
- **Forward-compatible**: Even types = required (reject if unknown), odd types = optional (skip if unknown)
- **Compact**: Chain/token/currency dictionaries, varint encoding, mantissa+zeros for amounts, delta timestamps, whole-payload Brotli compression, app-level text dictionary
- **Secure**: Per-invoice random salt (16 bytes, 128-bit), full keccak256 domain separator (32 bytes), type spoofing protection, optional EIP-712 signatures
- **URL-safe**: Base64url encoding (RFC 4648 §5) fits within 2000-byte URL limit for QR compatibility

---

## 2. Encoding Pipeline

```
Invoice Object
  → Build TLV records (one per field)
  → Encode chain ID via dictionary (§4.5)
  → Encode dueAt as delta from issuedAt (varint)
  → Encode quantities with scale encoding (§5.1)
  → Encode rates/total with mantissa + trailing zeros (§5.2)
  → Apply app-level text dictionary to all text fields + item descriptions (§6.1)
  → Generate 16-byte random salt (Type 20)
  → Sort records ascending by type (canonical ordering)
  → Compute full keccak256 domain separator hash, 32 bytes (Type 31)
  → Serialize: 3-byte header + TLV records
  → Whole-payload Brotli compression (§6.2) — VERSION high bit signals compression
  → Base64url encode (no padding)
  → Append to URL as hash fragment
```

### Base64url Alphabet (RFC 4648 §5)

```
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_
```

No padding (`=` stripped). Uses native `btoa`/`atob` with `+/` → `-_` translation.

---

## 3. Binary Format

### 3.1 Header (3 bytes, fixed)

```
Offset  Size  Field       Value
0       1     Magic       0x56 ('V')
1       1     Version     0x01 (low 7 bits) | compression flag (high bit)
2       1     TLV Count   Number of TLV records in payload (max 64)
```

**Version byte encoding**: `version & 0x7F` = codec version (always `0x01`). `version & 0x80` = whole-payload Brotli flag:
- `0x01` — uncompressed: bytes 2+ are `[COUNT][TLV records...]`
- `0x81` — compressed: bytes 2+ are `brotli([COUNT][TLV records...])`

Decoder MUST check the high bit. If set, decompress before parsing TLV records. If Brotli expansion occurs (compressed >= raw), the encoder falls back to `0x01` (uncompressed).

### 3.2 TLV Record Structure

```
[Type: 1 byte] [Length: varint] [Value: <Length> bytes]
```

- **Type**: uint8 (0–255)
- **Length**: varint-encoded (1–5 bytes, see §8)
- **Value**: raw bytes, format depends on type

### 3.3 Odd/Even Rule

Inspired by [BOLT #1](https://github.com/lightning/bolts/blob/master/01-messaging.md):

| Type parity | Semantics | Decoder behavior |
|-------------|-----------|------------------|
| **Even** | Required | MUST reject invoice if type is unknown |
| **Odd** | Optional | MUST skip silently if type is unknown |

This enables future codec versions to add optional fields without breaking existing decoders.

### 3.4 Canonical Ordering

- Records MUST be sorted ascending by type number
- Duplicate types MUST NOT appear
- Decoder MUST reject violations

---

## 4. Type Registry

### 4.1 Required Types (even)

| Type | Name | Value Format | Size |
|------|------|-------------|------|
| 2 | `chainId` | chain dictionary (§4.5) | 2–5 |
| 4 | `issuedAt` | uint32 BE (unix timestamp) | 4 |
| 6 | `dueAt` | varint delta from issuedAt (§4.6) | 1–4 |
| 8 | `decimals` | uint8 (token decimal places) | 1 |
| 10 | `fromWallet` | raw bytes (20 bytes for EVM) | 20 |
| 12 | `currency` | prefix byte + payload (§4.3) | 2–10 |
| 14 | `items` | packed binary (§5) | variable |
| 16 | `fromName` | UTF-8 string (app-dict applied) | variable |
| 18 | `clientName` | UTF-8 string (app-dict applied) | variable |
| 20 | `salt` | random bytes (`crypto.getRandomValues`) | 16 |
| 22 | `invoiceId` | UTF-8 string | variable |
| 24 | `total` | mantissa + trailing zeros (§5.2) — **final payment amount (includes magicDust if applied)** | variable |

### 4.2 Optional Types (odd)

| Type | Name | Value Format | Size |
|------|------|-------------|------|
| 1 | `tokenAddress` | prefix byte + payload (§4.4) | 2–21 |
| 3 | `clientWallet` | raw bytes (20 bytes for EVM) | 20 |
| 5 | `notes` | UTF-8 string (app-dict applied) | variable |
| 7 | `fromEmail` | UTF-8 string (app-dict applied) | variable |
| 9 | `fromPhone` | UTF-8 string (app-dict applied) | variable |
| 11 | `fromAddress` | UTF-8 string (app-dict applied, physical address) | variable |
| 13 | `clientEmail` | UTF-8 string (app-dict applied) | variable |
| 15 | `clientPhone` | UTF-8 string (app-dict applied) | variable |
| 17 | `clientAddress` | UTF-8 string (app-dict applied, physical address) | variable |
| 19 | `tax` | UTF-8 string (percentage, e.g. "8.25%") | variable |
| 21 | `discount` | UTF-8 string (percentage) | variable |
| 27 | `memo` | UTF-8 string (reserved) | variable |
| 29 | `ttl` | uint32 BE (unix timestamp, ERC-3009 validBefore) | 4 |
| 31 | `domainSeparator` | full keccak256 hash (§7.3) — **mandatory** | 32 |
| 33 | `signature` | EIP-712 typed data signature (§7.5) | 65 |
| 35 | `fromTaxId` | UTF-8 string | variable |
| 37 | `clientTaxId` | UTF-8 string | variable |
| 39 | `recurring` | reserved | variable |
| 253 | `compressedText` | grouped Brotli block (§6.2) | variable |

### 4.3 Currency Encoding (Type 12)

```
Byte 0: 0x00 = dictionary lookup, 0x01 = raw UTF-8
Byte 1+: dictionary code (1 byte) OR raw currency symbol
```

### 4.4 Token Address Encoding (Type 1)

```
Byte 0: 0x00 = dictionary lookup, 0x01 = raw address
Byte 1+: dictionary code (1 byte) OR raw 20-byte address
```

### 4.5 Chain ID Encoding (Type 2)

```
Byte 0: 0x00 = dictionary lookup, 0x01 = raw varint
Byte 1+: dictionary code (1 byte) OR varint chain ID
```

Chain dictionary:

| Code | Chain | Chain ID |
|------|-------|----------|
| 1 | Ethereum | 1 |
| 2 | Arbitrum | 42161 |
| 3 | Optimism | 10 |
| 4 | Polygon | 137 |
| 5 | Base | 8453 |

Known chains encode as 2 bytes (`[0x00, code]`). Unknown chains encode as `[0x01, varint(chainId)]`.

### 4.6 Delta Timestamp Encoding (Type 6 — dueAt)

`dueAt` is stored as a **varint delta** from `issuedAt`:

```
dueAt_value = varint(dueAt - issuedAt)
```

Typical delta (30 days = 2,592,000 seconds) fits in 3 varint bytes vs. 4 bytes for uint32 BE. Decoder reconstructs: `dueAt = issuedAt + delta`.

---

## 5. Items Encoding (Type 14)

Line items are packed into a single TLV record:

```
[count: varint]
  per item:
    [desc_len: varint] [description: UTF-8]
    [scale: uint8] [scaled_value: varint]        ← quantity (§5.1)
    [mantissa: BigInt varint] [zeros: uint8]      ← rate (§5.2)
```

- `rate` is in **atomic units** (e.g., `"150000000"` = $150.00 USDC with 6 decimals)
- `quantity` uses scale encoding for fractional values (e.g., 1.5 hours)
- Maximum items: application-defined (VoidPay uses 5)

### 5.1 Quantity Scale Encoding

Finds minimum scale (0–9) such that `qty × 10^scale` is an integer:

```
writeQuantity(1.5)   → [scale=1] [value=15]   = 2 bytes
writeQuantity(0.25)  → [scale=2] [value=25]   = 2 bytes
writeQuantity(100)   → [scale=0] [value=100]  = 2 bytes
```

Replaces float32 (4 bytes) — saves 2 bytes per item for common quantities.

### 5.2 Mantissa + Trailing Zeros Encoding

For BigInt amounts that often have many trailing zeros (e.g., `100000000` for $100 USDC):

```
writeMantissa(100000000n)  → [mantissa=1n] [zeros=8]  = 2 bytes
writeMantissa(1000000000000000000n)  → [mantissa=1n] [zeros=18]  = 2 bytes (1 ETH!)
```

Format: `[mantissa: BigInt varint] [trailing_zero_count: uint8]`

Decoder reconstructs: `value = mantissa × 10^zeros`

### 5.3 Total Encoding (Type 24)

The total stored is the **final payment amount**. If magicDust was applied at creation time, the total already includes it (total = subtotal + magicDust). If magicDust was not applied (user disabled it), the total equals the subtotal. The decoder reads this value as-is — it is the definitive amount the payer must send. MagicDust can be derived from salt for display purposes (showing the subtotal/dust breakdown).

---

## 6. Text Optimization

### 6.1 Application-Level Text Dictionary

Before Brotli compression, common text patterns are replaced with single-byte control characters (0x02–0x0F range):

| Code | Pattern | Bytes saved |
|------|---------|-------------|
| 0x02 | `@outlook.com` | 11 |
| 0x0C | `@hotmail.com` | 11 |
| 0x0D | `development` | 10 |
| 0x0E | `consulting` | 9 |
| 0x03 | `@gmail.com` | 9 |
| 0x04 | `@yahoo.com` | 9 |
| 0x05 | `https://` | 7 |
| 0x06 | `Invoice` | 6 |
| 0x07 | `Payment` | 6 |
| 0x09 | `.com` | 3 |
| 0x0F | `INV-` | 3 |

Applied to all text fields **and item descriptions** before encoding. Reversed after decoding. Substitutions are sorted by length descending (longest match first) to avoid partial replacements.

Pattern selection criteria (validated via benchmark):
- Patterns ≥ 4 bytes preferred — Brotli's static dictionary handles shorter patterns efficiently
- ROI = `(pattern.length - 1) × expected_frequency` — higher is better
- Removed from v1.1: `0x` (2 chars, too short), `.eth` (ROI 0.2, Brotli handles it)
- Added in v1.2: `INV-` (ROI 2.4), `development` (ROI 2.0), `@hotmail.com` (ROI 1.1), `consulting` (ROI 0.5)

> **Note**: `0x0A` (newline) and `0x0B` are intentionally skipped to avoid collision with `\n` in multiline address fields.

### 6.2 Whole-Payload Brotli Compression

Instead of compressing individual text fields, the **entire TLV payload** is Brotli-compressed after serialization. This gives the compressor maximum context across all fields — binary headers, text, addresses — in one pass.

```
Encode: writeTlv(records) → [MAGIC][VERSION][COUNT][TLV...]
        → brotli(body) where body = [COUNT][TLV...]
        → [MAGIC][VERSION|0x80][compressed_body]
        → Base64url

Decode: Base64url → bytes
        → check VERSION high bit
        → if 0x80: decompress bytes[2:] → prepend [MAGIC][VERSION&0x7F]
        → readTlv normally
```

Compression uses Brotli quality 11 (maximum) via `node:zlib` (`brotliCompressSync`).

If Brotli output is **larger** than raw input (possible for very small payloads), the encoder falls back to uncompressed format (VERSION = `0x01`, no high bit).

**No threshold**: unlike the previous Type 253 approach (100-byte minimum), whole-payload compression has no minimum size — the `compressed < raw` check is the only gate.

### Type 253 (Legacy)

Type 253 (`compressedText`) is retained in the type registry for backward compatibility but is **no longer emitted** by the encoder. Decoders SHOULD still handle Type 253 if encountered (for URLs generated by older codec versions). The whitelist rule still applies: only type_ids `{5, 7, 9, 11, 13, 15, 17, 35, 37}` are allowed inside a Type 253 block.

---

## 7. Security

### 7.1 Salt & Magic Dust (Type 20, required)

16 bytes (128 bits) from `crypto.getRandomValues()`, per NIST SP 800-132 recommendation for salts in integrity constructions. Provides 2^64 birthday collision resistance at ~2^64 invoices — far beyond any realistic usage.

Decoder MUST reject invoices with missing or < 16-byte salt.

Salt serves as a derivation primitive:

```
derivePRNG(salt, label) = HMAC-SHA256(salt, UTF-8(label))
```

Used for deterministic magic dust generation: `(uint32(derived[0..3]) % 999) + 1`

Magic dust is applied at **creation time**: if the user enables magic dust, the encoder derives it from salt, adds it to the subtotal, and stores the result as TOTAL (Type 24). The decoder reads TOTAL as-is — it is the definitive payment amount. For display purposes (showing the subtotal/dust breakdown), the decoder can re-derive magic dust from salt and check if `total - sumOfItems == derivedDust`.

### 7.2 Canonical Ordering

Records sorted ascending by type. Decoder validates — rejects non-ascending or duplicate types. Ensures deterministic binary output for domain separator computation.

### 7.3 Domain Separator (Type 31, mandatory)

```
hash = keccak256( UTF-8("VOIDPAY_INVOICE_V1") || serialized_body )
```

Where `serialized_body` = concatenation of `[type(1)] [length(varint)] [value(n)]` for all records **except** Type 31 itself, in canonical order. The length uses varint encoding matching the on-wire TLV format, preventing field boundary confusion in the hash preimage.

The full 32-byte keccak256 output is used without truncation. This provides:
- 2^128 birthday collision resistance — far exceeds any realistic attack
- 2^256 preimage resistance — infeasible for any attacker

Encoder: MUST compute after all other records, insert at canonical position.
Decoder: MUST recompute and compare — reject on mismatch or if absent.
Despite Type 31 being odd (normally optional by the even/odd rule), this implementation requires it for integrity protection.

> **Note**: Domain separator is an integrity checksum, not a cryptographic signature. It protects against data corruption and cross-protocol collision, but not intentional forgery. For anti-tampering, use EIP-712 signatures (§7.5).

### 7.4 Contract Binding

Implicit through existing types:
- Type 1 (`tokenAddress`) stores full 20-byte contract address
- Type 8 (`decimals`) baked at creation time

Decoder cross-check: if token is in dictionary → `dict.decimals` MUST match Type 8 value.

### 7.5 EIP-712 Signature (Type 33, optional)

Optional invoice authenticity via EIP-712 typed data signatures:

```
Type 33 value: [v: uint8] [r: 32 bytes] [s: 32 bytes] = 65 bytes total
```

Typed data structure:

```
VoidPayInvoice(
  bytes32 domainSeparator,
  uint256 chainId,
  address recipient,
  uint256 amount,
  uint256 issuedAt
)
```

- `domainSeparator`: Type 31 value (keccak256 integrity hash)
- `recipient`: Type 10 (`fromWallet`)
- `amount`: Type 24 (`total`, subtotal in atomic units)

Verifier recovers signer address via `ecrecover` and compares to `fromWallet`.

Since Type 33 is odd, decoders that don't support signatures skip it silently.

### 7.6 Hardening Limits

| Limit | Value | Action |
|-------|-------|--------|
| Max TLV count | 64 | Reject |
| Max single value | 4,096 bytes | Reject |
| Max total payload | 1,481 bytes (pre-Base64url) | Reject at encode |
| Max inflated size | 16,384 bytes | Reject (decompression bomb) |
| Min salt length | 16 bytes | Reject |

### 7.7 URL Budget

```
URL limit:           2,000 bytes
Prefix:              ~25 bytes (https://voidpay.xyz/pay#)
Available:           1,975 bytes
Base64url ratio:     ×1.333 (3 bytes → 4 chars)
Max raw payload:     ~1,481 bytes
Typical invoice:     200–560 bytes → 270–750 chars
```

---

## 8. Varint Encoding

Variable-length unsigned integer encoding (same as Protocol Buffers):

```
Each byte: [continuation_bit(1)] [data_bits(7)]

If MSB = 1: more bytes follow
If MSB = 0: this is the last byte

Little-endian byte order within the varint.
```

| Value | Bytes | Encoded |
|-------|-------|---------|
| 0 | 1 | `0x00` |
| 127 | 1 | `0x7F` |
| 128 | 2 | `0x80 0x01` |
| 16384 | 3 | `0x80 0x80 0x01` |

**BigInt varint**: Same encoding, supports arbitrary precision for atomic unit amounts (e.g., 10^18 wei). Max 16 continuation bytes (112 bits).

---

## 9. Dictionaries

### 9.1 Currency Dictionary

| Code | Symbol |
|------|--------|
| 1 | USDC |
| 2 | USDT |
| 3 | DAI |
| 4 | ETH |
| 5 | WETH |
| 6 | MATIC |
| 7 | POL |
| 8 | WBTC |
| 9 | USDC.e |
| 10 | EURC |
| 11 | USDT0 |

### 9.2 Token Address Dictionary

Range convention: **1–9** Ethereum, **10–19** Arbitrum, **20–29** Optimism, **30–39** Polygon, **40–49** Base.

#### Ethereum (chain 1)

| Code | Token | Decimals | Address |
|------|-------|----------|---------|
| 1 | USDC | 6 | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| 2 | USDT | 6 | `0xdAC17F958D2ee523a2206206994597C13D831ec7` |
| 3 | DAI | 18 | `0x6B175474E89094C44Da98b954EedeAC495271d0F` |
| 4 | WETH | 18 | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` |
| 5 | WBTC | 8 | `0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599` |
| 6 | EURC | 6 | `0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c` |
| 7 | USDT0 | 6 | `0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee` |

#### Arbitrum (chain 42161)

| Code | Token | Decimals | Address |
|------|-------|----------|---------|
| 10 | USDC | 6 | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| 11 | USDC.e | 6 | `0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8` |
| 12 | USDT | 6 | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` |
| 13 | DAI | 18 | `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1` |
| 14 | WETH | 18 | `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1` |
| 15 | WBTC | 8 | `0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f` |

#### Optimism (chain 10)

| Code | Token | Decimals | Address |
|------|-------|----------|---------|
| 20 | USDC | 6 | `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85` |
| 21 | USDC.e | 6 | `0x7F5c764cBc14f9669B88837ca1490cCa17c31607` |
| 22 | USDT | 6 | `0x94b008aA00579c1307B0EF2c499aD98a8ce58e58` |
| 24 | WETH | 18 | `0x4200000000000000000000000000000000000006` |
| 25 | WBTC | 8 | `0x68f180fcCe6836688e9084f035309E29Bf0A2095` |

#### Polygon (chain 137)

| Code | Token | Decimals | Address |
|------|-------|----------|---------|
| 30 | USDC | 6 | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` |
| 31 | USDC.e | 6 | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` |
| 32 | USDT | 6 | `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` |
| 33 | DAI | 18 | `0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063` |
| 34 | WETH | 18 | `0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619` |
| 35 | WBTC | 8 | `0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6` |

#### Base (chain 8453)

| Code | Token | Decimals | Address |
|------|-------|----------|---------|
| 40 | USDC | 6 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| 41 | USDbC | 6 | `0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA` |
| 42 | DAI | 18 | `0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb` |
| 43 | WETH | 18 | `0x4200000000000000000000000000000000000006` |
| 44 | WBTC | 8 | `0x0555E30da8f98308EdB960aa94C0ED47230d2B9c` |
| 45 | EURC | 6 | `0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42` |

---

## 10. Example

### Minimal Invoice

```json
{
  "invoiceId": "INV-001",
  "issuedAt": 1704067200,
  "dueAt": 1706745600,
  "networkId": 1,
  "currency": "USDC",
  "decimals": 6,
  "from": {
    "name": "Alice",
    "walletAddress": "0x1234567890123456789012345678901234567890"
  },
  "client": { "name": "Bob" },
  "items": [{ "description": "Consulting", "quantity": 1, "rate": "150000000" }],
  "total": "150000000"
}
```

### Encoded TLV Records (conceptual)

```
Type  2 (chainId):     [0x00, 0x01] (dict: Ethereum=1)
Type  4 (issuedAt):    uint32BE(1704067200)
Type  6 (dueAt):       varint(2678400) — delta from issuedAt (31 days)
Type  8 (decimals):    [0x06]
Type 10 (fromWallet):  <20 bytes>
Type 12 (currency):    [0x00, 0x01] (dict: USDC=1)
Type 14 (items):       [count=1][descLen][desc][scale=0][qty=1][mantissa=15][zeros=7]
Type 16 (fromName):    UTF-8("Alice")
Type 18 (clientName):  UTF-8("Bob")
Type 20 (salt):        <16 random bytes>
Type 22 (invoiceId):   UTF-8("INV-001")
Type 24 (total):       [mantissa=15] [zeros=7] — 150000000 = 15×10^7 (final amount, includes magicDust if applied)
Type 31 (domainSep):   keccak256(prefix || body)  — full 32 bytes
```

### Final URL

```
https://voidpay.xyz/pay#VgEMAAE...  (Base64url of binary)
```

---

## 11. Versioning

- Codec version is in header byte 1, low 7 bits (currently `0x01`). High bit = compression flag.
- No separate "invoice schema version" field — the codec version is the single version identifier
- Format is **locked** once deployed — changes require a new codec version
- Forward compatibility via odd/even rule: new optional types can be added without version bump
- Compression is transparent: same version, just a flag bit. Decoders handle both compressed and uncompressed payloads.

---

## 12. Changelog

| Date | Change |
|------|--------|
| 2026-03-17 | v1.0 — Initial TLV format |
| 2026-03-19 | v1.1 — Full rewrite: Base62→Base64url, DEFLATE→Brotli, 4B→3B header (removed flags), 2B BE→varint TLV lengths, float32→scale quantity, BigInt varint→mantissa+zeros amounts, chain dictionary, app-level text dictionary, delta dueAt, subtotal (no magicDust in TLV), EIP-712 signatures (Type 33), `0x0A`→`0x0B` dict code fix |
| 2026-03-19 | v1.2 — Compression optimization: Type 253 grouped compression → whole-payload Brotli (VERSION high bit 0x80 signals compression, no threshold), app-dict applied to item descriptions, updated dictionary (removed `0x`/`.eth`, added `INV-`/`development`/`consulting`/`@hotmail.com`) |
| 2026-03-20 | v1.3 — Security hardening: salt restored to 16 bytes (128-bit, NIST SP 800-132), domain separator restored to full 32-byte keccak256 (no truncation), TOTAL stores final payment amount (includes magicDust if applied at creation), MAGIC byte validated before decompression, Base64url pad=1 rejection, mantissa zeros capped at 30, reverseDict output length capped at 4096, EIP-712 domain includes chainId, viem hex utilities |

---

## License

This specification is part of VoidPay, released under the MIT License.
