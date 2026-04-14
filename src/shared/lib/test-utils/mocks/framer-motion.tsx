/**
 * Framer Motion Mock for Vitest
 *
 * This mock is applied via the alias configuration in vitest.config.ts.
 * It replaces 'framer-motion' imports with this file for all tests.
 *
 * Purpose: Provides deterministic snapshots by stripping animation-related props
 * and rendering motion.* components as regular HTML elements.
 *
 * @see vitest.config.ts (alias: { 'framer-motion': ... })
 * @see https://vitest.dev/guide/mocking.html
 */
import * as React from 'react'

/**
 * Animation props to strip from motion components
 */
const ANIMATION_PROPS = new Set([
  'animate',
  'initial',
  'exit',
  'transition',
  'variants',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileDrag',
  'whileInView',
  'viewport',
  'onAnimationStart',
  'onAnimationComplete',
  'layout',
  'layoutId',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'dragTransition',
  'onDrag',
  'onDragStart',
  'onDragEnd',
  // Note: DO NOT strip 'style' - components use it for positioning
])

/**
 * Create a mock motion component that renders as regular HTML
 */
function createMotionComponent(tag: string) {
  const Component = React.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
    const filteredProps: Record<string, unknown> = { ref }

    for (const [key, value] of Object.entries(props)) {
      if (!ANIMATION_PROPS.has(key)) {
        filteredProps[key] = value
      }
    }

    return React.createElement(tag, filteredProps)
  })
  Component.displayName = `motion.${tag}`
  return Component
}

/**
 * Proxy-based motion object that creates components on-demand
 */
const motionCache: Record<string, ReturnType<typeof createMotionComponent>> = {}
export const motion = new Proxy(
  {},
  {
    get(_target: object, prop: string) {
      if (!(prop in motionCache)) {
        motionCache[prop] = createMotionComponent(prop)
      }
      return motionCache[prop]
    },
  }
) as typeof import('framer-motion').motion

/**
 * AnimatePresence - just renders children
 */
export const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>

/**
 * useReducedMotion - always returns true (prefer reduced motion)
 */
export const useReducedMotion = () => true

/**
 * useAnimation - mock animation controls
 */
export const useAnimation = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
  set: () => {},
})

/**
 * useMotionValue - mock motion value
 */
export const useMotionValue = <T,>(initial: T) => ({
  get: () => initial,
  set: () => {},
  onChange: () => () => {},
  on: () => () => {},
})

/**
 * useSpring - mock spring value
 */
export const useSpring = <T,>(initial: T) => ({
  get: () => initial,
  set: () => {},
})

/**
 * useTransform - mock transform value
 */
export const useTransform = () => ({
  get: () => 0,
  set: () => {},
})

/**
 * useInView - always returns true (in view)
 */
export const useInView = () => true

/**
 * useScroll - mock scroll values
 */
export const useScroll = () => ({
  scrollX: { get: () => 0 },
  scrollY: { get: () => 0 },
  scrollXProgress: { get: () => 0 },
  scrollYProgress: { get: () => 0 },
})

/**
 * useDragControls - mock drag controls
 */
export const useDragControls = () => ({
  start: () => {},
})

/**
 * useAnimationControls - mock animation controls
 */
export const useAnimationControls = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
  set: () => {},
})

/**
 * LayoutGroup - just renders children
 */
export const LayoutGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>

/**
 * Reorder - mock reorder components
 */
export const Reorder = {
  Group: React.forwardRef<
    HTMLUListElement,
    { children: React.ReactNode; values?: unknown; onReorder?: unknown; axis?: unknown }
  >(({ children, values: _values, onReorder: _onReorder, axis: _axis, ...props }, ref) => (
    <ul {...props} ref={ref}>
      {children}
    </ul>
  )),
  Item: React.forwardRef<HTMLLIElement, { children: React.ReactNode; value?: unknown }>(
    ({ children, value: _value, ...props }, ref) => (
      <li {...props} ref={ref}>
        {children}
      </li>
    )
  ),
}

// Set display names
Reorder.Group.displayName = 'Reorder.Group'
Reorder.Item.displayName = 'Reorder.Item'

/**
 * Type exports - re-export from actual framer-motion for type compatibility
 */
export type { MotionProps, Variants, Transition } from 'framer-motion'
