import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, vi } from 'vitest'

// Mock React useId for deterministic snapshots
let idCounter = 0
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useId: () => `:r${(idCounter++).toString(16)}:`,
  }
})

// Mock framer-motion for deterministic snapshots across environments
// This ensures motion components render as plain divs without animation props
vi.mock('framer-motion', async () => {
  const React = await import('react')
  const actual = await vi.importActual('framer-motion')

  // Helper to strip motion-specific props from elements
  const stripMotionProps = (props: Record<string, unknown>) => {
    const {
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      variants: _variants,
      whileHover: _whileHover,
      whileTap: _whileTap,
      whileFocus: _whileFocus,
      whileInView: _whileInView,
      whileDrag: _whileDrag,
      layout: _layout,
      layoutId: _layoutId,
      onAnimationStart: _onAnimationStart,
      onAnimationComplete: _onAnimationComplete,
      ...rest
    } = props
    // Intentionally discard motion-specific props
    void [_initial, _animate, _exit, _transition, _variants, _whileHover, _whileTap, _whileFocus, _whileInView, _whileDrag, _layout, _layoutId, _onAnimationStart, _onAnimationComplete]
    return rest
  }

  // Create a simple motion component factory
  const createMotionComponent = (Component: string) => {
    const MotionComponent = React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
      const cleanProps = stripMotionProps(props)
      return React.createElement(Component, { ...cleanProps, ref })
    })
    MotionComponent.displayName = `motion.${Component}`
    return MotionComponent
  }

  return {
    ...actual,
    motion: {
      div: createMotionComponent('div'),
      span: createMotionComponent('span'),
      a: createMotionComponent('a'),
      button: createMotionComponent('button'),
      ul: createMotionComponent('ul'),
      li: createMotionComponent('li'),
      nav: createMotionComponent('nav'),
      section: createMotionComponent('section'),
      article: createMotionComponent('article'),
      header: createMotionComponent('header'),
      footer: createMotionComponent('footer'),
      main: createMotionComponent('main'),
      form: createMotionComponent('form'),
      input: createMotionComponent('input'),
      p: createMotionComponent('p'),
      h1: createMotionComponent('h1'),
      h2: createMotionComponent('h2'),
      h3: createMotionComponent('h3'),
      h4: createMotionComponent('h4'),
      img: createMotionComponent('img'),
      svg: createMotionComponent('svg'),
      path: createMotionComponent('path'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useReducedMotion: vi.fn(() => false),
    useInView: vi.fn(() => true),
    useAnimation: vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    })),
  }
})

// Reset ID counter before each test for consistent snapshots
beforeEach(() => {
  idCounter = 0
})

// Runs a cleanup after each test case (e.g. clearing DOM)
afterEach(() => {
  cleanup()
})

// Mock pointer capture methods for Radix UI components (happy-dom compatibility)
beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
})
