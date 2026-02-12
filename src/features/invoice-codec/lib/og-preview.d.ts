import type { Invoice } from '@/entities/invoice';
/**
 * OG Preview data structure for social sharing.
 * Contains minimal, non-sensitive invoice metadata.
 */
export interface OGPreviewData {
    /** Shortened invoice ID (first 8 chars of UUID) */
    id: string;
    /** Total amount (formatted with 2 decimal places) */
    amount: string;
    /** Currency symbol */
    currency: string;
    /** Network short code (eth, arb, op, poly) */
    network: string;
    /** Sender name (optional, max 20 chars) */
    from?: string;
    /** Due date in MMDD format (optional) */
    due?: string;
}
/**
 * Encodes minimal invoice metadata for OG preview.
 * Format: id_amount_currency_network[_from][_due]
 *
 * @param invoice The full invoice data
 * @returns URL-safe string for og query parameter
 *
 * @example
 * ```ts
 * encodeOGPreview(invoice)
 * // => "a1b2c3d4_1250.00_USDC_arb_Acme_1231"
 * ```
 */
export declare function encodeOGPreview(invoice: Invoice): string;
/**
 * Decodes OG preview string back to preview data.
 *
 * @param ogString The og query parameter value
 * @returns Parsed preview data
 */
export declare function decodeOGPreview(ogString: string): OGPreviewData;
/**
 * Gets network chain ID from short code.
 */
export declare function getNetworkIdFromCode(code: string): number | undefined;
//# sourceMappingURL=og-preview.d.ts.map