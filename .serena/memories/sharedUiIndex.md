# Shared UI Index

**Last Updated**: 2025-12-01
**Purpose**: Catalog of Design System components in `shared/ui`
**Rule**: MUST be read BEFORE writing any JSX. MUST be updated when adding/modifying components.

## Primitives (Radix Wrappers)

| Component           | Import                | Key Props                            | Variants                                |
| ------------------- | --------------------- | ------------------------------------ | --------------------------------------- |
| `Dialog`            | `@/shared/ui/dialog`  | `open`, `onOpenChange`               | -                                       |
| `DialogContent`     | `@/shared/ui/dialog`  | `className`                          | -                                       |
| `DialogHeader`      | `@/shared/ui/dialog`  | `className`                          | -                                       |
| `DialogFooter`      | `@/shared/ui/dialog`  | `className`                          | -                                       |
| `DialogTitle`       | `@/shared/ui/dialog`  | `className`                          | -                                       |
| `DialogDescription` | `@/shared/ui/dialog`  | `className`                          | -                                       |
| `DialogClose`       | `@/shared/ui/dialog`  | `asChild`                            | -                                       |
| `Select`            | `@/shared/ui/select`  | `value`, `onValueChange`, `disabled` | -                                       |
| `SelectTrigger`     | `@/shared/ui/select`  | `className`, `variant`, `size`       | `default`, `outline` / `sm`, `md`, `lg` |
| `SelectValue`       | `@/shared/ui/select`  | `placeholder`                        | -                                       |
| `SelectContent`     | `@/shared/ui/select`  | `className`, `position`              | -                                       |
| `SelectItem`        | `@/shared/ui/select`  | `value`, `disabled`                  | -                                       |
| `SelectGroup`       | `@/shared/ui/select`  | -                                    | -                                       |
| `SelectLabel`       | `@/shared/ui/select`  | -                                    | -                                       |
| `Popover`           | `@/shared/ui/popover` | `open`, `onOpenChange`               | -                                       |
| `PopoverTrigger`    | `@/shared/ui/popover` | `asChild`                            | -                                       |
| `PopoverContent`    | `@/shared/ui/popover` | `align`, `sideOffset`, `className`   | -                                       |
| `PopoverAnchor`     | `@/shared/ui/popover` | `asChild`                            | -                                       |

## Motion Components

| Component         | Import               | Key Props                                  | Notes                                    |
| ----------------- | -------------------- | ------------------------------------------ | ---------------------------------------- |
| `motion`          | `@/shared/ui`        | `initial`, `animate`, `exit`, `transition` | Raw Framer Motion primitive              |
| `AnimatePresence` | `@/shared/ui`        | `mode`                                     | For exit animations                      |

> **Note**: Motion exports minimized for bundle optimization. Only `motion` and `AnimatePresence` are exported.
> Other hooks (useAnimation, useScroll, etc.) were removed as unused. Add back to `motion.tsx` if needed.

## Form Components

| Component  | Import                 | Key Props                                  | Variants |
| ---------- | ---------------------- | ------------------------------------------ | -------- |
| `Input`    | `@/shared/ui/input`    | `label`, `error`, `icon`, `iconPosition`   | -        |
| `Textarea` | `@/shared/ui/textarea` | `label`, `error`, `maxLength`, `showCount` | -        |

## Typography

| Component | Import                   | Key Props                      | Variants                                                  |
| --------- | ------------------------ | ------------------------------ | --------------------------------------------------------- |
| `Heading` | `@/shared/ui/typography` | `level`, `className`           | `h1`, `h2`, `h3`, `h4`, `h5`                              |
| `Text`    | `@/shared/ui/typography` | `variant`, `mono`, `className` | `body`, `body-sm`, `caption`, `label`, `overline`, `code` |

## Feedback Components

| Component | Import              | Key Props              | Variants                                                               |
| --------- | ------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `Badge`   | `@/shared/ui/badge` | `variant`, `className` | `default`, `secondary`, `success`, `warning`, `destructive`, `outline` |

