'use client'

import { MagicDustToggle } from '../MagicDustToggle'

/**
 * Link generation options: Magic Dust toggle.
 * OG preview moved to ShareModal (computed dynamically at share time).
 */
export function LinkOptionsSection() {
  return (
    <div className="space-y-3 border-t border-zinc-800/50 pt-4">
      <MagicDustToggle />
    </div>
  )
}
