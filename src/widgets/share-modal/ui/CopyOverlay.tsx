'use client'

import { motion } from '@/shared/ui/motion'
import { useReducedMotion } from '@/shared/ui'

interface CopyOverlayProps {
  copied: boolean
}

const IDLE = {
  primary:   'radial-gradient(ellipse 80% 60% at 50% 50%, oklch(45% 0.27 280 / 0.5) 0%, oklch(52% 0.22 285 / 0.3) 40%, transparent 70%)',
  secondary: 'radial-gradient(ellipse 70% 50% at 45% 55%, oklch(57% 0.24 290 / 0.4) 0%, oklch(66% 0.17 290 / 0.2) 50%, transparent 70%)',
  glow:      'radial-gradient(circle at center, oklch(45% 0.27 280 / 0.3) 0%, transparent 60%)',
}

const SUCCESS = {
  primary:   'radial-gradient(ellipse 100% 80% at 50% 50%, oklch(72% 0.18 165 / 0.5) 0%, oklch(76% 0.15 175 / 0.3) 50%, transparent 70%)',
  secondary: 'radial-gradient(ellipse 80% 60% at 48% 52%, oklch(75% 0.16 170 / 0.4) 0%, oklch(78% 0.14 185 / 0.2) 50%, transparent 70%)',
}

/**
 * Fluid gradient overlay for Copy Link button.
 * Idle: calm violet breathing. Copied: emerald success bloom.
 * Same visual language as SmartPayButton's FluidOverlay.
 */
export function CopyOverlay({ copied }: CopyOverlayProps) {
  const prefersReducedMotion = useReducedMotion()
  const palette = copied ? SUCCESS : IDLE

  if (prefersReducedMotion) {
    return (
      <div className="pointer-events-none absolute inset-0 rounded-[inherit]">
        <div className="absolute inset-0 rounded-[inherit] opacity-30" style={{ background: palette.primary }} />
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit]">
      {/* Layer 1: Primary morphing blob */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] blur-xl"
        animate={copied
          ? { opacity: [0.5, 0.9, 0.3], scale: [1, 1.4, 1.1] }
          : { opacity: [0.15, 0.22, 0.15], scale: [1, 1.04, 1] }
        }
        transition={copied
          ? { duration: 1.2, times: [0, 0.4, 1], ease: 'easeOut' }
          : { duration: 9, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ background: palette.primary }}
      />

      {/* Layer 2: Secondary blob (offset, counter-phase) */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] blur-2xl"
        animate={copied
          ? { opacity: [0.3, 0.7, 0.2], x: [0, 5, 0], y: [0, -5, 0] }
          : { opacity: [0.1, 0.18, 0.1], x: [-1, 1, -1], y: [1, -1, 1] }
        }
        transition={copied
          ? { duration: 1, times: [0, 0.5, 1], ease: 'easeOut' }
          : { duration: 11, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 1] }
        }
        style={{ background: palette.secondary }}
      />

      {/* Layer 3: Soft inner glow (idle only) */}
      {!copied && (
        <motion.div
          className="absolute inset-0 rounded-[inherit]"
          animate={{ opacity: 0.04 }}
          transition={{ duration: 0.4 }}
          style={{ background: IDLE.glow }}
        />
      )}

      {/* Layer 4: Success bloom */}
      {copied && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] blur-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 0.8, 0.4], scale: [0.9, 1.3, 1.05] }}
          transition={{ duration: 1, times: [0, 0.4, 1], ease: 'easeOut' }}
          style={{ background: SUCCESS.primary }}
        />
      )}
    </div>
  )
}
