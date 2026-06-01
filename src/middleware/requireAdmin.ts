import type { NextFunction, Request, Response } from 'express'
import type { Env } from '../config/env.js'
import { adminFromToken, verifyToken } from '../services/auth.service.js'

export function createRequireAdmin(env: Env) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.get('authorization')
    const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : undefined

    if (!token) {
      res.status(401).json({ error: 'Unauthorized.' })
      return
    }

    try {
      const payload = verifyToken(env, token)
      const admin = adminFromToken(env, payload)
      if (!admin) {
        res.status(401).json({ error: 'Unauthorized.' })
        return
      }
      req.admin = admin
      next()
    } catch {
      res.status(401).json({ error: 'Unauthorized.' })
    }
  }
}
