import { describe, it, expect } from 'vitest'
import { render, screen } from '@/shared/test-utils'
import {
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
} from '../motion'

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
        <motion.div data-testid="animated-div" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Animated content
        </motion.div>
      )

      expect(screen.getByTestId('animated-div')).toBeInTheDocument()
      expect(screen.getByText('Animated content')).toBeInTheDocument()
    })

    it('should render motion.button', () => {
      render(
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          Click me
        </motion.button>
      )

      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
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

  describe('LayoutGroup', () => {
    it('should export LayoutGroup component', () => {
      expect(LayoutGroup).toBeDefined()
    })

    it('should render children inside LayoutGroup', () => {
      render(
        <LayoutGroup>
          <motion.div layout data-testid="layout-child">
            Layout content
          </motion.div>
        </LayoutGroup>
      )

      expect(screen.getByTestId('layout-child')).toBeInTheDocument()
    })
  })

  describe('Reorder', () => {
    it('should export Reorder components', () => {
      expect(Reorder).toBeDefined()
      expect(Reorder.Group).toBeDefined()
      expect(Reorder.Item).toBeDefined()
    })

    it('should render Reorder.Group with items', () => {
      const items = ['Item 1', 'Item 2', 'Item 3']

      render(
        <Reorder.Group axis="y" values={items} onReorder={() => {}} data-testid="reorder-group">
          {items.map((item) => (
            <Reorder.Item key={item} value={item}>
              {item}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )

      expect(screen.getByTestId('reorder-group')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })
  })

  describe('Hooks', () => {
    it('should export useAnimation hook', () => {
      expect(useAnimation).toBeDefined()
      expect(typeof useAnimation).toBe('function')
    })

    it('should export useMotionValue hook', () => {
      expect(useMotionValue).toBeDefined()
      expect(typeof useMotionValue).toBe('function')
    })

    it('should export useTransform hook', () => {
      expect(useTransform).toBeDefined()
      expect(typeof useTransform).toBe('function')
    })

    it('should export useSpring hook', () => {
      expect(useSpring).toBeDefined()
      expect(typeof useSpring).toBe('function')
    })

    it('should export useScroll hook', () => {
      expect(useScroll).toBeDefined()
      expect(typeof useScroll).toBe('function')
    })

    it('should export useInView hook', () => {
      expect(useInView).toBeDefined()
      expect(typeof useInView).toBe('function')
    })

    it('should export useDragControls hook', () => {
      expect(useDragControls).toBeDefined()
      expect(typeof useDragControls).toBe('function')
    })

    it('should export useAnimationControls hook', () => {
      expect(useAnimationControls).toBeDefined()
      expect(typeof useAnimationControls).toBe('function')
    })

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
