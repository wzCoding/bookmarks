import type {
  BookmarkTreeNode,
  BookmarkMeta,
  BookmarkMetaMap,
  RecentOpenedBookmark,
  OpenTabsOption,
  TreeNode,
  BgMessageResponse,
} from '@/types'

// 防抖函数
function debounce<T extends (...args: never[]) => void>(
  func: T,
  delay = 1000
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer) // 清除已有的计时器，重新开始计时
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// 展开树结构
function expandTree(tree: BookmarkTreeNode[], result: BookmarkTreeNode[] = []): BookmarkTreeNode[] {
  for (const item of tree) {
    result.push(item)
    if (item.children) {
      expandTree(item.children, result)
    }
  }
  return result
}

// 根据指定的key字段获取树结构
function getTreeByKey(list: BookmarkTreeNode[], rootId: string, key: string): TreeNode[] {
  const nodes: TreeNode[] = []
  const result: TreeNode[] = []

  list.forEach((item) => {
    if (item[key as keyof BookmarkTreeNode]) {
      const node: TreeNode = {
        title: item.title,
        id: item.id,
      }
      if (item.parentId) {
        node.parentId = item.parentId
        nodes.push(node)
      }
    }
  })

  const root = nodes.filter((item) => item.parentId === rootId)

  const getAllBookMarks = (item: TreeNode): void => {
    const childrens = nodes.filter((child) => child.parentId === item.id)
    if (childrens.length) {
      item.children = childrens
      for (const child of childrens) {
        getAllBookMarks(child)
      }
    }
    if (item.parentId === rootId) {
      result.push(item)
    }
  }

  for (const item of root) {
    getAllBookMarks(item)
  }
  return result
}

// 设置localStorage缓存
function setLocalCache(key: string, data: Record<string, unknown>): void {
  const cache = window.localStorage.getItem(key)
  if (!cache) {
    window.localStorage.setItem(key, JSON.stringify(data))
  } else {
    const parsedCache: Record<string, unknown> = JSON.parse(cache)
    const dataKey = Object.keys(data)[0]
    if (!parsedCache[dataKey] && String(data[dataKey]) !== '1') {
      parsedCache[dataKey] = data[dataKey]
      window.localStorage.setItem(key, JSON.stringify(parsedCache))
    }
  }
}

// 获取localStorage缓存
function getLocalCache(key: string, id: string): string {
  const cache = window.localStorage.getItem(key)
  if (cache) {
    const parsedCache: Record<string, unknown> = JSON.parse(cache)
    return (parsedCache[id] as string) || ''
  }
  return ''
}

// 简单的日期格式化
function getDate(date: number | string | Date | undefined): string | undefined {
  if (!date) return 
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  const add0 = (num: number): string | number => {
    return num < 10 ? '0' + num : num
  }
  return `${year}/${add0(month)}/${add0(day)}`
}

// 利用chrome-extension Api直接获取书签链接的favicon
function faviconURL(u: string): string {
  const url = new URL(chrome.runtime.getURL('/_favicon/'))
  url.searchParams.set('pageUrl', u)
  url.searchParams.set('size', '32')
  return url.toString()
}

// 获取当前active状态的浏览器页签
function getCurrentTab(callback: (tab: chrome.tabs.Tab) => void): void {
  const queryOptions: chrome.tabs.QueryInfo = { active: true, lastFocusedWindow: true }
  chrome.tabs.query(queryOptions, ([tab]) => {
    if (chrome.runtime.lastError) console.error(chrome.runtime.lastError)
    callback && callback(tab)
  })
}

// 获取bookmark
async function getAllBookMarks(): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
  return await chrome.bookmarks.getTree()
}

// 获取最近使用的bookmark
async function getRecentBookMarks(number: number): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
  return await chrome.bookmarks.getRecent(number)
}

// 修改bookmark
function updateBookMark(
  id: string,
  options: { title?: string; url?: string },
  callback?: (result: chrome.bookmarks.BookmarkTreeNode) => void
): void {
  if (!options) return
  chrome.bookmarks.update(id, options, (res) => {
    callback && callback(res)
  })
}

// 创建bookmark
function createBookMark(
  options: { parentId?: string; index?: number; title?: string; url?: string },
  callback?: (result: chrome.bookmarks.BookmarkTreeNode) => void
): void {
  if (!options) return
  chrome.bookmarks.create(options, (res) => {
    callback && callback(res)
  })
}

// 删除bookmark
function removeBookMark(
  id: string,
  callback?: () => void
): void {
  if (!id) return
  chrome.bookmarks.remove(id, () => {
    callback && callback()
  })
}

// 移动bookmark
function moveBookMark(
  id: string,
  options: { parentId?: string; index?: number },
  callback?: (result: chrome.bookmarks.BookmarkTreeNode) => void
): void {
  if (!options) return
  chrome.bookmarks.move(id, options, (res) => {
    callback && callback(res)
  })
}

