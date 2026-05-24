import { FastifyInstance } from 'fastify'
import { getDb, logger } from 'devforge-shared'
import { SkillsMPClient } from 'devforge-skillsmp'
import { config } from 'devforge-shared'

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/health — 健康检查
  app.get('/admin/health', async (_req, reply) => {
    try {
      await getDb().$queryRaw`SELECT 1`
      return reply.send({ status: 'ok', timestamp: new Date().toISOString() })
    } catch (err) {
      return reply.status(503).send({ status: 'error', message: 'Database unreachable' })
    }
  })

  // GET /admin/status — SkillsMP + DB 状态
  app.get('/admin/status', async (_req, reply) => {
    const client = new SkillsMPClient(config.skillsmp.apiKey, config.skillsmp.dailyLimit)
    const skillCount = await getDb().skill.count()

    return reply.send({
      skillsmp: {
        configured: !!config.skillsmp.apiKey,
        remaining: client.remaining,
        dailyLimit: config.skillsmp.dailyLimit,
      },
      cache: {
        skills: skillCount,
      },
    })
  })
}
