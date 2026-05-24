import { BORDER, TEXT_PRIMARY, RESET, visibleWidth, stripAnsi } from './theme'
import { padEnd } from './format'

interface BoxOptions {
  width?: number
  padding?: number
  borderColor?: string
}

/**
 * Render a bordered box around content lines.
 * ```
 * ┌──────────────────────┐
 * │  content              │
 * │  content              │
 * └──────────────────────┘
 * ```
 */
export function renderBox(content: string[], opts: BoxOptions = {}): string[] {
  const width = opts.width ?? 72
  const padding = opts.padding ?? 1
  const border = opts.borderColor || BORDER
  const innerWidth = width - 2 - padding * 2

  const result: string[] = []

  // Top border
  result.push(`${border}┌${'─'.repeat(width - 2)}┐${RESET}`)

  // Content lines
  for (const line of content) {
    const plain = stripAnsi(line)
    const lineWidth = visibleWidth(line)
    if (lineWidth > innerWidth) {
      // TODO: word-wrap long content
    }
    const padded = ' '.repeat(padding) + line + ' '.repeat(Math.max(0, width - 2 - padding - lineWidth))
    result.push(`${border}│${RESET}${padded}${border}│${RESET}`)
  }

  // Bottom border
  result.push(`${border}└${'─'.repeat(width - 2)}┘${RESET}`)

  return result
}

interface TitledBoxOptions extends BoxOptions {
  titleColor?: string
}

/**
 * Render a bordered box with an inline title at top-left.
 * ```
 * ┌── 📋 项目概览 ─────────────────────────────────────┐
 * │  content                                            │
 * └────────────────────────────────────────────────────┘
 * ```
 */
export function renderTitledBox(title: string, content: string[], opts: TitledBoxOptions = {}): string[] {
  const width = opts.width ?? 72
  const padding = opts.padding ?? 1
  const border = opts.borderColor || BORDER
  const titleColor = opts.titleColor || TEXT_PRIMARY

  const result: string[] = []

  // Top border with title
  const titlePrefix = '── '
  const titleSuffix = ' ─'
  const titleFull = `${titlePrefix}${title}${titleSuffix}`
  const titleLen = visibleWidth(titleFull)
  const fillLen = Math.max(0, width - 2 - titleLen)
  result.push(`${border}┌${titlePrefix}${titleColor}${title}${RESET}${border}${titleSuffix}${'─'.repeat(fillLen)}┐${RESET}`)

  // Content lines
  const innerWidth = width - 2 - padding * 2
  for (const line of content) {
    const lw = visibleWidth(line)
    const padded = ' '.repeat(padding) + line + ' '.repeat(Math.max(0, width - 2 - padding - lw))
    result.push(`${border}│${RESET}${padded}${border}│${RESET}`)
  }

  // Bottom border
  result.push(`${border}└${'─'.repeat(width - 2)}┘${RESET}`)

  return result
}

/**
 * Render a simple full-width banner (no borders).
 */
export function renderBanner(lines: string[]): string[] {
  return lines
}
