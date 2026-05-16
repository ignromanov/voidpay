'use client'

import { toast } from '@/shared/lib/toast'
import { GenerateButtonView } from './GenerateButtonView'

export interface GenerateButtonProps {
  onGenerate: (() => void) | undefined
  canGenerate: boolean
  isGenerating?: boolean | undefined
  onSubmitAttempt?: () => void
}

/**
 * Generate invoice link button — Container.
 * Delegates rendering to GenerateButtonView.
 * Production: no Remotion frame, so hover/press are CSS-native (no prop injection).
 */
export function GenerateButton({ onGenerate, canGenerate, isGenerating = false, onSubmitAttempt }: GenerateButtonProps) {
  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate()
    } else {
      toast.success('Coming soon', {
        description: 'Invoice generation will be available in the next update',
      })
    }
  }

  return (
    <GenerateButtonView
      onGenerate={handleGenerate}
      canGenerate={canGenerate}
      isGenerating={isGenerating}
      {...(onSubmitAttempt && { onSubmitAttempt })}
    />
  )
}
