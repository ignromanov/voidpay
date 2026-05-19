// Containers (for production form)
export { MetadataSection, type MetadataSectionProps } from './MetadataSection'
export { PartySection, type PartySectionProps } from './PartySection'
export { LineItemsSection, type LineItemsSectionProps } from './LineItemsSection'
export { TaxDiscountSection, type TaxDiscountSectionProps } from './TaxDiscountSection'
export { PaymentSection, type PaymentSectionProps } from './PaymentSection'
export { NotesSection, type NotesSectionProps } from './NotesSection'
export { LinkOptionsSection } from './LinkOptionsSection'
export { GenerateButton, type GenerateButtonProps } from './GenerateButton'

// Views (for video-internals re-export — do not re-export from widgets/invoice-form/index.ts)
export { MetadataSectionView, type MetadataSectionViewProps } from './MetadataSectionView'
export { PartySectionView, type PartySectionViewProps } from './PartySectionView'
export { LineItemsSectionView, type LineItemsSectionViewProps, LineItemRowView, type LineItemRowViewProps } from './LineItemsSectionView'
export { PaymentSectionView, type PaymentSectionViewProps } from './PaymentSectionView'
export { LinkOptionsSectionView, type LinkOptionsSectionViewProps } from './LinkOptionsSectionView'
export { GenerateButtonView, type GenerateButtonViewProps } from './GenerateButtonView'
