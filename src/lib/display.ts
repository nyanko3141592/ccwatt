// Terminal display

import chalk from 'chalk'
import type { EnergyResult } from './calculator.js'

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export interface SourceCounts {
  claudeCode: number
  opencode: number
}

// Simple box line helper
const W = 35 // inner width
const line = (s: string) => chalk.gray('  ┃') + s + chalk.gray('┃')
const top = () => chalk.gray('  ┏' + '━'.repeat(W) + '┓')
const mid = () => chalk.gray('  ┣' + '━'.repeat(W) + '┫')
const bot = () => chalk.gray('  ┗' + '━'.repeat(W) + '┛')
const pad = (s: string, len: number) => s + ' '.repeat(Math.max(0, W - len))

export function displayResult(result: EnergyResult, sessionCount: number, sources?: SourceCounts): void {
  // Energy/CO2 formatted
  const energyStr = result.energyWh >= 1000
    ? `${(result.energyWh / 1000).toFixed(2)} kWh`
    : `${result.energyWh.toFixed(1)} Wh`
  const co2Str = result.co2Grams >= 1000
    ? `${(result.co2Grams / 1000).toFixed(2)} kg`
    : `${result.co2Grams.toFixed(1)} g`

  console.log()

  // ===== ENVIRONMENTAL IMPACT FIRST =====
  const treeCount = Math.ceil(result.treeDays)
  console.log(chalk.bold.green('  🌍 ENVIRONMENTAL IMPACT'))
  console.log(chalk.gray('  ─────────────────────────────────────────'))
  console.log()

  if (treeCount === 0) {
    console.log(chalk.green('     🌱'))
    console.log(chalk.gray('     A tiny sprout. You\'re eco-friendly!'))
  } else if (treeCount < 10) {
    // Small numbers: 1 emoji = 1 tree
    console.log(chalk.green('     ' + '🌳'.repeat(treeCount)))
    console.log(chalk.gray(`     ${treeCount} tree-day${treeCount === 1 ? '' : 's'} needed to absorb your CO2`))
  } else {
    // Larger numbers: 1 emoji = 10 trees for visual impact
    const emojiCount = Math.ceil(treeCount / 10)
    const EMOJIS_PER_ROW = 10
    const MAX_ROWS = 15  // Max 150 emojis = 1500 trees before abbreviating

    if (emojiCount <= MAX_ROWS * EMOJIS_PER_ROW) {
      // Display all emojis
      const rows = Math.ceil(emojiCount / EMOJIS_PER_ROW)
      for (let i = 0; i < rows; i++) {
        const count = Math.min(EMOJIS_PER_ROW, emojiCount - i * EMOJIS_PER_ROW)
        console.log(chalk.green('     ' + '🌳'.repeat(count)))
      }
    } else {
      // Abbreviate for massive usage
      for (let i = 0; i < MAX_ROWS; i++) {
        console.log(chalk.green('     ' + '🌳'.repeat(EMOJIS_PER_ROW)))
      }
      const remaining = treeCount - (MAX_ROWS * EMOJIS_PER_ROW * 10)
      console.log(chalk.yellow(`     ...and ${remaining.toLocaleString()} more trees working overtime`))
    }
    console.log(chalk.gray(`     🌳 = 10 trees | ${treeCount.toLocaleString()} tree-days needed`))
  }

  console.log()
  console.log()

  // ===== STATUS REPORT BOX =====
  console.log(top())
  console.log(line(pad(chalk.bold.white(' ⚡ USAGE REPORT'), 16)))
  console.log(mid())

  // Stats
  console.log(line(pad(` ⚡ Power    ${chalk.bold.yellow(energyStr.padStart(12))}`, 26)))
  console.log(line(pad(` 💨 CO2      ${chalk.bold.cyan(co2Str.padStart(12))}`, 26)))
  const treeDaysStr = Math.ceil(result.treeDays).toLocaleString() + ' days'
  console.log(line(pad(` 🌳 Trees    ${chalk.bold.green(treeDaysStr.padStart(12))}`, 26)))

  console.log(mid())

  // Token breakdown
  console.log(line(pad(` 📊 Tokens`, 10)))
  console.log(line(pad(`    Input   ${chalk.white(formatNumber(result.inputTokens).padStart(12))}`, 26)))
  console.log(line(pad(`    Output  ${chalk.white(formatNumber(result.outputTokens).padStart(12))}`, 26)))
  console.log(line(pad(`    Cache   ${chalk.white(formatNumber(result.cacheTokens).padStart(12))}`, 26)))
  console.log(line(pad(`    ${chalk.bold('Total')}   ${chalk.bold.white(formatNumber(result.totalTokens).padStart(12))}`, 26)))

  console.log(bot())
  console.log()

  // Session info
  if (sources && (sources.claudeCode > 0 || sources.opencode > 0)) {
    const parts: string[] = []
    if (sources.claudeCode > 0) parts.push(`🟠 Claude Code: ${sources.claudeCode}`)
    if (sources.opencode > 0) parts.push(`🔷 OpenCode: ${sources.opencode}`)
    console.log(chalk.gray(`  📁 ${parts.join('  ')}`))
  } else {
    console.log(chalk.gray(`  📁 Analyzed ${sessionCount} sessions`))
  }
  console.log()
}

export function displayNoData(): void {
  console.log()
  console.log(chalk.bold.green('  🌍 ENVIRONMENTAL IMPACT'))
  console.log(chalk.gray('  ─────────────────────────────────────────'))
  console.log()
  console.log(chalk.green('     🌱'))
  console.log(chalk.gray('     No carbon footprint yet. Earth is happy!'))
  console.log()
  console.log()

  console.log(top())
  console.log(line(pad(chalk.bold.white(' ⚡ USAGE REPORT'), 16)))
  console.log(mid())
  console.log(line(pad(chalk.yellow(' 🔍 No AI usage data found'), 26)))
  console.log(line(pad(chalk.gray('    Supported:'), 14)))
  console.log(line(pad(chalk.gray('    Claude Code, OpenCode'), 25)))
  console.log(bot())
  console.log()
}