## Layout Components

| Component         | Import             | Key Props              | Variants           |
| ----------------- | ------------------ | ---------------------- | ------------------ |
| `Card`            | `@/shared/ui/card` | `variant`, `className` | `default`, `glass` |
| `CardHeader`      | `@/shared/ui/card` | `className`            | -                  |
| `CardContent`     | `@/shared/ui/card` | `className`            | -                  |
| `CardFooter`      | `@/shared/ui/card` | `className`            | -                  |
| `CardTitle`       | `@/shared/ui/card` | `className`            | -                  |
| `CardDescription` | `@/shared/ui/card` | `className`            | -                  |

## Action Components

| Component | Import               | Key Props                                | Variants                                                                                                  |
| --------- | -------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Button`  | `@/shared/ui/button` | `variant`, `size`, `disabled`, `asChild` | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `glow`, `void` / `default`, `sm`, `lg`, `icon` |

## Brand Components (P0.8.2)

| Component           | Import                            | Key Props                             | Variants / Notes                                 |
| ------------------- | --------------------------------- | ------------------------------------- | ------------------------------------------------ |
| `VoidLogo`          | `@/shared/ui/void-logo`           | `size`, `static`, `className`         | Black hole with subtle violet glow. Sizes: `sm`, `md`, `lg`, `xl` or custom number |
| `AuroraText`        | `@/shared/ui/aurora-text`         | `as`, `className`, `children`         | Polymorphic: `span`, `h1`-`h6`, `p`              |
| `HyperText`         | `@/shared/ui/hyper-text`          | `text`, `className`, `animateOnMount` | Character scramble reveal effect                 |
| `VoidButtonOverlay` | `@/shared/ui/button-void-overlay` | `isLoading`, `isDisabled`             | Accretion disk animation for void button variant |

## Brand Utilities

| Utility            | Import                                 | Purpose                                     |
| ------------------ | -------------------------------------- | ------------------------------------------- |
| `useReducedMotion` | `@/shared/ui`                          | Accessibility hook for animation preference |
| `useHyperText`     | `@/shared/ui/hooks/use-hyper-text`     | Hook for character scramble animation       |
| `NETWORK_THEMES`   | `@/shared/ui/constants/brand-tokens`   | Network background theme configurations     |
| `SIZE_PRESETS`     | `@/shared/ui/constants/brand-tokens`   | Size presets for VoidLogo                   |

## Address Input (Shared UI)

| Component      | Import                      | Key Props                             | Variants |
| -------------- | --------------------------- | ------------------------------------- | -------- |
| `AddressInput` | `@/shared/ui/address-input` | `value`, `onChange`, `label`, `error` | -        |

## Feature-Level Form Components

| Component        | Import                      | Key Props                                        | Variants |
| ---------------- | --------------------------- | ------------------------------------------------ | -------- |
| `NetworkSelect`  | `@/features/wallet-connect` | `value`, `onValueChange`, `disabled`, `testnets` | -        |
| `TokenSelect`    | `@/features/invoice`        | `value`, `onValueChange`, `chainId`, `disabled`  | -        |
| `InvoiceItemRow` | `@/features/invoice`        | `item`, `onChange`, `onRemove`, `canRemove`      | -        |

---

## Usage Guidelines

### Before Creating New Component

1. **Search this index** — Does a similar component exist?
2. **If 80% similar** — Extend existing component with new variant
3. **If truly new** — Create in `shared/ui/` and update this index

### After Creating/Modifying Component

```bash
# Update this memory
mcp__serena__edit_memory("sharedUiIndex", ...)

# Commit changes
git add .serena/memories/ && git commit -m "docs(memory): update sharedUiIndex"
```

### Import Convention

```typescript
// ✅ Correct - from Public API
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent } from '@/shared/ui/dialog'

// ❌ Wrong - from internal path
import { Button } from '@/shared/ui/button/button'
```
