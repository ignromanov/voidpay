/**
 * video-internals — View exports for Remotion video scenes.
 *
 * Import from this subpath, NOT from the main barrel (@/widgets/invoice-form).
 * The main barrel exposes only production Container components.
 *
 * Usage:
 *   import { InvoiceFormView } from '@/widgets/invoice-form/video-internals'
 *
 * FOLLOWUP: update src/video imports to use @/widgets/invoice-form/video-internals
 */

// Top-level View
export { InvoiceFormView, type InvoiceFormViewProps } from './ui/InvoiceFormView'

// Section Views
export { MetadataSectionView, type MetadataSectionViewProps } from './ui/sections/MetadataSectionView'
export { PartySectionView, type PartySectionViewProps } from './ui/sections/PartySectionView'
export {
  LineItemsSectionView,
  type LineItemsSectionViewProps,
  LineItemRowView,
  type LineItemRowViewProps,
} from './ui/sections/LineItemsSectionView'
export { PaymentSectionView, type PaymentSectionViewProps } from './ui/sections/PaymentSectionView'
export { LinkOptionsSectionView, type LinkOptionsSectionViewProps } from './ui/sections/LinkOptionsSectionView'
export { GenerateButtonView, type GenerateButtonViewProps } from './ui/sections/GenerateButtonView'
