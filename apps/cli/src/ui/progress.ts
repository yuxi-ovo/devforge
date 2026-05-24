import { PRIMARY, SUCCESS, ERROR, WARNING, TEXT_MUTED, TEXT_SECONDARY,
         BORDER, RESET, BOLD, DIM } from './theme'
import { padEnd } from './format'
import { DynamicSection } from './screen'

/** Phase definition for PhaseTracker */
export interface Phase {
  name: string
  status: 'pending' | 'active' | 'completed' | 'failed'
}

export interface SubTask {
  name: string
  status: 'pending' | 'active' | 'completed' | 'failed'
  detail?: string
}

/**
 * PhaseTracker — manages multi-phase display with sub-tasks.
 *
 * Renders a region like:
 * ```
 *   阶段 1/4: 创建项目目录              ✓ 完成
 *   阶段 2/4: 下载 Skill                ◌ 进行中
 *     └─ ✓  mcp-server-patterns   (0.8s)
 *     └─ ◌  testing-standards      下载中...
 * ```
 */
export class PhaseTracker {
  private phases: Phase[] = []
  private subTasks: SubTask[][] = []
  private section: DynamicSection
  private width: number

  constructor(width = 72) {
    this.section = new DynamicSection()
    this.width = width
  }

  begin(): void {
    this.section.begin()
    this.render()
  }

  setPhases(phases: Phase[]): void {
    this.phases = phases
    this.subTasks = phases.map(() => [])
  }

  updatePhase(index: number, status: Phase['status']): void {
    if (index >= 0 && index < this.phases.length) {
      this.phases[index].status = status
      this.render()
    }
  }

  addSubTask(phaseIndex: number, task: SubTask): void {
    if (phaseIndex >= 0 && phaseIndex < this.subTasks.length) {
      this.subTasks[phaseIndex].push(task)
      this.render()
    }
  }

  updateSubTask(phaseIndex: number, taskIndex: number, status: SubTask['status'], detail?: string): void {
    if (phaseIndex >= 0 && phaseIndex < this.subTasks.length) {
      const tasks = this.subTasks[phaseIndex]
      if (taskIndex >= 0 && taskIndex < tasks.length) {
        tasks[taskIndex].status = status
        if (detail !== undefined) tasks[taskIndex].detail = detail
        this.render()
      }
    }
  }

  complete(): void {
    this.section.end()
  }

  private render(): void {
    const lines: string[] = []

    for (let p = 0; p < this.phases.length; p++) {
      const phase = this.phases[p]
      const icon = this.statusIcon(phase.status)
      const statusText = this.statusText(phase.status)
      const line = `  ${icon} ${phase.name} ${DIM}${statusText}${RESET}`
      lines.push(line)

      // Sub-tasks
      const tasks = this.subTasks[p] || []
      for (const task of tasks) {
        const taskIcon = this.statusIcon(task.status)
        const detail = task.detail ? ` ${DIM}${task.detail}${RESET}` : ''
        lines.push(`    └─ ${taskIcon} ${task.name}${detail}`)
      }
    }

    this.section.update(lines)
  }

  private statusIcon(status: string): string {
    switch (status) {
      case 'completed': return `${SUCCESS}✓${RESET}`
      case 'active':    return `${PRIMARY}◌${RESET}`
      case 'failed':    return `${ERROR}✗${RESET}`
      default:          return `${TEXT_MUTED}⏳${RESET}`
    }
  }

  private statusText(status: string): string {
    switch (status) {
      case 'completed': return '完成'
      case 'active':    return '进行中'
      case 'failed':    return '失败'
      default:          return '等待'
    }
  }

  get lineCount(): number {
    return this.section.lines
  }
}

/**
 * Render a progress bar.
 *
 * ```
 * [████████████████░░░░░░░░░░]  57%
 * ```
 */
export function renderProgressBar(percent: number, width = 40): string {
  const p = Math.max(0, Math.min(100, percent))
  const filled = Math.round((p / 100) * width)
  const empty = width - filled
  const bar = `${PRIMARY}${'█'.repeat(filled)}${RESET}${DIM}${'░'.repeat(empty)}${RESET}`
  return `  ${bar}  ${BOLD}${p}%${RESET}`
}
