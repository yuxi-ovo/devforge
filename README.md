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

## 测试

### 测试方法

使用 10 个不同技术栈的项目描述，在非交互模式下运行 `devforge create`，自动安装前 5 个推荐 Skill，评估推荐准确性和稳定性。

```bash
# 运行单个测试
devforge create "用vue开发一个电商网站 包含商品展示 购物车和支付功能"

# 批量测试脚本
cd /path/to/test-dir && bash run-tests.sh
```

### 测试用例与结果

| # | 项目描述 | AI 提取关键词 | 搜索结果 | 安装的 Skill |
|---|---|---|---|---|
| 1 | 用vue开发一个电商网站 包含商品展示 购物车和支付功能 | `vue · ecommerce · frontend · shopping cart` | 15 个 | vue, vue-best-practices, vueuse-functions, frontend-patterns, frontend-slides |
| 2 | 用React和WebSocket开发实时聊天应用 支持群聊和文件传输 | `react · websocket · chat · realtime` | 20 个 | react, react-vendoring, chat-sdk, chat-perf, chat-customizations-editor |
| 3 | 用Python开发机器学习数据处理管道 包含特征工程和模型训练 | `python · machine learning · data pipeline · feature engineering` | 10 个 | python-patterns, python-testing, python-debugpy, data-pipeline, machine-learning-ops-ml-pipeline |
| 4 | 用Node.js开发RESTful API服务器 使用Express和PostgreSQL数据库 | `nodejs · express · postgresql · restful api` | 15 个 | nodejs-backend-patterns, nodejs-best-practices, nodejs-keccak256, postgresql, postgresql-optimization |
| 5 | 用Rust开发WebAssembly浏览器游戏引擎 支持2D渲染和物理模拟 | `rust · webassembly · game engine · 2d rendering · physics simulation` | 18 个 | rust-patterns, rust-testing, game-engine, game-engine-resources, game-engineering-team |
| 6 | 用Go开发微服务架构 包含服务发现 API网关和消息队列 | `golang · microservices · service discovery · API gateway · message queue` | 12 个 | golang-patterns, golang-testing, api-gateway, microservices-architect, microservices-patterns |
| 7 | 用Flutter开发跨平台移动应用 包含用户认证和本地存储 | `Flutter · mobile app · authentication · local storage` | 17 个 | flutter-animating-apps, flutter-dart-code-review, flutter-pr-checks-finder, rebuilding-flutter-tool, mobile-app |
| 8 | 用Next.js开发博客系统 支持MDX渲染 SEO优化和评论功能 | `nextjs · blog · mdx · seo · comments` | 13 个 | nextjs-turbopack, blog-post, blogwatcher, seo, seo-review |
| 9 | 用UniApp开发微信小程序 包含用户登录 支付和地图功能 | `uniapp · wechat miniprogram · vue3 · mobile` | 10 个 | uniapp, mobile-app, mobile-games, mobile-onboarding, mobile-security-coder |
| 10 | 搭建DevOps CI/CD流水线 使用Docker Kubernetes和GitHub Actions | `Docker · Kubernetes · GitHub Actions · CI/CD · DevOps` | 19 个 | docker-management, docker-patterns, kubernetes-architect, ci-cd-and-automation, playwright-devops |

### 评估结果

| 维度 | 得分 | 说明 |
|---|---|---|
| 关键词准确性 | 9.5/10 | 所有用例 AI 提取的关键词与项目描述高度匹配 |
| 推荐相关性 | 8.5/10 | 8/10 用例推荐的 5 个 Skill 全部相关，2/10 有 1 个不太相关 |
| 语言优先级 | 10/10 | 同一 Skill 正确优先推荐中文版 |
| 去重效果 | 10/10 | 无重复 Skill 安装 |
| 稳定性 | 10/10 | 全部一次成功，无超时、无报错 |
| 安装完整性 | 10/10 | 50 个 Skill 全部安装成功，SKILL.md 文件完整 |
| **综合** | **9.5/10** | |

### 已知问题

- 项目名包含 `/` 时路径会被截断（如 `CI/CD`），需对项目名做特殊字符过滤
- 小众技术领域（UniApp、Rust/WASM）市场 Skill 数量较少，推荐选择余地有限
- 个别推荐 Skill 相关性偏低（如 Node.js 项目推荐了 keccak256 加密哈希）

## 许可证

MIT
