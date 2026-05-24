import * as p from '@clack/prompts'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { homedir } from 'os'
import { config } from '@zr-ovo/devforge-shared'
import {
  renderSection, renderBox,
  iconBullet, iconInfo, iconWarning,
} from '../ui'
import {
  PRIMARY, SUCCESS, WARNING, INFO, TEXT_SECONDARY, TEXT_MUTED, BORDER,
  BOLD, DIM, RESET,
} from '../ui/theme'

const CONFIG_DIR = resolve(homedir(), '.devforge')
const CONFIG_PATH = resolve(CONFIG_DIR, '.env')

function maskKey(key: string | undefined, label = '未设置'): string {
  if (!key) return `${WARNING}${label}${RESET}`
  return `${SUCCESS}****${key.slice(-4)}${RESET}`
}

function readDotEnv(): Record<string, string> {
  if (!existsSync(CONFIG_PATH)) return {}
  const lines = readFileSync(CONFIG_PATH, 'utf-8').split('\n')
  const env: Record<string, string> = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim()
  }
  return env
}

function readCurrentConfig(): ReturnType<typeof readDotEnv> {
  const env = readDotEnv()
  return {
    AI_PROVIDER: env.AI_PROVIDER || config.ai.provider,
    AI_MODEL: env.AI_MODEL || config.ai.model,
    AI_API_KEY: env.AI_API_KEY || env.ANTHROPIC_API_KEY || config.ai.apiKey || '',
    AI_BASE_URL: env.AI_BASE_URL || config.ai.baseUrl || '',
    SKILLSMP_API_KEY: env.SKILLSMP_API_KEY || config.skillsmp.apiKey || '',
  }
}

function writeDotEnv(updates: Record<string, string | undefined>): void {
  mkdirSync(CONFIG_DIR, { recursive: true })
  const existing = readDotEnv()

  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) {
      delete existing[k]
    } else {
      existing[k] = v
    }
  }

  const content = Object.entries(existing)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n'

  writeFileSync(CONFIG_PATH, content, 'utf-8')
  console.log(`  ${SUCCESS}✓${RESET} 配置已保存到 ${DIM}${CONFIG_PATH}${RESET}`)
}

function showCurrent(): void {
  const cfg = readCurrentConfig()

  console.log()
  console.log(renderSection('当前配置', { color: PRIMARY }))

  const lines = [
    `  ${iconBullet()} ${TEXT_SECONDARY}AI Provider:${RESET} ${BOLD}${cfg.AI_PROVIDER}${RESET}`,
    `  ${iconBullet()} ${TEXT_SECONDARY}AI Model:${RESET}    ${BOLD}${cfg.AI_MODEL}${RESET}`,
    `  ${iconBullet()} ${TEXT_SECONDARY}API Key:${RESET}     ${maskKey(cfg.AI_API_KEY)}`,
    `  ${iconBullet()} ${TEXT_SECONDARY}Base URL:${RESET}    ${cfg.AI_BASE_URL || TEXT_MUTED + '未设置' + RESET}`,
    `  ${iconBullet()} ${TEXT_SECONDARY}SkillsMP:${RESET}    ${maskKey(cfg.SKILLSMP_API_KEY)}`,
  ]
  console.log(renderBox(lines, { width: 60, borderColor: BORDER }).join('\n'))
}

/** 检查配置完整性，返回警告列表 */
export function getConfigWarnings(): string[] {
  const cfg = readCurrentConfig()
  const warnings: string[] = []
  if (!cfg.SKILLSMP_API_KEY) {
    warnings.push('SkillsMP API Key 未配置，Skill 搜索功能不可用')
  }
  if (!cfg.AI_API_KEY) {
    warnings.push('AI API Key 未配置，AI 推荐将使用默认排序（基于 Star 数）')
  }
  return warnings
}

