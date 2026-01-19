// Terminal display - RPG Edition 🎮

import chalk from 'chalk'
import type { EnergyResult } from './calculator.js'

// Rank system based on CO2
const RANKS = [
  { maxCo2: 100, rank: 'F', title: 'Eco Newbie', color: chalk.green },
  { maxCo2: 500, rank: 'E', title: 'Carbon Curious', color: chalk.green },
  { maxCo2: 1000, rank: 'D', title: 'Watt Watcher', color: chalk.cyan },
  { maxCo2: 5000, rank: 'C', title: 'Power User', color: chalk.cyan },
  { maxCo2: 10000, rank: 'B', title: 'Grid Gremlin', color: chalk.yellow },
  { maxCo2: 50000, rank: 'A', title: 'Carbon Sorcerer', color: chalk.yellow },
  { maxCo2: 100000, rank: 'S', title: 'Climate Chaos Agent', color: chalk.hex('#FFA500') },
  { maxCo2: 500000, rank: 'S+', title: 'Extinction Accelerator', color: chalk.red },
  { maxCo2: Infinity, rank: 'S++', title: 'Planet Destroyer', color: chalk.magenta },
]

// Random titles for flavor
const FLAVOR_TITLES = [
  'Digital Druid', 'Byte Burner', 'Silicon Sorcerer', 'Token Titan',
  'Prompt Paladin', 'Cache Knight', 'Model Mage', 'Neural Nomad',
  'GPU Gladiator', 'Tensor Templar', 'Entropy Engineer', 'Bit Berserker',
]

function getRank(co2Grams: number) {
  for (const r of RANKS) {
    if (co2Grams < r.maxCo2) return r
  }
  return RANKS[RANKS.length - 1]
}

function getNextRank(co2Grams: number) {
  for (let i = 0; i < RANKS.length; i++) {
    if (co2Grams < RANKS[i].maxCo2) {
      return i < RANKS.length - 1 ? RANKS[i + 1] : null
    }
  }
  return null
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function generateBar(value: number, max: number, width: number = 10, filled = '█', empty = '░'): string {
  const ratio = Math.min(value / max, 1)
  const filledCount = Math.round(ratio * width)
  return filled.repeat(filledCount) + empty.repeat(width - filledCount)
}

function getLevel(co2Grams: number): number {
  return Math.floor(Math.log2(co2Grams + 1) * 5)
}

function getRandomFlavorTitle(): string {
  return FLAVOR_TITLES[Math.floor(Math.random() * FLAVOR_TITLES.length)]
}

export interface SourceCounts {
  claudeCode: number
  opencode: number
}

// Simple box line helper
const W = 41 // inner width
const line = (s: string) => chalk.gray('  ┃') + s + chalk.gray('┃')
const top = () => chalk.gray('  ┏' + '━'.repeat(W) + '┓')
const mid = () => chalk.gray('  ┣' + '━'.repeat(W) + '┫')
const bot = () => chalk.gray('  ┗' + '━'.repeat(W) + '┛')
const pad = (s: string, len: number) => s + ' '.repeat(Math.max(0, W - len))

export function displayResult(result: EnergyResult, sessionCount: number, sources?: SourceCounts): void {
  const rank = getRank(result.co2Grams)
  const nextRank = getNextRank(result.co2Grams)
  const level = getLevel(result.co2Grams)
  const flavorTitle = getRandomFlavorTitle()

  // Energy/CO2 formatted
  const energyStr = result.energyWh >= 1000
    ? `${(result.energyWh / 1000).toFixed(2)} kWh`
    : `${result.energyWh.toFixed(1)} Wh`
  const co2Str = result.co2Grams >= 1000
    ? `${(result.co2Grams / 1000).toFixed(2)} kg`
    : `${result.co2Grams.toFixed(1)} g`

  // Calculate stat percentages (for visual bars)
  const powerPercent = Math.min(result.energyWh / 10000, 1)
  const co2Percent = Math.min(result.co2Grams / 100000, 1)
  const treePercent = Math.min(result.treeDays / 365, 1)

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
  console.log(line(pad(chalk.bold.white(' ⚡ CARBON STATUS REPORT ⚡'), 28)))
  console.log(mid())

  // Player info
  const lvl = `Lv.${level}`
  console.log(line(pad(` ${chalk.bold.white(lvl)} ${chalk.gray(flavorTitle)}`, 2 + lvl.length + flavorTitle.length)))

  const badge = `【${rank.rank}】`
  console.log(line(pad(` ${rank.color(badge)} ${chalk.bold(rank.title)}`, 2 + badge.length + rank.title.length)))

  console.log(mid())

  // Stats with bars
  const pwrBar = chalk.yellow(generateBar(powerPercent, 1, 10))
  const co2Bar = chalk.cyan(generateBar(co2Percent, 1, 10))
  const treeBar = chalk.green(generateBar(treePercent, 1, 10))

  console.log(line(` ⚡ PWR  ${chalk.bold.yellow(energyStr.padStart(10))} ${pwrBar} `))
  console.log(line(` 💨 CO2  ${chalk.bold.cyan(co2Str.padStart(10))} ${co2Bar} `))
  const treeDaysStr = Math.ceil(result.treeDays) + ' days'
  console.log(line(` 🌳 TREE ${chalk.bold.green(treeDaysStr.padStart(10))} ${treeBar} `))

  console.log(mid())

  // Token breakdown
  console.log(line(pad(chalk.gray(' 📊 TOKEN USAGE'), 15)))
  console.log(line(pad(`    Input:  ${chalk.white(formatNumber(result.inputTokens).padStart(12))}`, 26)))
  console.log(line(pad(`    Output: ${chalk.white(formatNumber(result.outputTokens).padStart(12))}`, 26)))
  console.log(line(pad(`    Cache:  ${chalk.white(formatNumber(result.cacheTokens).padStart(12))}`, 26)))
  console.log(line(pad(`    ${chalk.bold('TOTAL:')} ${chalk.bold.white(formatNumber(result.totalTokens).padStart(12))}`, 26)))

  console.log(mid())

  // Next rank progress
  if (nextRank) {
    const progress = result.co2Grams / nextRank.maxCo2
    const progressBar = generateBar(progress, 1, 20, '▓', '░')
    const pct = `${(progress * 100).toFixed(0)}%`
    console.log(line(pad(chalk.gray(' 📈 NEXT RANK'), 13)))
    console.log(line(pad(`    ${nextRank.color(nextRank.title)}`, 4 + nextRank.title.length)))
    console.log(line(`    [${progressBar}] ${pct.padStart(4)}   `))
  } else {
    console.log(line(pad(chalk.magenta(' 👑 MAX RANK ACHIEVED'), 21)))
    console.log(line(pad(chalk.gray('    Congratulations...? 🌍💀'), 27)))
  }

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
  console.log(line(pad(chalk.bold.white(' ⚡ CARBON STATUS REPORT ⚡'), 28)))
  console.log(mid())
  console.log(line(pad(` ${chalk.bold.white('Lv.0')} ${chalk.green('Eco Warrior')}`, 17)))
  console.log(line(pad(` ${chalk.green('【?】')} ${chalk.gray('No data yet')}`, 18)))
  console.log(mid())
  console.log(line(pad(chalk.yellow(' 🔍 No AI usage data found'), 26)))
  console.log(line(pad(chalk.gray('    Supported: Claude Code, OpenCode'), 36)))
  console.log(line(pad(chalk.gray('    Start using an AI coding tool!'), 34)))
  console.log(bot())
  console.log()
}
