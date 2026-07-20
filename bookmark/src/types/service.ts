/**
 * Agent 通信服务相关类型定义
 *
 * 涵盖：鉴权、截图 API 请求/响应、截图业务层数据结构
 * 对应 services/index.ts（AgentClient）和 services/snapshot.ts（ScreenshotManager）
 */

// ==================== 鉴权相关 ====================

/** Agent 连接配置 */
export interface AgentConfig {
  /** Agent 服务基础地址，默认 http://127.0.0.1:3789 */
  baseUrl: string
  /** 请求超时时间（毫秒），默认 15000 */
  timeout: number
}

/** 鉴权令牌对（chrome.storage.local 持久化结构） */
export interface AuthTokens {
  /** JWT access token */
  accessToken: string
  /** 长期 refresh token（原始值，用于轮换） */
  refreshToken: string
  /** access token 过期时间（Unix 毫秒），用于本地提前刷新 */
  expiresAt: number
  /** 客户端标识 */
  clientId: string
}

/** POST /auth 响应 */
export interface AuthResponse {
  success: true
  token: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

/** GET /health 响应 */
export interface HealthResponse {
  status: string
  version: string
  activePages: number
  maxPages: number
  uptime: number
}

// ==================== 截图 API 相关 ====================

/** POST /snapshot 请求体 */
export interface SnapshotRequest {
  url: string
  fullPage?: boolean
}

/** POST /snapshot 响应中的数据库记录 */
export interface SnapshotRecord {
  id: number
  url: string
  imagePath: string
  createdAt: string
}

/** POST /snapshot 完整响应 */
export interface SnapshotResponse {
  success: boolean
  path: string
  url: string
  createdAt: string
  record: SnapshotRecord
}

/** GET /snapshots 分页响应 */
export interface SnapshotListResponse {
  success: boolean
  data: SnapshotRecord[]
  total: number
  page: number
  pageSize: number
}

// ==================== 截图业务层 ====================

/** 截图结果（插件侧使用的简化结构） */
export interface ScreenshotResult {
  /** 截图对应的书签 URL */
  url: string
  /** Agent 返回的截图文件本地路径（Agent 侧） */
  filePath: string
  /** 截图创建时间 ISO 字符串 */
  createdAt: string
  /** 数据库记录 ID */
  recordId: number
  /** 截图 base64 数据（可选） */
  dataUrl?: string
}

/** 截图任务状态 */
export type ScreenshotStatus = 'idle' | 'capturing' | 'done' | 'error'

/** 截图任务 */
export interface ScreenshotTask {
  url: string
  status: ScreenshotStatus
  result?: ScreenshotResult
  error?: string
  startedAt: number
}

/** 截图缓存存储结构（chrome.storage.local 中） */
export interface ScreenshotCacheStore {
  /** 按 URL 索引的截图元数据 */
  byUrl: Record<string, ScreenshotResult>
  /** 按 recordId 索引（用于快速查找） */
  byId: Record<number, string>
  /** 最后更新时间戳 */
  updatedAt: number
}
