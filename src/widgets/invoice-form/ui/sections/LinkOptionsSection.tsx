'use client'

import { MagicDustToggle } from '../MagicDustToggle'
import { OgImageCheckbox } from '../OgImageCheckbox'

/**
 * Link generation options: Magic Dust toggle and OG image checkbox.
 * Uses store directly (no props needed).
 */
export function LinkOptionsSection() {
  return (
    <div className="space-y-3 border-t border-zinc-800/50 pt-4">
      <MagicDustToggle />
      <OgImageCheckbox />
    </div>
  )
}
