'use client'

import { Share2Icon, ArrowRightIcon, Loader2Icon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'

export interface GenerateButtonViewProps {
  onGenerate: (() => void) | undefined
  canGenerate: boolean
  isGenerating?: boolean | undefined
  onSubmitAttempt?: () => void
  /** Round 9a: simulate hover state for Remotion render */
  hoverState?: boolean
  /** Round 9a: simulate press state for Remotion render */
  pressState?: boolean
}

/**
 * Presentational Generate button — extracted from GenerateButton (round-9a).
 * Parallel to SmartPayButtonView from round-6.
 *
 * Strips framer-motion (none in production GenerateButton, but this View is
 * safe for Remotion render path by design). Hover/press states driven by props
 * so Remotion can simulate user interaction frame-by-frame.
 */
export function GenerateButtonView({
  onGenerate,
  canGenerate,
  isGenerating = false,
  onSubmitAttempt,
  hoverState = false,
  pressState = false,
}: GenerateButtonViewProps) {
  const handleClick = () => {
    if (!canGenerate) {
      onSubmitAttempt?.()
      return
    }
    onGenerate?.()
  }

  return (
    <div
      className="pt-4"
      style={{
        transform: pressState ? 'scale(0.97)' : hoverState ? 'scale(1.02)' : undefined,
        transformOrigin: 'center',
        transition: 'none', // Remotion: no CSS transitions
      }}
    >
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
}
