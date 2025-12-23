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
import { motion, AnimatePresence, type Transition } from './motion'
import type { TargetAndTransition } from 'framer-motion'
import type { NetworkTheme } from './constants/brand-tokens'

// --- Types & Constants ---

export type NetworkBackgroundProps = {
  theme?: NetworkTheme
  className?: string
}

const CLIP_PATHS = {
  // Ethereum: Diamond with inner facet
  ethereumOuter: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  ethereumInner: 'polygon(50% 20%, 80% 50%, 50% 80%, 20% 50%)',
  // Arbitrum: Stylized upward arrow
  arbitrumArrow: 'polygon(50% 0%, 100% 100%, 70% 100%, 50% 35%, 30% 100%, 0% 100%)',
  // Polygon: Hexagon shapes
  polygonHex: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  polygonInner: 'polygon(35% 15%, 65% 15%, 85% 50%, 65% 85%, 35% 85%, 15% 50%)',
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
  // Asymmetric layout: Primary shape top-left, secondary bottom-right, accent mid-right
  const renderThemeShapes = () => {
    switch (theme) {
      // Optimism: Concentric rings (O logo style)
      case 'optimism':
        return (
          <>
            {/* Primary: Large ring top-left */}
            <Shape
              className="-left-[15%] -top-[10%] h-[600px] w-[600px] opacity-50 blur-[20px]"
              color="bg-red-500/50"
              rounded="rounded-full"
              animate={{ y: [0, 40, 0], x: [0, 30, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Inner ring (creates O effect) */}
            <div className="absolute -left-[15%] -top-[10%] h-[600px] w-[600px] opacity-50 blur-[20px]">
              <motion.div
                className="absolute inset-[25%] rounded-full bg-zinc-950"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            {/* Secondary: Smaller ring bottom-right */}
            <Shape
              className="-bottom-[5%] -right-[10%] h-[400px] w-[400px] opacity-40 blur-[15px]"
              color="bg-orange-500/40"
              rounded="rounded-full"
              animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
              delay={3}
            />
            {/* Accent: Small circle mid-right */}
            <Shape
              className="right-[5%] top-[40%] h-[200px] w-[200px] opacity-35 blur-[12px]"
              color="bg-rose-400/35"
              rounded="rounded-full"
              animate={{ y: [0, -25, 0], opacity: [0.35, 0.5, 0.35] }}
              transition={{ duration: 12, repeat: Infinity }}
              delay={1}
            />
          </>
        )

      // Arbitrum: Stylized A / upward arrows
      case 'arbitrum':
        return (
          <>
            {/* Primary: Large arrow top-left */}
            <Shape
              className="-left-[10%] -top-[5%] h-[650px] w-[500px] opacity-50 blur-[18px]"
              color="bg-sky-500/50"
              clipPath={CLIP_PATHS.arbitrumArrow}
              animate={{ y: [0, 35, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Secondary: Medium arrow bottom-right, rotated */}
            <Shape
              className="-bottom-[8%] -right-[8%] h-[500px] w-[400px] opacity-40 blur-[15px]"
              color="bg-cyan-400/40"
              clipPath={CLIP_PATHS.arbitrumArrow}
              animate={{ y: [0, -30, 0], rotate: [180, 177, 180] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              delay={2}
            />
            {/* Accent: Small glow mid-right */}
            <Shape
              className="right-[8%] top-[35%] h-[180px] w-[140px] opacity-30 blur-[12px]"
              color="bg-blue-400/30"
              clipPath={CLIP_PATHS.arbitrumArrow}
              animate={{ y: [0, -20, 0], opacity: [0.3, 0.45, 0.3] }}
              transition={{ duration: 10, repeat: Infinity }}
              delay={4}
            />
          </>
        )

      // Polygon: Hexagon shapes
      case 'polygon':
        return (
          <>
            {/* Primary: Large hexagon top-left */}
            <Shape
              className="-left-[12%] -top-[8%] h-[600px] w-[600px] opacity-50 blur-[18px]"
              color="bg-purple-500/50"
              clipPath={CLIP_PATHS.polygonHex}
              animate={{ y: [0, 35, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Inner hexagon (creates layered effect) */}
            <Shape
              className="-left-[12%] -top-[8%] h-[600px] w-[600px] opacity-30 blur-[10px]"
              color="bg-violet-400/30"
              clipPath={CLIP_PATHS.polygonInner}
              animate={{ y: [0, 35, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Secondary: Smaller hexagon bottom-right */}
            <Shape
              className="-bottom-[6%] -right-[8%] h-[420px] w-[420px] opacity-40 blur-[15px]"
              color="bg-fuchsia-500/40"
              clipPath={CLIP_PATHS.polygonHex}
              animate={{ y: [0, -28, 0], rotate: [30, 25, 30] }}
              transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }}
              delay={2}
            />
            {/* Accent: Small hexagon mid-right */}
            <Shape
              className="right-[6%] top-[38%] h-[160px] w-[160px] opacity-35 blur-[10px]"
              color="bg-purple-400/35"
              clipPath={CLIP_PATHS.polygonHex}
              animate={{ y: [0, -18, 0], opacity: [0.35, 0.5, 0.35] }}
              transition={{ duration: 11, repeat: Infinity }}
              delay={3}
            />
          </>
        )

      // Ethereum: Diamond/rhombus with facets
      case 'ethereum':
      default:
        return (
          <>
            {/* Primary: Large diamond top-left */}
            <Shape
              className="-left-[12%] -top-[5%] h-[700px] w-[500px] opacity-50 blur-[18px]"
              color="bg-blue-500/50"
              clipPath={CLIP_PATHS.ethereumOuter}
              animate={{ y: [0, 40, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Inner facet (creates ETH logo depth) */}
            <Shape
              className="-left-[12%] -top-[5%] h-[700px] w-[500px] opacity-35 blur-[10px]"
              color="bg-indigo-400/35"
              clipPath={CLIP_PATHS.ethereumInner}
              animate={{ y: [0, 40, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Secondary: Smaller diamond bottom-right */}
            <Shape
              className="-bottom-[8%] -right-[10%] h-[550px] w-[400px] opacity-40 blur-[15px]"
              color="bg-indigo-500/40"
              clipPath={CLIP_PATHS.ethereumOuter}
              animate={{ y: [0, -35, 0], rotate: [0, -3, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              delay={2}
            />
            {/* Accent: Small diamond mid-right */}
            <Shape
              className="right-[8%] top-[40%] h-[200px] w-[150px] opacity-35 blur-[10px]"
              color="bg-blue-400/35"
              clipPath={CLIP_PATHS.ethereumOuter}
              animate={{ y: [0, -20, 0], opacity: [0.35, 0.5, 0.35] }}
              transition={{ duration: 12, repeat: Infinity }}
              delay={4}
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
