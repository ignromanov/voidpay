/**
 * Privacy Policy Content
 * Separated from page component for maintainability
 */

export const privacyContent = {
  meta: {
    title: 'Privacy Policy | VoidPay',
    description:
      'VoidPay privacy policy. Zero-backend architecture means your invoice data lives only in the URL hash fragment, never on our servers.',
    lastUpdated: 'January 2026',
  },

  sections: [
    {
      id: 'philosophy',
      title: 'Our Privacy Philosophy',
      content:
        "VoidPay is built on a fundamental principle: we can't lose, leak, or sell your data because we never have it. This isn't just a policy choice — it's an architectural decision baked into the core of our application.",
    },
    {
      id: 'architecture',
      title: 'How Our Zero-Backend Architecture Works',
      content:
        "When you create an invoice, all the data is compressed and encoded directly into the URL's hash fragment (the part after the # symbol).",
      codeExample: 'https://voidpay.xyz/pay#N4IgbghgTg9g...',
      additionalContent:
        "Here's the key: hash fragments are never sent to web servers. This is a fundamental property of how URLs work in web browsers (defined in RFC 3986). When you open an invoice link, your browser keeps the hash fragment local and only sends the base URL to our server.",
    },
    {
      id: 'not-collected',
      title: "What We Don't Collect",
      items: [
        { label: 'Invoice data', description: 'amounts, descriptions, line items, dates' },
        { label: 'Wallet addresses', description: 'sender or recipient' },
        { label: 'Personal information', description: 'names, emails, company details' },
        { label: 'Payment information', description: 'transaction hashes, payment status' },
        { label: 'User accounts', description: 'we have no registration or authentication' },
        {
          label: 'Analytics or telemetry',
          description:
            'we use privacy-focused Umami analytics on the landing page only — you can opt out via the footer toggle. No data is collected on /create or /pay pages',
        },
        { label: 'Cookies for tracking', description: 'we use no cookies whatsoever' },
      ],
    },
    {
      id: 'local-storage',
      title: 'Local Storage (Your Data, Your Device)',
      content:
        "VoidPay uses your browser's LocalStorage to save invoice drafts and history. This data:",
      items: [
        { label: 'Never leaves your device', description: 'stored locally in your browser' },
        {
          label: 'Is fully under your control',
          description: 'you can clear it anytime via browser settings',
        },
        {
          label: 'Is exportable',
          description: 'you can export your history as JSON for backup or migration',
        },
        { label: 'Is importable', description: 'restore your data on any device' },
      ],
    },
    {
      id: 'og-preview',
      title: 'Social Preview (Optional Trade-off)',
      content:
        'When you share an invoice link on social media, platforms like Twitter or Telegram request a preview image. To generate this preview, you can optionally include minimal metadata in the URL query string:',
      codeExample: 'https://voidpay.xyz/pay?og=INV-001_1250_USDC_arb_Acme#N4Ig...',
      additionalContent:
        'The ?og= parameter contains only: invoice ID, amount, currency, network, and sender name. This is the only data that our server can see, and only if you choose to include it. The full invoice details remain private in the hash fragment.',
      note: 'This feature is opt-in. Links without the ?og= parameter will show a generic VoidPay preview instead of invoice-specific details.',
    },
    {
      id: 'third-party',
      title: 'Third-Party Services',
      content: 'VoidPay interacts with the following external services:',
      services: [
        {
          name: 'RPC Providers (Alchemy, Infura)',
          description:
            'We proxy blockchain requests through our edge functions to protect API keys. These requests contain only blockchain data (token balances, transaction status) — no personal information or invoice contents.',
        },
        {
          name: 'WalletConnect / RainbowKit',
          description:
            "When you connect your wallet to pay an invoice, the connection is handled by WalletConnect. We don't store wallet addresses or connection data.",
          link: {
            text: "WalletConnect's privacy policy",
            url: 'https://walletconnect.com/privacy',
          },
        },
        {
          name: 'Blockchain Networks',
          description:
            'Payments are made directly on public blockchains (Ethereum, Arbitrum, Optimism, Polygon). All blockchain transactions are publicly visible by design. VoidPay does not add any additional tracking to these transactions.',
        },
      ],
    },
    {
      id: 'abuse-prevention',
      title: 'Abuse Prevention (Privacy-Preserving)',
      content:
        "To prevent phishing and scam invoices, we maintain a public blocklist of known malicious URLs. Here's how we protect privacy while doing this:",
      items: [
        {
          label: 'SHA-256 hashes',
          description: 'The blocklist contains only hashes of malicious URL fragments',
        },
        {
          label: 'Irreversible',
          description: 'Hashes are irreversible — you cannot recover invoice data from them',
        },
        {
          label: 'Client-side checking',
          description: 'Your invoice URL is never sent to our servers for validation',
        },
        {
          label: 'Public on GitHub',
          description: 'The blocklist is public for transparency and community review',
        },
      ],
    },
    {
      id: 'open-source',
      title: 'Open Source Transparency',
      content:
        'VoidPay is open source under the MIT License. Every claim in this privacy policy can be verified by reviewing our code. You can also self-host VoidPay if you prefer complete control.',
      github: 'https://github.com/ignromanov/voidpay',
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      content:
        "Since we don't collect user data, there's nothing to retain or delete. Your browser's LocalStorage data persists until you clear it. Invoice URLs remain functional indefinitely — they are self-contained and don't depend on any server-side storage.",
    },
    {
      id: 'children',
      title: "Children's Privacy",
      content:
        'VoidPay is not directed to children under 18. Cryptocurrency transactions require legal capacity to enter into contracts. We do not knowingly provide services to minors.',
    },
    {
      id: 'changes',
      title: 'Changes to This Policy',
      content:
        'If we change this policy, we\'ll update the "Last updated" date at the top of this page and commit the changes to our public GitHub repository. Since there\'s no account system, we cannot send you notifications — we recommend checking this page periodically.',
    },
    {
      id: 'contact',
      title: 'Contact',
      content: "Questions about privacy? We're happy to explain our architecture in more detail:",
      links: [
        { text: 'Open an issue on GitHub', url: 'https://github.com/ignromanov/voidpay/issues' },
        { text: '@voidpay_xyz on Twitter', url: 'https://twitter.com/voidpay_xyz' },
      ],
    },
  ],
} as const
