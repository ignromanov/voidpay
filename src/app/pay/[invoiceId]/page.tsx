export default async function PayInvoicePage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-electric-violet">Pay Invoice</h1>
      <p>Invoice ID: {invoiceId}</p>
    </div>
  );
}
