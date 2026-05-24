import { version } from '../../package.json'
import { gradientLines, fg } from '../ui/theme'

const LOGO = [
  '  ███████   ███████ ',
  '  ██    ██  ██      ',
  '  ██    ██  ███████ ',
  '  ██    ██  ██      ',
  '  ██    ██  ██      ',
  '  ███████   ██      ',
]

// Cyan → Indigo gradient
const GRADIENT_START: [number, number, number] = [6, 182, 212]    // #06B6D4
const GRADIENT_END: [number, number, number] = [129, 140, 248]   // #818CF8

export function printLogo(): void {
  const colored = gradientLines(
    LOGO,
    GRADIENT_START[0], GRADIENT_START[1], GRADIENT_START[2],
    GRADIENT_END[0], GRADIENT_END[1], GRADIENT_END[2],
  )
  for (const line of colored) {
    console.log(line)
  }
  // Version line — final gradient color
  const [er, eg, eb] = GRADIENT_END
  console.log(`${fg(er, eg, eb)}  DevForge v${version}\x1b[0m`)
  console.log('')
}
