import type { NextFunction, Request, Response } from 'express'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (res.headersSent) {
    return
  }

  const isProd = process.env.NODE_ENV === 'production'

  if (err instanceof Error && err.message.startsWith('Invalid environment')) {
    res.status(500).json({ error: isProd ? 'Server misconfigured.' : err.message })
    return
  }

  if (!isProd && err instanceof Error) {
    console.error(err)
  }

  res.status(500).json({ error: 'Server error.' })
}
