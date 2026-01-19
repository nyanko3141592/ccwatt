// 電力消費計算ロジック

export type ModelType = 'opus' | 'sonnet' | 'haiku' | 'unknown'

// Wh per token (推定値)
const ENERGY_PER_TOKEN: Record<ModelType, number> = {
  opus: 0.003,
  sonnet: 0.001,
  haiku: 0.0003,
  unknown: 0.001, // デフォルトはsonnet相当
}

// CO2排出係数 (kg-CO2/kWh)
const CO2_PER_KWH = 0.5

// 木1本が1年間に吸収するCO2 (kg)
const CO2_PER_TREE_PER_YEAR = 14

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
  model: ModelType
}

export interface EnergyResult {
  totalTokens: number
  inputTokens: number
  outputTokens: number
  cacheTokens: number
  energyWh: number
  co2Grams: number
  treeDays: number
  model: ModelType
}

export function calculateEnergy(usage: TokenUsage): EnergyResult {
  const cacheTokens = usage.cacheCreationTokens + usage.cacheReadTokens
  const totalTokens = usage.inputTokens + usage.outputTokens + cacheTokens
  const energyWh = totalTokens * ENERGY_PER_TOKEN[usage.model]
  const co2Kg = (energyWh / 1000) * CO2_PER_KWH
  const co2Grams = co2Kg * 1000
  const co2PerTreePerDay = (CO2_PER_TREE_PER_YEAR * 1000) / 365
  const treeDays = co2Grams / co2PerTreePerDay

  return {
    totalTokens,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cacheTokens,
    energyWh,
    co2Grams,
    treeDays,
    model: usage.model,
  }
}

export function aggregateUsages(usages: TokenUsage[]): TokenUsage {
  return usages.reduce(
    (acc, u) => ({
      inputTokens: acc.inputTokens + u.inputTokens,
      outputTokens: acc.outputTokens + u.outputTokens,
      cacheCreationTokens: acc.cacheCreationTokens + u.cacheCreationTokens,
      cacheReadTokens: acc.cacheReadTokens + u.cacheReadTokens,
      model: u.model !== 'unknown' ? u.model : acc.model,
    }),
    { inputTokens: 0, outputTokens: 0, cacheCreationTokens: 0, cacheReadTokens: 0, model: 'unknown' as ModelType }
  )
}

export const MODEL_NAMES: Record<ModelType, string> = {
  opus: 'Opus',
  sonnet: 'Sonnet',
  haiku: 'Haiku',
  unknown: 'Unknown',
}
