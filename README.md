# VoidPay

Stateless Invoicing Platform built with Next.js, Wagmi, and Feature-Sliced Design.

## Quickstart

### Prerequisites

- Node.js v20+ (v22 recommended)
- pnpm v9+

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd stateless-invoicing-platform
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

3.  Configure environment variables:
    Copy `.env.example` to `.env.local` and fill in your RPC keys.
    ```bash
    cp .env.example .env.local
    ```

4.  Start the development server:
    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Architecture

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Web3**: Wagmi v2, Viem, RainbowKit
- **State**: Zustand, TanStack Query
- **Design Methodology**: Feature-Sliced Design (FSD)

## Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint
- `pnpm format`: Format code with Prettier
- `pnpm type-check`: Run TypeScript compiler check
