'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, Plus } from 'lucide-react'

import { Text } from '@/shared/ui'
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
 * Expandable section with smooth Framer Motion animations.
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden pt-1 pl-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
