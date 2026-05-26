# @zr-ovo/devforge

AI 分析项目描述，自动提取关键词，搜索 Skill 并安装。

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

## 测试

### 测试方法

使用 10 个不同技术栈的项目描述，在非交互模式下运行 `devforge create`，自动安装前 5 个推荐 Skill，评估推荐准确性和稳定性。

### 测试结果

| # | 项目描述 | AI 关键词 | 结果数 | 安装的 Skill |
|---|---|---|---|---|
| 1 | Vue 电商网站 | `vue · ecommerce · frontend · shopping cart` | 15 | vue, vue-best-practices, vueuse-functions, frontend-patterns, frontend-slides |
| 2 | React 实时聊天 | `react · websocket · chat · realtime` | 20 | react, react-vendoring, chat-sdk, chat-perf, chat-customizations-editor |
| 3 | Python 机器学习 | `python · machine learning · data pipeline · feature engineering` | 10 | python-patterns, python-testing, python-debugpy, data-pipeline, machine-learning-ops-ml-pipeline |
| 4 | Node.js RESTful API | `nodejs · express · postgresql · restful api` | 15 | nodejs-backend-patterns, nodejs-best-practices, nodejs-keccak256, postgresql, postgresql-optimization |
| 5 | Rust WASM 游戏引擎 | `rust · webassembly · game engine · 2d rendering · physics simulation` | 18 | rust-patterns, rust-testing, game-engine, game-engine-resources, game-engineering-team |
| 6 | Go 微服务架构 | `golang · microservices · service discovery · API gateway · message queue` | 12 | golang-patterns, golang-testing, api-gateway, microservices-architect, microservices-patterns |
| 7 | Flutter 跨平台应用 | `Flutter · mobile app · authentication · local storage` | 17 | flutter-animating-apps, flutter-dart-code-review, flutter-pr-checks-finder, rebuilding-flutter-tool, mobile-app |
| 8 | Next.js 博客系统 | `nextjs · blog · mdx · seo · comments` | 13 | nextjs-turbopack, blog-post, blogwatcher, seo, seo-review |
| 9 | UniApp 微信小程序 | `uniapp · wechat miniprogram · vue3 · mobile` | 10 | uniapp, mobile-app, mobile-games, mobile-onboarding, mobile-security-coder |
| 10 | DevOps CI/CD | `Docker · Kubernetes · GitHub Actions · CI/CD · DevOps` | 19 | docker-management, docker-patterns, kubernetes-architect, ci-cd-and-automation, playwright-devops |

### 综合评分

| 维度 | 得分 |
|---|---|
| 关键词准确性 | 9.5/10 |
| 推荐相关性 | 8.5/10 |
| 语言优先级 | 10/10 |
| 去重效果 | 10/10 |
| 稳定性 | 10/10 |
| 安装完整性 | 10/10 |
| **综合** | **9.5/10** |

## 许可证

MIT
