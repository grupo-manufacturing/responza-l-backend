import type { Request, Response, NextFunction } from 'express'
import type { Env } from '../config/env.js'
import {
  isHoneypotTriggered,
  parseWaitlistBody,
  processWaitlist,
} from '../services/waitlist.service.js'

export function createWaitlistHandler(env: Env) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = parseWaitlistBody(req.body)
      if (!body) {
        res.status(400).json({ error: 'Invalid request body.' })
        return
      }

      if (isHoneypotTriggered(body)) {
        res.status(200).json({ ok: true })
        return
      }

      const result = await processWaitlist(env, body, {
        ip: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      })

      if (result.ok) {
        res.status(200).json({ ok: true })
        return
      }

      res.status(result.status).json({ error: result.error })
    } catch (err) {
      next(err)
    }
  }
}
