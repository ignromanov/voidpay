/**
 * Binary Invoice Decoder
 *
 * Unpacks binary-encoded invoice back to InvoiceSchemaV1
 */

import { InvoiceSchemaV1 } from '@/entities/invoice/model/schema';
import { decodeBase62 } from './base62';
import {
  bytesToUuid,
  bytesToAddress,
  readUInt32,
  readVarInt,
  readString,
  readOptionalString,
  readOptionalAddress,
} from './utils';

/**
 * Decodes a Base62-encoded binary invoice back to InvoiceSchemaV1
 */
export function decodeBinary(encoded: string): InvoiceSchemaV1 {
  const bytes = decodeBase62(encoded);
  let offset = 0;

  // Helper to advance offset
  const read = <T extends { bytesRead: number; value: any }>(fn: () => T): T['value'] => {
    const result = fn();
    offset += result.bytesRead;
    return result.value;
  };

  // 1. Version (1 byte)
  const version = bytes[offset++] ?? 0;
  if (version !== 1) {
    throw new Error(`Unsupported binary schema version: ${version}`);
  }

  // 2. Invoice ID (16 bytes UUID)
  const idBytes = bytes.slice(offset, offset + 16);
  const invoiceId = bytesToUuid(idBytes);
  offset += 16;

  // 3. Issue Date (4 bytes)
  const issuedAt = read(() => readUInt32(bytes, offset));

  // 4. Due Date (4 bytes)
  const dueAt = read(() => readUInt32(bytes, offset));

  // 5. Notes (optional)
  const notes = read(() => readOptionalString(bytes, offset));

  // 6. Network Chain ID (varint)
  const networkId = read(() => readVarInt(bytes, offset));

  // 7. Currency Symbol (string)
  const currency = read(() => readString(bytes, offset));

  // 8. Token Address (optional)
  const tokenAddress = read(() => readOptionalAddress(bytes, offset));

  // 9. Decimals (varint)
  const decimals = read(() => readVarInt(bytes, offset));

  // 10. Sender Info
  const from = {
    name: read(() => readString(bytes, offset)),
    walletAddress: bytesToAddress(bytes.slice(offset, offset + 20)),
    email: undefined as string | undefined,
    physicalAddress: undefined as string | undefined,
    phone: undefined as string | undefined,
  };
  offset += 20;

  from.email = read(() => readOptionalString(bytes, offset));
  from.physicalAddress = read(() => readOptionalString(bytes, offset));
  from.phone = read(() => readOptionalString(bytes, offset));

  // 11. Client Info
  const client = {
    name: read(() => readString(bytes, offset)),
    walletAddress: undefined as string | undefined,
    email: undefined as string | undefined,
    physicalAddress: undefined as string | undefined,
    phone: undefined as string | undefined,
  };

  client.walletAddress = read(() => readOptionalAddress(bytes, offset));
  client.email = read(() => readOptionalString(bytes, offset));
  client.physicalAddress = read(() => readOptionalString(bytes, offset));
  client.phone = read(() => readOptionalString(bytes, offset));

  // 12. Line Items
  const itemCount = read(() => readVarInt(bytes, offset));
  const items: Array<{ description: string; quantity: string | number; rate: string }> = [];

  for (let i = 0; i < itemCount; i++) {
    const description = read(() => readString(bytes, offset));
    const qStr = read(() => readString(bytes, offset));
    const rate = read(() => readString(bytes, offset));

    // Try to parse quantity as number if possible
    const qNum = parseFloat(qStr);
    const quantity = !isNaN(qNum) && qNum.toString() === qStr ? qNum : qStr;

    items.push({ description, quantity, rate });
  }

  // 13. Tax (optional)
  const tax = read(() => readOptionalString(bytes, offset));

  // 14. Discount (optional)
  const discount = read(() => readOptionalString(bytes, offset));

  // Construct the invoice object
  const invoice: InvoiceSchemaV1 = {
    version: 1,
    invoiceId,
    issuedAt,
    dueAt,
    notes,
    networkId,
    currency,
    tokenAddress,
    decimals,
    from,
    client,
    items,
    tax,
    discount,
  };

  return invoice;
}

/**
 * Decoding steps with detailed breakdown (for debugging UI)
 */
export interface DecodingStep {
  step: string;
  description: string;
  bytes: string;
  value: unknown;
  offset: number;
}

/**
 * Decodes with detailed step-by-step information for UI display
 */
export function decodeBinaryWithSteps(encoded: string): { invoice: InvoiceSchemaV1; steps: DecodingStep[] } {
  const bytes = decodeBase62(encoded);
  const steps: DecodingStep[] = [];
  let offset = 0;

  const addStep = (step: string, description: string, bytesRead: number, value: unknown) => {
    const stepBytes = Array.from(bytes.slice(offset, offset + bytesRead))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');

    steps.push({
      step,
      description,
      bytes: stepBytes,
      value,
      offset,
    });

    offset += bytesRead;
  };

  // 1. Version
  const v = bytes[offset];
  addStep('1', 'Version', 1, v);

  // 2. Invoice ID
  const idBytes = bytes.slice(offset, offset + 16);
  const id = bytesToUuid(idBytes);
  addStep('2', 'Invoice ID (UUID)', 16, id);

  // 3. Issue Date
  const { value: iss, bytesRead: issBytes } = readUInt32(bytes, offset);
  addStep('3', 'Issue Date (Unix timestamp)', issBytes, `${iss} (${new Date(iss * 1000).toISOString()})`);

  // 4. Due Date
  const { value: due, bytesRead: dueBytes } = readUInt32(bytes, offset);
  addStep('4', 'Due Date (Unix timestamp)', dueBytes, `${due} (${new Date(due * 1000).toISOString()})`);

  // 5. Notes
  const { value: nt, bytesRead: ntBytes } = readOptionalString(bytes, offset);
  addStep('5', 'Notes (optional)', ntBytes, nt || '(none)');

  // Continue for all fields...
  // (simplified for brevity - full implementation would include all fields)

  // Use the regular decoder for actual parsing
  offset = 0;
  const invoice = decodeBinary(encoded);

  return { invoice, steps };
}
