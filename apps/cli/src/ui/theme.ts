// ── Color Palette ──────────────────────────────────────
// Inspired by Claude Code, Vercel, Linear — cyan/indigo accent

const ESC = '\x1b'

// Foreground colors
export const PRIMARY      = `${ESC}[38;2;6;182;212m`    // #06B6D4 cyan-500
export const PRIMARY_BRIGHT = `${ESC}[38;2;34;211;238m`  // #22D3EE cyan-400
export const PRIMARY_DIM  = `${ESC}[38;2;8;145;178m`     // #0891B2 cyan-600

export const SECONDARY    = `${ESC}[38;2;129;140;248m`   // #818CF8 indigo-400
export const SECONDARY_DIM = `${ESC}[38;2;99;102;241m`   // #6366F1 indigo-500

export const SUCCESS      = `${ESC}[38;2;52;211;153m`    // #34D399 emerald-400
export const WARNING      = `${ESC}[38;2;251;191;36m`    // #FBBF24 amber-400
export const ERROR        = `${ESC}[38;2;251;113;133m`   // #FB7185 rose-400
export const INFO         = `${ESC}[38;2;56;189;248m`    // #38BDF8 sky-400

export const TEXT_PRIMARY   = `${ESC}[38;2;226;232;240m` // #E2E8F0 slate-200
export const TEXT_SECONDARY = `${ESC}[38;2;148;163;184m` // #94A3B8 slate-400
export const TEXT_MUTED     = `${ESC}[38;2;100;116;139m` // #64748B slate-500

// Background colors
export const BG_SURFACE  = `${ESC}[48;2;30;41;59m`      // #1E293B slate-800
export const BG_DEEP     = `${ESC}[48;2;15;23;42m`      // #0F172A slate-900

// Borders
export const BORDER      = `${ESC}[38;2;51;65;85m`      // #334155 slate-700

// ANSI attributes
export const BOLD = `${ESC}[1m`
export const DIM  = `${ESC}[2m`
export const RESET = `${ESC}[0m`

// ── Helpers ────────────────────────────────────────────

/** Build 24-bit foreground ANSI code from RGB */
export function fg(r: number, g: number, b: number): string {
  return `${ESC}[38;2;${r};${g};${b}m`
}

/** Build 24-bit background ANSI code from RGB */
export function bg(r: number, g: number, b: number): string {
  return `${ESC}[48;2;${r};${g};${b}m`
}

/** Interpolate between two RGB colors */
export function gradient(
  text: string,
  startR: number, startG: number, startB: number,
  endR: number, endG: number, endB: number,
): string {
  const chars = [...text]
  const len = chars.length
  if (len === 0) return text
  return chars
    .map((ch, i) => {
      const t = i / Math.max(len - 1, 1)
      const r = Math.round(startR + (endR - startR) * t)
      const g = Math.round(startG + (endG - startG) * t)
      const b = Math.round(startB + (endB - startB) * t)
      return `${fg(r, g, b)}${ch}`
    })
    .join('') + RESET
}

/** Apply gradient across array of strings (line-by-line) */
export function gradientLines(
  lines: string[],
  startR: number, startG: number, startB: number,
  endR: number, endG: number, endB: number,
): string[] {
  return lines.map((line, i) => {
    const t = i / Math.max(lines.length - 1, 1)
    const r = Math.round(startR + (endR - startR) * t)
    const g = Math.round(startG + (endG - startG) * t)
    const b = Math.round(startB + (endB - startB) * t)
    return `${fg(r, g, b)}${line}${RESET}`
  })
}

/** Check if terminal supports 24-bit true color */
export function hasTrueColor(): boolean {
  const env = process.env
  return !!(
    env.COLORTERM === 'truecolor' ||
    env.COLORTERM === '24bit' ||
    env.TERM_PROGRAM === 'vscode' ||
    env.TERM_PROGRAM === 'iterm' ||
    env.TERM_PROGRAM === 'hyper' ||
    (env.TERM && env.TERM.endsWith('-direct'))
  )
}

/** Strip ANSI escape codes from string for width measurement */
export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[\d+(;\d+)*m/g, '')
}

/** Measure visible width of string (excluding ANSI codes) */
export function visibleWidth(text: string): number {
  return stripAnsi(text).length
}
