/**
 * Core UI Primitives - Public Exports
 * Feature: 009-core-primitives-transfer
 */

// Button (existing)
export { Button, buttonVariants, type ButtonProps } from './button'

// Card (enhanced with glass variant)
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
  type CardProps,
} from './card'

// Dialog (existing)
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog'

// Input (new)
export { Input, inputVariants, type InputProps } from './input'

// AddressInput (feature: 010-form-components)
export { AddressInput, type AddressInputProps } from './address-input'

// Motion - NOT exported from barrel to prevent Framer Motion bundle inclusion
// Use direct imports instead:
// - import { motion, AnimatePresence } from '@/shared/ui/motion' (for below-fold components)
// - Types: import type { MotionProps, Variants, Transition } from '@/shared/ui/motion'

// Reduced motion hook (accessibility) - Pure JS implementation, no Framer Motion
export { useReducedMotion } from './hooks/use-reduced-motion'

// Brand tokens (theme configuration)
export type { NetworkTheme } from './constants/brand-tokens'

// Critical path inline SVG icons (above-fold optimization)
export {
  ArrowRightIcon,
  LockIcon,
  ServerOffIcon,
  GlobeIcon,
  GithubIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  WalletIcon,
  HashIcon,
} from './icons'

// Popover (existing)
export { Popover, PopoverTrigger, PopoverContent } from './popover'

// Select (existing)
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select'

// Textarea (new)
export { Textarea, type TextareaProps } from './textarea'

// Badge (new)
export { Badge, badgeVariants, type BadgeProps } from './badge'

// CopyButton (feature: 014-invoice-paper-widget)
export { CopyButton, copyButtonVariants, type CopyButtonProps } from './copy-button'

// Typography (new)
export {
  Heading,
  Text,
  headingVariants,
  textVariants,
  type HeadingProps,
  type HeadingVariant,
  type HeadingElement,
  type TextProps,
  type TextVariant,
  type TextElement,
} from './typography'

// VoidLogo (feature: 011-brand-visual-components)
export { VoidLogo, type VoidLogoProps } from './void-logo'

// AuroraText (feature: 011-brand-visual-components)
export { AuroraText, type AuroraTextProps } from './aurora-text'

// HyperText (feature: 011-brand-visual-components)
export { HyperText, type HyperTextProps } from './hyper-text'

// WalletButton - NOT exported from barrel to prevent Web3 bundle inclusion
// Use direct imports instead:
// - import { LazyWalletButton } from '@/shared/ui/wallet-button-lazy' (recommended)
// - import { WalletButton } from '@/shared/ui/wallet-button' (requires Web3Provider)
