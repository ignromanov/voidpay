# Research: Brand & Visual Components

**Feature**: 011-brand-visual-components | **Date**: 2025-11-29

## Research Topics

1. Framer Motion animation patterns for complex effects
2. CSS conic-gradient browser support and fallbacks
3. Character scramble animation techniques
4. Performance optimization for ambient backgrounds
5. Accessibility for animated components (prefers-reduced-motion)

---

## 1. Framer Motion Animation Patterns

### Decision: Use hybrid approach (CSS keyframes + Framer Motion)

**Rationale**:

- CSS keyframes for continuous, predictable animations (rotation, gradient cycling)
- Framer Motion for state-dependent animations (hover, theme transitions)
- Reduces JS thread overhead for always-running animations

**Alternatives Considered**:

- Pure Framer Motion: More flexible but higher CPU usage for continuous animations
- Pure CSS: Limited interactivity, no AnimatePresence for crossfades

### Pattern: AnimatePresence for Theme Transitions

```tsx
import { AnimatePresence, motion } from 'framer-motion'

// NetworkBackground theme crossfade
;<AnimatePresence mode="wait">
  <motion.div
    key={theme}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.5 }}
  >
    {renderShapes(theme)}
  </motion.div>
</AnimatePresence>
```

### Pattern: useReducedMotion Hook

```tsx
import { useReducedMotion } from 'framer-motion'

function VoidButton() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <button className={cn('relative', !shouldReduceMotion && 'animate-accretion-disk')}>
      {/* content */}
    </button>
  )
}
```

---

## 2. CSS Conic Gradient Support

### Decision: Use conic-gradient with radial fallback

**Rationale**:

- conic-gradient: 95%+ browser support (Chrome 69+, Firefox 83+, Safari 12.1+)
- Radial gradient fallback for IE11/older browsers (minimal VoidPay target audience)

**Browser Support Matrix**:

| Browser      | conic-gradient | @supports |
| ------------ | -------------- | --------- |
| Chrome 69+   | Yes            | Yes       |
| Firefox 83+  | Yes            | Yes       |
| Safari 12.1+ | Yes            | Yes       |
| Edge 79+     | Yes            | Yes       |
| IE11         | No             | No        |

### Pattern: @supports Fallback

```css
.accretion-disk {
  /* Fallback for older browsers */
  background: radial-gradient(
    circle,
    transparent 40%,
    #7c3aed 50%,
    white 60%,
    #7c3aed 70%,
    transparent 80%
  );
}

@supports (background: conic-gradient(from 0deg, transparent, #7c3aed)) {
  .accretion-disk {
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      #7c3aed 90deg,
      white 180deg,
      #7c3aed 270deg,
      transparent 360deg
    );
  }
}
```

---

## 3. Character Scramble Animation

### Decision: requestAnimationFrame + interval with character pool

**Rationale**:

- Smooth scramble effect with configurable duration
- Static characters (spaces, punctuation) prevent layout shift
- Character pool limits to alphanumeric for consistency

**Alternatives Considered**:

- Pure setInterval: Less smooth, timing inconsistencies
- CSS only: Not possible for character replacement
- Canvas: Overkill for text effects

### Pattern: HyperText Animation Logic

```typescript
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const STATIC_CHARS = /[\s.,!?;:'"()-]/

function useHyperText(text: string, duration: number, animateOnLoad: boolean) {
  const [displayText, setDisplayText] = useState(animateOnLoad ? '' : text)
  const [isAnimating, setIsAnimating] = useState(animateOnLoad)

  useEffect(() => {
    if (!isAnimating) return

    const charDelay = duration / text.length
    let currentIndex = 0

    const interval = setInterval(() => {
      setDisplayText((prev) => {
        const chars = text.split('').map((char, i) => {
          if (i < currentIndex) return char
          if (STATIC_CHARS.test(char)) return char
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        })
        return chars.join('')
      })

      currentIndex++
      if (currentIndex > text.length) {
        clearInterval(interval)
        setDisplayText(text)
        setIsAnimating(false)
      }
    }, charDelay)

    return () => clearInterval(interval)
  }, [text, duration, isAnimating])

  return { displayText, triggerAnimation: () => setIsAnimating(true) }
}
```

