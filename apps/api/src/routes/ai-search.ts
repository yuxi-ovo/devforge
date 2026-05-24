import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getDb, logger, config } from 'devforge-shared'
import { SkillsMPClient } from 'devforge-skillsmp'

const aiSearchSchema = z.object({
  q: z.string().min(1).max(500),
})

export async function aiSearchRoutes(app: FastifyInstance): Promise<void> {
  app.get('/ai-search', async (req, reply) => {
    const parsed = aiSearchSchema.safeParse(req.query)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid query', details: parsed.error.flatten() })
    }

    const { q } = parsed.data
    const client = new SkillsMPClient(config.skillsmp.apiKey, config.skillsmp.dailyLimit)

    if (!config.skillsmp.apiKey) {
      return reply.status(503).send({ error: 'SkillsMP API key not configured' })
    }

    try {
      const skills = await client.aiSearch(q)

      // 缓存到本地 SQLite
      if (skills.length > 0) {
        const db = getDb()
        for (const skill of skills) {
          await db.skill.upsert({
            where: { id: skill.id },
            update: {
              name: skill.name,
              author: skill.author,
              description: skill.description,
              githubUrl: skill.githubUrl,
              skillUrl: skill.skillUrl || null,
              stars: skill.stars,
              path: skill.path || null,
              branch: skill.branch || null,
              cachedAt: new Date(),
            },
            create: {
              id: skill.id,
              name: skill.name,
              author: skill.author,
              description: skill.description,
              githubUrl: skill.githubUrl,
              skillUrl: skill.skillUrl || null,
              stars: skill.stars,
              path: skill.path || null,
              branch: skill.branch || null,
            },
          })
        }
      }

      return reply.send({
        query: q,
        data: skills.map((s) => ({
          id: s.id,
          name: s.name,
          author: s.author,
          description: s.description,
          githubUrl: s.githubUrl,
          skillUrl: s.skillUrl,
          stars: s.stars,
        })),
        count: skills.length,
        apiRemaining: client.remaining,
      })
    } catch (err) {
      logger.error({ err, q }, 'AI search failed')
      return reply.status(500).send({ error: 'AI search failed' })
    }
  })
}
