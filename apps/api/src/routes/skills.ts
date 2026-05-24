import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getDb } from '@zr-ovo/devforge-shared'

export async function skillRoutes(app: FastifyInstance): Promise<void> {
  app.get('/skills/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params as { id: string })

    const db = getDb()
    const skill = await db.skill.findUnique({
      where: { id },
      include: {
        securityReports: {
          orderBy: { scannedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!skill) {
      return reply.status(404).send({ error: 'Skill not found' })
    }

    return reply.send({
      id: skill.id,
      name: skill.name,
      author: skill.author,
      description: skill.description,
      githubUrl: skill.githubUrl,
      stars: skill.stars,
      path: skill.path,
      branch: skill.branch,
      security: skill.securityReports[0]
        ? {
            riskScore: skill.securityReports[0].riskScore,
            riskLevel: skill.securityReports[0].riskLevel,
            findings: skill.securityReports[0].findings,
            scannedAt: skill.securityReports[0].scannedAt.toISOString(),
          }
        : null,
      cachedAt: skill.cachedAt.toISOString(),
    })
  })
}
