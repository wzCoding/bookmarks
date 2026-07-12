/**
 * M-Book Service Worker
 * 职责：
 * 1. 初始化 Side Panel 行为
 * 2. 维护书签 URL → ID 映射表
 * 3. 监听标签页更新，追踪书签打开时间
 * 4. 监听书签变更，同步映射表和清理存储
 * 5. 响应消息请求，提供元数据查询接口
 */
;(function () {
  'use strict'

  // ==================== 常量 ====================
  /** chrome.storage.local 中元数据的 key 前缀 */
  const META_KEY_PREFIX = 'bm_meta_'

  // ==================== URL→ID 映射表 ====================
  /** @type {Map<string, string>} url → bookmarkId */
  let urlToIdMap = new Map()

  // ==================== 初始化 ====================
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('[M-Book BG] SidePanel 初始化失败:', error))

  // 启动时构建映射表
  buildUrlToIdMap()

  // ==================== 映射表构建 ====================

  /**
   * 递归遍历书签树，提取所有书签节点（排除文件夹），建立 URL→ID 映射
   * @returns {Promise<void>}
   */
  async function buildUrlToIdMap() {
    try {
      const tree = await chrome.bookmarks.getTree()
      const newMap = new Map()

      /**
       * 递归遍历书签树节点
       * @param {chrome.bookmarks.BookmarkTreeNode[]} nodes
       */
      function walk(nodes) {
        for (const node of nodes) {
          // 只有叶子节点（有 url）才是真正的书签
          if (node.url) {
            // 标准化 URL：去掉尾部斜杠，统一小写
            const normalized = normalizeUrl(node.url)
            // 如果同一 URL 有多个书签，保留先遇到的（通常更接近根）
            if (!newMap.has(normalized)) {
              newMap.set(normalized, node.id)
            }
          }
          if (node.children) {
            walk(node.children)
          }
        }
      }

      walk(tree)
      urlToIdMap = newMap
      console.log(`[M-Book BG] 映射表已构建，共 ${urlToIdMap.size} 个书签`)
    } catch (err) {
      console.error('[M-Book BG] 构建映射表失败:', err)
    }
  }

  /**
   * 标准化 URL 用于匹配
   * - 转为小写
   * - 移除尾部斜杠
   * - 移除 www. 前缀（可选，这里保留以便精确匹配）
   * @param {string} url
   * @returns {string}
   */
  function normalizeUrl(url) {
    if (!url) return ''
    let normalized = url.toLowerCase().trim()
    // 移除尾部斜杠（保留根路径 /）
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1)
    }
    return normalized
  }

  // ==================== 元数据存储 ====================

  /**
   * 获取单个书签的元数据
   * @param {string} bookmarkId
   * @returns {Promise<{lastOpened: number, openCount: number} | null>}
   */
  async function getMeta(bookmarkId) {
    try {
      const key = META_KEY_PREFIX + bookmarkId
      const result = await chrome.storage.local.get(key)
      return result[key] || null
    } catch (err) {
      console.error('[M-Book BG] 读取元数据失败:', bookmarkId, err)
      return null
    }
  }

  /**
   * 获取全部书签的元数据
   * @returns {Promise<Record<string, {lastOpened: number, openCount: number}>>}
   */
  async function getAllMeta() {
    try {
      const all = await chrome.storage.local.get(null)
      /** @type {Record<string, {lastOpened: number, openCount: number}>} */
      const metaMap = {}
      for (const [key, value] of Object.entries(all)) {
        if (key.startsWith(META_KEY_PREFIX)) {
          const bookmarkId = key.slice(META_KEY_PREFIX.length)
          metaMap[bookmarkId] = value
        }
      }
      return metaMap
    } catch (err) {
      console.error('[M-Book BG] 批量读取元数据失败:', err)
      return {}
    }
  }

  /**
   * 记录书签打开事件（更新 lastOpened 和 openCount）
   * @param {string} bookmarkId
   */
  async function recordOpen(bookmarkId) {
    try {
      const now = Date.now()
      const existing = await getMeta(bookmarkId)
      const meta = {
        lastOpened: now,
        openCount: existing ? existing.openCount + 1 : 1,
      }
      const key = META_KEY_PREFIX + bookmarkId
      await chrome.storage.local.set({ [key]: meta })
      console.log(`[M-Book BG] 记录打开: ${bookmarkId} → ${new Date(now).toLocaleString()}`)
    } catch (err) {
      console.error('[M-Book BG] 记录打开失败:', bookmarkId, err)
    }
  }

  /**
   * 删除指定书签的元数据
   * @param {string} bookmarkId
   */
  async function removeMeta(bookmarkId) {
    try {
      const key = META_KEY_PREFIX + bookmarkId
      await chrome.storage.local.remove(key)
      console.log(`[M-Book BG] 已清理元数据: ${bookmarkId}`)
    } catch (err) {
      console.error('[M-Book BG] 清理元数据失败:', bookmarkId, err)
    }
  }

  // ==================== 标签页监听 ====================

  /**
   * 监听标签页更新 — 当页面加载完成时，检查 URL 是否命中已知书签
   */
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // 仅在页面加载完成时触发
    if (changeInfo.status !== 'complete') return
    if (!tab.url) return

    // 跳过 Chrome 内部页面
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return
    }

    const normalized = normalizeUrl(tab.url)
    const bookmarkId = urlToIdMap.get(normalized)

    if (bookmarkId) {
      recordOpen(bookmarkId)
    }
  })

  // ==================== 书签变更监听 ====================

  // 书签创建 — 重新构建映射表（确保新增书签被追踪）
  chrome.bookmarks.onCreated.addListener(() => {
    console.log('[M-Book BG] 书签已创建，重建映射表')
    buildUrlToIdMap()
  })

  // 书签删除 — 清理元数据并重建映射表
  chrome.bookmarks.onRemoved.addListener((id) => {
    console.log('[M-Book BG] 书签已删除:', id)
    removeMeta(id)
    buildUrlToIdMap()
  })

  // 书签变更（标题/URL 修改）— 重建映射表
  chrome.bookmarks.onChanged.addListener(() => {
    console.log('[M-Book BG] 书签已变更，重建映射表')
    buildUrlToIdMap()
  })

  // 书签移动 — URL 不变，无需重建映射表，但记录日志
  chrome.bookmarks.onMoved.addListener((id) => {
    console.log('[M-Book BG] 书签已移动:', id)
  })

  // ==================== 消息通信 ====================

  /**
   * 响应来自侧边栏/弹出页的消息请求
   * 支持的操作：
   * - 'getBookmarkMeta'    → 获取单个书签元数据
   * - 'getAllBookmarksMeta' → 获取全部书签元数据
   * - 'recordBookmarkOpen'  → 手动记录书签打开（openTabs 兜底）
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !message.action) return

    switch (message.action) {
      case 'getBookmarkMeta': {
        getMeta(message.bookmarkId).then((meta) => {
          sendResponse({ success: true, data: meta })
        })
        return true // 异步响应
      }

      case 'getAllBookmarksMeta': {
        getAllMeta().then((metaMap) => {
          sendResponse({ success: true, data: metaMap })
        })
        return true // 异步响应
      }

      case 'recordBookmarkOpen': {
        if (message.bookmarkId) {
          recordOpen(message.bookmarkId).then(() => {
            sendResponse({ success: true })
          })
        } else {
          sendResponse({ success: false, error: '缺少 bookmarkId' })
        }
        return true
      }

      default:
        // 未知操作，不响应
        break
    }
  })

  console.log('[M-Book BG] Service Worker 已启动')
})()
