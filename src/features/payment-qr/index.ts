/**
 * Payment QR Feature — EIP-681 QR code generation for crypto payments.
 *
 * Provides:
 * - PaymentQR: QR code component with validation, light/dark variants, logo
 * - QRModal: Dialog for scanning payment QR (dark variant, copy URI)
 * - QRTab: QR tab for share-modal (light variant, download button)
 * - buildPaymentUri: EIP-681 URI builder for native and ERC-20 tokens
 * - downloadQRCode: Download QR as PNG image
 */

export { PaymentQR } from './ui/PaymentQR'
export type { PaymentQRProps } from './ui/PaymentQR'
export { QRModal } from './ui/QRModal'
export { QRTab } from './ui/QRTab'
export { buildPaymentUri } from './lib/build-payment-uri'
export { downloadQRCode } from './lib/download-qr'
export { WalletDeepLinkButtons } from './ui/WalletDeepLinkButtons'
export { buildWalletDeepLink } from './lib/build-wallet-deeplink'
