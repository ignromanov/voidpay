import Link from 'next/link'
import { VoidLogo } from '@/shared/ui/void-logo'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <VoidLogo size="lg" className="mb-6 opacity-20" />
      <h1 className="mb-2 text-4xl font-bold text-zinc-50">404</h1>
      <p className="mb-8 max-w-md text-zinc-400">
        This page doesn&apos;t exist. If you followed an invoice link, check that the full URL was copied correctly.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-zinc-800 px-6 py-3 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700"
      >
        Back to Home
      </Link>
    </div>
  )
}
