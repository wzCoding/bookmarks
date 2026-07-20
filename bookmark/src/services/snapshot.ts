/**
 * 书签链接截图服务
 *
 * 依赖：
 * - AgentClient（来自 ./index）：负责与 BookmarkAgent 的 HTTP 通信
 * - 类型定义集中在 @/types/service
 *
 * 职责：
 * - ScreenshotManager：管理截图元数据缓存（chrome.storage.local）
 * - 任务去重、批量截图、历史查询
 */

import type {
  SnapshotRecord,
  ScreenshotResult,
  ScreenshotTask,
  ScreenshotCacheStore,
} from '@/types/service'
import type { AgentClient } from './index'
import { getAgentClient } from './index'

export type {
  ScreenshotResult,
  ScreenshotStatus,
  ScreenshotTask,
} from '@/types/service'

// ==================== 常量 ====================

/** chrome.storage.local 中截图缓存的 key */
const SCREENSHOT_CACHE_KEY = 'agent_screenshot_cache'

// ==================== 工具函数 ====================

/**
 * 校验 URL 是否可用于截图
 */
function isValidHttpUrl(url: string): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * URL 标准化（用于缓存 key）
 * - 转小写
 * - 移除尾部斜杠
 */
function normalizeUrl(url: string): string {
  if (!url) return ''
  let normalized = url.trim().toLowerCase()
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

// ==================== ScreenshotManager ====================

/**
 * 书签截图管理器
 *
 * 职责：
 * - 调用 AgentClient 执行截图
 * - 缓存截图元数据到 chrome.storage.local
 * - 提供按 URL 查询截图的功能
 * - 管理截图任务队列（防止对同一 URL 重复截图）
 *
 * 使用方式：
 * ```ts
 * const manager = new ScreenshotManager()
 * const result = await manager.captureBookmark('https://example.com')
 * const cached = await manager.getCachedScreenshot('https://example.com')
 * ```
 */
export class ScreenshotManager {
  private client: AgentClient
  /** 活跃的截图任务（按 URL 去重） */
  private activeTasks: Map<string, ScreenshotTask> = new Map()
  /** 缓存存储（内存层，加速读取） */
  private cache: ScreenshotCacheStore = { byUrl: {}, byId: {}, updatedAt: 0 }

  constructor(client?: AgentClient) {
    this.client = client ?? getAgentClient()
  }

  /** 获取内部 AgentClient（用于直接调用其他 API） */
  getClient(): AgentClient {
    return this.client
  }

  // ==================== 缓存管理 ====================

  /**
   * 从 chrome.storage.local 加载截图缓存到内存
   */
  async loadCache(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(SCREENSHOT_CACHE_KEY)
      const stored = result[SCREENSHOT_CACHE_KEY] as ScreenshotCacheStore | undefined
      if (stored) {
        this.cache = stored
      }
    } catch (err) {
      console.error('[ScreenshotManager] 加载缓存失败:', err)
    }
  }

  /**
   * 将内存缓存持久化到 chrome.storage.local
   */
  private async saveCache(): Promise<void> {
    this.cache.updatedAt = Date.now()
    try {
      await chrome.storage.local.set({
        [SCREENSHOT_CACHE_KEY]: this.cache,
      })
    } catch (err) {
      console.error('[ScreenshotManager] 保存缓存失败:', err)
    }
  }

  /**
   * 从缓存中查找指定 URL 的截图
   * @param url - 书签 URL
   * @returns 截图结果，若无缓存返回 null
   */
  async getCachedScreenshot(url: string): Promise<ScreenshotResult | null> {
    if (this.cache.updatedAt === 0) {
      await this.loadCache()
    }
    const normalized = normalizeUrl(url)
    return this.cache.byUrl[normalized] ?? null
  }

  /**
   * 批量获取缓存中的截图
   * @param urls - 书签 URL 列表
   * @returns URL → ScreenshotResult 映射
   */
  async getCachedScreenshots(urls: string[]): Promise<Map<string, ScreenshotResult>> {
    if (this.cache.updatedAt === 0) {
      await this.loadCache()
    }
    const result = new Map<string, ScreenshotResult>()
    for (const url of urls) {
      const normalized = normalizeUrl(url)
      const cached = this.cache.byUrl[normalized]
      if (cached) {
        result.set(url, cached)
      }
    }
    return result
  }

  /**
   * 保存截图到缓存
   */
  private async saveToCache(result: ScreenshotResult): Promise<void> {
    const normalized = normalizeUrl(result.url)
    this.cache.byUrl[normalized] = result
    this.cache.byId[result.recordId] = normalized
    await this.saveCache()
  }

  /**
   * 清除指定 URL 的截图缓存
   */
  async clearCachedScreenshot(url: string): Promise<void> {
    const normalized = normalizeUrl(url)
    const cached = this.cache.byUrl[normalized]
    if (cached) {
      delete this.cache.byUrl[normalized]
      delete this.cache.byId[cached.recordId]
      await this.saveCache()
    }
  }

  /**
   * 清除全部截图缓存
   */
  async clearAllCache(): Promise<void> {
    this.cache = { byUrl: {}, byId: {}, updatedAt: Date.now() }
    await chrome.storage.local.remove(SCREENSHOT_CACHE_KEY)
  }

  // ==================== 截图操作 ====================

  /**
   * 对书签 URL 执行截图
   *
   * 行为：
   * - 先查缓存：若已有当天截图，直接返回
   * - 去重检查：同一 URL 的截图任务正在执行中，返回已有任务
   * - 否则调用 Agent 执行截图并缓存结果
   *
   * @param url - 书签链接 URL
   * @param options - 可选参数 { force?: boolean, fullPage?: boolean }
   * @returns 截图任务（含状态和结果）
   */
  async captureBookmark(
    url: string,
    options?: { force?: boolean; fullPage?: boolean },
  ): Promise<ScreenshotTask> {
    if (!isValidHttpUrl(url)) {
      return {
        url,
        status: 'error',
        error: `无效的 URL: ${url}`,
        startedAt: Date.now(),
      }
    }

    const normalized = normalizeUrl(url)

    // 1. 检查活跃任务（去重）
    const existing = this.activeTasks.get(normalized)
    if (existing && (existing.status === 'capturing' || existing.status === 'idle')) {
      console.log(`[ScreenshotManager] URL 已有进行中的截图任务: ${url}`)
      return existing
    }

    // 2. 检查缓存（非强制模式下）
    if (!options?.force) {
      const cached = await this.getCachedScreenshot(url)
      if (cached) {
        // 当天截图视为有效
        const cacheDate = new Date(cached.createdAt).toDateString()
        const today = new Date().toDateString()
        if (cacheDate === today) {
          return {
            url,
            status: 'done',
            result: cached,
            startedAt: Date.now(),
          }
        }
      }
    }

    // 3. 创建任务并执行
    const task: ScreenshotTask = {
      url,
      status: 'capturing',
      startedAt: Date.now(),
    }
    this.activeTasks.set(normalized, task)

    try {
      const response = await this.client.requestScreenshot({
        url,
        fullPage: options?.fullPage,
      })

      const result: ScreenshotResult = {
        url: response.url,
        filePath: response.path,
        createdAt: response.createdAt,
        recordId: response.record.id,
      }

      task.status = 'done'
      task.result = result

      // 缓存结果
      await this.saveToCache(result)

      console.log(`[ScreenshotManager] 截图完成: ${url}`)
      return task
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      task.status = 'error'
      task.error = errorMsg
      console.error(`[ScreenshotManager] 截图失败: ${url}`, err)
      return task
    } finally {
      // 任务完成后延迟清理（保留短暂时间供 UI 轮询）
      setTimeout(() => {
        this.activeTasks.delete(normalized)
      }, 30000)
    }
  }

  /**
   * 批量截图（串行执行，避免 Agent 过载）
   * @param urls - 书签 URL 列表
   * @param options - 可选参数
   * @returns 截图任务列表
   */
  async captureBookmarks(
    urls: string[],
    options?: { force?: boolean; fullPage?: boolean },
  ): Promise<ScreenshotTask[]> {
    const results: ScreenshotTask[] = []
    for (const url of urls) {
      const task = await this.captureBookmark(url, options)
      results.push(task)
    }
    return results
  }

  /**
   * 获取指定 URL 的截图任务状态
   * @param url - 书签 URL
   */
  getTaskStatus(url: string): ScreenshotTask | null {
    const normalized = normalizeUrl(url)
    return this.activeTasks.get(normalized) ?? null
  }

  // ==================== Agent 历史查询 ====================

  /**
   * 从 Agent 查询指定 URL 的历史截图记录列表
   * @param url - 书签 URL
   */
  async getHistorySnapshots(url: string): Promise<SnapshotRecord[]> {
    try {
      const response = await this.client.listSnapshots({ url })
      return response.data
    } catch (err) {
      console.error('[ScreenshotManager] 查询历史截图失败:', err)
      return []
    }
  }
}

// ==================== 便捷工厂函数 ====================

/** 全局单例 ScreenshotManager */
let defaultManager: ScreenshotManager | null = null

/**
 * 获取默认 ScreenshotManager 实例（单例）
 * 首次调用时会自动加载缓存
 */
export function getScreenshotManager(): ScreenshotManager {
  if (!defaultManager) {
    defaultManager = new ScreenshotManager(getAgentClient())
    // 异步加载缓存，不阻塞返回
    defaultManager.loadCache().catch((err) => {
      console.error('[ScreenshotManager] 初始加载缓存失败:', err)
    })
  }
  return defaultManager
}

/**
 * 对单个书签链接快速截图（使用默认管理器）
 * @param url - 书签 URL
 * @param options - 可选参数
 */
export async function screenshotBookmark(
  url: string,
  options?: { force?: boolean; fullPage?: boolean },
): Promise<ScreenshotTask> {
  const manager = getScreenshotManager()
  return manager.captureBookmark(url, options)
}

/**
 * 获取书签截图缓存（使用默认管理器）
 * @param url - 书签 URL
 */
export async function getBookmarkScreenshot(url: string): Promise<ScreenshotResult | null> {
  const manager = getScreenshotManager()
  return manager.getCachedScreenshot(url)
}
