# @zr-ovo/devforge-skillsmp

SkillsMP API 客户端 — 搜索和发现 Claude Code Skill。

## 安装

```bash
npm install @zr-ovo/devforge-skillsmp
```

## 使用

```typescript
import { SkillsMPClient } from '@zr-ovo/devforge-skillsmp'

const client = new SkillsMPClient('your-api-key', 500)

// 关键词搜索
const result = await client.search({
  q: 'vue react',
  limit: 5,
  sortBy: 'stars',
})

console.log(result.skills) // Skill[]
console.log(result.total)  // 总数

// AI 语义搜索
const skills = await client.aiSearch('build a chat app with websocket')
console.log(skills) // Skill[]

// 剩余配额
console.log(client.remaining) // 499
```

## API

### `new SkillsMPClient(apiKey, dailyLimit?)`

创建客户端实例。

- `apiKey` — SkillsMP API Key（从 [skillsmp.com](https://skillsmp.com) 获取）
- `dailyLimit` — 每日调用限制（默认 500）

### `client.search(params)`

关键词搜索。

| 参数 | 类型 | 说明 |
|------|------|------|
| `q` | `string` | 搜索关键词 |
| `limit` | `number` | 每页数量（默认 20） |
| `sortBy` | `'recent' \| 'stars'` | 排序方式 |
| `category` | `string` | 分类筛选 |

返回：`{ skills: SkillsMPSkill[], total: number, hasMore: boolean }`

### `client.aiSearch(query)`

AI 语义搜索。

- `query` — 自然语言描述

返回：`SkillsMPSkill[]`

### `client.remaining`

当日剩余 API 调用次数。

## SkillsMPSkill 类型

```typescript
interface SkillsMPSkill {
  id: string
  name: string
  author: string
  description: string
  githubUrl: string
  skillUrl?: string
  stars: number
  updatedAt: string
}
```

## 许可证

MIT
