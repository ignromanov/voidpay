'use client'

import { Share2Icon, ArrowRightIcon } from '@/shared/ui/icons'
import { toast } from '@/shared/lib/toast'

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
      toast.success('Coming soon', {
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
        <Share2Icon size={20} className="mr-2" />
        Generate Invoice Link
        <ArrowRightIcon size={16} className="ml-2" />
      </Button>
    </div>
  )
}
