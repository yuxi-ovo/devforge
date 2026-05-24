import { DiscoveryQuery } from 'devforge-shared'

/**
 * Query Pool — 所有 GitHub 搜索查询定义
 *
 * Config-driven: 添加新 query 不需要改代码，只需在此数组中新增一条。
 */
export const queryPool: DiscoveryQuery[] = [
  // === Code Search (Primary) ===
  {
    id: 'code-skill-frontmatter',
    query: 'filename:SKILL.md "allowed-tools:"',
    type: 'code_search',
    strategy: 'primary',
    frequency: 'daily',
    weight: 10,
  },
  {
    id: 'code-skill-path',
    query: 'path:.claude/skills',
    type: 'code_search',
    strategy: 'primary',
    frequency: 'daily',
    weight: 10,
  },
  {
    id: 'code-claude-dir-ref',
    query: '"~/.claude/skills"',
    type: 'code_search',
    strategy: 'primary',
    frequency: '3d',
    weight: 8,
  },

  // === Repo Search — Topic ===
  {
    id: 'topic-claude-code',
    query: 'topic:claude-code',
    type: 'repo_search',
    strategy: 'primary',
    frequency: '6h',
    weight: 8,
  },
  {
    id: 'topic-agentic',
    query: 'topic:agentic',
    type: 'repo_search',
    strategy: 'primary',
    frequency: '6h',
    weight: 6,
  },
  {
    id: 'topic-mcp-server',
    query: 'topic:mcp-server',
    type: 'repo_search',
    strategy: 'primary',
    frequency: '6h',
    weight: 5,
  },
  {
    id: 'topic-mcp',
    query: 'topic:mcp',
    type: 'topic_search',
    strategy: 'primary',
    frequency: 'daily',
    weight: 5,
  },
  {
    id: 'topic-ai-agent',
    query: 'topic:ai-agent',
    type: 'repo_search',
    strategy: 'expansion',
    frequency: 'weekly',
    weight: 3,
  },

  // === Repo Search — Keyword ===
  {
    id: 'readme-claude-code',
    query: '"Claude Code" in:readme',
    type: 'repo_search',
    strategy: 'primary',
    frequency: 'daily',
    weight: 5,
  },
  {
    id: 'readme-install-skill',
    query: '"Install Skill" in:readme',
    type: 'repo_search',
    strategy: 'primary',
    frequency: 'daily',
    weight: 5,
  },
  {
    id: 'keyword-skill',
    query: 'claude-code skill',
    type: 'repo_search',
    strategy: 'primary',
    frequency: '3d',
    weight: 4,
  },

  // === Discovery — Collection Repos / Awesome Lists ===
  {
    id: 'awesome-claude',
    query: 'awesome-claude in:name',
    type: 'repo_search',
    strategy: 'expansion',
    frequency: 'weekly',
    weight: 4,
  },

  // === Fork Discovery (handled separately, not via search API) ===
  // Processed by scanning known seed repos' forks
]

/** 获取指定策略类型的 query 列表 */
export function getQueriesByStrategy(strategy: DiscoveryQuery['strategy']): DiscoveryQuery[] {
  return queryPool.filter((q) => q.strategy === strategy)
}

/** 获取指定频率的 query 列表 */
export function getQueriesByFrequency(frequency: DiscoveryQuery['frequency']): DiscoveryQuery[] {
  return queryPool.filter((q) => q.frequency === frequency)
}
