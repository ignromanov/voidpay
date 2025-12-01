# Shared UI Index

**Last Updated**: 2025-12-01
**Purpose**: Catalog of Design System components in `shared/ui`
**Rule**: MUST be read BEFORE writing any JSX. MUST be updated when adding/modifying components.

## Primitives (Radix Wrappers)

| Component           | Import                           | Key Props                            | Variants                                |
| ------------------- | -------------------------------- | ------------------------------------ | --------------------------------------- |
| `Dialog`            | `@/shared/ui/primitives/dialog`  | `open`, `onOpenChange`               | -                                       |
| `DialogContent`     | `@/shared/ui/primitives/dialog`  | `className`                          | -                                       |
| `DialogHeader`      | `@/shared/ui/primitives/dialog`  | `className`                          | -                                       |
| `DialogFooter`      | `@/shared/ui/primitives/dialog`  | `className`                          | -                                       |
| `DialogTitle`       | `@/shared/ui/primitives/dialog`  | `className`                          | -                                       |
| `DialogDescription` | `@/shared/ui/primitives/dialog`  | `className`                          | -                                       |
| `DialogClose`       | `@/shared/ui/primitives/dialog`  | `asChild`                            | -                                       |
| `Select`            | `@/shared/ui/primitives/select`  | `value`, `onValueChange`, `disabled` | -                                       |
| `SelectTrigger`     | `@/shared/ui/primitives/select`  | `className`, `variant`, `size`       | `default`, `outline` / `sm`, `md`, `lg` |
| `SelectValue`       | `@/shared/ui/primitives/select`  | `placeholder`                        | -                                       |
| `SelectContent`     | `@/shared/ui/primitives/select`  | `className`, `position`              | -                                       |
| `SelectItem`        | `@/shared/ui/primitives/select`  | `value`, `disabled`                  | -                                       |
| `SelectGroup`       | `@/shared/ui/primitives/select`  | -                                    | -                                       |
| `SelectLabel`       | `@/shared/ui/primitives/select`  | -                                    | -                                       |
| `Popover`           | `@/shared/ui/primitives/popover` | `open`, `onOpenChange`               | -                                       |
| `PopoverTrigger`    | `@/shared/ui/primitives/popover` | `asChild`                            | -                                       |
| `PopoverContent`    | `@/shared/ui/primitives/popover` | `align`, `sideOffset`, `className`   | -                                       |
| `PopoverAnchor`     | `@/shared/ui/primitives/popover` | `asChild`                            | -                                       |

## Motion Components

| Component         | Import               | Key Props                        | Variants                      |
| ----------------- | -------------------- | -------------------------------- | ----------------------------- |
| `FadeIn`          | `@/shared/ui/motion` | `duration`, `delay`, `className` | -                             |
| `SlideIn`         | `@/shared/ui/motion` | `direction`, `duration`, `delay` | `up`, `down`, `left`, `right` |
| `ScaleIn`         | `@/shared/ui/motion` | `duration`, `delay`, `className` | -                             |
| `AnimatePresence` | `@/shared/ui/motion` | `mode`                           | -                             |

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

| Component | Import               | Key Props                                | Variants                                                                                          |
| --------- | -------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `Button`  | `@/shared/ui/button` | `variant`, `size`, `disabled`, `asChild` | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` / `default`, `sm`, `lg`, `icon` |

## Feature-Level Form Components

| Component        | Import                        | Key Props                                        | Variants |
| ---------------- | ----------------------------- | ------------------------------------------------ | -------- |
| `AddressInput`   | `@/features/address-input`    | `value`, `onChange`, `label`, `error`, `chainId` | -        |
| `NetworkSelect`  | `@/features/network-select`   | `value`, `onValueChange`, `disabled`, `testnets` | -        |
| `TokenSelect`    | `@/features/token-select`     | `value`, `onValueChange`, `chainId`, `disabled`  | -        |
| `InvoiceItemRow` | `@/features/invoice-item-row` | `item`, `onChange`, `onRemove`, `canRemove`      | -        |

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
import { Dialog, DialogContent } from '@/shared/ui/primitives/dialog'

// ❌ Wrong - from internal path
import { Button } from '@/shared/ui/button/button'
```
