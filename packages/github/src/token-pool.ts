import { logger } from 'devforge-shared'

interface TokenState {
  token: string
  remaining: number
  resetAt: number
  isCodeSearchLimited: boolean
}

/**
 * GitHub Token Pool — 多 token 轮询 + 限流控制
 *
 * 支持 REST API (5000 req/hr) 和 Code Search API (30 req/min) 两套限流体系。
 * 当所有 token 均受限时，使用 exponential backoff。
 */
export class TokenPool {
  private tokens: TokenState[] = []
  private index = 0

  constructor(rawTokens: string[]) {
    if (rawTokens.length === 0) {
      logger.warn({ module: 'token-pool' }, 'No GitHub tokens configured — using unauthenticated (60 req/hr)')
      this.tokens = [{ token: '', remaining: 60, resetAt: Date.now() + 3600000, isCodeSearchLimited: false }]
      return
    }
    this.tokens = rawTokens.map((t) => ({
      token: t,
      remaining: 5000,
      resetAt: Date.now() + 3600000,
      isCodeSearchLimited: false,
    }))
    logger.info({ module: 'token-pool', count: this.tokens.length }, 'Token pool initialized')
  }

  /** 获取下一个可用 token（轮询），如果全受限则返回 null */
  acquire(): string | null {
    const now = Date.now()

    for (let i = 0; i < this.tokens.length; i++) {
      this.index = (this.index + 1) % this.tokens.length
      const t = this.tokens[this.index]

      // 如果重置时间已过，恢复配额
      if (now >= t.resetAt) {
        t.remaining = 5000
        t.resetAt = now + 3600000
        t.isCodeSearchLimited = false
      }

      if (t.remaining > 0) {
        return t.token
      }
    }

    return null
  }

  /** 报告 token 使用情况 */
  reportUsage(token: string, remaining: number, isCodeSearch = false): void {
    const t = this.tokens.find((s) => s.token === token)
    if (t) {
      t.remaining = remaining
      if (isCodeSearch) {
        t.isCodeSearchLimited = true
      }
    }
  }

  /** 当 API 返回 403/429 时，标记 token 为受限并暂停 */
  markLimited(token: string, retryAfterMs = 60000): void {
    const t = this.tokens.find((s) => s.token === token)
    if (t) {
      t.remaining = 0
      t.resetAt = Date.now() + retryAfterMs
      logger.warn({ module: 'token-pool' }, `Token limited, paused for ${retryAfterMs}ms`)
    }
  }

  get availableCount(): number {
    const now = Date.now()
    return this.tokens.filter((t) => now >= t.resetAt || t.remaining > 0).length
  }
}
