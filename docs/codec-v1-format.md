# VoidPay Invoice Codec v1 — Format Specification

> **Version**: 1.0
> **Status**: Stable (format locked)
> **Date**: 2026-03-17
> **Reference Implementation**: `@voidpay/codec` (TypeScript)

---

## 1. Overview

VoidPay Codec v1 is a binary TLV (Type-Length-Value) format for encoding crypto invoices into URL-safe strings. The entire invoice is encoded into a URL hash fragment — **no server ever sees the data**.

```
https://voidpay.xyz/pay#<Base62-encoded binary>
                        └─ Hash fragment (never sent to server)
```

### Design Principles

- **Self-describing**: Each field carries its own type tag — decoders skip unknown fields gracefully
- **Forward-compatible**: Even types = required (reject if unknown), odd types = optional (skip if unknown)
- **Compact**: Token/currency dictionaries, varint encoding, optional grouped text compression
- **Secure**: Per-invoice random salt, keccak256 domain separator, type spoofing protection
- **URL-safe**: Base62 encoding fits within 2000-byte URL limit for QR compatibility

---

## 2. Encoding Pipeline

```
Invoice Object
  → Build TLV records (one per field)
  → Generate 16-byte random salt (Type 20)
  → Optionally compress text fields into Type 253
  → Sort records ascending by type (canonical ordering)
  → Compute domain separator hash (Type 31)
  → Serialize: 4-byte header + TLV records
  → Base62 encode
  → Append to URL as hash fragment
```

### Base62 Alphabet

```
0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
```

No padding. Big-endian byte interpretation.

---

## 3. Binary Format

### 3.1 Header (4 bytes, fixed)

```
Offset  Size  Field       Value
0       1     Magic       0x56 ('V')
1       1     Version     0x01
2       1     Flags       0x00 (reserved, all zero in v1)
3       1     TLV Count   Number of TLV records in payload (max 64)
```

### 3.2 TLV Record Structure

```
[Type: 1 byte] [Length: 2 bytes BE] [Value: <Length> bytes]
```

- **Type**: uint8 (0–255)
- **Length**: uint16 big-endian (max value per record: 4096 bytes)
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
| 2 | `chainId` | varint (EVM chain ID) | 1–4 |
| 4 | `issuedAt` | uint32 BE (unix timestamp) | 4 |
| 6 | `dueAt` | uint32 BE (unix timestamp) | 4 |
| 8 | `decimals` | uint8 (token decimal places) | 1 |
| 10 | `fromWallet` | raw bytes (20 bytes for EVM) | 20 |
| 12 | `currency` | prefix byte + payload (see §4.3) | 2–10 |
| 14 | `items` | packed binary (see §5) | variable |
| 16 | `fromName` | UTF-8 string | variable |
| 18 | `clientName` | UTF-8 string | variable |
| 20 | `salt` | random bytes (`crypto.getRandomValues`) | 16 |
| 22 | `invoiceId` | UTF-8 string | variable |
| 24 | `total` | BigInt varint (atomic units) | variable |

### 4.2 Optional Types (odd)

| Type | Name | Value Format | Size |
|------|------|-------------|------|
| 1 | `tokenAddress` | prefix byte + payload (see §4.4) | 2–21 |
| 3 | `clientWallet` | raw bytes (20 bytes for EVM) | 20 |
| 5 | `notes` | UTF-8 string | variable |
| 7 | `fromEmail` | UTF-8 string | variable |
| 9 | `fromPhone` | UTF-8 string | variable |
| 11 | `fromAddress` | UTF-8 string (physical address) | variable |
| 13 | `clientEmail` | UTF-8 string | variable |
| 15 | `clientPhone` | UTF-8 string | variable |
| 17 | `clientAddress` | UTF-8 string (physical address) | variable |
| 19 | `tax` | UTF-8 string (percentage, e.g. "8.25") | variable |
| 21 | `discount` | UTF-8 string (percentage) | variable |
| 25 | `magicDust` | BigInt varint (atomic units, 1–999) | 1–2 |
| 29 | `ttl` | uint32 BE (unix timestamp, ERC-3009 validBefore) | 4 |
| 31 | `domainSeparator` | keccak256 hash (see §7.3) — **mandatory** | 32 |
| 35 | `fromTaxId` | UTF-8 string | variable |
| 37 | `clientTaxId` | UTF-8 string | variable |
| 253 | `compressedText` | grouped deflate block (see §6) | variable |

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

---

## 5. Items Encoding (Type 14)

Line items are packed into a single TLV record:

```
[count: varint]
  per item:
    [desc_len: varint] [description: UTF-8]
    [quantity: 4 bytes float32 BE]
    [rate_len: varint] [rate: BigInt varint bytes]
```

- `rate` is in **atomic units** (e.g., `"150000000"` = $150.00 USDC with 6 decimals)
- `quantity` uses IEEE 754 float32 for fractional values (e.g., 1.5 hours)
- Maximum items: application-defined (VoidPay uses 5)

