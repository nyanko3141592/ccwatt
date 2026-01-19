// Terminal display - Full package edition

import chalk from 'chalk'
import type { EnergyResult } from './calculator.js'

// Random humorous comments
const COMMENTS = {
  tiny: [
    'Adorable usage 🐣',
    'Earth says "thanks!"',
    'Tree: "Easy peasy" 🌳',
    'Are you even trying?',
  ],
  small: [
    "Still fine... probably",
    'AI runs on electricity, you know',
    'A tree did a little work',
    'Earth: "I\'ll allow it"',
  ],
  medium: [
    'Using more than you thought...?',
    'Tree: "Hold on a sec"',
    'Maybe plant a tree sometime?',
    'Earth: "Hmm..."',
  ],
  large: [
    "That's quite a lot 😅",
    'Tree: "Overtime again" 🌲💦',
    'AI addiction much?',
    'Earth: "Hey now..."',
  ],
  huge: [
    'Tree is dying inside 🌲😵',
    "Anthropic's power bill must be wild",
    'Go plant a forest 🌱',
    'Earth: "Are you listening?"',
  ],
  extreme: [
    'Tree: "I quit" 🪵',
    'Basically deforestation at this point',
    'Power company: "Our best customer!"',
    'Earth: "..."',
  ],
}

// Fun comparisons
const FUNNY_COMPARISONS = [
  { emoji: '☕', name: 'cups of coffee', wh: 100, verb: 'brew' },
  { emoji: '🍞', name: 'slices of toast', wh: 50, verb: 'make' },
  { emoji: '📱', name: 'phone charges', wh: 10, verb: 'do' },
  { emoji: '🎮', name: 'hours of PS5', wh: 200, verb: 'play' },
  { emoji: '📺', name: 'hours of Netflix', wh: 100, verb: 'watch' },
  { emoji: '🚗', name: 'km in a Tesla', wh: 150, verb: 'drive' },
  { emoji: '🛁', name: 'min of hairdryer', wh: 1200, verb: 'use' },
  { emoji: '🍳', name: 'eggs on induction', wh: 100, verb: 'fry' },
  { emoji: '🧊', name: 'hours of fridge', wh: 50, verb: 'run' },
  { emoji: '💡', name: 'hours of LED bulb', wh: 10, verb: 'light' },
]

function getRandomComment(treeDays: number): string {
  let category: keyof typeof COMMENTS
  if (treeDays < 0.1) category = 'tiny'
  else if (treeDays < 1) category = 'small'
  else if (treeDays < 7) category = 'medium'
  else if (treeDays < 30) category = 'large'
  else if (treeDays < 365) category = 'huge'
  else category = 'extreme'

  const comments = COMMENTS[category]
  return comments[Math.floor(Math.random() * comments.length)]
}

