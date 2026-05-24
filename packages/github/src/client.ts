import { logger } from 'devforge-shared'
import { TokenPool } from './token-pool'

export interface GitHubClientOptions {
  tokens: string[]
  userAgent?: string
}

export interface SearchCodeResult {
  fullName: string
  owner: string
  name: string
  filePath: string
  url: string
}

export interface SearchRepoResult {
  fullName: string
  owner: string
  name: string
  description: string | null
  stars: number
  topics: string[]
  url: string
  isFork: boolean
  defaultBranch: string
}

export interface TreeEntry {
  path: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
}

export interface RepoContent {
  content: string
  encoding: string
  sha: string
}

const BASE = 'https://api.github.com'

export class GitHubClient {
  private tokenPool: TokenPool
  private userAgent: string

  constructor(opts: GitHubClientOptions) {
    this.tokenPool = new TokenPool(opts.tokens)
    this.userAgent = opts.userAgent || 'claude-code-discovery/0.1'
  }

  /** Code Search: filename:SKILL.md 等查询 */
  async searchCode(query: string, perPage = 100): Promise<SearchCodeResult[]> {
    const results: SearchCodeResult[] = []
    let page = 1
    let hasMore = true

    while (hasMore && page <= 10) {
      const data = await this.request<{ items: Array<{
        name: string; path: string; html_url: string; repository: { full_name: string; owner: { login: string }; name: string }
      }> }>('/search/code', { q: query, per_page: perPage, page })

      if (!data) break

      for (const item of data.items || []) {
        results.push({
          fullName: item.repository.full_name,
          owner: item.repository.owner.login,
          name: item.repository.name,
          filePath: item.path,
          url: item.html_url,
        })
      }

      hasMore = (data.items?.length ?? 0) === perPage
      page++
    }

    logger.info({ module: 'github', query, count: results.length }, 'Code search completed')
    return results
  }

  /** Repo Search: topic:claude-code 等查询 */
  async searchRepos(query: string, sort: 'stars' | 'updated' = 'stars', perPage = 100): Promise<SearchRepoResult[]> {
    const results: SearchRepoResult[] = []
    let page = 1
    let hasMore = true

    while (hasMore && page <= 10) {
      const data = await this.request<{ items: Array<{
        full_name: string; owner: { login: string }; name: string
        description: string | null; stargazers_count: number; topics: string[]
        html_url: string; fork: boolean; default_branch: string
      }> }>('/search/repositories', { q: query, sort, order: 'desc', per_page: perPage, page })

      if (!data) break

      for (const item of data.items || []) {
        results.push({
          fullName: item.full_name,
          owner: item.owner.login,
          name: item.name,
          description: item.description,
          stars: item.stargazers_count,
          topics: item.topics || [],
          url: item.html_url,
          isFork: item.fork,
          defaultBranch: item.default_branch,
        })
      }

      hasMore = (data.items?.length ?? 0) === perPage
      page++
    }

    logger.info({ module: 'github', query, count: results.length }, 'Repo search completed')
    return results
  }

  /** Git Trees API: 获取仓库目录树 */
  async getTree(owner: string, repo: string, branch = 'HEAD', recursive = true): Promise<TreeEntry[]> {
    const data = await this.request<{ sha: string; tree: Array<{ path: string; type: string; sha: string; size?: number }> }>(
      `/repos/${owner}/${repo}/git/trees/${branch}`, { recursive: recursive ? '1' : undefined }
    )
    if (!data) return []
    return data.tree.map((e) => ({ path: e.path, type: e.type as 'blob' | 'tree', sha: e.sha, size: e.size }))
  }

  /** Get repository metadata (for ETag/SHA cache) */
  async getRepo(owner: string, repo: string): Promise<{ sha: string | null } | null> {
    const data = await this.request<{ default_branch: string; object?: { sha: string } }>(
      `/repos/${owner}/${repo}`, {}
    )
    return data ? { sha: null } : null
  }

  /** Get file content from GitHub */
  async getContent(owner: string, repo: string, path: string): Promise<RepoContent | null> {
    const data = await this.request<{ content: string; encoding: string; sha: string }>(
      `/repos/${owner}/${repo}/contents/${path}`, {}
    )
    if (!data) return null
    return { content: data.content, encoding: data.encoding, sha: data.sha }
  }

  /** Get forks of a repository */
  async getForks(owner: string, repo: string, perPage = 100): Promise<SearchRepoResult[]> {
    const results: SearchRepoResult[] = []
    let page = 1
    let hasMore = true

    while (hasMore && page <= 10) {
      const data = await this.request<Array<{
        full_name: string; owner: { login: string }; name: string
        description: string | null; stargazers_count: number; topics: string[]
        html_url: string; fork: boolean; default_branch: string
      }>>(`/repos/${owner}/${repo}/forks`, { sort: 'stargazers', per_page: perPage, page })

      if (!data) break

      for (const item of data) {
        results.push({
          fullName: item.full_name,
          owner: item.owner.login,
          name: item.name,
          description: item.description,
          stars: item.stargazers_count,
          topics: item.topics || [],
          url: item.html_url,
          isFork: item.fork,
          defaultBranch: item.default_branch,
        })
      }

      hasMore = data.length === perPage
      page++
    }

    return results
  }

  /** Raw HTTP request with token pool + retry logic */
  private async request<T>(path: string, params: Record<string, unknown>): Promise<T | null> {
    const maxRetries = 3

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const token = this.tokenPool.acquire()
      if (!token) {
        logger.warn({ module: 'github' }, 'All tokens rate-limited, backing off...')
        await this.sleep(30000)
        continue
      }

      const url = new URL(BASE + path)
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v))
      }

      try {
        const res = await fetch(url.toString(), {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'User-Agent': this.userAgent,
            Accept: 'application/vnd.github.v3+json',
          },
        })

        // Track rate limit
        const remaining = parseInt(res.headers.get('X-RateLimit-Remaining') || '0', 10)
        const isCodeSearch = path === '/search/code'
        this.tokenPool.reportUsage(token, remaining, isCodeSearch)

        if (res.status === 403 || res.status === 429) {
          const retryAfter = parseInt(res.headers.get('Retry-After') || '60', 10) * 1000
          this.tokenPool.markLimited(token, retryAfter)
          logger.warn({ module: 'github', status: res.status, retryAfter }, 'Rate limited')
          continue
        }

        if (res.status === 404) return null
        if (!res.ok) {
          logger.error({ module: 'github', status: res.status, path }, 'GitHub API error')
          if (attempt < maxRetries - 1) {
            await this.sleep(5000 * (attempt + 1))
            continue
          }
          return null
        }

        return await res.json() as T
      } catch (err) {
        logger.error({ module: 'github', path, attempt }, 'GitHub API request failed')
        if (attempt < maxRetries - 1) {
          await this.sleep(5000 * (attempt + 1))
          continue
        }
        return null
      }
    }

    return null
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
