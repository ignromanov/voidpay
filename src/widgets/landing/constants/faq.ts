/**
 * FAQ content for landing page
 * Feature: 012-landing-page
 * SEO: Used for JSON-LD FAQPage schema
 */

export type FaqItem = {
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is VoidPay really free?',
    answer:
      "Yes, forever. We don't store your data on any server, so there's nothing to charge for. You only pay network gas fees when sending payments.",
  },
  {
    question: 'What if VoidPay shuts down?',
    answer:
      "Your invoices keep working. The data is in the URL, not on our servers. You can even self-host VoidPay — it's open source.",
  },
  {
    question: 'Do you collect any data?',
    answer:
      "Zero. No analytics, no telemetry, no tracking. We literally can't see your invoices — they exist only in your URL.",
  },
  {
    question: 'What happens if the link breaks?',
    answer:
      "It can't break. Your invoice data IS the link — it's encoded directly in the URL. As long as you have the URL saved, your invoice exists forever.",
  },
  {
    question: 'Which wallets are supported?',
    answer:
      'Any EVM-compatible wallet works — MetaMask, Rainbow, Coinbase Wallet, WalletConnect, Rabby, and many more. If it connects to Ethereum, it works with VoidPay.',
  },
  {
    question: 'Is this secure?',
    answer:
      'Your data never touches our servers. Invoice information is compressed and encoded directly into the URL. We use industry-standard compression (pako) and base64url encoding.',
  },
  {
    question: 'Can I export to PDF?',
    answer:
      'Yes! Every invoice can be exported as a professional PDF document. The PDF includes all invoice details, QR code, and payment information.',
  },
  {
    question: 'What networks are supported?',
    answer:
      'VoidPay supports Ethereum, Arbitrum, Optimism, and Polygon. We plan to add more networks based on community feedback.',
  },
  {
    question: 'How do I get paid?',
    answer:
      'Share your invoice link with your client. They connect their wallet, review the invoice, and pay with one click. The payment goes directly to your wallet address.',
  },
]
