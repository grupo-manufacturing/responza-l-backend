import { Router } from 'express'
import type { Env } from '../config/env.js'
import { createAdminRouter } from './admin/index.js'
import { healthRouter } from './health.routes.js'
import { blogsRouter } from './blogs.routes.js'
import { createWaitlistRouter } from './waitlist.routes.js'

export function apiRouter(env: Env) {
  const router = Router()
  router.use(healthRouter)
  router.use(blogsRouter)
  router.use(createWaitlistRouter(env))
  router.use('/admin', createAdminRouter(env))
  return router
}
