# Deploying VoidPay to Cloudflare Workers (OpenNext)

Status: pre-cutover. Production still runs on Vercel. Nothing here is deployed automatically.

## Architecture

- Next.js 16 built with `@opennextjs/cloudflare` into `.open-next/` (`worker.js` + `assets/`).
- `wrangler.jsonc` binds static assets (`ASSETS`) and a self-reference service (`WORKER_SELF_REFERENCE`).
- All API routes (`/api/rpc`, `/api/transfers`, `/api/health`, `/api/og`) run on the Node.js runtime
  (`nodejs_compat`); OpenNext on Workers does not support `runtime = 'edge'` routes.
- Response headers have ONE source: `headers()` in `next.config.mjs` (CSP, noindex, cache rules).
  `vercel.json` no longer carries headers, otherwise Vercel would emit a duplicate CSP.
  Static-asset headers (files served directly by Workers Static Assets, bypassing the Worker) come from
  `public/_headers` (copied to `.open-next/assets/_headers` by the build; verified in `pnpm cf:build` output).

## Build rules

- Build only in CI or on a clean checkout. NEVER with `.env.local` / `.env*` present: Next inlines
  env values it reads at build time, and the CI job `Cloudflare Workers build` fails if any `.env*`
  file (except the `*.example` files) exists.
- `NEXT_PUBLIC_*` values are public build-time constants (inlined into the client bundle). Provide them
  as CI/build environment variables, not files: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`,
  `NEXT_PUBLIC_FORMSPREE_ID`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ENABLE_TESTNETS`,
  `NEXT_PUBLIC_COMING_SOON_MODE`.
- Commands: `pnpm cf:build`, `pnpm cf:preview` (local workerd), `pnpm cf:deploy` (real deploy, do not run
  before the preview checklist below passes).
- CI also runs `wrangler deploy --dry-run` and fails if the gzip upload exceeds 10 MB
  (Workers paid-plan limit; free plan is 3 MB).

## Secrets (runtime, server-side only)

Never put these in `wrangler.jsonc`, `vars`, `.env*` committed files or the build environment.

```bash
pnpm wrangler secret put ALCHEMY_API_KEY
pnpm wrangler secret put INFURA_API_KEY
pnpm wrangler secret put KV_REST_API_URL
pnpm wrangler secret put KV_REST_API_TOKEN
```

Non-secret `vars` in `wrangler.jsonc`: `DEPLOY_PLATFORM=cloudflare` (already set; makes `clientIp()` trust `cf-connecting-ip` — never set it on Vercel).

`OG_FONTS_BASE_URL=https://voidpay.xyz` is also set in `vars` (already set): the public origin that serves
`/fonts/Geist-*.ttf` for `/api/og` (Workers has no `VERCEL_URL`). After cutover re-check that the Worker can fetch it (see OG section).

Local preview secrets go in `.dev.vars` (gitignored). `KV_REST_API_*` missing = rate limiter fails
closed (503) by design; do not add a fail-open fallback.

## Workers Builds settings

- Production branch: `master` (deploys only on release merge, Git Flow).
- Non-production branch builds: disabled (GitHub CI job `Cloudflare Workers build` already builds every PR).
- Build command: `pnpm cf:build`
- Deploy command: `npx wrangler deploy`
- Build variables: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `NEXT_PUBLIC_FORMSPREE_ID`,
  `NEXT_PUBLIC_APP_URL=https://voidpay.xyz`, `NEXT_PUBLIC_ENABLE_TESTNETS=false`, `NEXT_PUBLIC_COMING_SOON_MODE=false`.
These three are also set as runtime `vars` in wrangler.jsonc; NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID and NEXT_PUBLIC_FORMSPREE_ID must still be set as build variables.
- Runtime secrets (already set): `ALCHEMY_API_KEY`, `INFURA_API_KEY`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`.
- Preview URLs were disabled via API on 2026-11-18.

## Dynamic OG images (`/api/og`) - memory risk

`/api/og?og=...` renders with Satori + resvg WASM. Workers isolates are capped at **128 MB**, so
`/api/og` memory must be measured on preview before DNS cutover. If it exceeds the limit (error 1102):

1. Separate OG worker (e.g. `workers-og`) routed on `/api/og`, or
2. Keep OG on a Vercel subdomain and point `og:image` URLs there.

Do not replace it with a static redirect: dynamic `?og=` previews must keep working.

## Preview smoke checklist (on the `workers.dev` URL, before cutover)

Target: `https://voidpay.<account>.workers.dev` (`preview_urls` is disabled).

- [ ] `POST /api/rpc` valid request: 200. Over limit: 429 with `Retry-After`. Upstash unreachable: 503 (fail-closed).
- [ ] Spoofed `X-Real-IP` varied ×101 requests from one client: 429 (limiter keys on `cf-connecting-ip`).
- [ ] `POST /api/transfers` with cross-site `Origin`: 403.
- [ ] `?mock=` query ignored in production mode (no mock RPC responses).
- [ ] `navigateToHashUrl` end-to-end on `/pay#...` (no `#A#A` / "Corrupted Data"); verify on the built worker, not `next dev`.
- [ ] `/api/og` branding and `/api/og?og=...` render; record peak memory (see section above).
- [ ] `/api/health` reports Redis state correctly.
- [ ] Header diff vs current prod: `curl -sI https://voidpay.xyz/{,create,pay}` and one
      `/_next/static/chunks/<file>.js`, against the same paths on the Workers URL. Expected differences:
      only Vercel-specific headers (`x-vercel-*`, `server`). CSP, HSTS, nosniff, frame options,
      `x-robots-tag` (present on `/pay`, absent on `/` and `/create`) and `cache-control`
      (no-store only on `/api/rpc`, `/api/transfers`; immutable on `_next/static`) must match.

## Cloudflare zone settings to disable

- Web Analytics auto-injection (would add an un-CSP'd script and contradicts the privacy stance).
- Rocket Loader (rewrites scripts, breaks CSP/hydration).
- Email Address Obfuscation.
- Bot Fight Mode / Super Bot Fight Mode: exempt the synthetic uptime probe, or disable.
- Auto Minify, Mirage, Polish: off (not needed; can alter content).

## DNS cutover

1. Preview checklist green; OG memory decision made.
2. `wrangler.jsonc` already declares `routes: [{ pattern: "voidpay.xyz", custom_domain: true }]`.
   Deploy (`pnpm cf:deploy`) from CI, then remove the existing Vercel DNS record for `voidpay.xyz`
   if Cloudflare refuses to create the Custom Domain over it.
3. Verify `curl -I https://voidpay.xyz/`, cert, and the smoke checklist again against the real domain.
4. Post-cutover PR: set `"workers_dev": false` (remove the `TODO(cutover)` line) and decide on removing `vercel.json`.

## Rollback

1. Dashboard -> Workers -> `voidpay` -> Settings -> Domains: remove the Custom Domain `voidpay.xyz`.
2. Restore the Vercel DNS record (CNAME/A as before cutover).
3. Keep the Vercel project alive (and its env vars) until Workers has been stable for a full release cycle.
4. Headers come from `next.config.mjs`, so they apply on Vercel as well after rollback.

## Known caveats

- `cf-connecting-ip` is trusted only when `DEPLOY_PLATFORM=cloudflare` (set in `wrangler.jsonc`);
  on Vercel it is ignored and the `x-real-ip` / last `x-forwarded-for` order applies.
- The CSP (copied verbatim from the former `vercel.json`) still allows `https://vercel.live`; drop it
  in a follow-up once Vercel is retired.
