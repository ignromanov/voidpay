'use client'

import { useState } from 'react'

import { Text } from '@/shared/ui/typography'
import { ChevronUpIcon, PlusIcon } from '@/shared/ui/icons'
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
        className="group flex cursor-pointer items-center gap-1.5 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
        aria-expanded={isOpen}
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title}`}
      >
        <div
          className={cn(
            'rounded p-0.5 transition-colors group-hover:bg-violet-500/10',
            isOpen ? 'bg-violet-500/10 text-violet-400' : 'bg-zinc-800'
          )}
        >
          {isOpen ? (
            <ChevronUpIcon size={12} className="text-zinc-500 group-hover:text-violet-400" />
          ) : (
            <PlusIcon size={12} className="text-zinc-500 group-hover:text-violet-400" />
          )}
        </div>
        <Text
          variant="label"
          className="cursor-pointer text-zinc-400 transition-colors group-hover:text-violet-400"
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
