// Energy consumption calculation logic

// Model categories based on estimated energy per token
export type ModelCategory =
  | 'huge'     // GPT-4, Claude Opus, Gemini Ultra
  | 'large'    // GPT-4-turbo, Claude Sonnet, Gemini Pro
  | 'medium'   // GPT-3.5, Claude Haiku, Gemini Flash
  | 'small'    // Lightweight models
  | 'unknown'

// Wh per token (estimates based on 2024-2025 research)
// Sources: arxiv.org/html/2505.09598v1, arxiv.org/html/2512.03024v1
// GPT-4o: ~0.34 Wh/query ≈ 0.001 Wh/token (300-400 tokens)
// Llama3-70B on H100: ~0.39 J/token ≈ 0.0001 Wh/token
const ENERGY_PER_TOKEN: Record<ModelCategory, number> = {
  huge: 0.001,      // ~175B+ params (GPT-4, Opus) - ~3.6 J/token
  large: 0.0003,    // ~70B params (Sonnet, GPT-4-turbo) - ~1 J/token
  medium: 0.0001,   // ~20B params (Haiku, GPT-3.5) - ~0.36 J/token
  small: 0.00003,   // ~7B params (small models) - ~0.1 J/token
  unknown: 0.0003,  // Default to large
}

// Cache read tokens have near-zero energy cost (just memory retrieval)
// Cache creation tokens have full energy cost
const CACHE_READ_ENERGY_FACTOR = 0.01  // 1% of normal cost

// CO2 emission factor (kg-CO2/kWh) - global average
const CO2_PER_KWH = 0.5

// CO2 absorbed by 1 tree per year (kg)
const CO2_PER_TREE_PER_YEAR = 14

// Model mapping to categories
const MODEL_CATEGORIES: Record<string, ModelCategory> = {
  // Claude (Anthropic)
  'opus': 'huge',
  'claude-3-opus': 'huge',
  'claude-opus-4': 'huge',
  'sonnet': 'large',
  'claude-3-sonnet': 'large',
  'claude-3.5-sonnet': 'large',
  'claude-sonnet-4': 'large',
  'haiku': 'medium',
  'claude-3-haiku': 'medium',
  'claude-3.5-haiku': 'medium',

  // OpenAI
  'gpt-4': 'huge',
  'gpt-4-turbo': 'large',
  'gpt-4o': 'large',
  'gpt-4o-mini': 'medium',
  'gpt-3.5-turbo': 'medium',
  'gpt-3.5': 'medium',
  'o1': 'huge',
  'o1-mini': 'large',
  'o1-preview': 'huge',
  'o3-mini': 'large',

  // Google
  'gemini-ultra': 'huge',
  'gemini-pro': 'large',
  'gemini-1.5-pro': 'large',
  'gemini-1.5-flash': 'medium',
  'gemini-2.0-flash': 'medium',

  // DeepSeek
  'deepseek-chat': 'large',
  'deepseek-coder': 'large',
  'deepseek-v3': 'large',
  'deepseek-r1': 'large',

  // Zhipu AI (GLM)
  'glm-4': 'large',
  'glm-4.7': 'large',
  'glm-4.7-free': 'large',
  'glm-3-turbo': 'medium',

  // Alibaba (Qwen)
  'qwen-turbo': 'medium',
  'qwen-plus': 'large',
  'qwen-max': 'huge',
  'qwen2.5': 'large',

  // Meta (Llama)
  'llama-3': 'large',
  'llama-3.1': 'large',
  'llama-3.2': 'large',
  'llama-3-70b': 'large',
  'llama-3-8b': 'medium',
  'codellama': 'large',

  // Mistral
  'mistral-large': 'large',
  'mistral-medium': 'medium',
  'mistral-small': 'small',
  'mixtral': 'large',
  'codestral': 'large',

  // Cohere
  'command-r': 'large',
  'command-r-plus': 'huge',

  // xAI
  'grok': 'large',
  'grok-2': 'large',
}

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
  reasoningTokens: number
  model: string
  provider: string
}

