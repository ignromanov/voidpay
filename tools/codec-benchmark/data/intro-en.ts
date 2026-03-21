export interface IntroSection {
  title: string
  paragraphs: string[]
}

export interface IntroData {
  headline: string
  tagline: string
  sections: IntroSection[]
  keyInsight: string
}

export const INTRO_EN: IntroData = {
  headline: 'The Evolution of VoidPay\'s Invoice Codec',
  tagline: 'How we compressed a full crypto invoice into a URL that fits in a QR code',
  sections: [
    {
      title: 'The Problem',
      paragraphs: [
        'Crypto invoicing is broken. Sending a raw wallet address via Telegram or Discord is unprofessional and dangerous — clipboard hijacking, wrong network, wrong token decimals. Existing solutions like Request Finance require KYC, accounts, and organizational setup.',
        'VoidPay takes a radical approach: the URL IS the invoice. No backend, no database, no signup. A self-contained link carries all payment details in its hash fragment — invisible to the server, visible only to the sender and recipient.',
      ],
    },
    {
      title: 'The Constraint',
      paragraphs: [
        'A full invoice (two parties with names, emails, addresses, multiple line items, tax, notes) can easily reach 1KB of structured data. But URLs have hard limits: QR codes become unreadable above ~2000 bytes, and older HTTP clients truncate long URLs.',
        'Since the hash fragment carries ALL the data (zero-backend principle), every byte of the invoice must fit in the URL. This constraint drove 7 codec iterations over 4 months.',
      ],
    },
    {
      title: 'Three Eras of Compression',
      paragraphs: [
        'v0 (Baseline): JSON + lz-string. Simple but wasteful — JSON keys like "walletAddress" repeat for every invoice, consuming ~40% of space.',
        'v1–v3 (Ad-hoc Binary): Hand-crafted binary formats. Each iteration added optimizations: raw 20-byte addresses (−22 bytes each), bit flags for optional fields, currency dictionaries, DEFLATE compression on text blobs.',
        'v4–v6 (TLV Structured): Type-Length-Value format inspired by Lightning\'s BOLT12. Forward-compatible, extensible, with security primitives (salt for privacy, keccak256 domain separator for integrity). v6 adds whole-payload Brotli compression for maximum density.',
      ],
    },
  ],
  keyInsight: 'From 1043 chars (v0) to 698 chars (v6) for a full invoice with all fields — 33% smaller while adding salt, domain separator, and forward compatibility.',
}
