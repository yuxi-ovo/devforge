# @zr-ovo/devforge-skillsmp

SkillsMP API client for searching and discovering Claude Code Skills.

## Installation

```bash
npm install @zr-ovo/devforge-skillsmp
```

## Usage

```typescript
import { SkillsMPClient } from '@zr-ovo/devforge-skillsmp'

const client = new SkillsMPClient('your-api-key', 500)

// Keyword search
const result = await client.search({
  q: 'vue react',
  limit: 5,
  sortBy: 'stars',
})

console.log(result.skills) // Array of skills
console.log(result.total)  // Total count

// AI semantic search
const skills = await client.aiSearch('build a chat app with websocket')
console.log(skills) // Array of matching skills
```

## API Reference

### `new SkillsMPClient(apiKey, dailyLimit?)`

Create a new client instance.

- `apiKey` — Your SkillsMP API key (get one at [skillsmp.com](https://skillsmp.com))
- `dailyLimit` — Max API calls per day (default: 500)

### `client.search(params)`

Keyword search for skills.

- `params.q` — Search query
- `params.limit` — Results per page (default: 20)
- `params.sortBy` — Sort order: `'recent'` or `'stars'`
- `params.category` — Filter by category

Returns: `{ skills, total, hasMore }`

### `client.aiSearch(query)`

AI-powered semantic search.

- `query` — Natural language description

Returns: `SkillsMPSkill[]`

### `client.remaining`

Number of API calls remaining today.

## License

MIT
