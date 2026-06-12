import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import type { AppConfig, PersistedConfig, UpstreamAuthMode } from './config.js'
import { saveConfig } from './config.js'
import type { ModelPool } from './model-pool.js'
import type { StateStore } from './state-store.js'
import { getAdminHtml } from './admin-ui.js'

interface AdminDeps {
  config: AppConfig
  modelPool: ModelPool
  stateStore: StateStore
}

export function createAdminRoutes(deps: AdminDeps) {
  const admin = new Hono()

  admin.get('/', (c) => c.html(getAdminHtml()))

  admin.post('/api/auth', (c) => {
    const key = extractApiKey(c.req.raw.headers)
    if (!deps.config.proxyApiKey) {
      return c.json({ ok: true, configured: false })
    }
    if (key === deps.config.proxyApiKey) {
      return c.json({ ok: true, configured: true })
    }
    return c.json({ ok: false, configured: true }, 401)
  })

  admin.use('/api/*', adminAuth(deps))

  admin.get('/api/config', (c) => {
    const cfg = deps.config
    return c.json({
      port: cfg.port,
      hostname: cfg.hostname,
      proxyApiKey: cfg.proxyApiKey ? maskKey(cfg.proxyApiKey) : '',
      proxyApiKeySet: cfg.proxyApiKey.length > 0,
      dashscopeApiKeys: cfg.dashscopeApiKeys.map(maskKey),
      dashscopeApiKeysRaw: cfg.dashscopeApiKeys,
      upstreamBaseUrl: cfg.upstreamBaseUrl,
      openAIUpstreamBaseUrl: cfg.openAIUpstreamBaseUrl,
      modelIds: cfg.modelIds,
      cooldownSeconds: cfg.cooldownMs / 1000,
      upstreamAuthMode: cfg.upstreamAuthMode,
      corsOrigin: cfg.corsOrigin,
      statePath: cfg.statePath,
      isConfigured: cfg.dashscopeApiKeys.length > 0 && cfg.modelIds.length > 0,
    })
  })

  admin.put('/api/config', async (c) => {
    const body = await c.req.json<Partial<PersistedConfig> & {
      dashscopeApiKeysRaw?: string[]
      proxyApiKeyRaw?: string
    }>()

    const cfg = deps.config

    if (body.port !== undefined) {
      if (!Number.isFinite(body.port) || body.port <= 0 || body.port > 65535) {
        return c.json({ error: 'port must be between 1 and 65535' }, 400)
      }
      cfg.port = body.port
    }

    if (body.hostname !== undefined) {
      cfg.hostname = body.hostname
    }

    if (body.proxyApiKeyRaw !== undefined) {
      cfg.proxyApiKey = body.proxyApiKeyRaw
    } else if (body.proxyApiKey !== undefined && body.proxyApiKey !== maskKey(cfg.proxyApiKey)) {
      cfg.proxyApiKey = body.proxyApiKey
    }

    if (body.dashscopeApiKeysRaw !== undefined) {
      cfg.dashscopeApiKeys = body.dashscopeApiKeysRaw
        .map((k) => k.trim())
        .filter(Boolean)
    } else if (body.dashscopeApiKeys !== undefined) {
      const existing = cfg.dashscopeApiKeys
      cfg.dashscopeApiKeys = body.dashscopeApiKeys
        .map((masked, i) => {
          if (masked === maskKey(existing[i] || '')) return existing[i] || ''
          return masked
        })
        .filter((k) => k.trim())
    }

    if (body.modelIds !== undefined) {
      cfg.modelIds = [...new Set(body.modelIds.map((m) => m.trim()).filter(Boolean))]
    }

    if (body.upstreamBaseUrl !== undefined) cfg.upstreamBaseUrl = body.upstreamBaseUrl
    if (body.openAIUpstreamBaseUrl !== undefined) cfg.openAIUpstreamBaseUrl = body.openAIUpstreamBaseUrl

    if (body.cooldownSeconds !== undefined) {
      if (!Number.isFinite(body.cooldownSeconds) || body.cooldownSeconds <= 0) {
        return c.json({ error: 'cooldownSeconds must be a positive number' }, 400)
      }
      cfg.cooldownMs = body.cooldownSeconds * 1000
    }

    if (body.upstreamAuthMode !== undefined) {
      if (!isValidAuthMode(body.upstreamAuthMode)) {
        return c.json({ error: 'upstreamAuthMode must be authorization, x-api-key, or both' }, 400)
      }
      cfg.upstreamAuthMode = body.upstreamAuthMode
    }

    if (body.corsOrigin !== undefined) cfg.corsOrigin = body.corsOrigin
    if (body.statePath !== undefined) cfg.statePath = body.statePath

    try {
      saveConfig(cfg)
    } catch (error) {
      return c.json({ error: `Failed to save config: ${error instanceof Error ? error.message : String(error)}` }, 500)
    }

    return c.json({ ok: true })
  })

  admin.get('/api/status', (c) => {
    return c.json({
      health: {
        totalKeys: deps.modelPool.totalKeys(),
        modelsPerKey: deps.modelPool.totalModelsPerKey(),
        totalSlots: deps.modelPool.totalSlots(),
        availableSlots: deps.modelPool.availableCount(),
      },
      models: deps.modelPool.snapshot(),
    })
  })

  admin.post('/api/cooldown/clear', (c) => {
    deps.stateStore.clearAllCooldowns()
    return c.json({ ok: true })
  })

  admin.post('/api/restart', (c) => {
    setTimeout(() => process.exit(0), 200)
    return c.json({ ok: true })
  })

  return admin
}

function adminAuth(deps: AdminDeps) {
  return async (c: Context, next: Next): Promise<Response | void> => {
    if (!deps.config.proxyApiKey) {
      await next()
      return
    }

    const key = extractApiKey(c.req.raw.headers)
    if (key !== deps.config.proxyApiKey) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    await next()
  }
}

function extractApiKey(headers: Headers): string {
  const xApiKey = headers.get('x-api-key')?.trim()
  if (xApiKey) return xApiKey

  const authorization = headers.get('authorization')?.trim()
  if (!authorization) return ''

  const bearerPrefix = 'Bearer '
  if (authorization.startsWith(bearerPrefix)) {
    return authorization.slice(bearerPrefix.length).trim()
  }

  return authorization
}

function maskKey(key: string): string {
  if (!key) return ''
  if (key.length <= 8) return key.slice(0, 2) + '***'
  return key.slice(0, 4) + '***' + key.slice(-4)
}

function isValidAuthMode(value: unknown): value is UpstreamAuthMode {
  return value === 'authorization' || value === 'x-api-key' || value === 'both'
}
