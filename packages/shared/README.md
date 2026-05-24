# @zr-ovo/devforge-shared

Shared utilities for DevForge CLI — configuration, logging, and database access.

## Installation

```bash
npm install @zr-ovo/devforge-shared
```

## Usage

```typescript
import { config, logger, getDb, disconnectDb } from '@zr-ovo/devforge-shared'

// Load configuration from ~/.devforge/.env
console.log(config.ai.apiKey)
console.log(config.skillsmp.apiKey)

// Structured logging
logger.info('Server started')
logger.error({ err }, 'Something failed')

// Database access
const db = getDb()
const skills = await db.skill.findMany()
await disconnectDb()
```

## Configuration

The `config` object reads from `~/.devforge/.env`:

| Variable | Description |
|----------|-------------|
| `AI_PROVIDER` | AI provider (claude / openai / custom) |
| `AI_MODEL` | Model name |
| `AI_API_KEY` | API key |
| `AI_BASE_URL` | Custom API base URL |
| `SKILLSMP_API_KEY` | SkillsMP marketplace API key |

## License

MIT