---

## 4. Ambient Background Performance

### Decision: GPU-accelerated transforms + conditional rendering

**Rationale**:

- `transform` and `opacity` only (no layout/paint triggers)
- Limit shape count (8-12 per theme)
- Use `will-change` sparingly
- Pause animations when tab is not visible

**Alternatives Considered**:

- Canvas/WebGL: More performant but harder to integrate with React
- SVG animations: Similar performance, less flexible for blur effects

### Pattern: Performance-Optimized Shape Animation

```tsx
// Use transform for position, opacity for visibility
const shapeVariants: Variants = {
  initial: {
    opacity: 0,
    transform: 'translateY(100vh) scale(0.5)',
  },
  animate: (custom: { duration: number; delay: number }) => ({
    opacity: [0.1, 0.3, 0.1],
    transform: [
      'translateY(100vh) scale(0.5)',
      'translateY(-10vh) scale(1.2)',
      'translateY(100vh) scale(0.5)',
    ],
    transition: {
      duration: custom.duration,
      delay: custom.delay,
      repeat: Infinity,
      ease: 'linear',
    },
  }),
}

// Visibility API for pausing
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Pause animations
    } else {
      // Resume animations
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [])
```

### Shape Count by Theme

| Theme    | Shapes | Type      | Animation        |
| -------- | ------ | --------- | ---------------- |
| Arbitrum | 8      | Triangles | Float up         |
| Optimism | 8      | Circles   | Pulse            |
| Polygon  | 6      | Hexagons  | Rotate           |
| Ethereum | 8      | Rhombus   | Sway             |
| Base     | 6      | Circles   | Drift horizontal |
| VoidPay  | 10     | Blobs     | Morph borders    |

---

## 5. Accessibility (prefers-reduced-motion)

### Decision: Respect system preference, provide static fallback

**Rationale**:

- WCAG 2.1 Success Criterion 2.3.3 (AAA)
- Some users experience vestibular disorders, migraines
- Static visual identity should still be recognizable

**Implementation Strategy**:

```tsx
// Framer Motion hook
const prefersReducedMotion = useReducedMotion()

// Or CSS media query
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none !important;
    transition: none !important;
  }
}
```

### Fallback Behavior by Component

| Component         | Full Motion        | Reduced Motion          |
| ----------------- | ------------------ | ----------------------- |
| VoidLogo          | Pulsing crescent   | Static glow             |
| NetworkBackground | Floating shapes    | Static gradient overlay |
| Button void       | Spinning accretion | Solid violet ring       |
| AuroraText        | Cycling gradient   | Static gradient         |
| HyperText         | Character scramble | Instant reveal          |

---

## Implementation Recommendations

### Order of Implementation (by complexity)

1. **AuroraText** - CSS-only, simplest (5 tests)
2. **VoidLogo** - SVG + CSS animation (8 tests)
3. **HyperText** - useState + useEffect logic (10 tests)
4. **Button void variant** - CVA integration + CSS (12 tests)
5. **NetworkBackground** - Full Framer Motion + AnimatePresence (15 tests)

### Tailwind CSS Keyframes to Add

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      keyframes: {
        aurora: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'accretion-idle': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'crescent-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        aurora: 'aurora 8s ease infinite',
        'accretion-idle': 'accretion-idle 6s linear infinite',
        'accretion-hover': 'accretion-idle 2s linear infinite',
        'accretion-loading': 'accretion-idle 0.5s linear infinite',
        'crescent-pulse': 'crescent-pulse 3s ease-in-out infinite',
      },
    },
  },
}
```

---

## References

- [Framer Motion useReducedMotion](https://www.framer.com/motion/use-reduced-motion/)
- [CSS conic-gradient MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient)
- [WCAG 2.1 Animation Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [GPU Compositing Triggers](https://web.dev/articles/animations-overview#triggering)
