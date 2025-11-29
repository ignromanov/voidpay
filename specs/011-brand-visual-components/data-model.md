# Data Model: Brand & Visual Components

**Feature**: 011-brand-visual-components | **Date**: 2025-11-29

## Overview

Pure presentational components with no persistent state. All data flows through props.

---

## Component Props Interfaces

### 1. VoidLogo

```typescript
interface VoidLogoProps {
  /** Custom CSS classes to merge with defaults */
  className?: string
  /** Size preset or custom dimensions */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
  /** Disable pulse animation */
  static?: boolean
}
```

| Prop      | Type    | Default   | Description                       |
| --------- | ------- | --------- | --------------------------------- | ------- | ------ | ---- | ------------------------------------------------- |
| className | string? | undefined | Merged with cn()                  |
| size      | 'sm' \\ | 'md' \\   | 'lg' \\                           | 'xl' \\ | number | 'md' | sm=32px, md=48px, lg=64px, xl=96px, number=custom |
| static    | boolean | false     | Disables crescent pulse animation |

### 2. NetworkBackground

```typescript
type NetworkTheme = 'arbitrum' | 'optimism' | 'polygon' | 'ethereum' | 'base' | 'voidpay'

interface NetworkBackgroundProps {
  /** Network theme controlling colors and shapes */
  theme?: NetworkTheme
  /** Custom CSS classes for the container */
  className?: string
}
```

| Prop      | Type         | Default    | Description                                                |
| --------- | ------------ | ---------- | ---------------------------------------------------------- |
| theme     | NetworkTheme | 'ethereum' | Network color scheme and shape type (fallback for unknown) |
| className | string?      | undefined  | Container styling overrides                                |

### 3. Button void Variant

```typescript
// Extends existing ButtonProps from src/shared/ui/button.tsx
interface ButtonVoidProps extends Omit<ButtonProps, 'variant'> {
  variant: 'void'
  /** Loading state triggers maximum spin velocity */
  isLoading?: boolean
}
```

| Prop        | Type        | Default  | Description                             |
| ----------- | ----------- | -------- | --------------------------------------- |
| variant     | 'void'      | required | Activates accretion disk styling        |
| isLoading   | boolean     | false    | Triggers loading animation state        |
| disabled    | boolean     | false    | Hides accretion disk, grayscale         |
| (inherited) | ButtonProps | -        | size, asChild, className, onClick, etc. |

### 4. AuroraText

```typescript
interface AuroraTextProps {
  /** Text content or React children */
  children: React.ReactNode
  /** Custom CSS classes */
  className?: string
  /** HTML element to render as */
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
}
```

| Prop      | Type                        | Default   | Description         |
| --------- | --------------------------- | --------- | ------------------- |
| children  | ReactNode                   | required  | Text content        |
| className | string?                     | undefined | Additional styling  |
| as        | keyof JSX.IntrinsicElements | 'span'    | Polymorphic element |

### 5. HyperText

```typescript
interface HyperTextProps {
  /** Text to display with scramble effect */
  text: string
  /** Total animation duration in milliseconds */
  duration?: number
  /** Trigger animation on initial mount */
  animateOnLoad?: boolean
  /** Custom CSS classes */
  className?: string
  /** Callback when animation completes */
  onAnimationComplete?: () => void
}
```

| Prop                | Type       | Default   | Description              |
| ------------------- | ---------- | --------- | ------------------------ |
| text                | string     | required  | Target text to reveal    |
| duration            | number     | 300       | Animation duration in ms |
| animateOnLoad       | boolean    | true      | Auto-animate on mount    |
| className           | string?    | undefined | Container styling        |
| onAnimationComplete | () => void | undefined | Completion callback      |

---

## Theme Configuration

### Network Theme Colors

```typescript
const NETWORK_THEMES: Record<NetworkTheme, ThemeConfig> = {
  arbitrum: {
    primary: '#12AAFF',
    secondary: '#28A0F0',
    shape: 'triangle',
    animation: 'float',
    shapeCount: 8,
  },
  optimism: {
    primary: '#FF0420',
    secondary: '#FF5C5C',
    shape: 'circle',
    animation: 'pulse',
    shapeCount: 8,
  },
  polygon: {
    primary: '#8247E5',
    secondary: '#A77CF2',
    shape: 'hexagon',
    animation: 'rotate',
    shapeCount: 6,
  },
  ethereum: {
    primary: '#627EEA',
    secondary: '#8B9EF5',
    shape: 'rhombus',
    animation: 'sway',
    shapeCount: 8,
  },
  base: {
    primary: '#0052FF',
    secondary: '#3D7DFF',
    shape: 'circle',
    animation: 'drift',
    shapeCount: 6,
  },
  voidpay: {
    primary: '#7C3AED',
    secondary: '#A78BFA',
    shape: 'blob',
    animation: 'morph',
    shapeCount: 10,
  },
}
```

### Size Presets

```typescript
const SIZE_PRESETS = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
} as const
```

---

## Animation State Machine

### Button void States

```
┌─────────┐  hover   ┌─────────┐  click   ┌─────────┐
│  IDLE   │ ──────►  │  HOVER  │ ──────►  │ LOADING │
│ 6s spin │          │ 2s spin │          │ 0.5s    │
└─────────┘          └─────────┘          └─────────┘
     ▲                    │                    │
     │   mouseout         │                    │ complete
     └────────────────────┘                    │
                                               ▼
                                          ┌─────────┐
                                          │   IDLE  │
                                          └─────────┘

Disabled state: No accretion disk, grayscale filter
```

### HyperText Animation Flow

```
MOUNT ──► animateOnLoad=true? ──► SCRAMBLING ──► char by char ──► COMPLETE
              │                        │
              │ false                  │ text prop changes
              ▼                        ▼
           STATIC ◄────────────── SCRAMBLING
```

---

## CSS Custom Properties

```css
:root {
  /* VoidLogo */
  --void-logo-glow: rgba(124, 58, 237, 0.6);
  --void-logo-pulse-duration: 3s;

  /* Button void */
  --accretion-disk-idle-duration: 6s;
  --accretion-disk-hover-duration: 2s;
  --accretion-disk-loading-duration: 0.5s;

  /* AuroraText */
  --aurora-gradient: linear-gradient(90deg, #8b5cf6, #6366f1, #a855f7, #8b5cf6);
  --aurora-animation-duration: 8s;

  /* NetworkBackground */
  --network-transition-duration: 1.5s;
}
```

---

## Validation Rules

1. **VoidLogo size**: Must be positive number or valid preset
2. **NetworkBackground theme**: Must be valid NetworkTheme enum value
3. **HyperText text**: Non-empty string required
4. **HyperText duration**: Must be positive number (min: 50ms, max: 5000ms)
5. **Button void variant**: Cannot combine with other variants

---

## Export Structure

```typescript
// src/shared/ui/index.ts additions
export { VoidLogo } from './void-logo'
export type { VoidLogoProps } from './void-logo'

export { AuroraText } from './aurora-text'
export type { AuroraTextProps } from './aurora-text'

export { HyperText } from './hyper-text'
export type { HyperTextProps } from './hyper-text'

// Button already exported, void variant added to buttonVariants

// src/widgets/network-background/index.ts
export { NetworkBackground } from './NetworkBackground'
export type { NetworkBackgroundProps, NetworkTheme } from './NetworkBackground'
```
