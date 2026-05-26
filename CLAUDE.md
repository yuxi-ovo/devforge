# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevForge is a CLI tool that uses AI to analyze project descriptions, extract technology keywords, search the SkillsMP marketplace, and install Claude Code Skills to `.claude/skills/`. It's a TypeScript monorepo with npm workspaces.

## Build & Development Commands

```bash
# Build all packages (must build in dependency order)
npm run build

# Build individual packages (order matters: shared → skillsmp → api/cli)
cd packages/shared && npm run build
cd packages/skillsmp && npm run build
cd apps/cli && npm run build
cd apps/api && npm run build

# Watch mode for a single package
cd apps/cli && npm run dev

# Link CLI locally for testing
cd apps/cli && npm link
devforge --version

# Prisma commands
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to SQLite

# Lint & format
npm run lint
npm run format
```

There are no tests currently. The `npm test` script is a placeholder.

## Architecture

### Monorepo Layout

```
apps/cli/          → @zr-ovo/devforge (CLI tool, published to npm)
apps/api/          → devforge-api (Fastify server, not published)
packages/shared/   → @zr-ovo/devforge-shared (config, logger, Prisma client)
packages/skillsmp/ → @zr-ovo/devforge-skillsmp (SkillsMP API client)
```

### Dependency Graph

```
shared ← skillsmp ← cli
shared ← skillsmp ← api
```

All packages use TypeScript project references. The root `tsconfig.json` orchestrates composite builds via `tsconfig.base.json`.

### Key Data Flow (CLI `create`/`init` command)

1. User describes their project → `apps/cli/src/ai/analyze.ts` calls an OpenAI-compatible API to extract 3-5 technology keywords
2. Each keyword queries SkillsMP via `packages/skillsmp/src/client.ts` → `search()` hits `https://skillsmp.com/api/v1/skills/search`
3. Results are aggregated, deduplicated by name, sorted by stars
4. User selects skills interactively via `@clack/prompts`
5. `apps/cli/src/utils/installer.ts` fetches `SKILL.md` from `raw.githubusercontent.com` and writes to `.claude/skills/`

### Configuration System (`packages/shared/src/utils/config.ts`)

Two-tier: project `.env` takes precedence over global `~/.devforge/.env`. The config object exposes `ai` (provider, apiKey, model, baseUrl) and `skillsmp` (apiKey, dailyLimit) sections.

### SkillsMP Client (`packages/skillsmp/src/client.ts`)

- `search({ q, limit, sortBy, category })` — keyword search
- `aiSearch(query)` — semantic search
- Built-in daily usage tracking with `remaining` property

## Conventions

- All user-facing text is in Chinese (中文)
- Published packages use the `@zr-ovo` npm scope with `"access": "public"`
- CLI uses `@clack/prompts` for interactive UI (spinners, selects, multiselects, confirms)
- Custom UI components in `apps/cli/src/ui/` provide themed terminal rendering
- Prisma uses SQLite at `~/.devforge/devforge.db`

## Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `AI_PROVIDER` | `claude`, `openai`, or `custom` | — |
| `AI_API_KEY` | Model API key | — |
| `AI_MODEL` | Model name | `claude-sonnet-4-6` |
| `AI_BASE_URL` | Custom API endpoint | — |
| `SKILLSMP_API_KEY` | SkillsMP marketplace key | — |
| `DATABASE_URL` | SQLite path | `file:~/.devforge/devforge.db` |

## Known Issues

- Root `tsconfig.json` references `packages/github` which doesn't exist (stale reference)
- No test suite exists
