#!/usr/bin/env node

import { program } from 'commander'
import ora from 'ora'
import chalk from 'chalk'
import { scanClaudeDirectory, getClaudeDir } from './lib/scanner.js'
import { calculateEnergy, aggregateUsages } from './lib/calculator.js'
import { displayResult, displayNoData } from './lib/display.js'

program
  .name('ccwatt')
  .description('How much power did your AI use? 🌳')
  .version('0.1.0')
  .option('-j, --json', 'Output as JSON')
  .option('-q, --quiet', 'Show trees only')
  .action(async (options) => {
    const spinner = ora({
      text: 'Scanning Claude Code usage data...',
      color: 'green',
    }).start()

    try {
      const sessions = await scanClaudeDirectory()

      if (sessions.length === 0) {
        spinner.stop()
        displayNoData()
        return
      }

      spinner.succeed(`Found ${sessions.length} sessions`)

      // 全セッションの使用量を集計
      const usages = sessions.map((s) => s.usage)
      const totalUsage = aggregateUsages(usages)
      const result = calculateEnergy(totalUsage)

      if (options.json) {
        console.log(JSON.stringify({
          ...result,
          sessionCount: sessions.length,
          claudeDir: getClaudeDir(),
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

      displayResult(result, sessions.length)

    } catch (error) {
      spinner.fail('エラーが発生しました')
      console.error(chalk.red(error instanceof Error ? error.message : String(error)))
      process.exit(1)
    }
  })

program.parse()
