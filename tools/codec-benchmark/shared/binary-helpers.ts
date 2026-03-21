export function uuidToBytes(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, '')
  if (hex.length !== 32) throw new Error(`Invalid UUID: ${uuid}`)
  const bytes = new Uint8Array(16)
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

export function addressToBytes(address: string): Uint8Array {
  const hex = address.startsWith('0x') ? address.slice(2) : address
  if (hex.length !== 40 || !/^[0-9a-fA-F]{40}$/.test(hex))
    throw new Error(`Invalid address: ${address}`)
  const bytes = new Uint8Array(20)
  for (let i = 0; i < 20; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

export function writeUInt32(buffer: number[], value: number): void {
  buffer.push((value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff)
}

export function writeVarInt(buffer: number[], value: number): void {
  while (value > 0x7f) {
    buffer.push((value & 0x7f) | 0x80)
    value >>>= 7
  }
  buffer.push(value & 0x7f)
}

export function writeString(buffer: number[], str: string): void {
  const bytes = new TextEncoder().encode(str)
  writeVarInt(buffer, bytes.length)
  for (const b of bytes) buffer.push(b)
}

export function writeOptionalString(buffer: number[], str: string | undefined): void {
  if (str === undefined) {
    buffer.push(0)
  } else {
    buffer.push(1)
    writeString(buffer, str)
  }
}

export function writeOptionalAddress(buffer: number[], address: string | undefined): void {
  if (address === undefined) {
    buffer.push(0)
  } else {
    buffer.push(1)
    const bytes = addressToBytes(address)
    for (const b of bytes) buffer.push(b)
  }
}

export function writeBigIntVarInt(buffer: number[], value: bigint): void {
  if (value < 0n) throw new Error('Negative BigInt not supported')
  if (value === 0n) {
    buffer.push(0)
    return
  }
  let remaining = value
  while (remaining > 0x7fn) {
    buffer.push(Number(remaining & 0x7fn) | 0x80)
    remaining = remaining >> 7n
  }
  buffer.push(Number(remaining & 0x7fn))
}

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