function getRandomComparisons(energyWh: number, count: number = 3): string[] {
  const shuffled = [...FUNNY_COMPARISONS].sort(() => Math.random() - 0.5)
  const results: string[] = []

  for (const comp of shuffled) {
    if (results.length >= count) break
    const value = energyWh / comp.wh
    if (value >= 0.1) {
      const formatted = value >= 100 ? Math.round(value).toLocaleString() : value.toFixed(1)
      results.push(`${comp.emoji} ${comp.verb} ${formatted} ${comp.name}`)
    }
  }

  return results
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

// Progress bar
function generateProgressBar(percentage: number, width: number = 20): string {
  const capped = Math.min(percentage, 100)
  const filled = Math.round((capped / 100) * width)
  const empty = width - filled

  let color: (s: string) => string
  if (percentage < 25) color = chalk.green
  else if (percentage < 50) color = chalk.yellow
  else if (percentage < 75) color = chalk.hex('#FFA500')
  else color = chalk.red

  const bar = color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
  return bar
}

// Generate tree visualization based on usage
function getTreeArt(treeDays: number): string[] {
  // Calculate number of trees needed (1 tree = 1 day of absorption)
  const treeCount = Math.ceil(treeDays)

  if (treeCount === 0) {
    return [
      '     🌱     ',
      '  (a tiny sprout)',
    ]
  }

  // Build rows of trees (max 10 per row)
  const maxPerRow = 10
  const displayCount = Math.min(treeCount, 50) // Cap display at 50
  const rows: string[] = []

  let remaining = displayCount
  while (remaining > 0) {
    const thisRow = Math.min(remaining, maxPerRow)
    rows.push('🌳'.repeat(thisRow))
    remaining -= thisRow
  }

  // Add overflow indicator
  if (treeCount > 50) {
    rows.push(`  ...and ${(treeCount - 50).toLocaleString()} more trees`)
  }

  return rows
}

export function displayResult(result: EnergyResult, sessionCount: number): void {
  const treeArt = getTreeArt(result.treeDays)
  const comment = getRandomComment(result.treeDays)
  const comparisons = getRandomComparisons(result.energyWh)

  const loadPercentage = Math.min((result.treeDays / 365) * 100, 100)

  console.log()
  console.log(chalk.bold.cyan('  ╭─────────────────────────────────────╮'))
  console.log(chalk.bold.cyan('  │') + chalk.bold('    ⚡ Watt Did AI Cost? ⚡          ') + chalk.bold.cyan('│'))
  console.log(chalk.bold.cyan('  │') + chalk.gray('    How much power did your AI use? ') + chalk.bold.cyan('│'))
  console.log(chalk.bold.cyan('  ╰─────────────────────────────────────╯'))
  console.log()

  // Tree visualization
  const treeCount = Math.ceil(result.treeDays)
  console.log(chalk.gray('  🌳 Trees needed to absorb this CO2'))
  console.log(chalk.gray('  ─────────────────────────────────────'))
  for (const line of treeArt) {
    console.log(chalk.green('     ' + line))
  }
  if (treeCount > 0) {
    console.log(chalk.gray(`     (${treeCount.toLocaleString()} tree-days of absorption)`))
  }
  console.log()

  // Token info
  console.log(chalk.gray('  📊 Token Usage'))
  console.log(chalk.gray('  ─────────────────────────────────────'))
  console.log(`     Input: ${chalk.white(formatNumber(result.inputTokens))}  Output: ${chalk.white(formatNumber(result.outputTokens))}  Cache: ${chalk.white(formatNumber(result.cacheTokens))}`)
  console.log(`     ${chalk.bold('Total')}: ${chalk.bold.white(formatNumber(result.totalTokens))} tokens`)
  console.log()

  // Energy info
  const energyStr = result.energyWh >= 1000
    ? `${(result.energyWh / 1000).toFixed(2)} kWh`
    : `${result.energyWh.toFixed(1)} Wh`
  const co2Str = result.co2Grams >= 1000
    ? `${(result.co2Grams / 1000).toFixed(2)} kg`
    : `${result.co2Grams.toFixed(1)} g`

  console.log(chalk.gray('  ⚡ Energy & CO2'))
  console.log(chalk.gray('  ─────────────────────────────────────'))
  console.log(`     Power: ${chalk.bold.yellow(energyStr)}`)
  console.log(`     CO2:   ${chalk.bold.blue(co2Str)}`)
  console.log()

  // Earth load meter
  console.log(chalk.gray('  🌍 Earth Load Meter'))
  console.log(chalk.gray('  ─────────────────────────────────────'))
  const bar = generateProgressBar(loadPercentage, 25)
  const percentStr = loadPercentage >= 100 ? '100%+' : `${loadPercentage.toFixed(1)}%`
  console.log(`     [${bar}] ${percentStr}`)

  // Tree absorption time
  let treeTimeStr: string
  if (result.treeDays < 1) {
    treeTimeStr = `${Math.round(result.treeDays * 24)} hours`
  } else if (result.treeDays < 30) {
    treeTimeStr = `${Math.round(result.treeDays)} days`
  } else if (result.treeDays < 365) {
    treeTimeStr = `${(result.treeDays / 30).toFixed(1)} months`
  } else {
    treeTimeStr = `${(result.treeDays / 365).toFixed(1)} years`
  }
  console.log(chalk.gray(`     1 tree needs ${chalk.white(treeTimeStr)} to absorb this`))
  console.log()

  // Fun comparisons
  console.log(chalk.gray('  🎯 With this much power you could...'))
  console.log(chalk.gray('  ─────────────────────────────────────'))
  for (const comp of comparisons) {
    console.log(`     ${comp}`)
  }
  console.log()

  // Random comment
  console.log(chalk.gray('  ─────────────────────────────────────'))
  console.log(chalk.italic(`     ${comment}`))
  console.log()

  // Session count
  console.log(chalk.gray(`  📁 Analyzed ${sessionCount} sessions`))
  console.log()
}

export function displayNoData(): void {
  console.log()
  console.log(chalk.bold.cyan('  ╭─────────────────────────────────────╮'))
  console.log(chalk.bold.cyan('  │') + chalk.bold('    ⚡ Watt Did AI Cost? ⚡          ') + chalk.bold.cyan('│'))
  console.log(chalk.bold.cyan('  ╰─────────────────────────────────────╯'))
  console.log()
  console.log(chalk.yellow('     🔍 No Claude Code usage data found'))
  console.log()
  console.log(chalk.gray('     Data is stored in ~/.claude/projects/'))
  console.log(chalk.gray('     Try using Claude Code first!'))
  console.log()
  console.log(chalk.green('     🌱 Still eco-friendly for now'))
  console.log()
}
