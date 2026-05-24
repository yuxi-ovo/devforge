# DevForge

> 为 Claude Code 发现、搜索并安装 Skill 的命令行工具。

```text
  ╔╦╗╔═╗╔═╗╦  ╦╔═╗╔═╗
   ║║║╣ ╠═╣║  ║║  ║╣ 
  ═╩╝╚═╝╩ ╩╩═╝╩╚═╝╚═╝
  v1.0.2
```

---

## 功能

- **AI 关键词提取** — 描述项目，AI 自动提取 3-5 个技术关键词
- **智能搜索** — 每个关键词搜索 SkillsMP 市场 Top 5，聚合去重
- **语言优先级** — 同一 Skill 优先取中文版，其次英文
- **查看详情** — 输入序号跳转 SkillsMP 详情页
- **交互式安装** — 选择 Skill 后自动下载安装到 `.claude/skills/`

## 安装

```bash
npm install -g @zr-ovo/devforge
```

## 使用

```bash
# 配置 API Key
devforge config

# 搜索 Skill
devforge search "vue react typescript"

# 创建项目并安装 Skill
devforge create my-project

# 在当前项目初始化
devforge init

# 安装指定 Skill
devforge install <skill-id>
```

## 工作流程

```
描述项目 → AI 提取关键词 → 按关键词搜索 → 聚合去重 → 选择安装
```

## 命令

| 命令 | 描述 |
|------|------|
| `devforge create <name>` | 创建项目并安装 Skill |
| `devforge init` | 在当前目录初始化 Skill |
| `devforge search <query>` | 搜索 Skill |
| `devforge install <id...>` | 安装指定 Skill |
| `devforge config` | 配置 API Key |
| `devforge --version` | 显示版本号 |
| `devforge --help` | 显示帮助 |

## 配置

运行 `devforge config` 或编辑 `~/.devforge/.env`：

```env
AI_PROVIDER=claude
AI_API_KEY=your-api-key
AI_MODEL=claude-sonnet-4-6
SKILLSMP_API_KEY=your-skillsmp-key
```

## 技术栈

- **TypeScript** + **Node.js >= 18**
- **@clack/prompts** — 交互式终端 UI
- **SkillsMP API** — Skill 搜索市场
- **Prisma** + **SQLite** — 本地缓存
- **Fastify** — API 服务（可选）

## 项目结构

```
devforge/
├── apps/
│   ├── api/          # API 服务
│   └── cli/          # CLI 工具
├── packages/
│   ├── shared/       # 配置、日志、数据库
│   └── skillsmp/     # SkillsMP API 客户端
└── package.json
```

## 开发

```bash
npm install
npm run build
cd apps/cli && npm link
devforge --version
```

## License

MIT
