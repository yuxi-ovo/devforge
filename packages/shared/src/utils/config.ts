import dotenv from 'dotenv'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { homedir } from 'os'

// Load .env from current directory (project-level override)
dotenv.config()

// Load global config from ~/.devforge/.env (CLI-level default)
const globalEnv = resolve(homedir(), '.devforge', '.env')
if (existsSync(globalEnv)) {
  const parsed = dotenv.parse(readFileSync(globalEnv, 'utf-8'))
  for (const [k, v] of Object.entries(parsed)) {
    // Don't override env vars already set (including those from cwd .env)
    if (process.env[k] === undefined) {
      process.env[k] = v
    }
  }
}

function env(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function envInt(name: string, defaultValue?: number): number {
  const raw = process.env[name]
  if (!raw) {
    if (defaultValue !== undefined) return defaultValue
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return parseInt(raw, 10)
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  database: {
    url: process.env.DATABASE_URL || '',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: envInt('REDIS_PORT', 6379),
  },

  github: {
    tokens: [
      process.env.GITHUB_TOKEN_1,
      process.env.GITHUB_TOKEN_2,
      process.env.GITHUB_TOKEN_3,
    ].filter(Boolean) as string[],
    // Code Search: ~30 req/min per token
    // Repo Search: 5000 req/hr per token (shared pool with REST)
    codeSearchRatePerMin: 30,
    restRatePerHour: 5000,
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
  },

  ai: {
    provider: (process.env.AI_PROVIDER || 'claude') as 'claude' | 'openai' | 'deepseek' | 'custom',
    apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || '',
    baseUrl: process.env.AI_BASE_URL || '',
    model: process.env.AI_MODEL || 'claude-sonnet-4-6',
  },

  skillsmp: {
    apiKey: process.env.SKILLSMP_API_KEY || '',
    dailyLimit: Number(process.env.SKILLSMP_DAILY_LIMIT) || 500,
  },
} as const
