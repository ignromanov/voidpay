'use client'

import { Share2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/ui/button'

export interface GenerateButtonProps {
  onGenerate: (() => void) | undefined
  canGenerate: boolean
}

/**
 * Generate invoice link button with glow variant.
 */
export function GenerateButton({ onGenerate, canGenerate }: GenerateButtonProps) {
  const handleClick = () => {
    if (onGenerate) {
      onGenerate()
    } else {
      toast.info('Coming soon', {
        description: 'Invoice generation will be available in the next update',
      })
    }
  }

  return (
    <div className="pt-4">
      <Button
        onClick={handleClick}
        disabled={!canGenerate}
        variant="glow"
        className="h-14 w-full cursor-pointer text-base"
      >
        <Share2 className="mr-2 h-5 w-5" />
        Generate Invoice Link
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
