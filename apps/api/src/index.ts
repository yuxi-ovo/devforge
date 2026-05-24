import Fastify from 'fastify'
import cors from '@fastify/cors'
import { logger, config, getDb, disconnectDb } from 'devforge-shared'
import { searchRoutes } from './routes/search'
import { skillRoutes } from './routes/skills'
import { adminRoutes } from './routes/admin'

async function main(): Promise<void> {
  const app = Fastify({
    logger: false, // using our own logger
  })

  // CORS
  await app.register(cors)

  // Routes
  await app.register(searchRoutes)
  await app.register(skillRoutes)
  await app.register(adminRoutes)

  // Database connection
  const db = getDb()
  await db.$connect()
  logger.info('Database connected')

  // Startup
  const port = parseInt(process.env.PORT || '3001', 10)
  const host = process.env.HOST || '0.0.0.0'

  try {
    await app.listen({ port, host })
    logger.info({ port, host }, 'API server started')
  } catch (err) {
    logger.error({ err }, 'Failed to start API server')
    process.exit(1)
  }

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down API...')
    await app.close()
    await disconnectDb()
    process.exit(0)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

main()
