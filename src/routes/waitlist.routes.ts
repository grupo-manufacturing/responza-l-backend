import { Router } from 'express'
import type { Env } from '../config/env.js'
import { createWaitlistHandler } from '../controllers/waitlist.controller.js'
import { waitlistRateLimit } from '../middleware/waitlistRateLimit.js'

export function createWaitlistRouter(env: Env) {
  const router = Router()
  router.post('/waitlist', waitlistRateLimit, createWaitlistHandler(env))
  return router
}
