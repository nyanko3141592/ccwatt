// ターミナル表示

import chalk from 'chalk'
import Table from 'cli-table3'
import type { EnergyResult } from './calculator.js'

export function generateTreeViz(treeDays: number): { trees: string; description: string } {
  const treeCount = Math.min(Math.ceil(treeDays), 15)

  let trees = ''
  for (let i = 0; i < treeCount; i++) {
    trees += '🌳'
  }
  if (treeDays > 15) {
    trees += ` +${Math.round(treeDays - 15)}`
  }
  if (treeCount === 0) {
    trees = '🌱'
  }

  let description: string
  if (treeDays < 0.1) {
    description = '木にとってはほんのひと呼吸'
  } else if (treeDays < 1) {
    const hours = Math.round(treeDays * 24)
    description = `木1本が${hours}時間で吸収できる量`
  } else if (treeDays < 7) {
    description = `木1本が${Math.round(treeDays)}日かけて吸収する量`
  } else if (treeDays < 30) {
    description = `木1本が約${Math.round(treeDays / 7)}週間かけて吸収する量`
  } else if (treeDays < 365) {
    description = `木1本が約${Math.round(treeDays / 30)}ヶ月かけて吸収する量`
  } else {
    description = `木1本が約${(treeDays / 365).toFixed(1)}年かけて吸収する量`
  }

  return { trees, description }
}

export function generateComment(treeDays: number): string {
  if (treeDays < 0.1) return 'エコなAI活用ですね 🌿'
  if (treeDays < 0.5) return 'AIも少しずつ電気を使ってます'
  if (treeDays < 1) return '木が半日がんばる量... 🌲'
  if (treeDays < 3) return '意外と使ってるかも? 🤔'
  if (treeDays < 7) return '木が1週間近くがんばる量です 💪'
  if (treeDays < 30) return 'けっこう使ってますね 😅'
  if (treeDays < 100) return '木も大変そう... 🌳💦'
  return '木、がんばれ... 🌲🌲🌲'
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export function displayResult(result: EnergyResult, sessionCount: number): void {
  const { trees, description } = generateTreeViz(result.treeDays)
  const comment = generateComment(result.treeDays)

  console.log()
  console.log(chalk.bold.cyan('  ⚡ Watt Did AI Cost'))
  console.log(chalk.gray('  ─'.repeat(20)))
  console.log()

  // トークン情報テーブル
  const tokenTable = new Table({
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    style: { 'padding-left': 2, 'padding-right': 2 },
  })

  tokenTable.push(
    [chalk.gray('入力トークン'), chalk.white(formatNumber(result.inputTokens))],
    [chalk.gray('出力トークン'), chalk.white(formatNumber(result.outputTokens))],
    [chalk.gray('キャッシュ'), chalk.white(formatNumber(result.cacheTokens))],
    [chalk.gray('合計'), chalk.bold.white(formatNumber(result.totalTokens))],
  )

  console.log(tokenTable.toString())
  console.log()

  // エネルギー情報
  console.log(chalk.gray('  ─'.repeat(20)))
  console.log()

  const energyWh = result.energyWh >= 1000
    ? `${(result.energyWh / 1000).toFixed(2)} kWh`
    : `${result.energyWh.toFixed(1)} Wh`

  const co2 = result.co2Grams >= 1000
    ? `${(result.co2Grams / 1000).toFixed(2)} kg`
    : `${result.co2Grams.toFixed(1)} g`

  console.log(`  ${chalk.yellow('⚡')} 電力消費:  ${chalk.bold.yellow(energyWh)}`)
  console.log(`  ${chalk.blue('💨')} CO2排出:   ${chalk.bold.blue(co2)}`)
  console.log()

  // 木の視覚化
  console.log(chalk.gray('  ─'.repeat(20)))
  console.log()
  console.log(chalk.green(`  ${trees}`))
  console.log()
  console.log(chalk.white(`  ${description}`))
  console.log()

  // コメント
  console.log(chalk.gray('  ─'.repeat(20)))
  console.log()
  console.log(chalk.italic(`  ${comment}`))
  console.log()

  // セッション数
  if (sessionCount > 0) {
    console.log(chalk.gray(`  📁 ${sessionCount} セッションを分析`))
    console.log()
  }
}

export function displayNoData(): void {
  console.log()
  console.log(chalk.yellow('  🔍 Claude Code の使用データが見つかりませんでした'))
  console.log()
  console.log(chalk.gray('  データは ~/.claude/projects/ に保存されます'))
  console.log(chalk.gray('  Claude Code を使ってみてください!'))
  console.log()
}
