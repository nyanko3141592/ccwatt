#!/usr/bin/env node

import { program } from 'commander'
import ora from 'ora'
import chalk from 'chalk'
import { scanClaudeDirectory, getClaudeDir } from './lib/scanner.js'
import { scanOpenCodeDirectory, getOpenCodeDir } from './lib/opencode-scanner.js'
import { calculateEnergy, aggregateUsages } from './lib/calculator.js'
import { displayResult, displayNoData } from './lib/display.js'

program
  .name('ccwatt')
  .description('How much power did your AI use? 🌳')
  .version('0.2.0')
  .option('-j, --json', 'Output as JSON')
  .option('-q, --quiet', 'Show trees only')
  .option('--claude-only', 'Only scan Claude Code data')
  .option('--opencode-only', 'Only scan OpenCode data')
  .action(async (options) => {
    const spinner = ora({
      text: 'Scanning AI usage data...',
      color: 'green',
    }).start()

    try {
      const allSessions = []
      const sources: string[] = []

      // Scan Claude Code
      if (!options.opencodeOnly) {
        spinner.text = 'Scanning Claude Code data...'
        const claudeSessions = await scanClaudeDirectory()
        if (claudeSessions.length > 0) {
          allSessions.push(...claudeSessions)
          sources.push(`Claude Code (${claudeSessions.length})`)
        }
      }

      // Scan OpenCode
      if (!options.claudeOnly) {
        spinner.text = 'Scanning OpenCode data...'
        const opencodeSessions = await scanOpenCodeDirectory()
        if (opencodeSessions.length > 0) {
          allSessions.push(...opencodeSessions)
          sources.push(`OpenCode (${opencodeSessions.length})`)
        }
      }

      if (allSessions.length === 0) {
        spinner.stop()
        displayNoData()
        return
      }

      spinner.succeed(`Found ${allSessions.length} sessions from ${sources.join(', ')}`)

      // Aggregate usage from all sessions
      const usages = allSessions.map((s) => s.usage)
      const totalUsage = aggregateUsages(usages)
      const result = calculateEnergy(totalUsage)

      // Count by source
      const claudeCount = allSessions.filter(s => s.source === 'claude-code').length
      const opencodeCount = allSessions.filter(s => s.source === 'opencode').length

      if (options.json) {
        console.log(JSON.stringify({
          ...result,
          sessionCount: allSessions.length,
          sources: {
            claudeCode: claudeCount,
            opencode: opencodeCount,
          },
          directories: {
            claudeCode: getClaudeDir(),
            opencode: getOpenCodeDir(),
          },
        }, null, 2))
        return
      }

      if (options.quiet) {
        const treeCount = Math.min(Math.ceil(result.treeDays), 15)
        let trees = ''
        for (let i = 0; i < treeCount; i++) trees += '🌳'
        if (result.treeDays > 15) trees += ` +${Math.round(result.treeDays - 15)}`
        if (treeCount === 0) trees = '🌱'
        console.log(trees)
        return
      }

      displayResult(result, allSessions.length, { claudeCode: claudeCount, opencode: opencodeCount })

    } catch (error) {
      spinner.fail('Error occurred')
      console.error(chalk.red(error instanceof Error ? error.message : String(error)))
      process.exit(1)
    }
  })

program.parse()
