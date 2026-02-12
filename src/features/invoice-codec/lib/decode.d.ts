import type { Invoice } from '@/entities/invoice';
/**
 * Decodes a Binary V3 compressed string into an invoice object.
 * Supports version-specific parsing for backward compatibility.
 *
 * @param compressed The compressed string from the URL hash fragment
 * @returns The decoded invoice object
 * @throws Error if decoding fails or version is unsupported
 */
export declare const decodeInvoice: (compressed: string) => Invoice;
//# sourceMappingURL=decode.d.ts.map