---

## 6. Grouped Text Compression (Type 253)

Optional optimization for text-heavy invoices. When total text exceeds 100 bytes:

1. Collect values from eligible text types: 5, 7, 9, 11, 13, 15, 17, 35, 37
2. Encode as length-prefixed records:

```
[field_count: uint8]
  per field:
    [type_id: uint8]
    [value_len: varint] [value: UTF-8 bytes]
```

3. Deflate compress (RFC 1951, pako-compatible)
4. Store as Type 253 value; remove individual text TLV records

### Whitelist

Decoder MUST reject Type 253 blocks containing type_ids not in: `{5, 7, 9, 11, 13, 15, 17, 35, 37}`.

This prevents **type spoofing** — a malicious compressed block cannot overwrite business-critical fields like `total` (23) or `fromWallet` (10).

### Excluded from Compression

- Type 22 (`invoiceId`) — required even type, MUST appear as individual TLV
- Types 16, 18 (`fromName`, `clientName`) — required even types
- Types 19, 21 (`tax`, `discount`) — too short for compression benefit

---

## 7. Security

### 7.1 Salt (Type 20, required)

16 bytes from `crypto.getRandomValues()`. Prevents preimage dictionary attacks on public URLs.

Decoder MUST reject invoices with missing or < 16-byte salt.

Salt also serves as a derivation primitive:

```
derivePRNG(salt, label) = HMAC-SHA256(salt, UTF-8(label))
```

Used for deterministic magic dust generation: `(uint32(derived[0..3]) % 999) + 1`

### 7.2 Canonical Ordering

Records sorted ascending by type. Decoder validates — rejects non-ascending or duplicate types. Ensures deterministic binary output for domain separator computation.

### 7.3 Domain Separator (Type 31, mandatory)

```
hash = keccak256( UTF-8("VOIDPAY_INVOICE_V1") || serialized_body )
```

Where `serialized_body` = concatenation of `[type(1)] [length(2 BE)] [value(n)]` for all records **except** Type 31 itself, in canonical order. The length bytes mirror the on-wire TLV format, preventing field boundary confusion in the hash preimage.

- Encoder: MUST compute after all other records, insert at canonical position
- Decoder: MUST recompute and compare — reject on mismatch or if absent
- Despite Type 31 being odd (normally optional by the even/odd rule), this implementation requires it for integrity protection

> **Note**: Domain separator is an integrity checksum, not a cryptographic signature. It protects against data corruption and cross-protocol collision, but not intentional forgery. Anti-tampering requires EIP-712 signatures (planned for future versions).

### 7.4 Contract Binding

Implicit through existing types:
- Type 1 (`tokenAddress`) stores full 20-byte contract address
- Type 8 (`decimals`) baked at creation time

Decoder cross-check: if token is in dictionary → `dict.decimals` MUST match Type 8 value.

### 7.5 Hardening Limits

| Limit | Value | Action |
|-------|-------|--------|
| Max TLV count | 64 | Reject |
| Max single value | 4,096 bytes | Reject |
| Max total payload | 1,470 bytes (pre-Base62) | Reject at encode |
| Max inflated size | 16,384 bytes | Reject (decompression bomb) |
| Min salt length | 16 bytes | Reject |

### 7.6 URL Budget

```
URL limit:           2,000 bytes
Prefix:              ~25 bytes (https://voidpay.xyz/pay#)
Available:           1,975 bytes
Base62 ratio:        ×1.343
Max raw payload:     ~1,470 bytes
Typical invoice:     300–500 bytes → 400–670 chars
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

**BigInt varint**: Same encoding, supports arbitrary precision for atomic unit amounts (e.g., 10^18 wei).

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
Type  2 (chainId):     varint(1) = [0x01]
Type  4 (issuedAt):    uint32BE(1704067200)
Type  6 (dueAt):       uint32BE(1706745600)
Type  8 (decimals):    [0x06]
Type 10 (fromWallet):  <20 bytes>
Type 12 (currency):    [0x00, 0x01] (dict: USDC=1)
Type 14 (items):       <packed binary>
Type 16 (fromName):    UTF-8("Alice")
Type 18 (clientName):  UTF-8("Bob")
Type 20 (salt):        <16 random bytes>
Type 22 (invoiceId):   UTF-8("INV-001")
Type 24 (total):       BigInt varint(150000000)
Type 31 (domainSep):   keccak256(prefix || body)
```

### Final URL

```
https://voidpay.xyz/pay#2F8kN7xQ...  (Base62 of binary)
```

---

## 11. Versioning

- Codec version is in header byte 1 (currently `0x01`)
- No separate "invoice schema version" field — the codec version is the single version identifier
- Format is **locked** once deployed — changes require a new codec version
- Forward compatibility via odd/even rule: new optional types can be added without version bump

---

## License

This specification is part of VoidPay, released under the MIT License.
