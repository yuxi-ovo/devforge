#!/usr/bin/env node
import * as p from '@clack/prompts'
import { createCommand } from './commands/create'
import { searchCommand } from './commands/search'
import { installCommand } from './commands/install'
import { configCommand, ensureConfig } from './commands/config'
import { printLogo } from './utils/art'
import { renderDivider } from './ui'
import { PRIMARY, SUCCESS, TEXT_SECONDARY, TEXT_MUTED, BORDER, BOLD, DIM, RESET } from './ui/theme'

const VERSION = '0.1.0'

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const command = args[0] || ''

  try {
    switch (command) {
      case 'create':
        await ensureConfig()
        await createCommand(args.slice(1).join(' ') || undefined)
        break

      case 'init':
        await ensureConfig()
        await createCommand(undefined, true)
        break

      case 'install':
        await ensureConfig()
        await installCommand(args.slice(1))
        break

      case 'search':
        await ensureConfig()
        await searchCommand(args.slice(1).join(' ') || undefined)
        break

      case 'config':
        await configCommand()
        break

      case '--version':
      case '-v':
        console.log(`DevForge v${VERSION}`)
        break

      case '--help':
      case '-h':
      case 'help':
        showHelp()
        break

      default:
        if (command && !command.startsWith('-')) {
          await createCommand(command)
        } else if (process.stdin.isTTY) {
          await createCommand()
        } else {
          showHelp()
        }
        break
    }
  } catch (err) {
    console.error(`${String(err)}`)
    process.exit(1)
  }
}

function showHelp(): void {
  printLogo()
  console.log(`  ${BOLD}DevForge${RESET} ${TEXT_MUTED}v${VERSION}${RESET} ${DIM}— AI Native Workspace Orchestrator${RESET}`)
  console.log(`  ${DIM}为你的项目发现并安装 AI Skill${RESET}`)
  console.log()
  console.log(`  ${PRIMARY}${BOLD}用法:${RESET}`)
  console.log(`    ${BOLD}devforge create <项目名>${RESET}   创建项目并安装 Skill`)
  console.log(`    ${BOLD}devforge init${RESET}             在当前项目初始化 Skill`)
  console.log(`    ${BOLD}devforge search <关键词>${RESET}   搜索 Skill`)
  console.log(`    ${BOLD}devforge install <id...>${RESET}  安装 Skill 到当前项目`)
  console.log(`    ${BOLD}devforge config${RESET}           配置 AI`)
  console.log(`    ${BOLD}devforge --version${RESET}        查看版本`)
  console.log()
  console.log(`  ${TEXT_SECONDARY}${BOLD}示例:${RESET}`)
  console.log(`    ${DIM}devforge create my-mcp-server${RESET}`)
  console.log(`    ${DIM}devforge init${RESET}`)
  console.log(`    ${DIM}devforge search "mcp server"${RESET}`)
  console.log(`    ${DIM}devforge install mcp-server-patterns testing-standards${RESET}`)
  console.log()
  console.log(renderDivider({ char: '─', color: BORDER }))
  console.log(`  ${DIM}环境变量配置: devforge config${RESET}`)
  console.log()
}

main()
