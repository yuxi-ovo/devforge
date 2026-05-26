import { logger } from '@zr-ovo/devforge-shared'

const BASE = 'https://skillsmp.com/api/v1'

export interface SkillsMPSkill {
  id: string
  name: string
  author: string
  authorAvatar?: string
  description: string
  githubUrl: string
  skillUrl?: string
  stars: number
  updatedAt: string
  path?: string
  branch?: string
}

interface SearchResponse {
  success: boolean
  data: {
    skills: SkillsMPSkill[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
      totalIsExact: boolean
    }
    filters: {
      search: string
      sortBy: string
    }
  }
  meta: {
    requestId: string
    responseTimeMs: number
  }
}

export class SkillsMPClient {
  private apiKey: string
  private dailyUsage = 0
  private dailyLimit: number

  constructor(apiKey: string, dailyLimit = 500) {
    this.apiKey = apiKey
    this.dailyLimit = dailyLimit
  }

  get remaining(): number {
    return Math.max(0, this.dailyLimit - this.dailyUsage)
  }

  /** 关键词搜索 */
  async search(params: {
    q?: string
    page?: number
    limit?: number
    sortBy?: 'recent' | 'stars'
    category?: string
  }): Promise<{ skills: SkillsMPSkill[]; total: number; hasMore: boolean }> {
    if (this.dailyUsage >= this.dailyLimit) {
      logger.warn({ module: 'skillsmp' }, 'Daily API limit reached')
      return { skills: [], total: 0, hasMore: false }
    }

    const query = new URLSearchParams()
    if (params.q) query.set('q', params.q)
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.sortBy) query.set('sortBy', params.sortBy)
    if (params.category) query.set('category', params.category)

    try {
      const res = await fetch(`${BASE}/skills/search?${query}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'User-Agent': 'claude-code-discovery/0.1',
        },
      })

      this.dailyUsage++

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { error?: { code?: string; message?: string } }
        const code = errBody.error?.code
        const msg = errBody.error?.message || 'Unknown error'

        if (code === 'INVALID_API_KEY') throw new Error('API Key 无效，请运行 devforge config 重新配置')
        if (code === 'MISSING_QUERY') throw new Error('缺少搜索关键词')
        if (code === 'DAILY_QUOTA_EXCEEDED') throw new Error('今日 API 调用次数已用完，请明天再试')
        if (code === 'INTERNAL_ERROR') throw new Error('SkillsMP 服务器内部错误，请稍后再试')

        logger.warn({ status: res.status, code, module: 'skillsmp' }, 'SkillsMP search failed')
        throw new Error(`SkillsMP 请求失败: ${res.status} ${msg}`)
      }

      const body = (await res.json()) as SearchResponse
      if (!body.success) {
        return { skills: [], total: 0, hasMore: false }
      }

      return {
        skills: body.data.skills,
        total: body.data.pagination.total,
        hasMore: body.data.pagination.hasNext,
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('API Key')) throw err
      if (err instanceof Error && err.message.includes('API 调用次数')) throw err
      logger.error({ err, module: 'skillsmp' }, 'SkillsMP search error')
      return { skills: [], total: 0, hasMore: false }
    }
  }

  /** AI 语义搜索 */
  async aiSearch(q: string): Promise<SkillsMPSkill[]> {
    if (this.dailyUsage >= this.dailyLimit) {
      logger.warn({ module: 'skillsmp' }, 'Daily API limit reached')
      return []
    }

    try {
      const res = await fetch(`${BASE}/skills/ai-search?q=${encodeURIComponent(q)}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'User-Agent': 'claude-code-discovery/0.1',
        },
      })

      this.dailyUsage++

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { error?: { code?: string; message?: string } }
        const code = errBody.error?.code
        const msg = errBody.error?.message || 'Unknown error'

        if (code === 'INVALID_API_KEY') throw new Error('API Key 无效，请运行 devforge config 重新配置')
        if (code === 'MISSING_QUERY') throw new Error('缺少搜索关键词')
        if (code === 'DAILY_QUOTA_EXCEEDED') throw new Error('今日 API 调用次数已用完，请明天再试')
        if (code === 'INTERNAL_ERROR') throw new Error('SkillsMP 服务器内部错误，请稍后再试')

        throw new Error(`SkillsMP 请求失败: ${res.status} ${msg}`)
      }

      const body = (await res.json()) as SearchResponse
      return body.success ? body.data.skills : []
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('API Key')) throw err
      if (err instanceof Error && err.message.includes('API 调用次数')) throw err
      logger.error({ err, module: 'skillsmp' }, 'SkillsMP AI search error')
      return []
    }
  }
}
