import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getDb, logger, config } from 'devforge-shared'
import { SkillsMPClient } from 'devforge-skillsmp'

const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  category: z.string().optional(),
  sort: z.enum(['relevance', 'popular', 'newest']).default('relevance'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function searchRoutes(app: FastifyInstance): Promise<void> {
  app.get('/search', async (req, reply) => {
    const parsed = searchQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid query', details: parsed.error.flatten() })
    }

    const { q, category, sort, limit, offset } = parsed.data
    const client = new SkillsMPClient(config.skillsmp.apiKey, config.skillsmp.dailyLimit)

    if (!config.skillsmp.apiKey) {
      return reply.status(503).send({ error: 'SkillsMP API key not configured' })
    }

    const sortMap: Record<string, 'recent' | 'stars'> = {
      relevance: 'recent',
      popular: 'stars',
      newest: 'recent',
    }

    try {
      const page = Math.floor(offset / limit) + 1
      const result = await client.search({
        q,
        category,
        sortBy: sortMap[sort] || 'recent',
        page,
        limit,
      })

      // 缓存到本地 SQLite
      if (result.skills.length > 0) {
        const db = getDb()
        for (const skill of result.skills) {
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
        data: result.skills.map((s) => ({
          id: s.id,
          name: s.name,
          author: s.author,
          description: s.description,
          githubUrl: s.githubUrl,
          stars: s.stars,
        })),
        total: result.total,
        limit,
        offset,
        apiRemaining: client.remaining,
      })
    } catch (err) {
      logger.error({ err, q }, 'Search failed')
      return reply.status(500).send({ error: 'Search failed' })
    }
  })
}
