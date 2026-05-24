# @zr-ovo/devforge

AI Native Workspace Orchestrator — 用自然语言描述项目，AI 自动搜索并安装 Claude Code Skills。

```text
  ██████╗ ███████╗██╗   ██╗
  ██╔══██╗██╔════╝██║   ██║
  ██║  ██║█████╗  ██║   ██║
  ██║  ██║██╔══╝  ╚██╗ ██╔╝
  ██████╔╝██║      ╚████╔╝
  ╚═════╝ ╚═╝       ╚═══╝
  DevForge v1.0.2
```

## 安装

```bash
npm install -g @zr-ovo/devforge
```

## 特性

- **AI 关键词提取** — 描述项目后，AI 自动分析并提取 3-5 个技术关键词
- **智能搜索** — 按关键词搜索 SkillsMP 市场，每个关键词取 Top 5，聚合去重
- **语言优先级** — 同一 Skill 优先取中文版，其次英文，跳过日韩法德等
- **查看详情** — 选择 Skill 时可输入序号跳转到 SkillsMP 详情页
- **精美的终端 UI** — 24-bit 真彩色、卡片布局、动态进度追踪

## 快速开始

```bash
# 配置 API Key
devforge config

# 搜索 Skill
devforge search "vue react typescript"

# 创建项目并自动安装 Skill
devforge create my-project

# 在当前项目初始化 Skill
devforge init

# 安装指定 Skill
devforge install <skill-id>
```

## 工作流程

```
描述项目 → AI 提取关键词 → 按关键词搜索 → 聚合去重 → 选择安装
```

1. **AI 分析** — 输入项目描述，AI 提取 3-5 个技术关键词
2. **搜索市场** — 每个关键词搜索 SkillsMP，取 Top 5 结果
3. **聚合去重** — 按 Skill 名称去重，语言优先级：中文 > 英文 > 其他
4. **选择安装** — 交互式选择要安装的 Skill，支持查看详情

## 命令

| 命令 | 描述 |
|------|------|
| `devforge create <name>` | 创建新项目并安装 Skill |
| `devforge init` | 在当前目录初始化 Skill |
| `devforge search <query>` | 搜索 Skill 市场 |
| `devforge install <id...>` | 安装指定 Skill |
| `devforge config` | 配置 AI 和 SkillsMP |
| `devforge --version` | 显示版本号 |
| `devforge --help` | 显示帮助信息 |

## 配置

运行 `devforge config` 交互式配置，或手动编辑 `~/.devforge/.env`：

```env
AI_PROVIDER=claude
AI_API_KEY=your-api-key
AI_MODEL=claude-sonnet-4-6
SKILLSMP_API_KEY=your-skillsmp-key
```

## License

MIT
