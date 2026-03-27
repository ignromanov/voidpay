/**
 * App Layout — Fullscreen layout for /pay and /create routes
 *
 * - Fixed height viewport (excludes Navigation 64px + Footer 40px)
 * - No scroll on page level
 * - Children handle their own internal scrolling
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-[calc(100dvh-104px)] flex-col overflow-hidden print:h-auto print:overflow-visible">
      {children}
    </div>
  )
}
