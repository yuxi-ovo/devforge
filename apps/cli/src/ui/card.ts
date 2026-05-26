import {
  BORDER, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED,
  SUCCESS, PRIMARY, RESET, BOLD, DIM,
  visibleWidth, stripAnsi,
} from './theme'
import { formatStars, wrap, padEnd } from './format'
import { iconStar, iconSuccess } from './status'
import { renderBadge } from './badge'

interface BadgeDef {
  text: string
  color: string
}

interface CardOptions {
  icon?: string
  name: string
  subtitle?: string
  badges?: BadgeDef[]
  metadata?: string
  description: string
  aiReasoning?: string
  accent?: string
  width?: number
  selected?: boolean
}

/**
 * Render a recommendation card.
 *
 * ```
 * ┌── [AI推荐] [核心] ──────────────────────────────────┐
 * │  ★  mcp-server-patterns      ⭐ 1,234    热门      │
 * │  ─────────────────────────────────────────────────── │
 * │  MCP 服务器开发规范与最佳实践模板...                 │
 * │  AI: 这是您项目的核心 Skill                        │
 * └────────────────────────────────────────────────────┘
 * ```
 */
export function renderCard(opts: CardOptions): string[] {
  const width = opts.width ?? 72
  const border = BORDER
  const accent = opts.accent || PRIMARY
  const inner = width - 4  // 2 border + 2 padding

  const result: string[] = []

  // ── Top border with badges ──
  const badges = (opts.badges || []).map((b) => renderBadge(b.text, b.color))
  const badgeStr = badges.length > 0 ? ` ${badges.join(' ')} ` : ''
  const badgeLen = visibleWidth(badgeStr)
  const topFill = Math.max(0, inner - badgeLen)
  result.push(`${border}┌${badgeStr}${'─'.repeat(topFill)}┐${RESET}`)

  // ── Title line ──
  const prefix = opts.selected
    ? `${SUCCESS}✓${RESET} `
    : opts.icon
      ? `${opts.icon} `
      : '  '
  const nameStr = `${BOLD}${TEXT_PRIMARY}${opts.name}${RESET}`
  const metaStr = opts.metadata ? ` ${TEXT_MUTED}${opts.metadata}${RESET}` : ''
  const titleLeft = `${prefix}${nameStr}${metaStr}`
  const titleLine = `  ${titleLeft}`
  result.push(`${border}│${RESET}${padEnd(titleLine, inner)}${border}│${RESET}`)

  // ── Separator if there's description ──
  if (opts.description || opts.aiReasoning) {
    result.push(`${border}│${RESET} ${DIM}${'─'.repeat(inner - 2)}${RESET} ${border}│${RESET}`)
  }

  // ── Description ──
  if (opts.description) {
    const descLines = wrap(opts.description, inner - 4, 2)
    for (const line of descLines) {
      result.push(`${border}│${RESET}${padEnd(line, inner)}${border}│${RESET}`)
    }
  }

  // ── AI Reasoning ──
  if (opts.aiReasoning) {
    const aiLine = `${PRIMARY}AI:${RESET} ${opts.aiReasoning}`
    result.push(`${border}│${RESET}${padEnd(aiLine, inner)}${border}│${RESET}`)
  }

  // ── Bottom border ──
  result.push(`${border}└${'─'.repeat(inner)}┘${RESET}`)

  return result
}

interface ListOptions {
  width?: number
  gap?: number
}

/**
 * Render a vertical list of cards.
 */
export function renderCardList(items: CardOptions[], opts: ListOptions = {}): string[] {
  const gap = opts.gap ?? 1
  const result: string[] = []
  for (let i = 0; i < items.length; i++) {
    const card = renderCard({ ...items[i], width: opts.width })
    result.push(...card)
    if (i < items.length - 1 && gap > 0) {
      result.push('')
    }
  }
  return result
}
