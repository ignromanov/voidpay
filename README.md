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

## Development Workflow

This project uses **Git Worktrees** for isolated feature development, enabling multiple developers or AI agents to work on different features concurrently without conflicts.

### Creating a New Feature

```bash
# Create feature (automatically creates isolated worktree)
/speckit.specify "Add user authentication"
```

This creates:

- Feature branch: `001-user-auth`
- Isolated worktree: `worktrees/001-user-auth/`
- Feature specification: `worktrees/001-user-auth/specs/001-user-auth/spec.md`

### Development Process

```bash
# All commands work within the worktree
/speckit.plan      # Create technical plan
/speckit.tasks     # Generate task list
/speckit.implement # Execute implementation
```

### Integration & Cleanup

```bash
# After feature completion
git checkout main
git merge 001-user-auth
git worktree remove worktrees/001-user-auth
git worktree prune
```

### Parallel Development

Multiple features can be developed simultaneously:

```bash
worktrees/001-user-auth/     # Agent 1: Authentication
worktrees/002-payment-flow/  # Agent 2: Payment processing
worktrees/003-notifications/ # Agent 3: Notification system
```

Each worktree is completely isolated - no conflicts, no blocking.

**See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines and constitutional principles.**
