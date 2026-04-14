/**
 * VoidPay vs Request Finance — Comparison page content
 * Feature: 040-competitor-comparison
 * Data source: .ai/knowledge/research/2026-04-08-request-finance-deep-analysis.md
 * Last verified: April 2026
 */

export const compareContent = {
  meta: {
    title: 'VoidPay vs Request Finance — Honest Comparison | 2026',
    description:
      'Detailed comparison of VoidPay and Request Finance for crypto invoicing. Pricing, privacy, setup time, features — side by side. Updated April 2026.',
    lastVerified: 'April 2026',
  },

  tldr: {
    heading: 'VoidPay vs Request Finance',
    subheading: 'Two approaches to crypto invoicing. One stores your data. One doesn\'t.',
    summary:
      'Request Finance is a full-featured finance platform for enterprises — invoicing, payroll, expenses, corporate cards. VoidPay is a zero-backend invoicing tool where the entire invoice lives in the URL. No signup, no servers, no fees. Choose Request Finance if you need enterprise accounting integrations. Choose VoidPay if you need privacy, speed, and zero cost.',
  },

  quickComparison: [
    { feature: 'Price', voidpay: 'Free forever', requestFinance: 'From $250/mo (annual)' },
    { feature: 'Signup', voidpay: 'None', requestFinance: 'Required + KYB/KYC' },
    { feature: 'Data storage', voidpay: 'URL only (zero-backend)', requestFinance: 'Centralized servers' },
    { feature: 'Time to first invoice', voidpay: '30 seconds', requestFinance: '5+ minutes (days with KYB)' },
    { feature: 'Transaction fees', voidpay: 'Gas only', requestFinance: '0.95–1.5% (crypto-to-fiat)' },
    { feature: 'Privacy', voidpay: 'Structural — no data to leak', requestFinance: 'Collects KYB docs, IDs, financial data' },
    { feature: 'Works if service shuts down', voidpay: 'Yes — URL is self-contained', requestFinance: 'No — invoices depend on hosted platform' },
    { feature: 'Accounting integrations', voidpay: 'None (by design)', requestFinance: 'Xero, QuickBooks' },
    { feature: 'Batch payroll', voidpay: 'No', requestFinance: 'Yes (CSV upload)' },
    { feature: 'Corporate cards', voidpay: 'No', requestFinance: 'Coming soon (early 2026)' },
    { feature: 'Supported networks', voidpay: 'ETH, Base, ARB, OP, Polygon', requestFinance: '20+ networks' },
  ],

  sections: [
    {
      id: 'pricing',
      title: 'Pricing',
      voidpay: {
        summary: 'VoidPay is free. No subscription, no transaction fees, no hidden costs. You only pay blockchain gas fees when sending a transaction — and that goes to the network, not us.',
        details: 'This is possible because VoidPay has no backend infrastructure to maintain. The invoice URL is the product.',
      },
      requestFinance: {
        summary: 'Request Finance charges subscription fees starting at $250/month (billed annually), with additional transaction fees for certain payment rails.',
        details: 'Stablecoin payouts are fee-free, but crypto-to-fiat payments incur 0.95–1.5% fees depending on plan tier. USD payouts have tiered volume fees (0.20–0.30%) plus banking rail charges ($10–30). A 30-day free trial is available.',
      },
      bottomLine: 'For a freelancer or small DAO, VoidPay costs $0/year. Request Finance costs $3,000–20,000/year before transaction fees.',
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      voidpay: {
        summary: 'VoidPay stores nothing. The entire invoice is encoded into the URL hash fragment, which browsers never send to servers. There is no database, no account, no data to breach.',
        details: 'This is a structural guarantee, not a policy promise. Even if VoidPay wanted to collect data, the architecture makes it impossible — hash fragments (the part after #) are client-side only per RFC 3986.',
      },
      requestFinance: {
        summary: 'Request Finance operates a centralized platform that stores invoice data, user accounts, and compliance documents. KYB/KYC verification requires submitting incorporation documents, ownership structures, IDs, and source-of-funds records.',
        details: 'Their mobile app declares collection of personal and financial information. On-chain requests exist, but off-chain invoice objects, attachments, and contacts are platform-dependent. Private payments on Aleo hide on-chain data but metadata is still maintained in the platform.',
      },
      bottomLine: 'VoidPay cannot leak your data because it never has it. Request Finance\'s privacy depends on their security practices and data policies.',
    },
    {
      id: 'setup',
      title: 'Setup & Onboarding',
      voidpay: {
        summary: 'Open the website. Fill in invoice details. Get a link. There is no step 4.',
        details: 'No account creation, no email verification, no organization setup. 30 seconds to your first invoice.',
      },
      requestFinance: {
        summary: 'Create an account, set up an organization, and complete verification. New accounts cannot automatically email invoices to clients — you must share links manually until your account is validated.',
        details: 'For basic crypto invoicing, account creation takes about 5 minutes. For regulated features (crypto-to-fiat, cards), KYB/KYC verification takes "a few business days." Recipients can also block vendors by default, requiring whitelisting.',
      },
      bottomLine: 'VoidPay: 30 seconds, zero friction. Request Finance: minutes to days, depending on which features you need.',
    },
    {
      id: 'features',
      title: 'Feature Depth',
      voidpay: {
        summary: 'VoidPay focuses on one thing: creating and sharing crypto invoice links. It includes PDF export, QR codes, Magic Dust payment matching, multi-chain support, and local history — all running client-side.',
        details: 'By design, VoidPay does not include accounting integrations, batch payroll, expense management, or corporate cards. These require backends and accounts — the opposite of our architecture.',
      },
      requestFinance: {
        summary: 'Request Finance is a full finance operations platform: invoicing, bill payment, payroll, expense claims, accounting integrations (Xero, QuickBooks), OCR, approval workflows, and upcoming corporate cards.',
        details: 'Supports 300+ tokens on 20+ networks, 350+ crypto and 20+ fiat currencies, and crypto-to-fiat payouts in 15+ currencies to 190+ countries. API available for automation.',
      },
      bottomLine: 'Request Finance does more. VoidPay does less — but what it does, it does with zero dependencies and zero cost.',
    },
    {
      id: 'who-should-choose',
      title: 'Who Should Choose What',
      chooseVoidpay: [
        'Freelancers and independent contractors who send occasional crypto invoices',
        'DAO contributors who need to request payment without creating accounts',
        'Privacy-conscious users who don\'t want financial data stored on third-party servers',
        'Anyone who needs a quick, shareable payment link with no setup',
        'Teams in regions where KYC processes are slow or restrictive',
      ],
      chooseRequestFinance: [
        'Companies that need accounting integrations (Xero, QuickBooks)',
        'Organizations running regular payroll for multiple contributors',
        'Finance teams that need approval workflows and expense management',
        'Businesses that need crypto-to-fiat settlement',
        'Enterprises requiring compliance documentation and audit trails',
      ],
    },
  ],

  reviews: {
    heading: 'What Users Say About Request Finance',
    note: 'VoidPay launched in March 2026 and does not yet have third-party reviews.',
    requestFinance: {
      rating: '4.7/5 on Capterra (47 reviews)',
      praised: [
        '"It\'s by far the best tool I\'ve used for freelance invoicing. Pretty simple and it works great!"',
        '"Easy to create invoice... it takes me 2 min to send my invoice."',
        '"The team is responsive & transparent, the technology protects against payment mistakes."',
      ],
      complaints: [
        '"Need to work on their UX more to avoid customer footfall."',
        '"Few steps are really difficult to use while selecting the specific chain and tokens."',
        '"Billing currency and network have to be configured manually."',
      ],
    },
  },

  disclaimer:
    'This comparison is based on publicly available documentation, pricing pages, and review platforms as of April 2026. We strive for accuracy but features and pricing may change. If you spot an error, please open an issue on GitHub.',
} as const
