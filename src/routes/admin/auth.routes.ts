import { Router } from 'express'
import type { Env } from '../../config/env.js'
import { createAuthController } from '../../controllers/auth.controller.js'
import { authRateLimit } from '../../middleware/authRateLimit.js'
import { createRequireAdmin } from '../../middleware/requireAdmin.js'

export function createAdminAuthRouter(env: Env) {
  const router = Router()
  const controller = createAuthController(env)
  const requireAdmin = createRequireAdmin(env)

  router.post('/auth/login', authRateLimit, controller.postLogin)
  router.post('/auth/logout', controller.postLogout)
  router.get('/auth/me', requireAdmin, controller.getMe)

  return router
}
