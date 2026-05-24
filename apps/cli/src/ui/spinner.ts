import { PRIMARY, TEXT_SECONDARY, SUCCESS, ERROR, RESET, DIM } from './theme'

const BRAILLE_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const FRAME_INTERVAL = 80 // ms

export class Spinner {
  private frames: string[]
  private interval: number
  private color: string
  private frameIndex = 0
  private timer: ReturnType<typeof setInterval> | null = null
  private message: string
  private running = false

  constructor(message: string, opts?: { frames?: string[]; interval?: number; color?: string }) {
    this.message = message
    this.frames = opts?.frames || BRAILLE_FRAMES
    this.interval = opts?.interval || FRAME_INTERVAL
    this.color = opts?.color || PRIMARY
  }

  start(message?: string): void {
    if (message !== undefined) this.message = message
    if (this.running) return
    this.running = true
    this.frameIndex = 0
    this.render()
    this.timer = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length
      this.render()
    }, this.interval)
  }

  setMessage(msg: string): void {
    this.message = msg
    if (this.running) this.render()
  }

  stop(finalMessage?: string): void {
    this.clear()
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.running = false
    if (finalMessage) {
      console.log(`  ${finalMessage}`)
    }
  }

  succeed(message?: string): void {
    this.clear()
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.running = false
    console.log(`  ${SUCCESS}✓${RESET} ${message || this.message}`)
  }

  fail(message?: string): void {
    this.clear()
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.running = false
    console.log(`  ${ERROR}✗${RESET} ${message || this.message}`)
  }

  private render(): void {
    const frame = this.frames[this.frameIndex]
    process.stdout.write(`\r  ${this.color}${frame}${RESET} ${this.message}\x1b[K`)
  }

  private clear(): void {
    // Clear the spinner line
    process.stdout.write('\r\x1b[K')
  }
}
