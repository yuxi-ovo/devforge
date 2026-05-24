# DevForge

AI 分析项目描述，自动提取关键词，在 SkillsMP 市场搜索匹配的 Skill 并安装到 `.claude/skills/`。

---

## 功能

- **AI 关键词提取** — 描述项目后，AI 自动提取 3-5 个技术关键词
- **智能搜索** — 每个关键词搜索 SkillsMP 市场 Top 5，聚合去重
- **语言优先级** — 同一 Skill 优先取中文版，其次英文
- **查看详情** — 输入序号跳转 SkillsMP 详情页
- **交互式安装** — 选择后自动下载到 `.claude/skills/`

## 安装

```bash
npm install -g @zr-ovo/devforge
```

或从源码：

```bash
git clone https://github.com/yuxi-ovo/devforge.git
cd devforge
npm install
npm run build
cd apps/cli && npm link
```

## 快速开始

### 1. 配置 API Key

```bash
devforge config
```

按提示输入：
- **AI Provider** — `claude`、`openai` 或 `custom`
- **AI API Key** — 模型 API Key
- **SkillsMP API Key** — 从 [skillsmp.com](https://skillsmp.com) 获取

配置保存在 `~/.devforge/.env`。

### 2. 搜索 Skill

```bash
devforge search "vue react typescript"
```

### 3. 创建项目并安装

```bash
devforge create my-project
```

AI 分析项目描述 → 提取关键词 → 搜索市场 → 选择安装。

### 4. 在现有项目初始化

```bash
cd existing-project
devforge init
```

### 5. 安装指定 Skill

```bash
devforge install <skill-id>
```

## 命令

| 命令 | 描述 |
|------|------|
| `devforge create <name>` | 创建项目并安装 Skill |
| `devforge init` | 在当前目录初始化 Skill |
| `devforge search <query>` | 搜索 Skill |
| `devforge install <id...>` | 安装指定 Skill |
| `devforge config` | 配置 API Key |
| `devforge --version` | 版本号 |
| `devforge --help` | 帮助 |

## 工作流程

```
描述项目 → AI 提取关键词 → 按关键词搜索 → 聚合去重 → 选择安装
```

1. 用户输入项目描述（如"用 uni-app 开发微信小程序"）
2. AI 提取关键词（如 `uniapp`、`wechat miniprogram`、`vue3`、`mobile`）
3. 每个关键词搜索 SkillsMP，取 Top 5
4. 按 Skill 名称去重，语言优先级排序
5. 用户选择要安装的 Skill
6. 自动下载到 `.claude/skills/`

## 配置

编辑 `~/.devforge/.env`：

| 变量 | 说明 | 示例 |
|------|------|------|
| `AI_PROVIDER` | AI 提供商 | `claude` |
| `AI_MODEL` | 模型名称 | `claude-sonnet-4-6` |
| `AI_API_KEY` | API Key | `sk-xxx` |
| `AI_BASE_URL` | 自定义 API 地址 | `https://api.example.com/v1` |
| `SKILLSMP_API_KEY` | SkillsMP API Key | `sk_live_xxx` |

支持的 AI 提供商：
- **Claude** — Anthropic 官方 API
- **OpenAI** — OpenAI 兼容接口（DeepSeek、小米等）
- **Custom** — 任意 OpenAI 格式 API

## 项目结构

```
devforge/
├── apps/
│   ├── api/                  # API 服务（Fastify）
│   │   └── src/
│   │       └── routes/       # 路由：search, ai-search, skills, admin
│   └── cli/                  # CLI 工具
│       └── src/
│           ├── ai/           # AI 分析（关键词提取）
│           ├── commands/     # 命令：create, search, install, config
│           ├── ui/           # 终端 UI 组件
│           └── utils/        # 工具：installer, art
├── packages/
│   ├── shared/               # 共享：配置、日志、数据库
│   └── skillsmp/             # SkillsMP API 客户端
├── .env.example              # 环境变量模板
└── package.json
```

## 技术栈

| 层 | 技术 |
|---|------|
| 语言 | TypeScript |
| 运行时 | Node.js >= 18 |
| CLI UI | @clack/prompts |
| API 框架 | Fastify |
| 数据库 | Prisma + SQLite |
| 日志 | Pino |
| Skill 市场 | SkillsMP API |

## 开发

```bash
# 安装依赖
npm install

# 构建所有包
npm run build

# 本地链接 CLI
cd apps/cli && npm link

# 测试
devforge --version
devforge --help
devforge search "vue"
```

## 许可证

MIT
