// Scan ~/.claude/ directory for JSONL session files

import { readdir, readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { TokenUsage } from './calculator.js'

interface ClaudeMessage {
  type?: string
  message?: {
    usage?: {
      input_tokens?: number
      output_tokens?: number
      cache_creation_input_tokens?: number
      cache_read_input_tokens?: number
    }
    model?: string
  }
}

export interface SessionInfo {
  path: string
  projectName: string
  usage: TokenUsage
  messageCount: number
  lastModified: Date
  source: 'claude-code' | 'opencode'
}

async function parseJsonlFile(filePath: string): Promise<{ usage: TokenUsage; messageCount: number }> {
  const content = await readFile(filePath, 'utf-8')
  const lines = content.trim().split('\n')

  let inputTokens = 0
  let outputTokens = 0
  let cacheCreationTokens = 0
  let cacheReadTokens = 0
  let messageCount = 0
  let model = 'unknown'

  for (const line of lines) {
    if (!line.trim()) continue
    try {
      const data = JSON.parse(line) as ClaudeMessage
      if (data.message?.usage) {
        const usage = data.message.usage
        inputTokens += usage.input_tokens || 0
        outputTokens += usage.output_tokens || 0
        cacheCreationTokens += usage.cache_creation_input_tokens || 0
        cacheReadTokens += usage.cache_read_input_tokens || 0
        messageCount++
      }
      if (data.message?.model) {
        model = data.message.model
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  return {
    usage: {
      inputTokens,
      outputTokens,
      cacheCreationTokens,
      cacheReadTokens,
      reasoningTokens: 0,
      model,
      provider: 'anthropic'
    },
    messageCount,
  }
}

async function findJsonlFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  async function walk(currentDir: string) {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name)
        if (entry.isDirectory()) {
          await walk(fullPath)
        } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
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

export async function scanClaudeDirectory(): Promise<SessionInfo[]> {
  const claudeDir = join(homedir(), '.claude', 'projects')
  const files = await findJsonlFiles(claudeDir)
  const sessions: SessionInfo[] = []

  for (const filePath of files) {
    try {
      const { usage, messageCount } = await parseJsonlFile(filePath)
      if (messageCount === 0) continue

      const fileStat = await stat(filePath)
      const pathParts = filePath.split('/')
      const projectIndex = pathParts.findIndex((p) => p === 'projects')
      const projectName = projectIndex >= 0 ? pathParts[projectIndex + 1] || 'unknown' : 'unknown'

      sessions.push({
        path: filePath,
        projectName: decodeURIComponent(projectName.replace(/-/g, '/')),
        usage,
        messageCount,
        lastModified: fileStat.mtime,
        source: 'claude-code',
      })
    } catch {
      // Ignore file read errors
    }
  }

  return sessions.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
}

export function getClaudeDir(): string {
  return join(homedir(), '.claude')
}
