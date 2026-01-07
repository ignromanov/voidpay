/**
 * Binary Codec Utilities
 *
 * Utilities for converting between different data types and binary representations.
 */

/**
 * Parses UUID string (with or without dashes) to 16 bytes
 * Example: "550e8400-e29b-41d4-a716-446655440000" -> Uint8Array(16)
 */
export function uuidToBytes(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, '');
  if (hex.length !== 32) {
    throw new Error(`Invalid UUID length: ${uuid}`);
  }

  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Converts 16 bytes back to UUID string with dashes
 */
export function bytesToUuid(bytes: Uint8Array): string {
  if (bytes.length !== 16) {
    throw new Error(`Invalid UUID bytes length: ${bytes.length}`);
  }

  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Parses Ethereum address (0x...) to 20 bytes
 */
export function addressToBytes(address: string): Uint8Array {
  const hex = address.startsWith('0x') ? address.slice(2) : address;
  if (hex.length !== 40) {
    throw new Error(`Invalid address length: ${address}`);
  }

  const bytes = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Converts 20 bytes back to Ethereum address (0x...)
 */
export function bytesToAddress(bytes: Uint8Array): string {
  if (bytes.length !== 20) {
    throw new Error(`Invalid address bytes length: ${bytes.length}`);
  }

  return '0x' + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Writes a 32-bit unsigned integer to buffer (Big Endian)
 */
export function writeUInt32(buffer: number[], value: number): void {
  buffer.push((value >>> 24) & 0xFF);
  buffer.push((value >>> 16) & 0xFF);
  buffer.push((value >>> 8) & 0xFF);
  buffer.push(value & 0xFF);
}

/**
 * Reads a 32-bit unsigned integer from buffer (Big Endian)
 */
export function readUInt32(bytes: Uint8Array, offset: number): { value: number; bytesRead: number } {
  const value = ((bytes[offset] ?? 0) << 24) |
                ((bytes[offset + 1] ?? 0) << 16) |
                ((bytes[offset + 2] ?? 0) << 8) |
                (bytes[offset + 3] ?? 0);
  return { value: value >>> 0, bytesRead: 4 }; // >>> 0 converts to unsigned
}

/**
 * Writes a varint (variable-length integer)
 * Smaller numbers take fewer bytes (1-5 bytes for 32-bit values)
 */
export function writeVarInt(buffer: number[], value: number): void {
  while (value > 0x7F) {
    buffer.push((value & 0x7F) | 0x80);
    value >>>= 7;
  }
  buffer.push(value & 0x7F);
}

/**
 * Reads a varint from buffer
 */
export function readVarInt(bytes: Uint8Array, offset: number): { value: number; bytesRead: number } {
  let value = 0;
  let shift = 0;
  let bytesRead = 0;

  while (offset + bytesRead < bytes.length) {
    const byte = bytes[offset + bytesRead] ?? 0;
    bytesRead++;

    value |= (byte & 0x7F) << shift;

    if ((byte & 0x80) === 0) {
      break;
    }

    shift += 7;
  }

  return { value, bytesRead };
}

/**
 * Writes a length-prefixed string (varint length + UTF-8 bytes)
 */
export function writeString(buffer: number[], str: string): void {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  writeVarInt(buffer, bytes.length);
  buffer.push(...Array.from(bytes));
}

/**
 * Reads a length-prefixed string
 */
export function readString(bytes: Uint8Array, offset: number): { value: string; bytesRead: number } {
  const { value: length, bytesRead: lengthBytes } = readVarInt(bytes, offset);
  offset += lengthBytes;

  const decoder = new TextDecoder();
  const stringBytes = bytes.slice(offset, offset + length);
  const value = decoder.decode(stringBytes);

  return { value, bytesRead: lengthBytes + length };
}

/**
 * Writes an optional string (1 byte flag + string if present)
 */
export function writeOptionalString(buffer: number[], str: string | undefined): void {
  if (str === undefined) {
    buffer.push(0);
  } else {
    buffer.push(1);
    writeString(buffer, str);
  }
}

/**
 * Reads an optional string
 */
export function readOptionalString(bytes: Uint8Array, offset: number): { value: string | undefined; bytesRead: number } {
  const flag = bytes[offset] ?? 0;
  if (flag === 0) {
    return { value: undefined, bytesRead: 1 };
  }

  const { value, bytesRead } = readString(bytes, offset + 1);
  return { value, bytesRead: bytesRead + 1 };
}

/**
 * Writes an optional address (1 byte flag + 20 bytes if present)
 */
export function writeOptionalAddress(buffer: number[], address: string | undefined): void {
  if (address === undefined) {
    buffer.push(0);
  } else {
    buffer.push(1);
    const bytes = addressToBytes(address);
    buffer.push(...Array.from(bytes));
  }
}

/**
 * Reads an optional address
 */
export function readOptionalAddress(bytes: Uint8Array, offset: number): { value: string | undefined; bytesRead: number } {
  const flag = bytes[offset] ?? 0;
  if (flag === 0) {
    return { value: undefined, bytesRead: 1 };
  }

  const addressBytes = bytes.slice(offset + 1, offset + 21);
  const value = bytesToAddress(addressBytes);
  return { value, bytesRead: 21 };
}

// ============================================================================
// BigInt VarInt Utilities
// ============================================================================

/**
 * Writes a BigInt as a variable-length integer
 *
 * Uses the same encoding as regular varint (7 bits data + 1 bit continuation)
 * but works with arbitrary precision BigInt values.
 *
 * @param buffer - Buffer to write to
 * @param value - BigInt value to encode
 *
 * @example
 * const buffer: number[] = []
 * writeBigIntVarInt(buffer, 150000000n)  // $150.00 in atomic units (USDC)
 * // buffer: [128, 194, 215, 71] (4 bytes)
 */
export function writeBigIntVarInt(buffer: number[], value: bigint): void {
  const ZERO = BigInt(0)
  const MASK_7BIT = BigInt(0x7F)
  const SEVEN = BigInt(7)

  // Handle negative values (not expected for amounts, but be safe)
  if (value < ZERO) {
    throw new Error('writeBigIntVarInt: negative values not supported')
  }

  // Special case: zero
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
 * Reads a BigInt varint from buffer
 *
 * @param bytes - Buffer to read from
 * @param offset - Starting position in buffer
 * @returns Object with BigInt value and number of bytes read
 *
 * @example
 * const bytes = new Uint8Array([128, 194, 215, 71])
 * const result = readBigIntVarInt(bytes, 0)
 * // result: { value: 150000000n, bytesRead: 4 }
 */
export function readBigIntVarInt(bytes: Uint8Array, offset: number): { value: bigint; bytesRead: number } {
  const ZERO = BigInt(0)
  const SEVEN = BigInt(7)

  let value = ZERO
  let shift = ZERO
  let bytesRead = 0

  while (offset + bytesRead < bytes.length) {
    const byte = bytes[offset + bytesRead] ?? 0
    bytesRead++

    value = value | (BigInt(byte & 0x7F) << shift)

    if ((byte & 0x80) === 0) {
      break
    }

    shift = shift + SEVEN
  }

  return { value, bytesRead }
}
