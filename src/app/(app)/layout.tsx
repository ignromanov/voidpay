/**
 * App Layout — Fullscreen layout for /pay and /create routes
 *
 * - Fixed height viewport (excludes Navigation 64px; Footer is in document flow, not fixed)
 * - No scroll on page level
 * - Children handle their own internal scrolling
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col overflow-hidden print:h-auto print:overflow-visible">
      {children}
    </div>
  )
}
