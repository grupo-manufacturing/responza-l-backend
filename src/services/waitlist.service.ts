import { z } from 'zod'
import type { Env } from '../config/env.js'
import { WaitlistSignup } from '../models/WaitlistSignup.js'
import { sendWaitlistConfirmation } from './email.service.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const waitlistBodySchema = z.object({
  email: z.string(),
  source: z.enum(['hero', 'footer']),
  website: z.string().optional(),
})

export type WaitlistBody = z.infer<typeof waitlistBodySchema>

export type WaitlistMeta = {
  ip?: string
  userAgent?: string
}

export type WaitlistFailure = {
  ok: false
  error: string
  status: 400 | 409 | 502 | 503
}

export type WaitlistResult = { ok: true } | WaitlistFailure

function normalizeEmail(email: string): string | null {
  const t = email.trim().toLowerCase()
  if (t.length > 320 || !emailPattern.test(t)) return null
  return t
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 11000
  )
}

export function parseWaitlistBody(body: unknown): WaitlistBody | null {
  const parsed = waitlistBodySchema.safeParse(body)
  if (!parsed.success) return null
  return parsed.data
}

export function isHoneypotTriggered(body: WaitlistBody): boolean {
  return typeof body.website === 'string' && body.website.trim().length > 0
}

export async function processWaitlist(
  env: Env,
  body: WaitlistBody,
  meta: WaitlistMeta,
): Promise<WaitlistResult> {
  const email = normalizeEmail(body.email)
  if (!email) {
    return { ok: false, error: 'Please enter a valid email address.', status: 400 }
  }

  try {
    await WaitlistSignup.create({
      email,
      source: body.source,
      ip: meta.ip,
      userAgent: meta.userAgent,
    })
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return {
        ok: false,
        error: "You're already on the waitlist.",
        status: 409,
      }
    }
    throw err
  }

  const emailResult = await sendWaitlistConfirmation(env, email)
  if (!emailResult.ok) {
    return { ok: false, error: emailResult.error, status: emailResult.status }
  }

  return { ok: true }
}
