/**
 * OG Image Route Handler (Cloudflare Workers)
 *
 * Serves the static VoidPay branding OG card (/og-image.png).
 * Dynamic Satori/resvg WASM rendering exceeds the 128 MB Cloudflare Workers
 * isolate ceiling when co-located with the full Next.js bundle (error 1102),
 * so this route redirects to the static asset until/unless dynamic OG is
 * split into its own dedicated Worker.
 */

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const target = new URL('/og-image.png', request.url)
  return NextResponse.redirect(target, {
    status: 302,
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
