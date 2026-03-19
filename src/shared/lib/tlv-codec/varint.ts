/**
 * Varint Utilities
 *
 * Variable-length integer encoding for TLV codec.
 * Smaller numbers take fewer bytes (1-5 bytes for 32-bit, unlimited for BigInt).
 */

/**
 * Writes a varint (variable-length integer) to a number array buffer.
 */
export function writeVarInt(buffer: number[], value: number): void {
  while (value > 0x7F) {
    buffer.push((value & 0x7F) | 0x80)
    value >>>= 7
  }
  buffer.push(value & 0x7F)
}

/**
 * Reads a varint from a Uint8Array at the given offset.
 */
export function readVarInt(bytes: Uint8Array, offset: number): { value: number; bytesRead: number } {
  const MAX_BYTES = 5 // max for uint32 (35 bits encoded)
  let value = 0
  let shift = 0
  let bytesRead = 0

  while (offset + bytesRead < bytes.length) {
    if (bytesRead >= MAX_BYTES) {
      throw new Error('Varint overflow: too many continuation bytes')
    }
    const byte = bytes[offset + bytesRead] ?? 0
    bytesRead++
    value |= (byte & 0x7F) << shift
    if ((byte & 0x80) === 0) break
    shift += 7
  }

  return { value: value >>> 0, bytesRead }
}

/**
 * Writes a BigInt as a variable-length integer.
 *
 * Uses 7 bits data + 1 bit continuation per byte, same encoding as writeVarInt
 * but supports arbitrary precision.
 *
 * @example
 * const buffer: number[] = []
 * writeBigIntVarInt(buffer, 150000000n)  // $150.00 USDC in atomic units
 */
export function writeBigIntVarInt(buffer: number[], value: bigint): void {
  const ZERO = BigInt(0)
  const MASK_7BIT = BigInt(0x7F)
  const SEVEN = BigInt(7)

  if (value < ZERO) {
    throw new Error('writeBigIntVarInt: negative values not supported')
  }

  if (value === ZERO) {
    buffer.push(0)
    return
  }

  let remaining = value
  while (remaining > MASK_7BIT) {
    buffer.push(Number(remaining & MASK_7BIT) | 0x80)
    remaining = remaining >> SEVEN
  }
  buffer.push(Number(remaining & MASK_7BIT))
}

/**
 * Reads a BigInt varint from a Uint8Array at the given offset.
 *
 * @example
 * const bytes = new Uint8Array([128, 194, 215, 71])
 * const result = readBigIntVarInt(bytes, 0)
 * // result: { value: 150000000n, bytesRead: 4 }
 */
export function readBigIntVarInt(bytes: Uint8Array, offset: number): { value: bigint; bytesRead: number } {
  const MAX_BYTES = 16 // 112 bits — far exceeds uint256 needs for atomic amounts
  const ZERO = BigInt(0)
  const SEVEN = BigInt(7)

  let value = ZERO
  let shift = ZERO
  let bytesRead = 0

  while (offset + bytesRead < bytes.length) {
    if (bytesRead >= MAX_BYTES) {
      throw new Error('BigInt varint overflow: too many continuation bytes')
    }
    const byte = bytes[offset + bytesRead] ?? 0
    bytesRead++
    value = value | (BigInt(byte & 0x7F) << shift)
    if ((byte & 0x80) === 0) break
    shift = shift + SEVEN
  }

  return { value, bytesRead }
}

/**
 * Writes a BigInt amount as mantissa + trailing zero count.
 *
 * Format: [mantissa: BigInt varint][trailing_zero_count: uint8]
 * Saves bytes for amounts like 10^18 (1 ETH) or 10^8 (1 USDC).
 *
 * @example
 * const buf: number[] = []
 * writeMantissa(buf, 100000000n)  // $100 USDC → mantissa=1, zeros=8 → 2 bytes
 */
export function writeMantissa(buf: number[], value: bigint): void {
  if (value === 0n) {
    writeBigIntVarInt(buf, 0n)
    buf.push(0)
    return
  }
  let zeros = 0
  let mantissa = value
  while (mantissa > 0n && mantissa % 10n === 0n) {
    mantissa /= 10n
    zeros++
  }
  writeBigIntVarInt(buf, mantissa)
  buf.push(zeros)
}

/**
 * Reads a mantissa-encoded BigInt from a Uint8Array at the given offset.
 *
 * @returns mantissa, zeros, reconstructed value, and total bytes consumed
 */
export function readMantissa(
  bytes: Uint8Array,
  offset: number,
): { mantissa: bigint; zeros: number; value: bigint; bytesRead: number } {
  const { value: mantissa, bytesRead: mBytes } = readBigIntVarInt(bytes, offset)
  const zeros = bytes[offset + mBytes]!
  const value = mantissa * 10n ** BigInt(zeros)
  return { mantissa, zeros, value, bytesRead: mBytes + 1 }
}

/**
 * Writes a fractional quantity as [scale: uint8][scaled_value: varint].
 *
 * Finds minimum scale (0–9) such that qty * 10^scale is an integer.
 *
 * @example
 * const buf: number[] = []
 * writeQuantity(buf, 1.5)   // scale=1, value=15 → 2 bytes
 * writeQuantity(buf, 0.25)  // scale=2, value=25 → 2 bytes
 */
export function writeQuantity(buf: number[], qty: number): void {
  let scale = 0
  let scaled = qty
  while (scale < 9 && Math.round(scaled) !== scaled) {
    scale++
    scaled = qty * Math.pow(10, scale)
  }
  scaled = Math.round(scaled)
  buf.push(scale)
  writeVarInt(buf, scaled)
}

/**
 * Reads a quantity-encoded number from a Uint8Array at the given offset.
 */
export function readQuantity(
  bytes: Uint8Array,
  offset: number,
): { value: number; bytesRead: number } {
  const scale = bytes[offset]!
  const { value: scaled, bytesRead } = readVarInt(bytes, offset + 1)
  return { value: scaled / Math.pow(10, scale), bytesRead: 1 + bytesRead }
}
