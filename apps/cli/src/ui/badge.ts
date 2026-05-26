import { PRIMARY, PRIMARY_BRIGHT, SUCCESS, INFO, SECONDARY, WARNING, ERROR, TEXT_MUTED, RESET } from './theme'

/**
 * Render a badge/tag: `[text]`
 */
export function renderBadge(text: string, color: string = PRIMARY): string {
  return `${color}[${text}]${RESET}`
}

// ── Presets ───────────────────────────────────────────

export const BADGE_AI      = renderBadge('AI推荐',    PRIMARY_BRIGHT)
export const BADGE_CORE    = renderBadge('核心',      SUCCESS)
export const BADGE_TESTING = renderBadge('测试',      INFO)
export const BADGE_DB      = renderBadge('数据库',    SECONDARY)
export const BADGE_API     = renderBadge('API',       WARNING)
export const BADGE_DEPLOY  = renderBadge('部署',      ERROR)
export const BADGE_TOOL    = renderBadge('工具',      TEXT_MUTED)
export const BADGE_POPULAR = renderBadge('热门',      WARNING)

/** Map category string to pre-built badge */
export function badgeForCategory(category: string): string {
  const map: Record<string, string> = {
    '核心': BADGE_CORE,
    '测试': BADGE_TESTING,
    '数据库': BADGE_DB,
    '部署': BADGE_DEPLOY,
    '工具': BADGE_TOOL,
  }
  const key = category.toLowerCase()
  if (key === 'api') return BADGE_API
  return map[category] || renderBadge(category, PRIMARY)
}
