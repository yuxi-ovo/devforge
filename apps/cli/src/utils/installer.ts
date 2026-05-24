import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'

interface InstallTarget {
  id: string
  name: string
  githubUrl: string
}

export type ProgressEvent = 'downloading' | 'completed' | 'skipped' | 'failed'
export type ProgressCallback = (phase: string, item: string, status: ProgressEvent, detail?: string) => void

interface SkillResult {
  id: string
  name: string
  status: 'success' | 'skipped' | 'failed'
  duration: number
  error?: string
}

const FETCH_TIMEOUT = 30_000
const MAX_RETRIES = 1

/**
 * 从 GitHub URL 解析 owner/repo/branch/path
 * https://github.com/{owner}/{repo}/tree/{branch}/{path}
 * https://github.com/{owner}/{repo}/blob/{branch}/{path}
 */
function parseGithubUrl(url: string): { owner: string; repo: string; branch: string; path: string } | null {
  try {
    const u = new URL(url)
    if (u.hostname !== 'github.com') return null
    const parts = u.pathname.split('/').filter(Boolean)
    // [owner, repo, 'tree'|'blob', branch, ...path]
    if (parts.length < 4) return null
    const branchIdx = parts.findIndex((p) => p === 'tree' || p === 'blob')
    if (branchIdx === -1) return null
    return {
      owner: parts[0],
      repo: parts[1],
      branch: parts[branchIdx + 1],
      path: parts.slice(branchIdx + 2).join('/'),
    }
  } catch {
    return null
  }
}

/** Fetch with timeout */
async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

/** Fetch with retry */
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url)
      return res
    } catch {
      if (attempt >= retries) return null
    }
  }
  return null
}

/** 从 GitHub 获取 SKILL.md 原始内容 */
async function fetchSkillContent(skill: InstallTarget): Promise<string | null> {
  const parsed = parseGithubUrl(skill.githubUrl)
  if (!parsed) return null

  const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${parsed.branch}/${parsed.path}`
  try {
    const res = await fetchWithRetry(rawUrl)
    if (!res || !res.ok) {
      // Try alternative: maybe it's a directory, try SKILL.md in that dir
      const altUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${parsed.branch}/${parsed.path}/SKILL.md`
      const altRes = await fetchWithRetry(altUrl)
      if (!altRes || !altRes.ok) return null
      return await altRes.text()
    }
    return await res.text()
  } catch {
    return null
  }
}

/** 安装 Skill 到目标目录的 .claude/skills/ 下 */
export async function installSkills(
  inputSkills: InstallTarget[],
  targetDir = process.cwd(),
  onProgress?: ProgressCallback,
): Promise<{ success: number; failed: number; skipped: number; errors: string[]; results: SkillResult[]; deduplicated: InstallTarget[] }> {
  // 按 name 去重，同名只保留第一个
  const seen = new Set<string>()
  const skills = inputSkills.filter((s) => {
    if (seen.has(s.name)) return false
    seen.add(s.name)
    return true
  })

  const skillsDir = resolve(targetDir, '.claude', 'skills')
  mkdirSync(skillsDir, { recursive: true })

  let success = 0
  let failed = 0
  let skippedCount = 0
  const errors: string[] = []
  const results: SkillResult[] = []

  for (const skill of skills) {
    const startTime = Date.now()
    onProgress?.('downloading', skill.name, 'downloading')

    const skillDir = join(skillsDir, skill.name)
    mkdirSync(skillDir, { recursive: true })

    const destPath = join(skillDir, 'SKILL.md')

    // Check if already exists
    if (existsSync(destPath)) {
      const duration = Date.now() - startTime
      errors.push(`${skill.name}: 已存在，跳过`)
      results.push({ id: skill.id, name: skill.name, status: 'skipped', duration })
      onProgress?.('downloading', skill.name, 'skipped', '已存在')
      skippedCount++
      continue
    }

    const content = await fetchSkillContent(skill)
    const duration = Date.now() - startTime

    if (!content) {
      errors.push(`${skill.name}: 无法获取 SKILL.md`)
      results.push({ id: skill.id, name: skill.name, status: 'failed', duration, error: '无法获取 SKILL.md' })
      onProgress?.('downloading', skill.name, 'failed', '无法获取')
      failed++
      continue
    }

    writeFileSync(destPath, content, 'utf-8')
    results.push({ id: skill.id, name: skill.name, status: 'success', duration })
    onProgress?.('downloading', skill.name, 'completed', `${(duration / 1000).toFixed(1)}s`)
    success++
  }

  return { success, failed, skipped: skippedCount, errors, results, deduplicated: skills }
}

export { parseGithubUrl }
