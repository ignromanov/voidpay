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

// Motion (existing)
export {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  useInView,
  useDragControls,
  useAnimationControls,
  useReducedMotion,
  LayoutGroup,
  Reorder,
  type MotionProps,
  type Variants,
  type Transition,
} from './motion'

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

// NetworkBackground (feature: 012-landing-page)
export { NetworkBackground, type NetworkBackgroundProps } from './network-background'
