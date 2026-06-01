import { Router } from 'express'
import type { Env } from '../../config/env.js'
import { createAdminAuthRouter } from './auth.routes.js'
import { createAdminBlogsRouter } from './blogs.routes.js'

export function createAdminRouter(env: Env) {
  const router = Router()
  router.use(createAdminAuthRouter(env))
  router.use(createAdminBlogsRouter(env))
  return router
}
