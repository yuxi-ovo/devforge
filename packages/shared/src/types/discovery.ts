export interface DiscoveryQuery {
  id: string
  query: string
  type: 'code_search' | 'repo_search' | 'topic_search' | 'forks'
  strategy: 'primary' | 'fallback' | 'expansion'
  frequency: '6h' | 'daily' | '3d' | 'weekly'
  weight: number
}

export interface DiscoveryResult {
  fullName: string
  owner: string
  name: string
  description: string | null
  stars: number
  topics: string[]
  url: string
  matchType: string
  matchQueryId: string
  relevanceScore: number
}

export interface DedupResult {
  uniqueRepos: Map<string, DiscoveryResult>
  duplicatesRemoved: number
}
