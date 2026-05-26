import { config } from '@zr-ovo/devforge-shared'

export interface AnalysisResult {
  projectName: string
  searchQueries: string[]
  reasoning: string
}

/** 调用 AI 分析项目描述，生成搜索关键词 */
export async function analyzeProject(projectDesc: string, defaultName?: string): Promise<AnalysisResult> {
  const systemPrompt = `你是 AI 开发项目分析专家。

从项目描述中提取搜索关键词，用于在开发者工具市场中搜索相关 Skill/插件/MCP。

规则：
1. 关键词必须是英文，中文要转成标准英文技术表达
2. 每个项目必须包含：
   - 核心框架/技术（如 vue, react, nodejs）
   - 项目类型或领域（如 ecommerce, blog, chat, dashboard）
3. 可选补充：平台、工具链、运行环境
4. 关键词数量 3-5 个
5. 关键词要能在开发者工具市场中搜到结果，不要太冷门

示例：

输入："用vue开发一个商城网站"
输出：["vue", "ecommerce", "frontend", "vue3"]

输入："开发 UniApp 微信小程序"
输出：["uniapp", "wechat miniprogram", "vue3", "mobile"]

输入："用 TS 开发 VSCode 插件"
输出：["vscode extension", "typescript", "nodejs"]

输入："开发 Node.js websocket 实时聊天服务"
输出：["nodejs", "websocket", "realtime", "backend"]`

  const prompt = `项目描述：${projectDesc}

提取 3-5 个英文搜索关键词，输出纯 JSON：
{ "searchQueries": ["keyword1", "keyword2", "keyword3"] }`

  const { provider, apiKey, baseUrl, model } = config.ai

  if (!apiKey) {
    return {
      projectName: (defaultName || ''),
      searchQueries: [projectDesc.split(' ').slice(0, 3).join(' ')],
      reasoning: '未配置 AI API Key，使用项目描述直接搜索',
    }
  }

  if (provider === 'claude') {
    const text = await callClaude(systemPrompt, prompt, model, apiKey, baseUrl)
    return parseAnalysis(text, defaultName)
  }

  const text = await callOpenAI(systemPrompt, prompt, model, apiKey, baseUrl!)
  return parseAnalysis(text, defaultName)
}

// ---- Internal HTTP helpers ----

async function callClaude(
  system: string,
  prompt: string,
  model: string,
  apiKey: string,
  baseUrl?: string,
): Promise<string> {
  const url = baseUrl ? `${baseUrl.replace(/\/+$/, '')}/v1/messages` : 'https://api.anthropic.com/v1/messages'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.3,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error: ${res.status} ${err}`)
  }

  const body = (await res.json()) as { content?: Array<{ type: string; text?: string }> }
  return body.content?.filter((c) => c.type === 'text').map((c) => c.text || '').join('\n') || ''
}

async function callOpenAI(
  system: string,
  prompt: string,
  model: string,
  apiKey: string,
  baseUrl: string,
): Promise<string> {
  const url = baseUrl ? `${baseUrl.replace(/\/+$/, '')}/chat/completions` : 'https://api.openai.com/v1/chat/completions'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.3,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI-compatible API error: ${res.status} ${err}`)
  }

  const body = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  return body.choices?.[0]?.message?.content || ''
}

function parseAnalysis(text: string, defaultName?: string): AnalysisResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        projectName: parsed.projectName || (defaultName || ''),
        searchQueries: Array.isArray(parsed.searchQueries) ? parsed.searchQueries.slice(0, 5) : [],
        reasoning: parsed.reasoning || '',
      }
    }
  } catch {
    // fall through
  }

  const lines = text.split('\n').filter(Boolean)
  return {
    projectName: (defaultName || ''),
    searchQueries: lines.slice(0, 3),
    reasoning: text.slice(0, 200),
  }
}
