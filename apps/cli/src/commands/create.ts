import * as p from '@clack/prompts'
import { mkdirSync } from 'fs'
import { resolve } from 'path'
import { exec } from 'child_process'
import { SkillsMPClient } from '@zr-ovo/devforge-skillsmp'
import { config } from '@zr-ovo/devforge-shared'
import { analyzeProject } from '../ai/analyze'
import { installSkills } from '../utils/installer'
import { printLogo } from '../utils/art'
import {
  renderDivider, renderSection, renderSubSection,
  renderTitledBox,
  renderCardList,
  iconSuccess, iconError, iconPending, iconBullet, iconSubBullet, iconStar, iconInfo,
  Spinner, PhaseTracker,
} from '../ui'
import {
  PRIMARY, SUCCESS, ERROR, WARNING,
  TEXT_SECONDARY, TEXT_MUTED,
  BOLD, DIM, RESET,
} from '../ui/theme'
import { truncate, formatStars } from '../ui/format'

interface SkillItem {
  id: string
  name: string
  author: string
  description: string
  githubUrl: string
  stars: number
}

export async function createCommand(projectName?: string, isInit = false): Promise<void> {
  const isTTY = !!process.stdin.isTTY
  const startTime = Date.now()

  // ── Welcome ──
  if (isTTY) {
    printLogo()
    console.log(`  ${BOLD}DevForge${RESET} ${DIM}— AI Native Workspace Orchestrator${RESET}`)
    console.log(`  ${DIM}描述你的项目，AI 自动搜索并安装开发 Skill${RESET}`)
    console.log(renderDivider({ color: TEXT_MUTED }))
    console.log()
  }

  // ── 项目名称（文件夹名） ──
  if (!projectName) {
    if (!isTTY) { console.error('Usage: devforge create <project-name>'); return }
    projectName = (await p.text({
      message: '项目文件夹名称，按 Enter 继续：',
      placeholder: 'my-project',
      validate: (v) => (v.length < 1 ? '请输入名称' : undefined),
    })) as string
    if (p.isCancel(projectName)) { p.cancel('已取消'); return }
  }

  // ── 项目描述（核心输入） ──
  let projectDesc: string
  if (!isTTY) {
    projectDesc = projectName
  } else {
    projectDesc = (await p.text({
      message: '描述你的项目，按 Enter 开始搜索：',
      placeholder: '例如：用 TypeScript 开发一个 MCP 服务器用于笔记管理',
      validate: (v) => (v.length < 4 ? '请详细描述项目' : undefined),
    })) as string
    if (p.isCancel(projectDesc)) { p.cancel('已取消'); return }
  }

  // ── 目标目录 ──
  const targetDir = isInit ? process.cwd() : resolve(process.cwd(), projectName)

  // ── Phase 4: AI Analysis → 提取关键词 ──
  const searchSpinner = new Spinner('正在分析项目...')
  searchSpinner.start()

  let searchQueries: string[] = []
  try {
    const analysis = await analyzeProject(projectDesc, projectName)
    searchQueries = analysis.searchQueries
    const tags = searchQueries.map((q) => `${PRIMARY}${q}${RESET}`).join(' · ')
    searchSpinner.succeed(`分析完成  ${tags}`)
  } catch {
    searchQueries = [projectDesc.split(' ').slice(0, 3).join(' ')]
    searchSpinner.fail('分析失败，使用默认关键词')
  }

  // ── Phase 5: 按关键词搜索，每个取 top 5，聚合按 stars 排序 ──
  const client = new SkillsMPClient(config.skillsmp.apiKey, config.skillsmp.dailyLimit)
  const seenNames = new Map<string, SkillItem>() // key: name → best skill

  for (const q of searchQueries) {
    searchSpinner.start(`搜索 "${q}"...`)
    try {
      const result = await client.search({ q, limit: 5, sortBy: 'stars' })
      for (const skill of result.skills) {
        const existing = seenNames.get(skill.name)
        if (!existing) {
          seenNames.set(skill.name, {
            id: skill.id, name: skill.name, author: skill.author,
            description: skill.description, githubUrl: skill.githubUrl,
            stars: skill.stars,
          })
        } else if (isPreferredOver(skill.id, existing.id)) {
          seenNames.set(skill.name, {
            id: skill.id, name: skill.name, author: skill.author,
            description: skill.description, githubUrl: skill.githubUrl,
            stars: skill.stars,
          })
        }
      }
    } catch { /* skip */ }
  }

  // 按 stars 排序
  const candidates = Array.from(seenNames.values()).sort((a, b) => b.stars - a.stars)

  if (candidates.length > 0) {
    searchSpinner.succeed(`找到 ${candidates.length} 个 Skill  ${DIM}↓ 选择要安装的 Skill${RESET}`)
  } else {
    searchSpinner.fail('未找到相关 Skill')
    console.log()
    console.log(`  ${iconInfo()} ${TEXT_SECONDARY}可能原因：${RESET}`)
    console.log(`    ${DIM}• 描述太简单，AI 无法提取有效关键词${RESET}`)
    console.log(`    ${DIM}• 搜索的关键词在市场中暂无匹配结果${RESET}`)
    console.log()
    console.log(`  ${iconInfo()} ${TEXT_SECONDARY}建议：${RESET}`)
    console.log(`    ${BOLD}1.${RESET} 用更具体的描述重新创建：${DIM}devforge create my-project${RESET}`)
    console.log(`    ${BOLD}2.${RESET} 直接搜索关键词：${BOLD}devforge search "vue react typescript"${RESET}`)
    console.log(`    ${BOLD}3.${RESET} 手动安装已知 Skill：${BOLD}devforge install <skill-id>${RESET}`)
    console.log()
    return
  }

  // ── 选择安装 ──
  const selectedRaw = await selectSkillsInteractive(client, candidates)
  if (selectedRaw.length === 0) {
    console.log(`  ${iconInfo()} 未选择任何 Skill`)
    return
  }

  // ── 安装 ──
  if (!isInit) mkdirSync(targetDir, { recursive: true })
  const phaseTracker = isTTY ? new PhaseTracker(72) : null
  if (isTTY) {
    console.log()
    console.log(renderSection('搭建工作区', { color: SUCCESS }))
    phaseTracker!.setPhases([
      { name: '下载 Skill', status: 'active' },
    ])
    phaseTracker!.begin()
  }

  const result = await installSkills(
    selectedRaw.map((s) => ({ id: s.id, name: s.name, githubUrl: s.githubUrl })),
    targetDir,
  )

  // 用去重后的列表更新 PhaseTracker
  if (isTTY) {
    for (let i = 0; i < result.deduplicated.length; i++) {
      phaseTracker!.addSubTask(0, { name: result.deduplicated[i].name, status: 'pending' })
    }
    for (const r of result.results) {
      const idx = result.deduplicated.findIndex((s) => s.name === r.name)
      if (idx >= 0) {
        if (r.status === 'success') phaseTracker!.updateSubTask(0, idx, 'completed', `${(r.duration / 1000).toFixed(1)}s`)
        else if (r.status === 'skipped') phaseTracker!.updateSubTask(0, idx, 'failed', '已存在')
        else if (r.status === 'failed') phaseTracker!.updateSubTask(0, idx, 'failed', r.error || '失败')
      }
    }
  }

  if (isTTY) {
    phaseTracker!.updatePhase(0, result.failed > 0 && result.success === 0 ? 'failed' : 'completed')
    phaseTracker!.complete()
  }

  // ── Summary ──
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log()
  console.log(renderSection('工作区构建完成', { color: SUCCESS }))

  const summaryLines = [
    `  项目名称:  ${BOLD}${projectName}${RESET}`,
    `  已安装:    ${SUCCESS}${result.success}${RESET} 个 Skill`,
    `  耗时:      ${totalTime}s`,
  ]
  if (result.skipped > 0) summaryLines.push(`  跳过:      ${WARNING}${result.skipped}${RESET} 个`)
  if (result.failed > 0) summaryLines.push(`  失败:      ${ERROR}${result.failed}${RESET} 个`)
  for (const line of renderTitledBox('📋 项目概览', summaryLines, { width: 72 })) {
    console.log(line)
  }

  if (result.results.length > 0) {
    console.log(renderSubSection('已安装 Skill'))
    for (const r of result.results) {
      const icon = r.status === 'success' ? iconSuccess() : r.status === 'skipped' ? iconPending() : iconError()
      const dur = r.status === 'success' ? ` ${DIM}(${(r.duration / 1000).toFixed(1)}s)${RESET}` : ''
      console.log(`  ${icon} ${BOLD}${r.name}${RESET}${dur}`)
    }
  }

  console.log()
  if (!isInit) console.log(`  ${iconBullet()} cd ${projectName}`)
  console.log(`  ${iconBullet()} 在 Claude Code 中打开项目即可使用已安装的 Skill`)
  console.log(`  ${iconBullet()} 运行 ${BOLD}devforge install${RESET} 添加更多 Skill`)
  console.log()
}

