import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

let client: PrismaClient | null = null

export function getDb(): PrismaClient {
  if (!client) {
    client = new PrismaClient({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    })

    client.$on('warn' as never, (e: { message: string }) => {
      logger.warn({ module: 'db' }, e.message)
    })

    client.$on('error' as never, (e: { message: string }) => {
      logger.error({ module: 'db' }, e.message)
    })
  }
  return client
}

export async function disconnectDb(): Promise<void> {
  if (client) {
    await client.$disconnect()
    client = null
  }
}
