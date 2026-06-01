import { Router } from 'express'
import { getDbStatus } from '../db/connect.js'

export const healthRouter = Router()

healthRouter.get('/health', (_req, res) => {
  const db = getDbStatus()
  const ok = db === 'connected'

  res.status(ok ? 200 : 503).json({
    ok,
    timestamp: new Date().toISOString(),
    db,
  })
})