// ── Interactive Skill Selection ──

async function selectSkillsInteractive(
  client: SkillsMPClient,
  candidates: SkillItem[],
): Promise<SkillItem[]> {
  if (!process.stdin.isTTY) {
    return candidates.slice(0, 5)
  }

  const allItems = [...candidates]

  while (true) {
    console.log()
    console.log(renderSection('选择 Skill', { color: TEXT_MUTED }))

    console.log(`  ${iconStar()} ${TEXT_SECONDARY}候选 Skill (${allItems.length})${RESET}`)
    for (let i = 0; i < allItems.slice(0, 8).length; i++) {
      const s = allItems[i]
      console.log(`    ${DIM}${i + 1}.${RESET} ${BOLD}${s.name}${RESET} ${DIM}· ${s.author} ${formatStars(s.stars)}${RESET}`)
      console.log(`       ${DIM}${truncate(s.description, 50)}${RESET}`)
    }
    if (allItems.length > 8) {
      console.log(`    ${DIM}... 还有 ${allItems.length - 8} 个${RESET}`)
    }
    console.log()
    console.log(`  ${DIM}提示：输入序号查看详情，或选择下方操作${RESET}`)

    const action = (await p.select({
      message: '↑↓ 选择，Enter 确认：',
      options: [
        { value: 'select', label: '选择要安装的 Skill' },
        { value: 'detail', label: '查看 Skill 详情（输入序号）' },
        { value: 'search', label: '搜索更多 Skill' },
        { value: 'done', label: '确认并安装' },
        { value: 'skip', label: '跳过安装' },
      ],
    })) as string

    if (p.isCancel(action) || action === 'skip') return []

    if (action === 'detail') {
      const idx = (await p.text({
        message: '输入 Skill 序号查看详情：',
        placeholder: `1-${allItems.length}`,
        validate: (v) => {
          const n = parseInt(v)
          if (isNaN(n) || n < 1 || n > allItems.length) return `请输入 1-${allItems.length} 之间的数字`
          return undefined
        },
      })) as string
      if (p.isCancel(idx)) continue

      const skill = allItems[parseInt(idx) - 1]
      const url = `https://skillsmp.com/skills/${skill.id}`
      console.log(`  ${iconInfo()} 正在打开 ${BOLD}${skill.name}${RESET} 的详情页...`)
      exec(`open "${url}"`)
      continue
    }

    if (action === 'search') {
      const query = (await p.text({
        message: '输入关键词，按 Enter 搜索：',
        placeholder: 'mcp, database, testing...',
      })) as string
      if (p.isCancel(query)) continue

      const s = new Spinner('搜索中...')
      s.start()
      try {
        const result = await client.search({ q: query as string, limit: 5, sortBy: 'stars' })
        s.succeed(`找到 ${result.skills.length} 个`)
        for (const skill of result.skills) {
          if (!allItems.some((x) => x.name === skill.name)) {
            allItems.push({
              id: skill.id, name: skill.name, author: skill.author,
              description: skill.description, githubUrl: skill.githubUrl,
              stars: skill.stars,
            })
          }
        }
      } catch {
        s.fail('搜索失败')
      }
    }

    if (action === 'select' || action === 'done') {
      const selected = (await p.multiselect({
        message: '↑↓ 移动，空格 选择，Enter 确认：',
        options: allItems.map((s) => ({
          value: s.id,
          label: `${s.name}  ${DIM}· ${s.author} ${formatStars(s.stars)}${RESET}`,
          hint: truncate(s.description, 30),
        })),
        required: false,
      })) as string[]

      if (p.isCancel(selected)) continue
      return allItems.filter((s) => selected.includes(s.id))
    }
  }
}

// ── 语言优先级：中文 > 英文 > 其他 ──

const NON_EN_LANGS = ['docs-ja-jp', 'docs-ko-kr', 'docs-fr-fr', 'docs-de-de', 'docs-es-es', 'docs-pt-br', 'docs-ru-ru', 'docs-it-it']

function langScore(id: string): number {
  if (id.includes('docs-zh-cn') || id.includes('docs-zh-tw')) return 2 // 中文最优
  if (NON_EN_LANGS.some((l) => id.includes(l))) return 0 // 日韩法德等跳过
  return 1 // 英文/默认
}

function isPreferredOver(newId: string, existingId: string): boolean {
  return langScore(newId) > langScore(existingId)
}
