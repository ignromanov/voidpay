# Data Model: Core UI Primitives Transfer (009)

**Generated**: 2025-11-28

## Component Interfaces

### Input Component

```typescript
// CVA Variants
const inputVariants = cva(
  'flex w-full rounded-lg border bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      state: {
        default:
          'border-zinc-800 focus:ring-violet-500/50 focus:border-violet-500 focus:shadow-[0_0_15px_rgba(124,58,237,0.3)]',
        error: 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50',
      },
    },
    defaultVariants: { state: 'default' },
  }
)

// Props Interface
interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  icon?: React.ReactNode
  iconPosition?: 'leading' | 'trailing'
}

// Component signature
const Input = React.forwardRef<HTMLInputElement, InputProps>
```

### Textarea Component

```typescript
// CVA Variants
const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all disabled:cursor-not-allowed disabled:opacity-50 resize-none focus:shadow-[0_0_15px_rgba(124,58,237,0.3)]'
)

// Props Interface
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

// Component signature
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>
```

### Badge Component

```typescript
// CVA Variants
const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-zinc-900 text-zinc-300 border-zinc-800',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        outline: 'bg-transparent border-zinc-700 text-zinc-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

// Props Interface
interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// Component signature
const Badge: React.FC<BadgeProps>
```

### Heading Component

```typescript
// CVA Variants
const headingVariants = cva('text-white', {
  variants: {
    variant: {
      hero: 'text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95]',
      h1: 'text-3xl md:text-4xl font-black tracking-tighter',
      h2: 'text-2xl font-bold tracking-tight',
      h3: 'text-xl font-bold tracking-tight',
      h4: 'text-sm font-bold uppercase tracking-widest text-zinc-500',
    },
  },
  defaultVariants: { variant: 'h2' },
})

// Default element mapping
const defaultElementMap = { hero: 'h1', h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4' }

// Props Interface (polymorphic)
type HeadingVariant = 'hero' | 'h1' | 'h2' | 'h3' | 'h4'
type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingElement
}

// Component signature
const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>
```

### Text Component

```typescript
// CVA Variants
const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-base text-zinc-400 leading-relaxed',
      large: 'text-lg md:text-xl text-zinc-400 leading-relaxed',
      small: 'text-sm text-zinc-500',
      tiny: 'text-xs text-zinc-500',
      muted: 'text-zinc-600',
      label: 'text-[10px] font-bold uppercase tracking-wider text-zinc-500',
    },
  },
  defaultVariants: { variant: 'body' },
})

// Default element mapping
const textElementMap = {
  body: 'p',
  large: 'p',
  small: 'p',
  tiny: 'span',
  muted: 'span',
  label: 'span',
}

// Props Interface (polymorphic)
type TextVariant = 'body' | 'large' | 'small' | 'tiny' | 'muted' | 'label'
type TextElement = 'p' | 'span' | 'div' | 'label'

interface TextProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  as?: TextElement
  mono?: boolean
}

// Component signature
const Text = React.forwardRef<HTMLElement, TextProps>
```

### Card Component (Extended)

```typescript
// CVA Variants
const cardVariants = cva('rounded-xl border border-zinc-800 shadow-sm', {
  variants: {
    variant: {
      default: 'bg-zinc-900/50',
      glass: 'backdrop-blur-xl bg-zinc-950/30',
    },
  },
  defaultVariants: { variant: 'default' },
})

// Props Interface (BACKWARD COMPATIBLE)
interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

// Component signature (preserves existing sub-components)
const Card = React.forwardRef<HTMLDivElement, CardProps>

// Preserved sub-components (NO CHANGES)
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>
```

## File Structure

```
src/shared/ui/
├── card.tsx           # Enhanced (add variant)
├── input.tsx          # NEW
├── textarea.tsx       # NEW
├── badge.tsx          # NEW
├── typography.tsx     # NEW (Heading + Text)
└── __tests__/
    ├── card.test.tsx      # NEW
    ├── input.test.tsx     # NEW
    ├── textarea.test.tsx  # NEW
    ├── badge.test.tsx     # NEW
    └── typography.test.tsx # NEW
```

## Exports (index.ts update)

```typescript
// src/shared/ui/index.ts additions
export { Input, type InputProps } from './input'
export { Textarea, type TextareaProps } from './textarea'
export { Badge, badgeVariants, type BadgeProps } from './badge'
export { Heading, Text, headingVariants, textVariants } from './typography'
// Card already exported, no change needed
```

## Validation Rules

| Component | Rule                | Validation                                         |
| --------- | ------------------- | -------------------------------------------------- |
| Input     | icon + iconPosition | icon renders only when provided                    |
| Input     | error state         | error prop takes precedence, adds error styling    |
| Textarea  | resize              | Always disabled (CSS `resize-none`)                |
| Badge     | variant             | Must be one of: default, success, warning, outline |
| Heading   | as prop             | Optional, defaults based on variant                |
| Text      | as prop             | Optional, defaults based on variant                |
| Card      | variant             | Optional, defaults to 'default'                    |
