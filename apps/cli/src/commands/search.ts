import * as p from '@clack/prompts'
import { exec } from 'child_process'
import { SkillsMPClient } from '@zr-ovo/devforge-skillsmp'
import { config } from '@zr-ovo/devforge-shared'
import { installSkills } from '../utils/installer'
import {
  renderSection, renderSubSection,
  renderCardList,
  iconInfo, iconBullet, iconSuccess,
  Spinner, PhaseTracker,
} from '../ui'
import {
  PRIMARY, SUCCESS, WARNING, TEXT_SECONDARY, TEXT_MUTED,
  BOLD, DIM, RESET,
} from '../ui/theme'
import { truncate, formatStars } from '../ui/format'

export async function searchCommand(query?: string): Promise<void> {
  if (!query) {
    query = (await p.text({
      message: '输入关键词搜索 Skill，按 Enter 搜索：',
      placeholder: '例如：mcp server, testing, database...',
      validate: (v) => (v.length < 1 ? '请输入关键词' : undefined),
    })) as string
    if (p.isCancel(query)) return
  }

  // Search
  const client = new SkillsMPClient(config.skillsmp.apiKey, config.skillsmp.dailyLimit)
  const spinner = new Spinner('搜索中...')
  spinner.start()

  let rawSkills: Array<{ id: string; name: string; author: string; description: string; githubUrl: string; stars: number }>
  try {
    const result = await client.search({ q: query, limit: 5, sortBy: 'stars' })
    rawSkills = result.skills
  } catch {
    spinner.fail('搜索失败')
    return
  }

  // 同一 skill 优先取中文版，其次英文
  const seenNames = new Map<string, typeof rawSkills[0]>()
  for (const skill of rawSkills) {
    const existing = seenNames.get(skill.name)
    if (!existing || isPreferredOver(skill.id, existing.id)) {
      seenNames.set(skill.name, skill)
    }
  }
  const skills = Array.from(seenNames.values()).sort((a, b) => b.stars - a.stars)

  spinner.succeed(`找到 ${skills.length} 个 Skill`)

  if (skills.length === 0) {
    console.log(`  ${iconInfo()} 没有找到匹配的 Skill`)
    return
  }

  // Display skills with numbers
  console.log()
  console.log(renderSection('搜索结果', { color: PRIMARY }))
  for (let i = 0; i < skills.length; i++) {
    const s = skills[i]
    console.log(`  ${DIM}${i + 1}.${RESET} ${BOLD}${s.name}${RESET} ${DIM}· ${s.author} ${formatStars(s.stars)}${RESET}`)
    console.log(`     ${DIM}${truncate(s.description, 50)}${RESET}`)
  }
  console.log()
  console.log(`  ${DIM}提示：输入序号查看详情，或选择要安装的 Skill${RESET}`)

  // Ask for action
  const action = (await p.select({
    message: '↑↓ 选择，Enter 确认：',
    options: [
      { value: 'select', label: '选择要安装的 Skill' },
      { value: 'detail', label: '查看 Skill 详情（输入序号）' },
      { value: 'skip', label: '跳过' },
    ],
  })) as string

  if (p.isCancel(action) || action === 'skip') {
    console.log(`  ${iconInfo()} 未选择任何 Skill`)
    return
  }

  if (action === 'detail') {
    const idx = (await p.text({
      message: '输入 Skill 序号查看详情：',
      placeholder: `1-${skills.length}`,
      validate: (v) => {
        const n = parseInt(v)
        if (isNaN(n) || n < 1 || n > skills.length) return `请输入 1-${skills.length} 之间的数字`
        return undefined
      },
    })) as string
    if (!p.isCancel(idx)) {
      const skill = skills[parseInt(idx) - 1]
      const url = `https://skillsmp.com/skills/${skill.id}`
      console.log(`  ${iconInfo()} 正在打开 ${BOLD}${skill.name}${RESET} 的详情页...`)
      exec(`open "${url}"`)
    }
    console.log(`  ${iconInfo()} 未选择任何 Skill`)
    return
  }

  // Select skills to install
  const selected = (await p.multiselect({
    message: '↑↓ 移动，空格 选择，Enter 确认：',
    options: skills.map((s) => ({
      value: s.id,
      label: `${s.name}  ${DIM}· ${s.author} ${formatStars(s.stars)}${RESET}`,
      hint: truncate(s.description, 30),
    })),
    required: false,
  })) as string[]

  if (p.isCancel(selected) || selected.length === 0) {
    console.log(`  ${iconInfo()} 未选择任何 Skill`)
    return
  }

  const toInstall = skills.filter((s) => selected.includes(s.id))

  // Install with phase tracker
  console.log()
  console.log(renderSection('安装 Skill', { color: SUCCESS }))

  const pt = new PhaseTracker(72)
  pt.setPhases([
    { name: '下载 Skill', status: 'active' },
    { name: '完成配置', status: 'pending' },
  ])
  pt.begin()

  for (let i = 0; i < toInstall.length; i++) {
    pt.addSubTask(0, { name: toInstall[i].name, status: 'pending' })
  }

  const installResult = await installSkills(
    toInstall.map((s) => ({ id: s.id, name: s.name, githubUrl: s.githubUrl })),
    undefined,
    (phase, item, status, detail) => {
      if (phase === 'downloading') {
        const idx = toInstall.findIndex((s) => s.name === item)
        if (idx >= 0) {
          if (status === 'downloading') pt.updateSubTask(0, idx, 'active', '下载中...')
          else if (status === 'completed') pt.updateSubTask(0, idx, 'completed', detail)
          else if (status === 'skipped') pt.updateSubTask(0, idx, 'failed', '已存在')
          else if (status === 'failed') pt.updateSubTask(0, idx, 'failed', detail)
        }
      }
    },
  )

  pt.updatePhase(0, installResult.failed > 0 && installResult.success === 0 ? 'failed' : 'completed')
  pt.updatePhase(1, installResult.success > 0 ? 'completed' : 'failed')
  pt.complete()

  // Summary
  console.log()
  console.log(`  ${iconSuccess()} ${BOLD}成功安装 ${installResult.success} 个 Skill${RESET}`)
  if (installResult.failed > 0) {
    console.log(`  ${WARNING}⚠${RESET} ${installResult.failed} 个安装失败`)
    for (const err of installResult.errors) console.log(`    ${DIM}${err}${RESET}`)
  }
  console.log()
}

// ── 语言优先级：中文 > 英文 > 其他 ──

const NON_EN_LANGS = ['docs-ja-jp', 'docs-ko-kr', 'docs-fr-fr', 'docs-de-de', 'docs-es-es', 'docs-pt-br', 'docs-ru-ru', 'docs-it-it']

function langScore(id: string): number {
  if (id.includes('docs-zh-cn') || id.includes('docs-zh-tw')) return 2
  if (NON_EN_LANGS.some((l) => id.includes(l))) return 0
  return 1
}

function isPreferredOver(newId: string, existingId: string): boolean {
  return langScore(newId) > langScore(existingId)
}
