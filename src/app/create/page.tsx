import type { Metadata } from 'next'
import { LazyWeb3Provider } from '../lazy-web3-provider'
import { CreateWorkspace } from './CreateWorkspace'

export const metadata: Metadata = {
  title: 'Create Invoice | VoidPay',
  description: 'Create and share crypto invoices instantly. No signup required.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CreatePage() {
  return (
    <LazyWeb3Provider>
      <CreateWorkspace />
    </LazyWeb3Provider>
  )
}
