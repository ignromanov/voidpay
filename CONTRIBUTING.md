# Contributing to VoidPay

## Setup

```bash
git clone https://github.com/ignromanov/voidpay.git
cd voidpay
pnpm install
cp .env.example .env.local   # add RPC keys
pnpm dev
```

## Pull Request Process

1. Branch from `develop`: `git checkout -b ###-short-description develop`
2. Make changes, ensure tests pass
3. Open PR targeting `develop` (not `master`)
4. PRs are squash-merged

## Code Style

- **Linting**: ESLint — run `pnpm lint` before committing
- **Formatting**: Prettier — run `pnpm format`
- **Architecture**: [Feature-Sliced Design](https://feature-sliced.design/) — layers must not violate import rules (features cannot import features, etc.)
- Pre-commit hook runs lint + type-check automatically

## Testing

```bash
pnpm test:coverage
```

80% coverage is required — CI will fail below this threshold. Place tests alongside the code they cover (`.test.ts` / `.test.tsx`).

## Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Base network support
fix: correct magic dust precision on Polygon
refactor: extract codec to shared layer
docs: update Quick Start prerequisites
```

## Code of Conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
