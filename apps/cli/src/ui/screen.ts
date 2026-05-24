/**
 * DynamicSection — manages a region of the terminal that can be
 * re-rendered dynamically with varying line counts.
 *
 * Uses cursor-up (\x1b[A) and clear-line (\x1b[K) sequences.
 *
 * Usage:
 *   const section = new DynamicSection()
 *   section.begin()         // mark start position
 *   section.update(['a', 'b'])  // render 2 lines
 *   section.update(['1', '2', '3'])  // render 3 lines (adds 1)
 *   section.update(['x'])    // render 1 line (clears 2)
 *   section.end()           // move cursor past tracked area
 */
export class DynamicSection {
  private lineCount = 0
  private started = false

  /**
   * Begin tracking. Records current cursor position.
   * Call this BEFORE writing anything.
   */
  begin(): void {
    this.started = true
    this.lineCount = 0
  }

  /**
   * Replace the content of the tracked region with new lines.
   * Handles size changes: adds lines if longer, clears if shorter.
   */
  update(lines: string[]): void {
    if (!this.started) return

    const prevCount = this.lineCount

    if (prevCount > 0) {
      // Move cursor up to the start of the tracked region
      process.stdout.write(`\x1b[${prevCount}A`)
    }

    // Write new lines
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) {
        process.stdout.write('\n')
      }
      process.stdout.write(lines[i] + '\x1b[K')
    }

    // If previous output was longer, clear remaining lines
    if (lines.length < prevCount) {
      const extra = prevCount - lines.length
      for (let i = 0; i < extra; i++) {
        process.stdout.write('\n\x1b[K')
      }
      // Move back up to the last content line
      process.stdout.write(`\x1b[${extra}A`)
    }

    this.lineCount = lines.length
  }

  /**
   * End tracking. Positions cursor after the last tracked line.
   */
  end(): void {
    if (!this.started) return
    if (this.lineCount > 0) {
      process.stdout.write('\n')
    }
    this.started = false
    this.lineCount = 0
  }

  /**
   * Get the current number of tracked lines.
   */
  get lines(): number {
    return this.lineCount
  }
}
