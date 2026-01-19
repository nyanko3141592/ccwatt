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

// Achievements
const ACHIEVEMENTS = [
  { id: 'first_wh', emoji: '⚡', name: 'First Watt', check: (r: EnergyResult) => r.energyWh >= 1 },
  { id: 'kwh_club', emoji: '🔌', name: '1kWh Club', check: (r: EnergyResult) => r.energyWh >= 1000 },
  { id: 'carbon_kg', emoji: '💨', name: 'Kilo Carbon', check: (r: EnergyResult) => r.co2Grams >= 1000 },
  { id: 'tree_week', emoji: '🌲', name: 'Tree Week', check: (r: EnergyResult) => r.treeDays >= 7 },
  { id: 'tree_month', emoji: '🌳', name: 'Forest Month', check: (r: EnergyResult) => r.treeDays >= 30 },
  { id: 'tree_year', emoji: '🏕️', name: 'Year of Trees', check: (r: EnergyResult) => r.treeDays >= 365 },
  { id: 'million', emoji: '🎰', name: 'Token Millionaire', check: (r: EnergyResult) => r.totalTokens >= 1_000_000 },
  { id: 'billion', emoji: '💎', name: 'Token Billionaire', check: (r: EnergyResult) => r.totalTokens >= 1_000_000_000 },
  { id: 'cache_heavy', emoji: '📦', name: 'Cache Monster', check: (r: EnergyResult) => r.cacheTokens > r.inputTokens * 10 },
  { id: 'output_heavy', emoji: '📝', name: 'Verbose Mode', check: (r: EnergyResult) => r.outputTokens > r.inputTokens },
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

function getUnlockedAchievements(result: EnergyResult) {
  return ACHIEVEMENTS.filter(a => a.check(result))
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
  // Level = log2(co2 + 1) * 5, so it grows slower at higher levels
  return Math.floor(Math.log2(co2Grams + 1) * 5)
}

function getRandomFlavorTitle(): string {
  return FLAVOR_TITLES[Math.floor(Math.random() * FLAVOR_TITLES.length)]
}

export interface SourceCounts {
  claudeCode: number
  opencode: number
}

export function displayResult(result: EnergyResult, sessionCount: number, sources?: SourceCounts): void {
  const rank = getRank(result.co2Grams)
  const nextRank = getNextRank(result.co2Grams)
  const level = getLevel(result.co2Grams)
  const achievements = getUnlockedAchievements(result)
  const flavorTitle = getRandomFlavorTitle()

  // Energy/CO2 formatted
  const energyStr = result.energyWh >= 1000
    ? `${(result.energyWh / 1000).toFixed(2)} kWh`
    : `${result.energyWh.toFixed(1)} Wh`
  const co2Str = result.co2Grams >= 1000
    ? `${(result.co2Grams / 1000).toFixed(2)} kg`
    : `${result.co2Grams.toFixed(1)} g`

  // Calculate stat percentages (for visual bars)
  const powerPercent = Math.min(result.energyWh / 10000, 1) // 10kWh = full
  const co2Percent = Math.min(result.co2Grams / 100000, 1) // 100kg = full
  const treePercent = Math.min(result.treeDays / 365, 1) // 1 year = full

  console.log()

  // Main status box
  console.log(chalk.gray('  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
  console.log(chalk.gray('  ┃') + chalk.bold.white('  ⚡ CARBON STATUS REPORT ⚡               ') + chalk.gray('┃'))
  console.log(chalk.gray('  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫'))

  // Player info
  console.log(chalk.gray('  ┃') + `  ${chalk.bold.white(`Lv.${level}`)} ${chalk.gray(flavorTitle)}`.padEnd(52) + chalk.gray('┃'))
  console.log(chalk.gray('  ┃') + `  ${rank.color(`【 ${rank.rank} 】`)} ${chalk.bold(rank.title)}`.padEnd(55) + chalk.gray('┃'))
  console.log(chalk.gray('  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫'))

  // Stats with bars
  const pwrBar = chalk.yellow(generateBar(powerPercent, 1, 12))
  const co2Bar = chalk.cyan(generateBar(co2Percent, 1, 12))
  const treeBar = chalk.green(generateBar(treePercent, 1, 12))

  console.log(chalk.gray('  ┃') + `  ⚡ PWR  ${chalk.bold.yellow(energyStr.padStart(12))} ${pwrBar} ` + chalk.gray('┃'))
  console.log(chalk.gray('  ┃') + `  💨 CO2  ${chalk.bold.cyan(co2Str.padStart(12))} ${co2Bar} ` + chalk.gray('┃'))
  console.log(chalk.gray('  ┃') + `  🌳 TREE ${chalk.bold.green((Math.ceil(result.treeDays) + ' days').padStart(12))} ${treeBar} ` + chalk.gray('┃'))

  console.log(chalk.gray('  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫'))

  // Token breakdown
  console.log(chalk.gray('  ┃') + chalk.gray('  📊 TOKEN USAGE                           ') + chalk.gray('┃'))
  console.log(chalk.gray('  ┃') + `     Input:  ${chalk.white(formatNumber(result.inputTokens).padStart(10))}              ` + chalk.gray('┃'))
  console.log(chalk.gray('  ┃') + `     Output: ${chalk.white(formatNumber(result.outputTokens).padStart(10))}              ` + chalk.gray('┃'))
  console.log(chalk.gray('  ┃') + `     Cache:  ${chalk.white(formatNumber(result.cacheTokens).padStart(10))}              ` + chalk.gray('┃'))
  console.log(chalk.gray('  ┃') + `     ${chalk.bold('TOTAL')}: ${chalk.bold.white(formatNumber(result.totalTokens).padStart(11))}              ` + chalk.gray('┃'))

  console.log(chalk.gray('  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫'))

  // Achievements
  console.log(chalk.gray('  ┃') + chalk.gray('  🏆 ACHIEVEMENTS                          ') + chalk.gray('┃'))
  if (achievements.length > 0) {
    // Display up to 6 achievements per row, max 2 rows
    const displayAchievements = achievements.slice(0, 12)
    for (let i = 0; i < displayAchievements.length; i += 6) {
      const row = displayAchievements.slice(i, i + 6)
      const achievementStr = row.map(a => `${a.emoji}`).join(' ')
      console.log(chalk.gray('  ┃') + `     ${achievementStr}`.padEnd(44) + chalk.gray('┃'))
    }
    // Show names of first few
    const names = achievements.slice(0, 3).map(a => a.name).join(' · ')
    console.log(chalk.gray('  ┃') + chalk.gray(`     ${names}`.slice(0, 43).padEnd(43)) + chalk.gray('┃'))
  } else {
    console.log(chalk.gray('  ┃') + chalk.gray('     (none yet - keep going!)              ') + chalk.gray('┃'))
  }

  console.log(chalk.gray('  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫'))

  // Next rank progress
  if (nextRank) {
    const progress = result.co2Grams / nextRank.maxCo2
    const progressBar = generateBar(progress, 1, 20, '▓', '░')
    console.log(chalk.gray('  ┃') + chalk.gray('  📈 NEXT RANK                             ') + chalk.gray('┃'))
    console.log(chalk.gray('  ┃') + `     ${nextRank.color(nextRank.title)}`.padEnd(52) + chalk.gray('┃'))
    console.log(chalk.gray('  ┃') + `     [${progressBar}] ${(progress * 100).toFixed(0)}%    ` + chalk.gray('┃'))
  } else {
    console.log(chalk.gray('  ┃') + chalk.magenta('  👑 MAX RANK ACHIEVED                     ') + chalk.gray('┃'))
    console.log(chalk.gray('  ┃') + chalk.gray('     Congratulations...? 🌍💀              ') + chalk.gray('┃'))
  }

  console.log(chalk.gray('  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))
  console.log()

  // Earth impact summary (outside box)
  const treeCount = Math.ceil(result.treeDays)
  if (treeCount > 0) {
    console.log(chalk.gray('  🌍 Environmental Impact:'))
    if (treeCount <= 50) {
      console.log(chalk.green('     ' + '🌳'.repeat(treeCount)))
    } else {
      console.log(chalk.green('     ' + '🌳'.repeat(10)))
      console.log(chalk.green('     ' + '🌳'.repeat(10)))
      console.log(chalk.gray(`     ...and ${(treeCount - 20).toLocaleString()} more trees working overtime`))
    }
    console.log(chalk.gray(`     ${treeCount.toLocaleString()} tree-days needed to absorb your CO2`))
    console.log()
  }

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
  console.log(chalk.gray('  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
  console.log(chalk.gray('  ┃') + chalk.bold.white('  ⚡ CARBON STATUS REPORT ⚡               ') + chalk.gray('┃'))
  console.log(chalk.gray('  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫'))
  console.log(chalk.gray('  ┃') + `  ${chalk.bold.white('Lv.0')} ${chalk.green('Eco Warrior')}`.padEnd(52) + chalk.gray('┃'))
  console.log(chalk.gray('  ┃') + `  ${chalk.green('【 ? 】')} ${chalk.gray('No data yet')}`.padEnd(52) + chalk.gray('┃'))
  console.log(chalk.gray('  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫'))
  console.log(chalk.gray('  ┃') + chalk.yellow('  🔍 No AI usage data found                ') + chalk.gray('┃'))
  console.log(chalk.gray('  ┃') + chalk.gray('     Supported: Claude Code, OpenCode      ') + chalk.gray('┃'))
  console.log(chalk.gray('  ┃') + chalk.gray('     Start using an AI coding tool!        ') + chalk.gray('┃'))
  console.log(chalk.gray('  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫'))
  console.log(chalk.gray('  ┃') + chalk.green('  🌱 Carbon footprint: 0                   ') + chalk.gray('┃'))
  console.log(chalk.gray('  ┃') + chalk.green('     Earth thanks you... for now.          ') + chalk.gray('┃'))
  console.log(chalk.gray('  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))
  console.log()
}
