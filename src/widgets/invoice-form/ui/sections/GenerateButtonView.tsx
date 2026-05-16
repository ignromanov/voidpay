'use client'

import React, { useCallback } from 'react'
import { Share2Icon, ArrowRightIcon, Loader2Icon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'

export interface GenerateButtonViewProps {
  onGenerate: (() => void) | undefined
  canGenerate: boolean
  isGenerating?: boolean | undefined
  onSubmitAttempt?: () => void
  /** Simulated hover state for Remotion frame-driven rendering */
  hoverState?: boolean
  /** Simulated press state for Remotion frame-driven rendering */
  pressState?: boolean
}

/**
 * Presentational Generate button. Hover/press states driven by props so
 * Remotion can simulate user interaction frame-by-frame without framer-motion.
 */
export const GenerateButtonView = React.memo(function GenerateButtonView({
  onGenerate,
  canGenerate,
  isGenerating = false,
  onSubmitAttempt,
  hoverState = false,
  pressState = false,
}: GenerateButtonViewProps) {
  const handleClick = useCallback(() => {
    if (!canGenerate) {
      onSubmitAttempt?.()
      return
    }
    onGenerate?.()
  }, [canGenerate, onGenerate, onSubmitAttempt])

  // Only apply frame-precise transform in the Remotion path (hoverState/pressState
  // are undefined in production). Production path gets style={undefined} so the
  // Button's native CSS hover styles are not suppressed.
  const interactive = hoverState || pressState
  const remotionStyle: React.CSSProperties | undefined = interactive
    ? {
        transform: pressState ? 'scale(0.97)' : 'scale(1.02)',
        transformOrigin: 'center',
        transition: 'none',
      }
    : undefined

  return (
    <div className="pt-4" style={remotionStyle}>
      <Button
        onClick={handleClick}
        disabled={isGenerating}
        variant="glow"
        className="h-14 w-full cursor-pointer text-base"
      >
        {isGenerating ? (
          <>
            <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Share2Icon size={20} className="mr-2" />
            Generate Invoice Link
            <ArrowRightIcon size={16} className="ml-2" />
          </>
        )}
      </Button>
    </div>
  )
})
