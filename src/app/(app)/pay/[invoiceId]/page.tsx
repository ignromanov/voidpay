export default async function PayInvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const { invoiceId } = await params
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-electric-violet mb-8 text-3xl font-bold">Pay Invoice</h1>
      <p>Invoice ID: {invoiceId}</p>
    </div>
  )
}
