import { timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'
import type { Env } from '../config/env.js'
import { getAdminIdentity } from '../config/env.js'

export type AdminTokenPayload = {
  sub: string
  email: string
  role: string
}

export type AuthAdmin = {
  id: string
  email: string
  role: string
}

export type LoginResult =
  | { ok: true; token: string; admin: AuthAdmin }
  | { ok: false; error: string; status: 401 }

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

function signToken(env: Env, admin: AuthAdmin): string {
  const payload: AdminTokenPayload = {
    sub: admin.id,
    email: admin.email,
    role: admin.role,
  }
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function verifyToken(env: Env, token: string): AdminTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload
}

export function login(env: Env, email: string, password: string): LoginResult {
  const admin = getAdminIdentity(env)
  const normalizedEmail = email.trim().toLowerCase()

  if (
    normalizedEmail !== admin.email ||
    !safeEqual(password, env.ADMIN_PASSWORD)
  ) {
    return { ok: false, error: 'Invalid email or password.', status: 401 }
  }

  const token = signToken(env, admin)
  return { ok: true, token, admin }
}

export function adminFromToken(env: Env, payload: AdminTokenPayload): AuthAdmin | null {
  const admin = getAdminIdentity(env)
  if (payload.sub !== admin.id || payload.email !== admin.email) {
    return null
  }
  return admin
}
