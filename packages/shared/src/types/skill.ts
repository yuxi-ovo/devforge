export interface SkillMetadata {
  name: string
  displayName?: string
  description?: string
  tags?: string[]
  category?: string
  version?: string
  author?: string
  'allowed-tools'?: string[]
  dependencies?: string[]
  references?: string[]
  installMethod?: string
  compatibility?: Record<string, string>
  [key: string]: unknown
}

export interface ParsedSkill {
  metadata: SkillMetadata
  rawFrontmatter: string
  rawContent: string
  parseError?: string
}

export type SkillStatus = 'discovered' | 'parsed' | 'parse_failed' | 'analyzed'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
