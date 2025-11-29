# Research: Core UI Primitives Transfer (009)

**Generated**: 2025-11-28
**Status**: Complete

## Design Source Analysis

### Decision: AI Studio v3 as Source of Truth

- **Location**: `assets/aistudio/v3/shared/ui/`
- **Rationale**: Constitutional Principle XI mandates AI Studio (Gemini 3 Pro) v3 as primary design source
- **Files Analyzed**: Input.tsx, Textarea.tsx, Badge.tsx, Typography.tsx, Card.tsx

### Decision: CVA Pattern for All Components

- **Rationale**: Existing button.tsx establishes CVA pattern; consistency required
- **Pattern**: `cva(baseStyles, { variants: {...}, defaultVariants: {...} })`
- **Alternative Considered**: Inline variant objects (used in design source) → Rejected for consistency

## Component Patterns Extracted

### Input Component

| Property      | Value                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| Base          | `rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm` |
| Focus         | `focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500`        |
| Focus Glow    | `focus:shadow-[0_0_15px_rgba(124,58,237,0.3)]`                         |
| Error         | `border-red-500/50 focus:border-red-500`                               |
| Icon Position | Leading only (`pl-9` when icon present)                                |
| Label         | `text-xs font-medium text-zinc-400 uppercase tracking-wide`            |

### Textarea Component

| Property | Value                                      |
| -------- | ------------------------------------------ |
| Base     | Same as Input + `min-h-[80px] resize-none` |
| Focus    | Same as Input                              |

### Badge Component

| Variant | Styles                                                     |
| ------- | ---------------------------------------------------------- |
| default | `bg-zinc-900 text-zinc-300 border-zinc-800`                |
| success | `bg-emerald-500/10 text-emerald-400 border-emerald-500/20` |
| warning | `bg-amber-500/10 text-amber-400 border-amber-500/20`       |
| outline | `bg-transparent border-zinc-700 text-zinc-400`             |
| Base    | `rounded-md border px-2 py-0.5 text-xs font-semibold`      |

### Typography - Heading

| Variant | Styles                                                                        | Default Element |
| ------- | ----------------------------------------------------------------------------- | --------------- |
| hero    | `text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95]` | h1              |
| h1      | `text-3xl md:text-4xl font-black tracking-tighter`                            | h1              |
| h2      | `text-2xl font-bold tracking-tight`                                           | h2              |
| h3      | `text-xl font-bold tracking-tight`                                            | h3              |
| h4      | `text-sm font-bold uppercase tracking-widest text-zinc-500`                   | h4              |

### Typography - Text

| Variant | Styles                                                         | Default Element |
| ------- | -------------------------------------------------------------- | --------------- |
| body    | `text-base text-zinc-400 leading-relaxed`                      | p               |
| large   | `text-lg md:text-xl text-zinc-400 leading-relaxed`             | p               |
| small   | `text-sm text-zinc-500`                                        | p               |
| tiny    | `text-xs text-zinc-500`                                        | span            |
| muted   | `text-zinc-600`                                                | span            |
| label   | `text-[10px] font-bold uppercase tracking-wider text-zinc-500` | span            |

### Card Glass Variant

| Property | Value                                                        |
| -------- | ------------------------------------------------------------ |
| Default  | `rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm` |
| Glass    | `backdrop-blur-xl bg-zinc-950/30`                            |

## Existing Component Analysis

### Card Sub-components (PRESERVE)

- `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`
- Current Card uses semantic CSS vars (`bg-card`, `text-card-foreground`)
- **Decision**: Extend Card props to add `variant` with glass option, preserve sub-components

## Testing Strategy

### Decision: TDD with Vitest

- **Framework**: Vitest (Constitutional Principle XVI)
- **Coverage Target**: 80%+
- **Test Types**: Unit (variants), Accessibility (ARIA), Visual regression (if needed)
- **Mocking**: Not required (no RPC/async for UI components)

### Test Structure Per Component

1. Renders with default props
2. Renders all variants correctly
3. Handles accessibility (labels, ARIA attributes)
4. Focus states work correctly
5. Snapshot for visual regression

## Dependencies

| Dependency             | Status       | Notes                   |
| ---------------------- | ------------ | ----------------------- |
| CVA                    | ✅ Installed | 0.7.1+                  |
| Radix UI               | ✅ Installed | Dialog, Select, Popover |
| Tailwind CSS           | ✅ Installed | 4.1.17+                 |
| clsx                   | ✅ Installed | 2.1.1+                  |
| tailwind-merge         | ✅ Installed | 2.5.4+                  |
| @testing-library/react | ✅ Installed | 16.3.0+                 |
| Vitest                 | ✅ Installed | 4.0.14+                 |

## Implementation Notes

### Icon Position Clarification

- **Spec**: Single icon position (leading OR trailing, configurable)
- **Design Source**: Only leading position implemented
- **Decision**: Implement configurable position via `iconPosition` prop (default: "leading")

### Polymorphic Components

- Heading: `as` prop for semantic element (h1-h6)
- Text: `as` prop for semantic element (p, span, div, etc.)
- Use proper TypeScript generics for type safety
