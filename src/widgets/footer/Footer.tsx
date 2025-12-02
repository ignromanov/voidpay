'use client'

/**
 * Footer Component
 *
 * Site footer matching design v3 with:
 * - Copyright and legal links
 * - Support button with heart icon
 * - Social media links (GitHub, Twitter)
 */

import { Heart, Github, Twitter } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Left: Copyright and legal links */}
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>&copy; 2025 VoidPay Protocol</span>
            <span className="text-zinc-700">|</span>
            <a
              href="#"
              className="transition-colors hover:text-zinc-300"
            >
              Privacy
            </a>
            <a
              href="#"
              className="transition-colors hover:text-zinc-300"
            >
              Terms
            </a>
          </div>

          {/* Right: Support button and social links */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-zinc-400 hover:text-zinc-50"
            >
              <Heart className="h-4 w-4" />
              Support VoidPay
            </Button>

            <span className="text-zinc-700">|</span>

            <div className="flex items-center gap-1">
              <a
                href="https://github.com/voidpay/voidpay"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-50"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/voidpay"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-50"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
