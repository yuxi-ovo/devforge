# @zr-ovo/devforge-shared

DevForge 共享工具 — 配置加载、日志、数据库访问。

## 安装

```bash
npm install @zr-ovo/devforge-shared
```

## 使用

```typescript
import { config, logger, getDb, disconnectDb } from '@zr-ovo/devforge-shared'

// 配置（从 ~/.devforge/.env 读取）
console.log(config.ai.provider)     // 'claude'
console.log(config.ai.apiKey)       // 'sk-xxx'
console.log(config.skillsmp.apiKey) // 'sk_live_xxx'

// 日志
logger.info('Server started')
logger.error({ err }, 'Something failed')

// 数据库
const db = getDb()
const skills = await db.skill.findMany()
await disconnectDb()
```

## API

### `config`

从 `~/.devforge/.env` 加载配置。

| 属性 | 类型 | 说明 |
|------|------|------|
| `config.ai.provider` | `string` | AI 提供商 |
| `config.ai.model` | `string` | 模型名称 |
| `config.ai.apiKey` | `string` | API Key |
| `config.ai.baseUrl` | `string` | 自定义 API 地址 |
| `config.skillsmp.apiKey` | `string` | SkillsMP API Key |
| `config.skillsmp.dailyLimit` | `number` | 每日 API 调用限制 |

### `logger`

Pino 日志实例。

```typescript
logger.info('message')
logger.warn({ key: 'value' }, 'message')
logger.error({ err }, 'error message')
```

### `getDb()` / `disconnectDb()`

Prisma 数据库客户端。

```typescript
const db = getDb()
const skill = await db.skill.findUnique({ where: { id: 'xxx' } })
await disconnectDb()
```

## 依赖

- `@prisma/client` — 数据库 ORM
- `dotenv` — 环境变量加载
- `pino` — 结构化日志

## 许可证

MIT
