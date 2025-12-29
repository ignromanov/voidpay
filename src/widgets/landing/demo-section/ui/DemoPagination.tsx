/**
 * DemoPagination - Navigation dots for demo invoice carousel
 * Feature: 012-landing-page
 */

import React from 'react'

interface DemoPaginationProps {
  items: ReadonlyArray<{ invoiceId: string }>
  activeIndex: number
  onSelect: (index: number) => void
}

export const DemoPagination = React.memo<DemoPaginationProps>(
  ({ items, activeIndex, onSelect }) => {
    return (
      <div className="mt-6 flex justify-center gap-3">
        {items.map((item, index) => (
          <button
            key={item.invoiceId}
            type="button"
            aria-label={`View invoice ${item.invoiceId}`}
            className="group relative flex h-8 w-8 cursor-pointer items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            onClick={() => onSelect(index)}
          >
            <span
              className={`block h-2 rounded-full transition-all duration-200 group-hover:scale-125 ${
                index === activeIndex
                  ? 'w-6 bg-violet-500'
                  : 'w-2 bg-zinc-600 group-hover:bg-zinc-400'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }
)

DemoPagination.displayName = 'DemoPagination'
