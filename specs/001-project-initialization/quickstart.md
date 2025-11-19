# VoidPay Developer Quickstart

**Feature**: 001-project-initialization
**Last Updated**: 2025-11-19
**Prerequisites**: Node.js 20+, pnpm 8+, Git

---

## Overview

This guide walks you through setting up the VoidPay development environment from initial clone to running development server. Expected completion time: **5 minutes** (Success Criteria SC-001).

---

## Prerequisites

### Required Software

- **Node.js 20+**: Check version with `node --version`
  - If missing: Install from [nodejs.org](https://nodejs.org/) or use [nvm](https://github.com/nvm-sh/nvm)
  - Recommended: Use `.nvmrc` file (run `nvm use` after clone)

- **pnpm 8+**: Check version with `pnpm --version`
  - If missing: `npm install -g pnpm` or `brew install pnpm` (macOS)

- **Git**: Check version with `git --version`
  - Usually pre-installed on macOS/Linux
  - Windows: Install from [git-scm.com](https://git-scm.com/)

### Optional (Recommended)

- **VS Code** with extensions:
  - ESLint (`dbaeumer.vscode-eslint`)
  - Prettier (`esbenp.prettier-vscode`)
  - Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
  - TypeScript Importer (`pmneo.tsimporter`)

---

## Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/voidpay/voidpay.git
cd voidpay

# Check Node.js version matches .nvmrc (optional but recommended)
nvm use  # If using nvm
# Expected output: "Now using node v20.x.x"
```

**Verify**:

```bash
ls -la
# Should see: package.json, src/, .nvmrc, etc.
```

---

## Step 2: Install Dependencies

```bash
# Install all dependencies using pnpm
pnpm install

# Expected time: 30-60 seconds
# Expected output: "Packages: +XXX" (number varies)
```

**Verify**:

```bash
pnpm list --depth=0
# Should see: next, react, wagmi, viem, @rainbow-me/rainbowkit, etc.
```

**Troubleshooting**:

- **Error: "pnpm: command not found"**
  - Solution: Install pnpm globally: `npm install -g pnpm`

- **Error: "EACCES: permission denied"**
  - Solution: Don't use `sudo`. Fix npm permissions or use nvm.

- **Error: "Unsupported engine"**
  - Solution: Upgrade Node.js to 20+ (check `package.json` engines field)

---

## Step 3: Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env.local

# Open .env.local in your editor
code .env.local  # VS Code
# OR
nano .env.local  # Terminal editor
```

**Edit `.env.local`** with your RPC API keys:

```bash
# Alchemy RPC Endpoints (Primary) - REQUIRED
NEXT_PUBLIC_ALCHEMY_ETH_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
NEXT_PUBLIC_ALCHEMY_ARB_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
NEXT_PUBLIC_ALCHEMY_OPT_URL=https://opt-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
NEXT_PUBLIC_ALCHEMY_POLY_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Infura RPC Endpoints (Fallback) - REQUIRED
NEXT_PUBLIC_INFURA_ETH_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
NEXT_PUBLIC_INFURA_ARB_URL=https://arbitrum-mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
NEXT_PUBLIC_INFURA_OPT_URL=https://optimism-mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
NEXT_PUBLIC_INFURA_POLY_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID

# App Configuration (Optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get API Keys**:

1. **Alchemy** (Primary RPC Provider):
   - Sign up: [https://www.alchemy.com/](https://www.alchemy.com/)
   - Create app → Select networks (Ethereum, Arbitrum, Optimism, Polygon)
   - Copy API key and replace `YOUR_ALCHEMY_API_KEY` in `.env.local`

2. **Infura** (Fallback RPC Provider):
   - Sign up: [https://www.infura.io/](https://www.infura.io/)
   - Create project → Enable all networks
   - Copy Project ID and replace `YOUR_INFURA_PROJECT_ID` in `.env.local`

**Verify**:

```bash
# Check that .env.local exists and is ignored by git
cat .env.local | head -n 5
# Should show your API keys (NOT the placeholder text)

git status
# Should NOT show .env.local (it's in .gitignore)
```

**Security Warning**:

- ⚠️ **NEVER commit `.env.local`** to git (it contains secrets!)
- ⚠️ **DO commit `.env.example`** (it's the template with no secrets)
- ✅ `.gitignore` already includes `.env.local` (you're protected)

---

## Step 4: Start Development Server

```bash
# Start Next.js development server
pnpm dev

# Expected output:
# ▲ Next.js 15.x.x
# - Local:        http://localhost:3000
# - Network:      http://192.168.x.x:3000
# ✓ Ready in 2.5s
```

**Verify**:

1. Open browser: [http://localhost:3000](http://localhost:3000)
2. You should see: **VoidPay landing page** (basic layout with "Connect Wallet" button)
3. Open browser console (F12): **No errors** (Success Criteria SC-002)

**Troubleshooting**:

- **Error: "Port 3000 is already in use"**
  - Solution: `pnpm dev -- -p 3001` (use different port)
  - OR: Kill process using port 3000: `lsof -ti:3000 | xargs kill`

- **Error: "Invalid environment variable"**
  - Solution: Check `.env.local` has all 8 required RPC URLs
  - Verify no typos in variable names (must match `.env.example`)

- **Error: "Module not found"**
  - Solution: Delete `node_modules/` and `.next/`, then `pnpm install` again

---

## Step 5: Verify Setup

### Type Check

```bash
pnpm type-check

# Expected output:
# ✓ No TypeScript errors
```

If errors appear, read carefully - they indicate type safety issues that must be fixed.

### Linting

```bash
pnpm lint

# Expected output:
# ✓ No ESLint warnings
```

If warnings appear, run `pnpm lint --fix` to auto-fix or manually address.

### Formatting

```bash
pnpm format

# Expected output:
# [Files formatted list]
```

This auto-formats all code to match Prettier style.

### Build (Production)

```bash
pnpm build

# Expected output:
# Route (app)                     Size     First Load JS
# ┌ ○ /                           XXX kB   XXX kB
# ├ ○ /create                     XXX kB   XXX kB
# └ ○ /pay                        XXX kB   XXX kB
# ✓ Compiled successfully
```

**Success Criteria**: Build completes without errors (SC-009), landing page bundle <500KB (SC-010).

---

## Step 6: Test Wallet Connection (Optional)

1. Install a Web3 wallet browser extension:
   - [MetaMask](https://metamask.io/) (most popular)
   - [Coinbase Wallet](https://www.coinbase.com/wallet)
   - [Rainbow Wallet](https://rainbow.me/)

2. Open [http://localhost:3000](http://localhost:3000)

3. Click **"Connect Wallet"** button

4. RainbowKit modal should open with wallet options (SC-006)

5. Select your wallet and connect

6. After connection, you should see:
   - Your wallet address displayed (truncated, e.g., "0x1234...5678")
   - Network switcher showing Ethereum/Arbitrum/Optimism/Polygon (SC-007)

**Note**: If you don't have a wallet, you can skip this step. Wallet connection is not required for development (you can build UI without connecting).

---

## Development Workflow

### File Structure (Feature-Sliced Design)

```
src/
├── app/                    # Next.js routes
│   ├── page.tsx            # Landing page (/)
│   ├── create/             # Invoice editor (/create)
│   └── pay/                # Payment view (/pay)
├── widgets/                # Large UI blocks
├── features/               # User interactions
├── entities/               # Business logic
└── shared/                 # Utilities, UI primitives
    ├── ui/                 # shadcn/ui components
    └── config/             # Wagmi, TanStack Query configs
```

### Key Files

- **`src/app/layout.tsx`**: Root layout (providers, fonts, global styles)
- **`src/shared/config/wagmi.ts`**: Wagmi/Viem configuration (RPC providers)
- **`src/shared/ui/`**: shadcn/ui components (Button, Card, etc.)
- **`tailwind.config.ts`**: Theme customization (electric violet color)
- **`tsconfig.json`**: TypeScript settings (strict mode, path aliases)

### Common Tasks

#### Add a New shadcn/ui Component

```bash
npx shadcn-ui@latest add button
# Component added to src/shared/ui/button.tsx

# Import and use:
import { Button } from '@/shared/ui/button'
```

#### Create a New Feature

```bash
# Example: Create "connect-wallet" feature
mkdir -p src/features/connect-wallet
touch src/features/connect-wallet/index.ts
touch src/features/connect-wallet/ConnectWalletButton.tsx
```

Follow FSD layer rules:

- `features/` can import from `entities/` and `shared/`
- `entities/` can import from `shared/` only
- `shared/` cannot import from other layers

#### Run Quality Checks Before Commit

```bash
# TypeScript type checking
pnpm type-check

# ESLint linting
pnpm lint

# Prettier formatting
pnpm format

# All checks together
pnpm type-check && pnpm lint
```

**Agent Workflow** (FR-020, FR-021):
When working with Claude Code or similar AI agents:

1. Agent completes task
2. Agent **automatically** runs `pnpm type-check` and `pnpm lint`
3. If errors: Agent attempts auto-fix and re-runs
4. If pass: Agent reports "All checks passed" and **waits for user confirmation**
5. **User reviews** changes in IDE
6. **User confirms** → Agent creates git commit
7. **User requests changes** → Agent continues development (no commit)

**Never commit code without passing type checks and lint checks!**

---

## Environment Differences

### Development (`pnpm dev`)

- Hot reload enabled (changes appear instantly)
- Source maps enabled (easier debugging)
- Console logs visible
- `NEXT_PUBLIC_VERCEL_ENV=development`

### Production Build (`pnpm build && pnpm start`)

- Optimized bundles (minified, tree-shaken)
- No source maps (smaller bundle)
- Console logs removed (except warnings/errors)
- `NEXT_PUBLIC_VERCEL_ENV=production`

### Preview (Vercel Deployments)

- Deployed on Vercel preview URL (e.g., `voidpay-git-feature-branch.vercel.app`)
- Uses preview environment variables
- `NEXT_PUBLIC_VERCEL_ENV=preview`

---

## Troubleshooting

### Development Server Issues

**Problem**: "Error: Cannot find module '@/shared/ui/button'"

- **Cause**: TypeScript path aliases not resolved
- **Solution**: Restart TS server in VS Code (`Cmd+Shift+P` → "TypeScript: Restart TS Server")

**Problem**: "Hydration error" in browser console

- **Cause**: Server-rendered HTML doesn't match client
- **Solution**: Ensure no browser-only code runs during SSR (use `useEffect` or `'use client'`)

**Problem**: Slow hot reload (>10s)

- **Cause**: Large node_modules or many files
- **Solution**: Exclude `node_modules` from IDE indexing, close unused files

### RPC Provider Issues

**Problem**: "Failed to fetch" on wallet connection

- **Cause**: Invalid or missing RPC URLs in `.env.local`
- **Solution**: Verify all 8 `NEXT_PUBLIC_*_URL` variables are set correctly

**Problem**: "Rate limit exceeded"

- **Cause**: Free tier limits on Alchemy/Infura
- **Solution**: Upgrade to paid tier or reduce request frequency

### Build Issues

**Problem**: "Type error: Property 'x' does not exist"

- **Cause**: TypeScript strict mode catching type errors
- **Solution**: Fix type annotations (don't use `any`, use proper types)

**Problem**: "Build failed: Out of memory"

- **Cause**: Insufficient Node.js heap size
- **Solution**: `NODE_OPTIONS="--max-old-space-size=4096" pnpm build`

---

## Next Steps

After completing this quickstart:

1. **Read the Constitution**: `.specify/memory/constitution.md` (understand non-negotiable principles)
2. **Explore the Codebase**: Start with `src/app/page.tsx` (landing page)
3. **Review Design Decisions**: `.specify/memory/brainstorm/DECISIONS.md`
4. **Implement Your First Feature**: Follow the next feature specification
5. **Submit Pull Request**: Follow Git workflow in `.specify/memory/constitution.md` (Governance section)

---

## Additional Resources

### Documentation

- **Next.js 15**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Wagmi v2**: [https://wagmi.sh/](https://wagmi.sh/)
- **RainbowKit**: [https://www.rainbowkit.com/](https://www.rainbowkit.com/)
- **shadcn/ui**: [https://ui.shadcn.com/](https://ui.shadcn.com/)
- **Feature-Sliced Design**: [https://feature-sliced.design/](https://feature-sliced.design/)

### Community

- **GitHub Issues**: [https://github.com/voidpay/voidpay/issues](https://github.com/voidpay/voidpay/issues)
- **Discussions**: [https://github.com/voidpay/voidpay/discussions](https://github.com/voidpay/voidpay/discussions)

### Tools

- **TypeScript Playground**: [https://www.typescriptlang.org/play](https://www.typescriptlang.org/play)
- **Tailwind Play**: [https://play.tailwindcss.com/](https://play.tailwindcss.com/)
- **Ethereum Unit Converter**: [https://eth-converter.com/](https://eth-converter.com/)

---

## Success Checklist

After completing this quickstart, you should be able to:

- [x] Clone repository and install dependencies in <5 minutes (SC-001)
- [x] Start development server without errors (SC-002)
- [x] Run `pnpm type-check` without TypeScript errors (SC-003)
- [x] Run `pnpm lint` without ESLint errors (SC-004)
- [x] See landing page with correct fonts (Geist Sans) and styling (SC-005)
- [x] Open RainbowKit wallet connection modal (SC-006)
- [x] See all 4 networks in network switcher (SC-007)
- [x] Import components using `@/*` path aliases (SC-008)
- [x] Build production bundle successfully (SC-009)
- [x] Verify landing page bundle <500KB (SC-010)

If any checkbox is unchecked, review the corresponding section above or check troubleshooting.

---

**Welcome to VoidPay development! 🚀**

Questions? Check GitHub Discussions or open an issue.
