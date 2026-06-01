import 'dotenv/config'
import { createServer } from 'node:http'
import { loadEnv } from './config/env.js'
import { connectDb, disconnectDb } from './db/connect.js'
import { createApp } from './app.js'

async function main() {
  const env = loadEnv()
  const app = createApp(env)
  const server = createServer(app)

  await connectDb(env)

  server.listen(env.PORT, () => {
    console.info(`API listening on port ${env.PORT}`)
  })

  const shutdown = async (signal: string) => {
    console.info(`${signal} received, shutting down`)
    server.close()
    await disconnectDb()
    process.exit(0)
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