// 根据target关键字来打开链接
// @param option - id 为可选的书签 ID，用于追踪打开时间
function openTabs(option: OpenTabsOption): void {
  if (!option) return
  const { type, url, id } = option
  // 如果提供了书签 ID，主动通知 background 记录打开时间（兜底机制）
  if (id) {
    chrome.runtime.sendMessage({
      action: 'recordBookmarkOpen',
      bookmarkId: id,
    }).catch(() => {
      // Service Worker 可能未就绪，静默失败
    })
  }
  if (!url) return
  if (type === '_blank') {
    window.open(url, type, 'noopener,noreferrer')
  } else if (type === '_window') {
    chrome.windows.create({ url: url, focused: true, state: 'maximized' })
  } else {
    getCurrentTab((tab) => {
      chrome.tabs.update(tab.id as number, { url: url, active: true })
    })
  }
}

// ==================== 书签元数据（打开时间）相关 ====================

/**
 * 通过 chrome.runtime.sendMessage 向 background 请求单个书签的元数据
 * 如果 background 不可用，回退到直接读取 chrome.storage.local
 * @param bookmarkId - 书签 ID
 */
async function getBookmarkMeta(bookmarkId: string): Promise<BookmarkMeta | null> {
  if (!bookmarkId) return null
  try {
    // 优先通过消息通信获取（数据由 background 维护）
    const response = (await chrome.runtime.sendMessage({
      action: 'getBookmarkMeta',
      bookmarkId,
    })) as BgMessageResponse<BookmarkMeta>
    if (response && response.success) {
      return response.data ?? null
    }
    return null
  } catch {
    // background 不可用时，直接读 storage 作为回退
    try {
      const result = await chrome.storage.local.get('bm_meta_' + bookmarkId)
      return (result['bm_meta_' + bookmarkId] as BookmarkMeta) || null
    } catch (storageErr) {
      console.error('getBookmarkMeta 回退存储读取失败:', storageErr)
      return null
    }
  }
}

/**
 * 批量获取所有书签的元数据
 */
async function getAllBookmarksMeta(): Promise<BookmarkMetaMap> {
  try {
    const response = (await chrome.runtime.sendMessage({
      action: 'getAllBookmarksMeta',
    })) as BgMessageResponse<BookmarkMetaMap>
    if (response && response.success) {
      return response.data || {}
    }
    return {}
  } catch {
    // background 不可用时回退到直接读 storage
    try {
      const all = await chrome.storage.local.get(null)
      const metaMap: BookmarkMetaMap = {}
      const prefix = 'bm_meta_'
      for (const [key, value] of Object.entries(all)) {
        if (key.startsWith(prefix)) {
          const bookmarkId = key.slice(prefix.length)
          metaMap[bookmarkId] = value as BookmarkMeta
        }
      }
      return metaMap
    } catch (storageErr) {
      console.error('getAllBookmarksMeta 回退存储读取失败:', storageErr)
      return {}
    }
  }
}

/**
 * 获取最近打开的书签列表
 * 先获取所有元数据，合并到书签列表，按 lastOpened 降序排序后取前 count 条
 * @param count - 需要返回的数量
 * @param allBookmarks - 全部书签（已展开为一维数组）
 */
async function getRecentOpenedBookmarks(
  count: number,
  allBookmarks: BookmarkTreeNode[]
): Promise<RecentOpenedBookmark[]> {
  if (!count || count <= 0) return []
  if (!allBookmarks || !allBookmarks.length) return []

  try {
    const metaMap = await getAllBookmarksMeta()

    // 合并书签与元数据，过滤出有打开记录的书签
    const merged: RecentOpenedBookmark[] = allBookmarks
      .filter((bm) => {
        // 只保留叶子书签（有 url）且有打开记录的
        return bm.url && metaMap[bm.id]
      })
      .map((bm) => {
        const meta = metaMap[bm.id]
        return {
          ...bm,
          lastOpened: meta.lastOpened,
          openCount: meta.openCount,
        }
      })

    // 按 lastOpened 降序排序
    merged.sort((a, b) => b.lastOpened - a.lastOpened)

    return merged.slice(0, count)
  } catch (err) {
    console.error('getRecentOpenedBookmarks 失败:', err)
    return []
  }
}

/**
 * 格式化相对时间（中文），用于展示 "最近打开"
 * @param timestamp - 毫秒时间戳
 * @returns 如 "刚刚"、"3分钟前"、"2小时前"、"昨天"、"3天前"、"2024/01/15"
 */
function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return '从未打开'

  const now = Date.now()
  const diff = now - timestamp

  // 未来时间（异常情况）
  if (diff < 0) return '刚刚'

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`

  // 超过一年显示具体日期
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

export {
  debounce,
  expandTree,
  getTreeByKey,
  setLocalCache,
  getLocalCache,
  getCurrentTab,
  getDate,
  getAllBookMarks,
  getRecentBookMarks,
  updateBookMark,
  createBookMark,
  removeBookMark,
  moveBookMark,
  openTabs,
  faviconURL,
  // 元数据相关
  getBookmarkMeta,
  getAllBookmarksMeta,
  getRecentOpenedBookmarks,
  formatRelativeTime,
}
