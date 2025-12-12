'use client'

/**
 * Footer Component
 *
 * Minimal glass-style footer:
 * - Sticky to bottom
 * - Glass effect (backdrop-blur)
 * - Single line: copyright, links, social
 */

import { Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800/30 bg-zinc-950/60 backdrop-blur-xl">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 text-xs text-zinc-400">
        {/* Left: Copyright */}
        <div className="flex items-center gap-3">
          <span>© 2025 VoidPay</span>
          <a href="#" className="transition-colors hover:text-zinc-300">Privacy</a>
          <a href="#" className="transition-colors hover:text-zinc-300">Terms</a>
        </div>

        {/* Right: Social */}
        <div className="flex items-center gap-1">
          <a
            href="https://github.com/voidpay/voidpay"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1.5 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href="https://twitter.com/voidpay"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1.5 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
            aria-label="Twitter"
          >
            <Twitter className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
