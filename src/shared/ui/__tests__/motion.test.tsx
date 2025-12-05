import { describe, it, expect } from 'vitest'
import { render, screen } from '@/shared/test-utils'
import { motion, AnimatePresence } from '../motion'
import { useReducedMotion } from '../hooks/use-reduced-motion'

/**
 * Motion Exports Tests
 *
 * Tests only the minimal set of framer-motion exports that are actually used
 * in the project. This keeps the bundle size small while ensuring core
 * animation functionality works correctly.
 *
 * Removed exports (not used in codebase):
 * - useAnimation, useMotionValue, useTransform, useSpring
 * - useScroll, useInView, useDragControls, useAnimationControls
 * - LayoutGroup, Reorder
 *
 * If you need these, add them back to motion.tsx exports.
 */

describe('Motion Exports', () => {
  describe('motion component', () => {
    it('should export motion object', () => {
      expect(motion).toBeDefined()
      expect(motion.div).toBeDefined()
      expect(motion.span).toBeDefined()
      expect(motion.button).toBeDefined()
    })

    it('should render motion.div with animation props', () => {
      render(
        <motion.div
          data-testid="animated-div"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Animated content
        </motion.div>
      )

      expect(screen.getByTestId('animated-div')).toBeInTheDocument()
      expect(screen.getByText('Animated content')).toBeInTheDocument()
    })

    it('should render motion.button', () => {
      render(
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Click me
        </motion.button>
      )

      expect(
        screen.getByRole('button', { name: /click me/i })
      ).toBeInTheDocument()
    })
  })

  describe('AnimatePresence', () => {
    it('should export AnimatePresence component', () => {
      expect(AnimatePresence).toBeDefined()
    })

    it('should render children inside AnimatePresence', () => {
      render(
        <AnimatePresence>
          <motion.div key="test" data-testid="presence-child">
            Child content
          </motion.div>
        </AnimatePresence>
      )

      expect(screen.getByTestId('presence-child')).toBeInTheDocument()
    })
  })

  describe('useReducedMotion hook', () => {
    it('should export useReducedMotion hook', () => {
      expect(useReducedMotion).toBeDefined()
      expect(typeof useReducedMotion).toBe('function')
    })
  })
})

describe('Motion with exit animations', () => {
  it('should support exit prop inside AnimatePresence', () => {
    const { rerender } = render(
      <AnimatePresence>
        <motion.div
          key="test"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="exit-div"
        >
          Content
        </motion.div>
      </AnimatePresence>
    )

    expect(screen.getByTestId('exit-div')).toBeInTheDocument()

    rerender(<AnimatePresence>{null}</AnimatePresence>)

    // AnimatePresence handles unmounting with animation
    // The element may or may not be in DOM depending on animation state
  })
})
