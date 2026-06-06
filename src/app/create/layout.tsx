import { Footer } from '@/widgets/footer'

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
