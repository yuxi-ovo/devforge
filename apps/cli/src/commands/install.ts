import * as p from '@clack/prompts'
import { SkillsMPClient } from 'devforge-skillsmp'
import { config } from 'devforge-shared'
import { installSkills } from '../utils/installer'
import {
  renderSection, renderSubSection,
  iconSuccess, iconError, iconInfo, iconBullet,
  Spinner, PhaseTracker,
} from '../ui'
import {
  PRIMARY, SUCCESS, WARNING, TEXT_SECONDARY, TEXT_MUTED,
  BOLD, DIM, RESET,
} from '../ui/theme'

export async function installCommand(args: string[]): Promise<void> {
  let skillIds = args

  if (skillIds.length === 0) {
    const input = (await p.text({
      message: '输入要安装的 Skill ID（逗号分隔），按 Enter 确认：',
      placeholder: 'skill-id-1, skill-id-2',
    })) as string
    if (p.isCancel(input)) return
    skillIds = input.split(',').map((s) => s.trim()).filter(Boolean)
  }

  if (skillIds.length === 0) {
    p.log.error('未指定 Skill ID')
    return
  }

  // Resolve skill details
  const spinner = new Spinner('查询 Skill 信息...')
  spinner.start()

  const client = new SkillsMPClient(config.skillsmp.apiKey, config.skillsmp.dailyLimit)
  const skills: Array<{ id: string; name: string; githubUrl: string }> = []

  for (const id of skillIds) {
    try {
      const result = await client.search({ q: id, limit: 5 })
      const match = result.skills.find((s) => s.id === id)
      if (match) {
        skills.push({ id: match.id, name: match.name, githubUrl: match.githubUrl })
      }
    } catch { /* skip failed lookups */ }
  }

  if (skills.length === 0) {
    spinner.fail('未找到指定 Skill')
    console.log(`  ${iconInfo()} 请确认 Skill ID 是否正确，或使用 devforge search 搜索`)
    return
  }

  spinner.succeed(`找到 ${skills.length} 个 Skill`)

  // Install with phase tracker
  console.log()
  console.log(renderSection('安装 Skill', { color: SUCCESS }))

  const pt = new PhaseTracker(72)
  pt.setPhases([
    { name: '下载 Skill', status: 'active' },
    { name: '完成配置', status: 'pending' },
  ])
  pt.begin()

  for (let i = 0; i < skills.length; i++) {
    pt.addSubTask(0, { name: skills[i].name, status: 'pending' })
  }

  const result = await installSkills(
    skills,
    undefined,
    (phase, item, status, detail) => {
      if (phase === 'downloading') {
        const idx = skills.findIndex((s) => s.name === item)
        if (idx >= 0) {
          if (status === 'downloading') pt.updateSubTask(0, idx, 'active', '下载中...')
          else if (status === 'completed') pt.updateSubTask(0, idx, 'completed', detail)
          else if (status === 'skipped') pt.updateSubTask(0, idx, 'failed', '已存在')
          else if (status === 'failed') pt.updateSubTask(0, idx, 'failed', detail)
        }
      }
    },
  )

  pt.updatePhase(0, result.failed > 0 && result.success === 0 ? 'failed' : 'completed')
  pt.updatePhase(1, result.success > 0 ? 'completed' : 'failed')
  pt.complete()

  // Summary
  console.log()
  if (result.success > 0) {
    console.log(`  ${iconSuccess()} ${BOLD}成功安装 ${result.success} 个 Skill${RESET}`)
    for (const s of skills) {
      console.log(`    ${iconBullet()} ${DIM}.claude/skills/${s.name}/SKILL.md${RESET}`)
    }
  } else {
    console.log(`  ${iconError()} 安装失败`)
  }

  if (result.failed > 0) {
    console.log(`  ${WARNING}⚠${RESET} ${DIM}${result.failed} 个安装失败${RESET}`)
    for (const err of result.errors) console.log(`    ${DIM}${err}${RESET}`)
  }
  console.log()
}
