/**
 * Terms of Service Content
 * Separated from page component for maintainability
 */

export const termsContent = {
  meta: {
    title: 'Terms of Service | VoidPay',
    description:
      'VoidPay terms of service. Free, open-source, non-custodial crypto invoicing tool. No account required, no funds custody, peer-to-peer payments.',
    lastUpdated: 'January 2026',
  },

  sections: [
    {
      id: 'agreement',
      title: 'Agreement to Terms',
      content:
        'By accessing or using VoidPay ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use the Service.',
    },
    {
      id: 'service-description',
      title: 'Service Description',
      content:
        'VoidPay is a free, open-source tool for creating and sharing cryptocurrency invoices. The Service:',
      items: [
        {
          label: 'Generates invoice URLs',
          description: 'all invoice data is encoded in the URL itself',
        },
        {
          label: 'Provides a payment interface',
          description: 'to view invoices and initiate wallet transactions',
        },
        {
          label: 'Does NOT process payments',
          description: 'all transactions occur directly on public blockchains',
        },
        {
          label: 'Does NOT hold funds',
          description: 'we never have custody of any cryptocurrency',
        },
      ],
    },
    {
      id: 'non-custodial',
      title: 'Non-Custodial Nature',
      disclaimer: {
        title: 'Important Disclaimer',
        content:
          'VoidPay is NOT a financial service, money transmitter, bank, or payment processor. We do not hold, control, or have access to your funds at any time. All payments are peer-to-peer transactions executed directly on blockchain networks.',
      },
      content:
        "When you use VoidPay to pay an invoice, you are sending cryptocurrency directly from your wallet to the recipient's wallet. VoidPay merely provides the interface — we never touch the funds.",
    },
    {
      id: 'no-account',
      title: 'No Account Required',
      content:
        'VoidPay operates on a permissionless basis. There is no registration, account creation, or sign-up process. You use the tool directly without providing any personal information to us. This also means there are no "account settings" or user profiles to manage.',
    },
    {
      id: 'responsibilities',
      title: 'Your Responsibilities',
      content: 'When using VoidPay, you are solely responsible for:',
      items: [
        {
          label: 'Verifying wallet addresses',
          description:
            'double-check recipient addresses before sending any payment. Cryptocurrency transactions are irreversible.',
        },
        {
          label: 'Selecting the correct network',
          description:
            "ensure you're paying on the blockchain network specified in the invoice (Ethereum, Arbitrum, Optimism, or Polygon).",
        },
        {
          label: 'Verifying token contracts',
          description:
            'for ERC-20 tokens, verify the token contract address matches the expected token. VoidPay shows verification status for known tokens.',
        },
        {
          label: 'Securing invoice URLs',
          description:
            'if an invoice contains sensitive business information, treat the URL as confidential.',
        },
        {
          label: 'Compliance with laws',
          description:
            'ensure your use of cryptocurrency complies with applicable laws in your jurisdiction.',
        },
        {
          label: 'Wallet security',
          description:
            'protect your wallet credentials. VoidPay never asks for private keys or seed phrases.',
        },
      ],
    },
    {
      id: 'payment-verification',
      title: 'Payment Verification',
      content:
        'VoidPay uses a technique called "Magic Dust" to help verify payments without a backend database:',
      items: [
        {
          description:
            'Each invoice includes a unique micro-amount (e.g., +0.000042) added to the total',
        },
        {
          description:
            'This creates a unique payment amount that can be matched to a specific invoice',
        },
        {
          description:
            'Payment verification requires an exact amount match — partial payments or incorrect amounts will not be recognized',
        },
      ],
      note: 'Important: Always pay the exact amount shown in the invoice. Do not round or modify the payment amount.',
    },
    {
      id: 'blockchain-risks',
      title: 'Blockchain Risks',
      content: 'By using VoidPay, you acknowledge the inherent risks of blockchain transactions:',
      items: [
        {
          label: 'Irreversibility',
          description:
            'blockchain transactions cannot be reversed, cancelled, or refunded once confirmed.',
        },
        {
          label: 'Network congestion',
          description: 'transactions may be delayed during periods of high network activity.',
        },
        {
          label: 'Gas fees',
          description:
            'you are responsible for network transaction fees, which vary based on network conditions.',
        },
        {
          label: 'Price volatility',
          description:
            'cryptocurrency values can fluctuate significantly between invoice creation and payment.',
        },
        {
          label: 'Chain reorganizations',
          description:
            'we wait for finalized transaction status to protect against reorgs, but theoretical risks remain.',
        },
        {
          label: 'Smart contract risks',
          description:
            'ERC-20 token payments interact with third-party smart contracts that may have bugs or vulnerabilities.',
        },
      ],
    },
    {
      id: 'disclaimer-warranties',
      title: 'Disclaimer of Warranties',
      legalText:
        'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
      content:
        'We do not warrant that the Service will be uninterrupted, secure, or error-free. We do not warrant the accuracy of blockchain data, token information, or payment verification results.',
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      legalText:
        'TO THE MAXIMUM EXTENT PERMITTED BY LAW, VOIDPAY AND ITS CREATORS, CONTRIBUTORS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:',
      liabilityItems: [
        'Your use or inability to use the Service',
        'Lost, stolen, or misdirected cryptocurrency',
        'Incorrect wallet addresses or payment amounts',
        'Blockchain network failures or delays',
        'Smart contract bugs or exploits',
        'Third-party wallet or RPC provider failures',
        'Unauthorized access to your wallet or devices',
      ],
    },
    {
      id: 'prohibited-uses',
      title: 'Prohibited Uses',
      content: 'You agree NOT to use VoidPay for:',
      items: [
        { description: 'Fraud, scams, phishing, or deceptive practices' },
        { description: 'Money laundering or terrorist financing' },
        { description: 'Transactions involving illegal goods or services' },
        { description: 'Circumventing sanctions or export controls' },
        { description: 'Creating fake or misleading invoices' },
        { description: 'Automated abuse, scraping, or denial-of-service attacks' },
        { description: 'Any activity that violates applicable laws' },
      ],
      note: 'We reserve the right to add malicious invoice URLs to our public blocklist (hosted on GitHub) to protect users from known scams.',
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      content: 'VoidPay is open source software released under the MIT License. This means:',
      items: [
        { description: 'You can view, copy, modify, and distribute the source code' },
        { description: 'You can self-host your own instance of VoidPay' },
        { description: 'The software is provided without warranty (as stated above)' },
        {
          description:
            'The VoidPay name and branding remain our intellectual property for the hosted service at voidpay.xyz',
        },
      ],
      github: 'https://github.com/ignromanov/voidpay',
    },
    {
      id: 'third-party',
      title: 'Third-Party Services',
      content:
        'VoidPay integrates with third-party services including wallet providers (WalletConnect, RainbowKit), RPC providers (Alchemy, Infura), and blockchain networks. These services have their own terms of service and privacy policies that apply to your use. We are not responsible for the availability, accuracy, or conduct of these third-party services.',
    },
    {
      id: 'indemnification',
      title: 'Indemnification',
      content:
        'You agree to indemnify, defend, and hold harmless VoidPay and its creators, contributors, and affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of a third party.',
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      content:
        'These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where the project maintainers reside, without regard to conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved through good-faith negotiation or, if necessary, binding arbitration.',
    },
    {
      id: 'severability',
      title: 'Severability',
      content:
        'If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.',
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      content:
        'We may update these Terms from time to time. Changes will be posted on this page with an updated "Last updated" date. Since there is no account system, we cannot notify you directly — continued use of the Service after changes constitutes acceptance of the new Terms.',
    },
    {
      id: 'termination',
      title: 'Termination',
      content:
        'Since there are no accounts, there is nothing to "terminate" in the traditional sense. However, we reserve the right to block access to the Service from specific IP addresses or add malicious URLs to our blocklist. Invoice URLs you\'ve already created will continue to work as they are self-contained and don\'t depend on our servers.',
    },
    {
      id: 'contact',
      title: 'Contact',
      content: 'Questions about these Terms? Reach out:',
      links: [
        { text: 'Open an issue on GitHub', url: 'https://github.com/ignromanov/voidpay/issues' },
        { text: '@voidpay_xyz on Twitter', url: 'https://twitter.com/voidpay_xyz' },
      ],
    },
  ],
} as const
