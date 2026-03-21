'use client'

import { Share2Icon, ArrowRightIcon, Loader2Icon } from '@/shared/ui/icons'
import { toast } from '@/shared/lib/toast'

import { Button } from '@/shared/ui/button'

export interface GenerateButtonProps {
  onGenerate: (() => void) | undefined
  canGenerate: boolean
  isGenerating?: boolean | undefined
  onSubmitAttempt?: () => void
}

/**
 * Generate invoice link button with glow variant.
 */
export function GenerateButton({ onGenerate, canGenerate, isGenerating = false, onSubmitAttempt }: GenerateButtonProps) {
  const handleClick = () => {
    if (!canGenerate) {
      onSubmitAttempt?.()
      return
    }
    if (onGenerate) {
      onGenerate()
    } else {
      toast.success('Coming soon', {
        description: 'Invoice generation will be available in the next update',
      })
    }
  }

  return (
    <div className="pt-4">
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
