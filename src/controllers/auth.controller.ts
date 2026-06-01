import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import type { Env } from '../config/env.js'
import { login } from '../services/auth.service.js'

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export function createAuthController(env: Env) {
  const postLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = loginBodySchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request body.' })
        return
      }

      const result = login(env, parsed.data.email, parsed.data.password)
      if (!result.ok) {
        res.status(result.status).json({ error: result.error })
        return
      }

      res.status(200).json({ ok: true, token: result.token, admin: result.admin })
    } catch (err) {
      next(err)
    }
  }

  const postLogout = (_req: Request, res: Response): void => {
    res.status(200).json({ ok: true })
  }

  const getMe = (req: Request, res: Response): void => {
    if (!req.admin) {
      res.status(401).json({ error: 'Unauthorized.' })
      return
    }
    res.status(200).json({ admin: req.admin })
  }

  return { postLogin, postLogout, getMe }
}
