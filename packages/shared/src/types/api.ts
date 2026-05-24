export interface SearchQuery {
  q: string
  category?: string
  riskLevel?: string
  minQuality?: number
  sort?: 'relevance' | 'popular' | 'newest'
  limit?: number
  offset?: number
}

export interface SkillSummary {
  id: string
  name: string
  displayName: string | null
  description: string | null
  category: string | null
  tags: string[]
  repository: {
    owner: string
    name: string
    stars: number
  }
  riskLevel: string | null
  qualityScore: number | null
}

export interface SkillDetail extends SkillSummary {
  version: string | null
  author: string | null
  allowedTools: string[]
  dependencies: string[]
  installMethod: string | null
  compatibility: Record<string, string> | null
  aiSummary: string | null
  aiQualityScore: number | null
  security: {
    riskScore: number | null
    riskLevel: string | null
    findings: unknown[]
  } | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}
