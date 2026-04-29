/**
 * App Layout — Fullscreen layout for /pay, /create, /invoice routes
 *
 * - Fixed height viewport (excludes Navigation 64px + Footer 40px = 104px reserved)
 * - Footer is fixed overlay (40px reserved in height calculation)
 * - No scroll on page level
 * - Children handle their own internal scrolling
 */
import { Footer } from '@/widgets/footer'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div className="flex h-[calc(100dvh-104px)] flex-col overflow-hidden print:h-auto print:overflow-visible">
        {children}
      </div>
      <Footer floating />
    </>
  )
}
