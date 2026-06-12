import 'dotenv/config'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

export type UpstreamAuthMode = 'authorization' | 'x-api-key' | 'both'

export interface PersistedConfig {
  port?: number
  hostname?: string
  proxyApiKey?: string
  dashscopeApiKeys?: string[]
  upstreamBaseUrl?: string
  openAIUpstreamBaseUrl?: string
  modelIds?: string[]
  cooldownSeconds?: number
  upstreamAuthMode?: UpstreamAuthMode
  corsOrigin?: string | false
  statePath?: string
}

export interface AppConfig {
  port: number
  hostname: string
  proxyApiKey: string
  dashscopeApiKeys: string[]
  upstreamBaseUrl: string
  openAIUpstreamBaseUrl: string
  modelIds: string[]
  cooldownMs: number
  upstreamAuthMode: UpstreamAuthMode
  corsOrigin: string | false
  statePath: string
  configPath: string
}

const DEFAULT_CONFIG_PATH = './data/config.json'

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optionalEnv(name: string): string | undefined {
  return process.env[name]?.trim() || undefined
}

function parsePositiveNumber(name: string, fallback: number): number {
  const raw = process.env[name]?.trim()
  if (!raw) return fallback

  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number`)
  }
  return value
}

function parseModelIds(): string[] {
  const models = requireEnv('MODEL_IDS')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean)

  if (models.length === 0) {
    throw new Error('MODEL_IDS must contain at least one model id')
  }

  return [...new Set(models)]
}

function parseDashscopeApiKeys(): string[] {
  const raw = requireEnv('DASHSCOPE_API_KEYS')
  const keys = raw
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean)

  if (keys.length === 0) {
    throw new Error('DASHSCOPE_API_KEYS must contain at least one key')
  }

  return [...new Set(keys)]
}

function parseUpstreamAuthMode(): UpstreamAuthMode {
  const value = process.env.UPSTREAM_AUTH_MODE?.trim() || 'authorization'

  if (value === 'authorization' || value === 'x-api-key' || value === 'both') {
    return value
  }

  throw new Error('UPSTREAM_AUTH_MODE must be authorization, x-api-key, or both')
}

function parseCorsOrigin(): string | false {
  const value = process.env.CORS_ORIGIN?.trim()
  if (!value) return '*'
  if (value.toLowerCase() === 'false') return false
  return value
}

export function loadConfig(): AppConfig {
  const configPath = resolve(process.env.CONFIG_PATH?.trim() || DEFAULT_CONFIG_PATH)

  if (existsSync(configPath)) {
    try {
      const json = loadJsonConfig(configPath)
      return jsonConfigToAppConfig(json, configPath)
    } catch (error) {
      console.warn(`[config] failed to load JSON config from ${configPath}:`, error)
      console.warn('[config] falling back to environment variables')
    }
  }

  return envConfigToAppConfig(configPath)
}

export function saveConfig(config: AppConfig): void {
  const json: PersistedConfig = {
    port: config.port,
    hostname: config.hostname,
    proxyApiKey: config.proxyApiKey,
    dashscopeApiKeys: config.dashscopeApiKeys,
    upstreamBaseUrl: config.upstreamBaseUrl,
    openAIUpstreamBaseUrl: config.openAIUpstreamBaseUrl,
    modelIds: config.modelIds,
    cooldownSeconds: config.cooldownMs / 1000,
    upstreamAuthMode: config.upstreamAuthMode,
    corsOrigin: config.corsOrigin,
    statePath: config.statePath,
  }

  mkdirSync(dirname(config.configPath), { recursive: true })
  writeFileSync(config.configPath, JSON.stringify(json, null, 2) + '\n', 'utf8')
}

function loadJsonConfig(path: string): PersistedConfig {
  const content = readFileSync(path, 'utf8')
  const parsed = JSON.parse(content)

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('config file must be a JSON object')
  }

  return parsed as PersistedConfig
}

function jsonConfigToAppConfig(json: PersistedConfig, configPath: string): AppConfig {
  const port = json.port ?? parsePositiveNumber('PORT', 3000)
  const hostname = json.hostname || optionalEnv('HOSTNAME') || '0.0.0.0'
  const proxyApiKey = json.proxyApiKey || optionalEnv('PROXY_API_KEY') || ''
  const dashscopeApiKeys = json.dashscopeApiKeys?.length
    ? [...new Set(json.dashscopeApiKeys.map((k) => k.trim()).filter(Boolean))]
    : tryParseDashscopeApiKeys() || []
  const modelIds = json.modelIds?.length
    ? [...new Set(json.modelIds.map((m) => m.trim()).filter(Boolean))]
    : tryParseModelIds() || []
  const cooldownSeconds = json.cooldownSeconds ?? parsePositiveNumber('MODEL_COOLDOWN_SECONDS', 2592000)
  const upstreamAuthMode = isValidAuthMode(json.upstreamAuthMode) ? json.upstreamAuthMode : parseUpstreamAuthMode()
  const corsOrigin = json.corsOrigin !== undefined ? json.corsOrigin : parseCorsOrigin()

  return {
    port,
    hostname,
    proxyApiKey,
    dashscopeApiKeys,
    upstreamBaseUrl: json.upstreamBaseUrl || optionalEnv('UPSTREAM_BASE_URL') || 'https://dashscope.aliyuncs.com/apps/anthropic',
    openAIUpstreamBaseUrl: json.openAIUpstreamBaseUrl || optionalEnv('OPENAI_UPSTREAM_BASE_URL') || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    modelIds,
    cooldownMs: cooldownSeconds * 1000,
    upstreamAuthMode,
    corsOrigin,
    statePath: json.statePath || optionalEnv('STATE_PATH') || './data/proxy-state.json',
    configPath,
  }
}

function envConfigToAppConfig(configPath: string): AppConfig {
  return {
    port: parsePositiveNumber('PORT', 3000),
    hostname: optionalEnv('HOSTNAME') || '0.0.0.0',
    proxyApiKey: requireEnv('PROXY_API_KEY'),
    dashscopeApiKeys: parseDashscopeApiKeys(),
    upstreamBaseUrl: optionalEnv('UPSTREAM_BASE_URL') || 'https://dashscope.aliyuncs.com/apps/anthropic',
    openAIUpstreamBaseUrl: optionalEnv('OPENAI_UPSTREAM_BASE_URL') || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    modelIds: parseModelIds(),
    cooldownMs: parsePositiveNumber('MODEL_COOLDOWN_SECONDS', 2592000) * 1000,
    upstreamAuthMode: parseUpstreamAuthMode(),
    corsOrigin: parseCorsOrigin(),
    statePath: optionalEnv('STATE_PATH') || './data/proxy-state.json',
    configPath,
  }
}

function tryParseDashscopeApiKeys(): string[] | null {
  try {
    return parseDashscopeApiKeys()
  } catch {
    return null
  }
}

function tryParseModelIds(): string[] | null {
  try {
    return parseModelIds()
  } catch {
    return null
  }
}

function isValidAuthMode(value: unknown): value is UpstreamAuthMode {
  return value === 'authorization' || value === 'x-api-key' || value === 'both'
}
