/**
 * 插件与 BookmarkAgent 鉴权通信服务
 *
 * 架构说明：
 * - AgentClient：封装与 bookmark-agent HTTP 服务的通信（JWT 鉴权、API 调用、健康检查）
 * - 截图业务逻辑请参见 ./snapshot.ts
 * - 类型定义集中在 @/types/service
 *
 * Agent 服务地址：http://127.0.0.1:3789
 * 鉴权方式：JWT Bearer Token（首次调用 POST /auth 获取 token 对，过期自动刷新）
 */

import type {
  AgentConfig,
  AuthTokens,
  AuthResponse,
  SnapshotRequest,
  SnapshotResponse,
  SnapshotListResponse,
  HealthResponse,
} from '@/types/service'

export type {
  AgentConfig,
  SnapshotRequest,
  SnapshotRecord,
  SnapshotResponse,
  SnapshotListResponse,
  HealthResponse,
} from '@/types/service'

// ==================== 常量 ====================

/** 默认 Agent 配置 */
const DEFAULT_AGENT_CONFIG: AgentConfig = {
  baseUrl: 'http://127.0.0.1:3789',
  timeout: 15000,
}

/** chrome.storage.local 存储键 */
const STORAGE_KEY = {
  /** 鉴权令牌 */
  AUTH_TOKENS: 'agent_auth_tokens',
} as const

/** 提前刷新阈值：access token 过期前 5 分钟刷新 */
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000

// ==================== 工具函数 ====================

/**
 * 带超时的 fetch 封装
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number },
): Promise<Response> {
  const timeout = options.timeout ?? DEFAULT_AGENT_CONFIG.timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// ==================== AgentClient ====================

/**
 * BookmarkAgent HTTP 客户端
 *
 * 职责：
 * - 管理 JWT 鉴权（自动获取 / 刷新 / 持久化）
 * - 封装所有 Agent API 调用
 * - 处理网络异常、超时、鉴权失败等错误场景
 *
 * 使用方式：
 * ```ts
 * const client = new AgentClient()
 * await client.ensureAuth()        // 确保已认证
 * const result = await client.requestScreenshot({ url: 'https://example.com' })
 * ```
 */
export class AgentClient {
  private config: AgentConfig
  private tokens: AuthTokens | null = null
  private authPromise: Promise<void> | null = null

  constructor(config?: Partial<AgentConfig>) {
    this.config = { ...DEFAULT_AGENT_CONFIG, ...config }
  }

  // ==================== 配置管理 ====================

  /** 获取当前配置 */
  getConfig(): AgentConfig {
    return { ...this.config }
  }

