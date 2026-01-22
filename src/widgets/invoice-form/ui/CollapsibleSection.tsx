'use client'

import { useState } from 'react'
import { ChevronUp, Plus } from 'lucide-react'

import { Text } from '@/shared/ui/typography'
import { cn } from '@/shared/lib/utils'

export interface CollapsibleSectionProps {
  title: string
  children?: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

/**
 * CollapsibleSection Component
 *
 * Expandable section with smooth CSS animations (no Framer Motion).
 * Uses the grid-template-rows trick for animating height to/from auto.
 * Used for optional fields in InvoiceForm (contact info, notes).
 *
 * @example
 * ```tsx
 * <CollapsibleSection title="Add Contact Info (Optional)">
 *   <Input label="Email" ... />
 * </CollapsibleSection>
 * ```
 */
export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('space-y-2', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex cursor-pointer items-center gap-1.5 focus:outline-none"
        aria-expanded={isOpen}
      >
        <div
          className={cn(
            'rounded p-0.5 transition-colors group-hover:bg-violet-500/10',
            isOpen ? 'bg-violet-500/10 text-violet-400' : 'bg-zinc-800'
          )}
        >
          {isOpen ? (
            <ChevronUp className="h-3 w-3 text-zinc-500 group-hover:text-violet-400" />
          ) : (
            <Plus className="h-3 w-3 text-zinc-500 group-hover:text-violet-400" />
          )}
        </div>
        <Text
          variant="label"
          className="cursor-pointer text-zinc-500 transition-colors group-hover:text-violet-400"
        >
          {title}
        </Text>
      </button>
      {/* CSS grid-template-rows animation: 0fr → 1fr enables height: auto animation */}
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-1 pl-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
