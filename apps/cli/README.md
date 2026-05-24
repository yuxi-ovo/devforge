# @zr-ovo/devforge

> 为 Claude Code 发现、搜索并安装 Skill 的命令行工具。

```text
  ╔╦╗╔═╗╔═╗╦  ╦╔═╗╔═╗
   ║║║╣ ╠═╣║  ║║  ║╣ 
  ═╩╝╚═╝╩ ╩╩═╝╩╚═╝╚═╝
```

## 安装

```bash
npm install -g @zr-ovo/devforge
```

## 功能

- **AI 关键词提取** — 描述项目，AI 自动提取技术关键词
- **智能搜索** — 按关键词搜索 SkillsMP，Top 5 聚合去重
- **语言优先级** — 中文 > 英文 > 其他
- **查看详情** — 输入序号跳转详情页
- **交互式安装** — 选择后自动下载到 `.claude/skills/`

## 使用

```bash
# 配置 API Key
devforge config

# 搜索 Skill
devforge search "vue react typescript"

# 创建项目并安装
devforge create my-project

# 当前目录初始化
devforge init

# 安装指定 Skill
devforge install <skill-id>
```

## 命令

| 命令 | 描述 |
|------|------|
| `devforge create <name>` | 创建项目并安装 Skill |
| `devforge init` | 当前目录初始化 |
| `devforge search <query>` | 搜索 Skill |
| `devforge install <id...>` | 安装指定 Skill |
| `devforge config` | 配置 API Key |
| `devforge --version` | 版本号 |
| `devforge --help` | 帮助 |

## 配置

编辑 `~/.devforge/.env`：

```env
AI_PROVIDER=claude
AI_API_KEY=your-api-key
AI_MODEL=claude-sonnet-4-6
SKILLSMP_API_KEY=your-skillsmp-key
```

## 依赖

- `@clack/prompts` — 交互式终端 UI
- `@zr-ovo/devforge-shared` — 配置、日志
- `@zr-ovo/devforge-skillsmp` — SkillsMP API 客户端

## 许可证

MIT