export interface EnergyResult {
  totalTokens: number
  inputTokens: number
  outputTokens: number
  cacheTokens: number
  reasoningTokens: number
  energyWh: number
  co2Grams: number
  treeDays: number
  model: string
  provider: string
}

export function getModelCategory(modelId: string): ModelCategory {
  const lower = modelId.toLowerCase()

  // Direct match
  for (const [key, category] of Object.entries(MODEL_CATEGORIES)) {
    if (lower.includes(key)) {
      return category
    }
  }

  // Fallback heuristics
  if (lower.includes('opus') || lower.includes('ultra') || lower.includes('max')) return 'huge'
  if (lower.includes('haiku') || lower.includes('mini') || lower.includes('flash') || lower.includes('turbo')) return 'medium'
  if (lower.includes('sonnet') || lower.includes('pro') || lower.includes('plus')) return 'large'

  return 'unknown'
}

export function calculateEnergy(usage: TokenUsage): EnergyResult {
  const cacheTokens = usage.cacheCreationTokens + usage.cacheReadTokens
  const totalTokens = usage.inputTokens + usage.outputTokens + cacheTokens + usage.reasoningTokens

  const category = getModelCategory(usage.model)
  const baseEnergy = ENERGY_PER_TOKEN[category]

  // Calculate energy with proper cache handling
  // - Input/Output/Reasoning tokens: full energy cost
  // - Cache creation: full energy cost (computation needed)
  // - Cache read: minimal energy (just memory retrieval)
  const computeTokens = usage.inputTokens + usage.outputTokens + usage.reasoningTokens + usage.cacheCreationTokens
  const cacheReadEnergy = usage.cacheReadTokens * baseEnergy * CACHE_READ_ENERGY_FACTOR

  const energyWh = (computeTokens * baseEnergy) + cacheReadEnergy
  const co2Kg = (energyWh / 1000) * CO2_PER_KWH
  const co2Grams = co2Kg * 1000
  const co2PerTreePerDay = (CO2_PER_TREE_PER_YEAR * 1000) / 365
  const treeDays = co2Grams / co2PerTreePerDay

  return {
    totalTokens,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cacheTokens,
    reasoningTokens: usage.reasoningTokens,
    energyWh,
    co2Grams,
    treeDays,
    model: usage.model,
    provider: usage.provider,
  }
}

export function aggregateUsages(usages: TokenUsage[]): TokenUsage {
  return usages.reduce(
    (acc, u) => ({
      inputTokens: acc.inputTokens + u.inputTokens,
      outputTokens: acc.outputTokens + u.outputTokens,
      cacheCreationTokens: acc.cacheCreationTokens + u.cacheCreationTokens,
      cacheReadTokens: acc.cacheReadTokens + u.cacheReadTokens,
      reasoningTokens: acc.reasoningTokens + u.reasoningTokens,
      model: u.model || acc.model,
      provider: u.provider || acc.provider,
    }),
    {
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
      reasoningTokens: 0,
      model: 'unknown',
      provider: 'unknown'
    }
  )
}

export function getProviderEmoji(provider: string): string {
  const lower = provider.toLowerCase()
  if (lower.includes('anthropic') || lower.includes('claude')) return '🟠'
  if (lower.includes('openai') || lower.includes('gpt')) return '🟢'
  if (lower.includes('google') || lower.includes('gemini')) return '🔵'
  if (lower.includes('deepseek')) return '🐋'
  if (lower.includes('zhipu') || lower.includes('glm')) return '🀄'
  if (lower.includes('alibaba') || lower.includes('qwen')) return '☁️'
  if (lower.includes('meta') || lower.includes('llama')) return '🦙'
  if (lower.includes('mistral')) return '🌬️'
  if (lower.includes('xai') || lower.includes('grok')) return '✖️'
  return '🤖'
}
