'use client'

import { useState, useEffect, useCallback } from 'react'

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const STATIC_CHARS = /[\s.,!?;:'"()-]/

/**
 * Hook for character-by-character scramble reveal animation
 *
 * @param text - Target text to reveal
 * @param duration - Total animation duration in milliseconds
 * @param animateOnLoad - Whether to animate on initial mount
 * @param onComplete - Callback when animation completes
 *
 * @returns displayText - Current text to display (scrambled or final)
 * @returns triggerAnimation - Function to manually trigger animation
 *
 * @example
 * ```tsx
 * const { displayText } = useHyperText('Hello World', 300, true)
 * return <span>{displayText}</span>
 * ```
 */
export function useHyperText(
  text: string,
  duration: number = 300,
  animateOnLoad: boolean = true,
  onComplete?: () => void
) {
  const [displayText, setDisplayText] = useState(animateOnLoad ? '' : text)
  const [isAnimating, setIsAnimating] = useState(animateOnLoad)

  const animate = useCallback(() => {
    if (!text) {
      setDisplayText('')
      setIsAnimating(false)
      return
    }

    setIsAnimating(true)

    const charDelay = duration / text.length
    let currentIndex = 0

    const updateText = () => {
      setDisplayText(() => {
        const chars = text.split('').map((char, i) => {
          // Already revealed characters
          if (i < currentIndex) return char

          // Static characters (spaces, punctuation) are never scrambled
          if (STATIC_CHARS.test(char)) return char

          // Scramble remaining characters
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        })

        return chars.join('')
      })

      currentIndex++

      if (currentIndex > text.length) {
        clearInterval(animationFrame)
        setDisplayText(text)
        setIsAnimating(false)
        onComplete?.()
      }
    }

    // Start animation
    const animationFrame = setInterval(updateText, charDelay)

    return () => clearInterval(animationFrame)
  }, [text, duration, onComplete])

  useEffect(() => {
    if (isAnimating) {
      return animate()
    }
    return undefined
  }, [animate, isAnimating])

  // Re-animate when text changes
  useEffect(() => {
    if (animateOnLoad) {
      setIsAnimating(true)
    } else {
      setDisplayText(text)
    }
  }, [text, animateOnLoad])

  const triggerAnimation = useCallback(() => {
    setIsAnimating(true)
  }, [])

  return { displayText, triggerAnimation }
}
