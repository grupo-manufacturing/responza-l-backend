import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().min(1).optional(),
  CORS_ORIGINS: z.string().optional(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
})

export type Env = z.infer<typeof envSchema>

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid environment: ${message}`)
  }
  return parsed.data
}

function expandOriginVariants(origins: string[]): string[] {
  const expanded = new Set(origins)

  for (const origin of origins) {
    try {
      const url = new URL(origin)
      const { hostname } = url
      if (hostname === 'localhost' || hostname.startsWith('127.')) continue

      if (hostname.startsWith('www.')) {
        const bare = new URL(origin)
        bare.hostname = hostname.slice(4)
        expanded.add(bare.origin)
      } else {
        const www = new URL(origin)
        www.hostname = `www.${hostname}`
        expanded.add(www.origin)
      }
    } catch {
      // keep only the literal value if it is not a valid URL
    }
  }

  return [...expanded]
}

export function getCorsOrigins(env: Env): string[] | undefined {
  if (!env.CORS_ORIGINS) {
    if (env.NODE_ENV === 'production') {
      return ['https://responza.in', 'https://www.responza.in']
    }
    return undefined
  }

  const list = env.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  if (list.length === 0) return undefined
  return expandOriginVariants(list)
}

export function getResendConfig(env: Env): { apiKey: string; from: string } | null {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) return null
  return { apiKey: env.RESEND_API_KEY, from: env.RESEND_FROM_EMAIL }
}

export function getAdminIdentity(env: Env): { id: string; email: string; role: string } {
  return {
    id: 'admin',
    email: env.ADMIN_EMAIL.trim().toLowerCase(),
    role: 'super_admin',
  }
}
