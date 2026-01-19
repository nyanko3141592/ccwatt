// Scan OpenCode data directory for usage data

import { readdir, readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { TokenUsage } from './calculator.js'
import type { SessionInfo } from './scanner.js'

interface OpenCodeMessage {
  id: string
  sessionID: string
  role: string
  modelID?: string
  providerID?: string
  tokens?: {
    input?: number
    output?: number
    reasoning?: number
    cache?: {
      read?: number
      write?: number
    }
  }
  path?: {
    cwd?: string
    root?: string
  }
  time?: {
    created?: number
    completed?: number
  }
}

function getProviderFromId(providerId: string | undefined, modelId: string | undefined): string {
  if (!providerId && !modelId) return 'unknown'

  const combined = `${providerId || ''} ${modelId || ''}`.toLowerCase()

  if (combined.includes('openai') || combined.includes('gpt') || combined.includes('o1')) return 'openai'
  if (combined.includes('anthropic') || combined.includes('claude')) return 'anthropic'
  if (combined.includes('google') || combined.includes('gemini')) return 'google'
  if (combined.includes('deepseek')) return 'deepseek'
  if (combined.includes('zhipu') || combined.includes('glm') || combined.includes('zai')) return 'zhipu'
  if (combined.includes('alibaba') || combined.includes('qwen')) return 'alibaba'
  if (combined.includes('meta') || combined.includes('llama')) return 'meta'
  if (combined.includes('mistral') || combined.includes('codestral')) return 'mistral'
  if (combined.includes('xai') || combined.includes('grok')) return 'xai'
  if (combined.includes('cohere') || combined.includes('command')) return 'cohere'

  return providerId || 'unknown'
}

async function findMessageFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  async function walk(currentDir: string) {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name)
        if (entry.isDirectory()) {
          await walk(fullPath)
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          files.push(fullPath)
        }
      }
    } catch {
      // Ignore access errors
    }
  }

  await walk(dir)
  return files
}

export async function scanOpenCodeDirectory(): Promise<SessionInfo[]> {
  const openCodeDir = join(homedir(), '.local', 'share', 'opencode', 'storage', 'message')

  let files: string[]
  try {
    files = await findMessageFiles(openCodeDir)
  } catch {
    // OpenCode not installed or no data
    return []
  }

  // Group messages by session
  const sessionMap = new Map<string, {
    usage: TokenUsage
    messageCount: number
    lastModified: Date
    projectPath: string
  }>()

  for (const filePath of files) {
    try {
      const content = await readFile(filePath, 'utf-8')
      const msg = JSON.parse(content) as OpenCodeMessage

      // Only count assistant messages with token data
      if (msg.role !== 'assistant' || !msg.tokens) continue

      const sessionId = msg.sessionID || 'unknown'
      const existing = sessionMap.get(sessionId) || {
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
          reasoningTokens: 0,
          model: 'unknown',
          provider: 'unknown',
        },
        messageCount: 0,
        lastModified: new Date(0),
        projectPath: msg.path?.root || msg.path?.cwd || 'unknown',
      }

      // Accumulate tokens
      existing.usage.inputTokens += msg.tokens.input || 0
      existing.usage.outputTokens += msg.tokens.output || 0
      existing.usage.reasoningTokens += msg.tokens.reasoning || 0
      existing.usage.cacheCreationTokens += msg.tokens.cache?.write || 0
      existing.usage.cacheReadTokens += msg.tokens.cache?.read || 0
      existing.messageCount++

      // Update model/provider info
      if (msg.modelID) {
        existing.usage.model = msg.modelID
      }
      if (msg.providerID || msg.modelID) {
        existing.usage.provider = getProviderFromId(msg.providerID, msg.modelID)
      }

      // Update last modified time
      const fileStat = await stat(filePath)
      if (fileStat.mtime > existing.lastModified) {
        existing.lastModified = fileStat.mtime
      }

      sessionMap.set(sessionId, existing)
    } catch {
      // Ignore file read errors
    }
  }

  // Convert map to array
  const sessions: SessionInfo[] = []
  for (const [sessionId, data] of sessionMap) {
    if (data.messageCount === 0) continue

    // Extract project name from path
    const pathParts = data.projectPath.split('/')
    const projectName = pathParts[pathParts.length - 1] || 'unknown'

    sessions.push({
      path: sessionId,
      projectName,
      usage: data.usage,
      messageCount: data.messageCount,
      lastModified: data.lastModified,
      source: 'opencode',
    })
  }

  return sessions.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
}

export function getOpenCodeDir(): string {
  return join(homedir(), '.local', 'share', 'opencode')
}
