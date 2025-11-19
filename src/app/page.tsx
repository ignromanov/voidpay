import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1 className="text-electric-violet text-4xl font-bold">VoidPay</h1>
        <p className="text-lg">Stateless Invoicing Platform</p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <ConnectButton />
        </div>
      </main>
    </div>
  )
}
