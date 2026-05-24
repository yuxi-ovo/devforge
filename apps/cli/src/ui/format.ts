import { visibleWidth, TEXT_MUTED, BORDER, DIM, RESET } from './theme'

/**
 * Truncate text to maxWidth, adding "…" if truncated.
 * Strips ANSI codes for width calculation.
 */
export function truncate(text: string, maxWidth: number): string {
  const clean = visibleWidth(text)
  if (clean <= maxWidth) return text
  // Simple truncation approach — approximate by string length ratio
  const ratio = maxWidth / Math.max(clean, 1)
  const cut = Math.floor(text.length * ratio)
  return text.slice(0, Math.max(cut - 1, 0)) + '…'
}

/** Left-pad text to target width */
export function pad(text: string, width: number, char = ' '): string {
  const vw = visibleWidth(text)
  return vw >= width ? text : char.repeat(width - vw) + text
}

/** Right-pad text to target width */
export function padEnd(text: string, width: number, char = ' '): string {
  const vw = visibleWidth(text)
  return vw >= width ? text : text + char.repeat(width - vw)
}

/**
 * Word-wrap text to specified width.
 * Respects ANSI codes (passes them through).
 */
export function wrap(text: string, width: number, indent = 0): string[] {
  const indentStr = ' '.repeat(indent)
  const words = text.split(/(\s+)/)
  const lines: string[] = []
  let current = indentStr
  let currentWidth = indent

  for (const word of words) {
    const wordWidth = visibleWidth(word)
    if (currentWidth + wordWidth > width && currentWidth > indent) {
      lines.push(current)
      current = indentStr
      currentWidth = indent
    }
    current += word
    currentWidth += wordWidth
  }
  if (currentWidth > indent) {
    lines.push(current)
  }
  return lines.length > 0 ? lines : [indentStr]
}

/** Format star count: 1234 → "1,234" */
export function formatStars(count: number): string {
  return count.toLocaleString('en-US')
}

/** Render a horizontal line of `char`, `width` columns */
export function hr(char = '─', width = 72): string {
  return BORDER + char.repeat(width) + RESET
}

/** Render a horizontal line with dim style */
export function hrDim(char = '─', width = 72): string {
  return DIM + char.repeat(width) + RESET
}

/**
 * Align text into two columns.
 * Left is left-justified, right is right-justified within total width.
 */
export function alignColumns(left: string, right: string, totalWidth = 72): string {
  const lw = visibleWidth(left)
  const rw = visibleWidth(right)
  const gap = Math.max(1, totalWidth - lw - rw)
  const spacer = ' '.repeat(gap < 0 ? 1 : gap)
  // If too wide, truncate left side
  if (lw + gap + rw > totalWidth) {
    const available = totalWidth - rw - 1
    return truncate(left, available) + spacer + right
  }
  return left + spacer + right
}

/** Repeat a string to fill width */
export function fill(text: string, width: number): string {
  return text.repeat(Math.ceil(width / visibleWidth(text))).slice(0, width)
}
