import { z } from 'zod'

export const envSchema = z.object({
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
  NEXT_PUBLIC_ENABLE_TESTNETS: z.string().optional().default('false'),

  // RPC Proxy (Server-side only - NOT prefixed with NEXT_PUBLIC_)
  // Single API key per provider — chain routing is automatic via slug maps
  ALCHEMY_API_KEY: z.string().optional(),
  INFURA_API_KEY: z.string().optional(),

  // Rate Limiting (Upstash Redis via Vercel Marketplace)
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
})

export type EnvConfig = z.infer<typeof envSchema>

export function validateEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.warn('Invalid environment variables:', parsed.error.format())
    return process.env as unknown as EnvConfig
  }
  return parsed.data
}