export async function configCommand(isSetup = false): Promise<void> {
  const isTTY = !!process.stdin.isTTY

  if (!isSetup) showCurrent()

  if (!isTTY) {
    if (!isSetup) console.log(`  ${iconInfo()} 运行 ${BOLD}devforge config${RESET} 进入交互式配置`)
    return
  }

  console.log()

  const action = await p.select({
    message: '选择操作：',
    options: [
      { value: 'ai', label: '修改配置' },
      { value: 'view', label: '仅查看配置' },
    ],
  })
  if (p.isCancel(action)) return
  if (action === 'view') return

  // ── AI 配置 ──
  console.log()
  console.log(renderSection('AI 配置', { color: PRIMARY }))

  const provider = await p.select({
    message: '选择 AI Provider：',
    options: [
      { value: 'claude', label: 'Claude (Anthropic/Messages API)' },
      { value: 'openai', label: 'OpenAI (兼容格式)' },
      { value: 'deepseek', label: 'DeepSeek' },
      { value: 'custom', label: '自定义 (OpenAI 兼容格式)' },
    ],
  })
  if (p.isCancel(provider)) return

  const apiKey = await p.password({
    message: '输入 API Key：',
    validate: (v) => (v.length < 4 ? '请输入有效的 API Key' : undefined),
  })
  if (p.isCancel(apiKey)) return

  const model = await p.text({
    message: '输入模型名称：',
    placeholder: provider === 'claude' ? 'claude-sonnet-4-6' : provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o',
    validate: (v) => (v.length < 1 ? '请输入模型名称' : undefined),
  })
  if (p.isCancel(model)) return

  const defaultUrl = provider === 'deepseek' ? 'https://api.deepseek.com' : ''
  const baseUrl = await p.text({
    message: 'API Base URL',
    placeholder: defaultUrl || 'https://api.deepseek.com',
  })
  if (p.isCancel(baseUrl)) return

  const trimmedKey = (apiKey as string).trim()
  const updates: Record<string, string> = {
    AI_PROVIDER: (provider as string).trim(),
    AI_MODEL: (model as string).trim(),
    AI_BASE_URL: (baseUrl as string || '').trim(),
  }

  if (provider === 'claude') {
    updates.ANTHROPIC_API_KEY = trimmedKey
    updates.AI_API_KEY = ''
  } else {
    updates.AI_API_KEY = trimmedKey
    updates.ANTHROPIC_API_KEY = ''
  }

  writeDotEnv(updates)

  // ── SkillsMP 配置 ──
  console.log()
  console.log(renderSection('SkillsMP 配置', { color: PRIMARY }))
  console.log(`  ${iconInfo()} SkillsMP API Key ${TEXT_SECONDARY}用于搜索 Skill 市场${RESET}`)
  console.log(`  ${DIM}  可在 https://skillsmp.com 注册获取${RESET}`)
  console.log()

  const skillsmpKey = await p.password({
    message: '输入 SkillsMP API Key：',
    validate: (v) => (v.length < 4 ? '请输入有效的 API Key' : undefined),
  })
  if (p.isCancel(skillsmpKey)) return
  writeDotEnv({ SKILLSMP_API_KEY: (skillsmpKey as string).trim() })

  console.log()
  showCurrent()
  console.log()
}

/** 首次运行：检测配置是否完整，若不完整则引导用户配置 */
export async function ensureConfig(): Promise<void> {
  if (!process.stdin.isTTY) return

  const warnings = getConfigWarnings()
  if (warnings.length === 0) return

  const isFirstRun = !existsSync(CONFIG_PATH)

  if (isFirstRun) {
    console.log()
    console.log(renderSection('首次使用 DevForge', { color: WARNING }))
    console.log(`  ${iconWarning()} 需要配置后才能正常使用全部功能`)
    for (const w of warnings) {
      console.log(`  ${iconBullet()} ${w}`)
    }
    console.log()
    const setup = await p.confirm({
      message: '是否现在配置？',
      initialValue: true,
    })
    if (p.isCancel(setup) || !setup) {
      console.log(`  ${iconInfo()} 随时运行 ${BOLD}devforge config${RESET} 完成配置`)
      console.log()
      return
    }
    await configCommand(true)
  } else if (warnings.length > 0) {
    // 非首次运行，但部分配置缺失，仅提醒
    console.log()
    console.log(renderSection('配置提醒', { color: WARNING }))
    for (const w of warnings) {
      console.log(`  ${iconWarning()} ${w}`)
    }
    console.log(`  ${iconInfo()} 运行 ${BOLD}devforge config${RESET} 完成配置`)
    console.log()
  }
}
