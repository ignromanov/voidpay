import { z } from "zod";

export const envSchema = z.object({
  NEXT_PUBLIC_ALCHEMY_ETH_URL: z.string().url(),
  NEXT_PUBLIC_ALCHEMY_ARB_URL: z.string().url(),
  NEXT_PUBLIC_ALCHEMY_OPT_URL: z.string().url(),
  NEXT_PUBLIC_ALCHEMY_POLY_URL: z.string().url(),
  NEXT_PUBLIC_INFURA_ETH_URL: z.string().url(),
  NEXT_PUBLIC_INFURA_ARB_URL: z.string().url(),
  NEXT_PUBLIC_INFURA_OPT_URL: z.string().url(),
  NEXT_PUBLIC_INFURA_POLY_URL: z.string().url(),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.warn("Invalid environment variables:", parsed.error.format());
    // Return empty/default or throw depending on strictness.
    // For now, we just warn to allow build without .env in CI/CD if needed.
    return process.env as unknown as EnvConfig;
  }
  return parsed.data;
}
