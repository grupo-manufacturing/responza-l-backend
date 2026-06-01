import mongoose from 'mongoose'
import type { Env } from '../config/env.js'

export async function connectDb(env: Env): Promise<void> {
  await mongoose.connect(env.MONGODB_URI)
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect()
}

export function getDbStatus(): 'connected' | 'disconnected' {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}
