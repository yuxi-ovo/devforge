# DevForge

**AI Native Workspace Orchestrator** — 用自然语言描述项目，AI 自动搜索并安装 Claude Code Skills，为你的项目搭建智能开发环境。

```text
  ██████╗ ███████╗██╗   ██╗
  ██╔══██╗██╔════╝██║   ██║
  ██║  ██║█████╗  ██║   ██║
  ██║  ██║██╔══╝  ╚██╗ ██╔╝
  ██████╔╝██║      ╚████╔╝
  ╚═════╝ ╚═╝       ╚═══╝
  DevForge v1.0.2
```

---

## 特性

- **AI 关键词提取** — 描述项目后，AI 自动分析并提取 3-5 个技术关键词
- **智能搜索** — 按关键词搜索 SkillsMP 市场，每个关键词取 Top 5，聚合去重
- **语言优先级** — 同一 Skill 优先取中文版，其次英文，跳过日韩法德等
- **查看详情** — 选择 Skill 时可输入序号跳转到 SkillsMP 详情页
- **精美的终端 UI** — 24-bit 真彩色、卡片布局、动态进度追踪
- **渐进式配置引导** — 首次运行自动引导配置 AI API Key 和 SkillsMP Key

## 快速开始

### 安装

```bash
npm install -g @zr-ovo/devforge
```

或从源码安装：

```bash
git clone https://github.com/yuxi-ovo/devforge.git
cd devforge
npm install
npm run build
cd apps/cli && npm link
```

### 配置

```bash
devforge config
```

按提示输入：
- **AI Provider** — 支持 Claude、OpenAI 兼容接口
- **AI API Key** — 模型 API Key
- **SkillsMP API Key** — 从 [skillsmp.com](https://skillsmp.com) 获取

### 使用

```bash
# 创建项目并自动安装 Skill
devforge create my-project

# 在当前项目初始化 Skill
devforge init

# 搜索 Skill
devforge search "vue react typescript"

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

## 命令参考

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

配置文件位于 `~/.devforge/.env`：

| 变量 | 说明 |
|------|------|
| `AI_PROVIDER` | AI 提供商（claude / openai / custom） |
| `AI_MODEL` | 模型名称 |
| `AI_API_KEY` | API Key |
| `AI_BASE_URL` | 自定义 API 地址 |
| `SKILLSMP_API_KEY` | SkillsMP 市场 API Key |

## 项目结构

```
devforge/
├── apps/
│   ├── api/          # API 服务器
│   └── cli/          # CLI 工具
│       └── src/
│           ├── ai/       # AI 分析模块
│           ├── commands/  # 命令实现
│           ├── ui/        # 终端 UI 组件
│           └── utils/     # 工具函数
├── packages/
│   ├── shared/       # 共享配置和工具
│   └── skillsmp/     # SkillsMP API 客户端
└── package.json
```

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

## 技术栈

- **TypeScript** — 全栈类型安全
- **Fastify** — 高性能 API 框架
- **@clack/prompts** — 交互式终端 UI
- **SkillsMP API** — Skill 搜索和 AI 语义搜索

## License

MIT