  /** 更新配置 */
  updateConfig(partial: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...partial }
  }

  // ==================== Token 管理 ====================

  /**
   * 确保已通过 Agent 认证
   * - 如果内存中已有有效 token，直接返回
   * - 否则尝试从 storage 加载，检查是否过期
   * - 如果 refresh token 可用，尝试刷新
   * - 否则重新发起认证
   */
  async ensureAuth(): Promise<void> {
    // 已有有效 token 且未临近过期
    if (this.tokens && Date.now() < this.tokens.expiresAt - TOKEN_REFRESH_BUFFER_MS) {
      return
    }

    // 防止并发重复认证
    if (this.authPromise) {
      return this.authPromise
    }

    this.authPromise = this.doAuth()
    try {
      await this.authPromise
    } finally {
      this.authPromise = null
    }
  }

  /** 内部认证流程 */
  private async doAuth(): Promise<void> {
    // 1. 尝试从 storage 恢复 token
    if (!this.tokens) {
      this.tokens = await this.loadTokensFromStorage()
    }

    // 2. 如果有 refresh token 且未彻底过期，尝试刷新
    if (this.tokens?.refreshToken) {
      const refreshed = await this.tryRefreshToken()
      if (refreshed) return
    }

    // 3. 重新发起首次认证
    await this.requestNewAuth()
  }

  /** 从 chrome.storage.local 加载 token */
  private async loadTokensFromStorage(): Promise<AuthTokens | null> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY.AUTH_TOKENS)
      const stored = result[STORAGE_KEY.AUTH_TOKENS] as AuthTokens | undefined
      return stored ?? null
    } catch {
      console.error('[AgentClient] 加载 token 存储失败')
      return null
    }
  }

  /** 持久化 token 到 chrome.storage.local */
  private async saveTokensToStorage(tokens: AuthTokens): Promise<void> {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY.AUTH_TOKENS]: tokens })
    } catch (err) {
      console.error('[AgentClient] 保存 token 存储失败:', err)
    }
  }

  /** 请求首次认证 POST /auth */
  private async requestNewAuth(): Promise<void> {
    const clientId = this.tokens?.clientId ?? `bookmark-plugin-${Date.now()}`
    const url = `${this.config.baseUrl}/auth`

    console.log('[AgentClient] 发起首次认证...')
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
      timeout: this.config.timeout,
    })

    if (!response.ok) {
      throw new Error(`认证失败: HTTP ${response.status}`)
    }

    const data = (await response.json()) as AuthResponse
    if (!data.success || !data.token || !data.refreshToken) {
      throw new Error('认证响应格式异常')
    }

    this.tokens = {
      accessToken: data.token,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + data.expiresIn * 1000,
      clientId,
    }

    await this.saveTokensToStorage(this.tokens)
    console.log('[AgentClient] 认证成功')
  }

  /** 尝试刷新 token POST /auth/refresh */
  private async tryRefreshToken(): Promise<boolean> {
    if (!this.tokens?.refreshToken) return false

    const url = `${this.config.baseUrl}/auth/refresh`
    console.log('[AgentClient] 尝试刷新 token...')

    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.tokens.refreshToken }),
        timeout: this.config.timeout,
      })

      if (!response.ok) {
        console.warn('[AgentClient] 刷新 token 失败: HTTP', response.status)
        return false
      }

      const data = (await response.json()) as AuthResponse
      if (!data.success || !data.token || !data.refreshToken) {
        console.warn('[AgentClient] 刷新响应格式异常')
        return false
      }

      this.tokens = {
        accessToken: data.token,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + data.expiresIn * 1000,
        clientId: this.tokens.clientId,
      }

      await this.saveTokensToStorage(this.tokens)
      console.log('[AgentClient] token 已刷新')
      return true
    } catch (err) {
      console.warn('[AgentClient] 刷新 token 网络异常:', err)
      return false
    }
  }

  /**
   * 撤销当前 token（用户主动断开连接）
   * POST /auth/revoke
   */
  async revokeAuth(): Promise<boolean> {
    if (!this.tokens?.refreshToken) return false

    const url = `${this.config.baseUrl}/auth/revoke`
    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.tokens.refreshToken }),
        timeout: this.config.timeout,
      })

      const data = await response.json()
      const success = data.success === true

      if (success) {
        this.tokens = null
        await chrome.storage.local.remove(STORAGE_KEY.AUTH_TOKENS)
        console.log('[AgentClient] token 已撤销')
      }

      return success
    } catch (err) {
      console.error('[AgentClient] 撤销 token 失败:', err)
      return false
    }
  }

  // ==================== API 调用 ====================

  /**
   * 发起带鉴权的 API 请求
   * 自动处理 token 过期刷新
   */
  async authenticatedRequest<T>(
    path: string,
    options: RequestInit = {},
    retryOnAuthError = true,
  ): Promise<T> {
    await this.ensureAuth()

    const url = `${this.config.baseUrl}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.tokens!.accessToken}`,
      ...((options.headers as Record<string, string>) ?? {}),
    }

    try {
      const response = await fetchWithTimeout(url, {
        ...options,
        headers,
        timeout: this.config.timeout,
      })

      // 鉴权失败，尝试刷新 token 后重试一次
      if (response.status === 401 && retryOnAuthError) {
        console.log('[AgentClient] 收到 401，尝试刷新 token 后重试')
        const refreshed = await this.tryRefreshToken()
        if (refreshed) {
          return this.authenticatedRequest<T>(path, options, false)
        }
        // 刷新失败，重新认证
        this.tokens = null
        await this.requestNewAuth()
        return this.authenticatedRequest<T>(path, options, false)
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '')
        throw new Error(`Agent API 错误: HTTP ${response.status}${errorBody ? ` - ${errorBody}` : ''}`)
      }

      return (await response.json()) as T
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        throw new Error('无法连接到 BookmarkAgent 服务，请确认 Agent 已启动')
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('请求超时，Agent 服务可能无响应')
      }
      throw err
    }
  }

  // ---- 截图相关 API ----

  /**
   * 请求对指定 URL 截图 POST /snapshot
   * @param params - 截图请求参数 { url, fullPage? }
   * @returns 截图响应（含文件路径和数据库记录）
   */
  async requestScreenshot(params: SnapshotRequest): Promise<SnapshotResponse> {
    if (!params.url) {
      throw new Error('缺少必填参数 url')
    }

    console.log(`[AgentClient] 请求截图: ${params.url}`)
    return this.authenticatedRequest<SnapshotResponse>('/snapshot', {
      method: 'POST',
      body: JSON.stringify({
        url: params.url,
        fullPage: params.fullPage ?? true,
      }),
    })
  }

  /**
   * 查询截图记录 GET /snapshots
   * @param options - 查询参数 { url?, page?, pageSize? }
   */
  async listSnapshots(options?: {
    url?: string
    page?: number
    pageSize?: number
  }): Promise<SnapshotListResponse> {
    const params = new URLSearchParams()
    if (options?.url) params.set('url', options.url)
    if (options?.page) params.set('page', String(options.page))
    if (options?.pageSize) params.set('pageSize', String(options.pageSize))

    const query = params.toString()
    const path = `/snapshots${query ? `?${query}` : ''}`
    return this.authenticatedRequest<SnapshotListResponse>(path)
  }

  // ---- 健康检查 ----

  /**
   * 健康检查 GET /health
   * 不需要鉴权，可用于检测 Agent 是否在线
   */
  async healthCheck(): Promise<HealthResponse> {
    const url = `${this.config.baseUrl}/health`
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      timeout: 5000,
    })

    if (!response.ok) {
      throw new Error(`Agent 健康检查失败: HTTP ${response.status}`)
    }

    return (await response.json()) as HealthResponse
  }

  /**
   * 快速检测 Agent 是否在线
   * @returns true 表示 Agent 服务可达
   */
  async isAgentOnline(): Promise<boolean> {
    try {
      await this.healthCheck()
      return true
    } catch {
      return false
    }
  }
}

// ==================== 便捷工厂函数 ====================

/** 全局单例 AgentClient */
let defaultClient: AgentClient | null = null

/**
 * 获取默认 AgentClient 实例（单例）
 */
export function getAgentClient(): AgentClient {
  if (!defaultClient) {
    defaultClient = new AgentClient()
  }
  return defaultClient
}

/**
 * 检测 Agent 服务是否在线
 * 便捷函数，可独立使用（无需初始化 client）
 */
export async function checkAgentOnline(baseUrl?: string): Promise<boolean> {
  const client = new AgentClient(baseUrl ? { baseUrl } : undefined)
  return client.isAgentOnline()
}

