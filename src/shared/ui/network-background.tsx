'use client'

/**
 * NetworkBackground - Animated background shapes that change per blockchain network
 * Feature: 012-landing-page
 *
 * Each network has unique shapes representing its visual identity:
 * - Ethereum: Rhombus/diamond shapes (blue/indigo)
 * - Arbitrum: Triangle shapes (blue/cyan)
 * - Optimism: Circle shapes (red/orange)
 */

import { cn } from '@/shared/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { Transition, TargetAndTransition } from 'framer-motion'

// --- Types & Constants ---

type NetworkTheme = 'arbitrum' | 'optimism' | 'ethereum'

export type NetworkBackgroundProps = {
  theme?: NetworkTheme
  className?: string
}

const CLIP_PATHS = {
  triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  rhombus: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
}

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`

// --- Shape Component ---

type ShapeProps = {
  className: string
  color: string
  animate: TargetAndTransition
  transition: Transition
  delay?: number
  clipPath?: string
  rounded?: string
}

function Shape({
  className,
  color,
  animate,
  transition,
  delay = 0,
  clipPath,
  rounded = 'rounded-none',
}: ShapeProps) {
  const wrapperClasses = cn('absolute mix-blend-screen', className)
  const finalTransition = { ...transition, delay }

  return (
    <motion.div className={wrapperClasses} animate={animate} transition={finalTransition}>
      <div className={cn('h-full w-full', color, rounded)} style={{ clipPath }} />
    </motion.div>
  )
}

// --- Main Component ---

export function NetworkBackground({ theme = 'ethereum', className }: NetworkBackgroundProps) {
  const renderThemeShapes = () => {
    switch (theme) {
      case 'optimism':
        return (
          <>
            <Shape
              className="-bottom-20 -left-20 h-[700px] w-[700px] opacity-40 blur-[80px]"
              color="bg-red-500/40"
              rounded="rounded-full"
              animate={{ y: [0, -100, 0], x: [0, 50, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Shape
              className="-right-20 -top-20 h-[600px] w-[600px] opacity-40 blur-[60px]"
              color="bg-orange-500/40"
              rounded="rounded-full"
              animate={{ y: [0, -150, 0], x: [0, -50, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
              delay={2}
            />
            <Shape
              className="right-[-10%] top-1/2 h-[400px] w-[400px] opacity-40 blur-[50px]"
              color="bg-rose-500/30"
              rounded="rounded-full"
              animate={{ y: [0, -50, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 15, repeat: Infinity }}
            />
          </>
        )

      case 'arbitrum':
        return (
          <>
            <Shape
              className="-left-[10%] -top-[10%] h-[700px] w-[700px] opacity-40 blur-[50px]"
              color="bg-blue-500/40"
              clipPath={CLIP_PATHS.triangle}
              animate={{ x: [0, 50, 0], y: [0, 50, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Shape
              className="-bottom-[10%] -right-[10%] h-[800px] w-[800px] opacity-40 blur-[60px]"
              color="bg-cyan-600/30"
              clipPath={CLIP_PATHS.triangle}
              animate={{ x: [0, -50, 0], y: [0, -50, 0], rotate: [0, -15, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
              delay={2}
            />
            <Shape
              className="left-[-200px] top-1/2 h-[400px] w-[400px] opacity-30 blur-[50px]"
              color="bg-blue-400/20"
              rounded="rounded-full"
              animate={{ x: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </>
        )

      case 'ethereum':
      default:
        return (
          <>
            <Shape
              className="left-[-200px] top-0 h-[900px] w-[600px] opacity-40 blur-[40px]"
              color="bg-blue-600/30"
              clipPath={CLIP_PATHS.rhombus}
              animate={{ y: [-50, 50, -50], rotate: [0, 5, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Shape
              className="bottom-0 right-[-200px] h-[900px] w-[600px] opacity-40 blur-[60px]"
              color="bg-indigo-500/30"
              clipPath={CLIP_PATHS.rhombus}
              animate={{ y: [50, -50, 50], rotate: [0, -5, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
              delay={1}
            />
          </>
        )
    }
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-0 overflow-hidden bg-zinc-950',
        className
      )}
    >
      {/* Shapes Container with AnimatePresence for smooth transitions */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0 h-full w-full"
        >
          {renderThemeShapes()}
        </motion.div>
      </AnimatePresence>

      {/* Noise Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: NOISE_SVG }}
      />

      {/* Vignette/Readability Layer */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.2)_50%,rgba(9,9,11,0.8)_100%)]" />
    </div>
  )
}
