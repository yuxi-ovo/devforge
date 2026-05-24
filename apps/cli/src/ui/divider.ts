import { BORDER, PRIMARY, TEXT_MUTED, RESET, BOLD, visibleWidth } from './theme'

const DEFAULT_WIDTH = 72

interface DividerOptions {
  char?: string
  width?: number
  color?: string
}

/**
 * Render a horizontal divider line.
 * ```
 * ──────────────────────────────────────────────────────
 * ```
 */
export function renderDivider(opts: DividerOptions = {}): string {
  const char = opts.char || '─'
  const width = opts.width ?? DEFAULT_WIDTH
  const color = opts.color || BORDER
  return `${color}${char.repeat(width)}${RESET}`
}

interface SectionOptions extends DividerOptions {
  title?: string
  titleColor?: string
}

/**
 * Render a section header with title on the left.
 * ```
 * ━━━ AI 分析 ——————————————————————————————————————
 * ```
 */
export function renderSection(title: string, opts: SectionOptions = {}): string {
  const char = opts.char || '━'
  const width = opts.width ?? DEFAULT_WIDTH
  const color = opts.color || PRIMARY
  const titleColor = opts.titleColor || PRIMARY

  const label = `${titleColor}${BOLD}${title}${RESET} ${color}`
  const labelWidth = visibleWidth(title) + 1 // title + space
  const remaining = Math.max(0, width - labelWidth)
  const line = `${char.repeat(remaining)}`
  return `${label}${line}${RESET}`
}

/**
 * Render a dimmed sub-section.
 * ```
 * ── 已安装 Skill ────────────────────────────────
 * ```
 */
export function renderSubSection(title: string, opts: SectionOptions = {}): string {
  const char = opts.char || '─'
  const width = opts.width ?? DEFAULT_WIDTH
  const color = opts.color || TEXT_MUTED

  const label = `${color}${title}${RESET} ${color}`
  const labelWidth = visibleWidth(title) + 1
  const remaining = Math.max(0, width - labelWidth)
  const line = `${char.repeat(remaining)}`
  return `${label}${line}${RESET}`
}
