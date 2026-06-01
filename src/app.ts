import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import type { Env } from './config/env.js'
import { getCorsOrigins } from './config/env.js'
import { apiRouter } from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp(env: Env) {
  const app = express()

  app.set('trust proxy', env.NODE_ENV === 'production' ? 1 : false)

  const origins = getCorsOrigins(env)
  app.use(
    cors(
      origins
        ? {
            origin: origins,
            credentials: true,
          }
        : {},
    ),
  )
  app.use(helmet())
  app.use(express.json({ limit: '256kb' }))

  app.use('/api/v1', apiRouter(env))

  app.use(errorHandler)

  return app
}
