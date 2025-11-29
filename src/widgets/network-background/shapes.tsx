'use client'

import { motion } from 'framer-motion'
import type { ShapeType } from '@/shared/ui/constants/brand-tokens'

interface ShapeProps {
  type: ShapeType
  color: string
  size: number
  delay: number
  duration: number
  index: number
}

/**
 * Renders individual animated shape for NetworkBackground
 */
export function Shape({ type, color, size, delay, duration, index }: ShapeProps) {
  const shapeVariants = {
    initial: {
      opacity: 0,
      y: '100vh',
      scale: 0.5,
    },
    animate: {
      opacity: [0.1, 0.3, 0.1],
      y: [100, -10, 100],
      scale: [0.5, 1.2, 0.5],
      transition: {
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear' as const,
      },
    },
  }

  const renderShape = () => {
    const sharedClasses = 'absolute'
    const sharedStyle = {
      filter: 'blur(40px)',
      width: `${size}px`,
      height: `${size}px`,
    }

    switch (type) {
      case 'triangle':
        return (
          <div
            data-shape="triangle"
            className={sharedClasses}
            style={{
              ...sharedStyle,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              backgroundColor: color,
            }}
          />
        )

      case 'circle':
        return (
          <div
            data-shape="circle"
            className={`${sharedClasses} rounded-full`}
            style={{
              ...sharedStyle,
              backgroundColor: color,
            }}
          />
        )

      case 'hexagon':
        return (
          <div
            data-shape="hexagon"
            className={sharedClasses}
            style={{
              ...sharedStyle,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              backgroundColor: color,
            }}
          />
        )

      case 'rhombus':
        return (
          <div
            data-shape="rhombus"
            className={sharedClasses}
            style={{
              ...sharedStyle,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              backgroundColor: color,
            }}
          />
        )

      case 'blob':
        return (
          <div
            data-shape="blob"
            className={sharedClasses}
            style={{
              ...sharedStyle,
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              backgroundColor: color,
            }}
          />
        )

      default:
        return (
          <div
            data-shape="circle"
            className={`${sharedClasses} rounded-full`}
            style={{
              ...sharedStyle,
              backgroundColor: color,
            }}
          />
        )
    }
  }

  return (
    <motion.div
      key={`${type}-${index}`}
      variants={shapeVariants}
      initial="initial"
      animate="animate"
      style={{
        position: 'absolute',
        left: `${(index * 100) / 12}%`,
        top: 0,
      }}
    >
      {renderShape()}
    </motion.div>
  )
}
