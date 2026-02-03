'use client'

import type { SVGProps } from 'react'

import { Heading } from '@/shared/ui/typography'
import { cn } from '@/shared/lib/utils'

type IconComponent = (props: SVGProps<SVGSVGElement> & { size?: number | string }) => React.JSX.Element

export interface SectionHeadingProps {
  icon: IconComponent
  iconColorClass: string
  title: string
  className?: string
}

/**
 * Reusable section heading with icon badge.
 * Used consistently across form sections.
 */
export function SectionHeading({ icon: Icon, iconColorClass, title, className }: SectionHeadingProps) {
  return (
    <div className={cn('mb-2 flex items-center gap-2', className)}>
      <div className={cn('rounded border p-1.5', iconColorClass)}>
        <Icon size={16} className="h-4 w-4" />
      </div>
      <Heading variant="h4" className="text-zinc-300">
        {title}
      </Heading>
    </div>
  )
}
