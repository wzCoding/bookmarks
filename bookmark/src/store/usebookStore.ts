import { computed, reactive, ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import {
    getAllBookMarks,
    getRecentBookMarks,
    getTreeByKey,
    expandTree,
    getAllBookmarksMeta,
    formatRelativeTime,
} from '@/utils'
import type {
    BookmarkTreeNode,
    BookmarkMetaMap,
    BookmarkNodeWithMeta,
    TreeNode,
} from '@/types'

interface AllNodeItem {
    title: string
    id: string
    type: string
}

const defaultTitle = ''
const defaultId = '0'
const defaultShowTitle = '书签栏'
const defaultShowId = '1'
const defaultSize = 8
const defaultPage = 1

const tree = expandTree(await getAllBookMarks())
const recent = await getRecentBookMarks(10)

// 预加载全部书签元数据（打开时间等）
let initialMeta: BookmarkMetaMap = {}
try {
    initialMeta = await getAllBookmarksMeta()
} catch (e) {
    console.error('预加载书签元数据失败:', e)
}

export const usebookStore = defineStore('bookmarks', () => {
    let allNodes: BookmarkTreeNode[] = tree

    // 书签展示相关
    const parentId: Ref<string> = ref(defaultId)
    const currentTitle: Ref<string> = ref(defaultShowTitle)

    // ==================== 元数据（打开时间）相关 ====================
    const bookmarkMetaMap: Ref<BookmarkMetaMap> = ref(initialMeta)

    const currentNodes: Ref<BookmarkNodeWithMeta[]> = ref(
        mergeMetaToNodes(getFolder(defaultShowId)?.children ?? [])
    )
    const recentNodes: Ref<BookmarkNodeWithMeta[]> = ref(mergeMetaToNodes(recent))

    /**
     * 将 bookmarkMetaMap 中的 lastOpened 合并到节点数组，添加 recentOpen 字段
     * @param nodes - 书签节点数组
     * @returns 合并后的节点数组（新数组，不修改原数组）
     */
    function mergeMetaToNodes(nodes: BookmarkTreeNode[] | undefined): BookmarkNodeWithMeta[] {
        if (!nodes || !nodes.length) return []
        const metaMap = bookmarkMetaMap.value
        return nodes.map((node) => {
            const meta = metaMap[node.id]
            return {
                ...node,
                recentOpen: meta ? meta.lastOpened : null,
                openCount: meta ? meta.openCount : 0,
            }
        })
    }

    /**
     * 加载全部书签元数据（从 chrome.storage.local / background）
     * 通常在初始化时调用，也可手动调用以刷新数据
     */
    async function loadBookmarkMeta(): Promise<void> {
        try {
            const meta = await getAllBookmarksMeta()
            bookmarkMetaMap.value = meta
            // 元数据更新后同步刷新列表
            refreshRecentOpened()
            refreshCurrentNodes()
        } catch (err) {
            console.error('加载书签元数据失败:', err)
        }
    }

    /**
     * 获取指定书签节点的 lastOpened 展示文本
     * @param node - 书签节点（至少包含 id）
     * @returns 如 "3分钟前"、"昨天"
     */
    function getNodeLastOpenedText(node: { id: string } | undefined): string {
        if (!node || !node.id) return '从未打开'
        const meta = bookmarkMetaMap.value[node.id]
        if (!meta || !meta.lastOpened) return '从未打开'
        return formatRelativeTime(meta.lastOpened)
    }

    /**
     * 获取指定书签节点的打开次数
     * @param node
     */
    function getNodeOpenCount(node: { id: string } | undefined): number {
        if (!node || !node.id) return 0
        const meta = bookmarkMetaMap.value[node.id]
        return meta ? meta.openCount : 0
    }

    // 最近打开的书签列表（按 lastOpened 降序，基于 allNodes + bookmarkMetaMap）
    const recentOpenedNodes: Ref<BookmarkNodeWithMeta[]> = ref([])

    /** 刷新"最近打开的书签"列表 */
    function refreshRecentOpened(): void {
        const metaMap = bookmarkMetaMap.value
        const result: BookmarkNodeWithMeta[] = allNodes
            .filter((bm) => bm.url && metaMap[bm.id])
            .map((bm) => {
                const meta = metaMap[bm.id]
                return {
                    ...bm,
                    recentOpen: meta.lastOpened,
                    openCount: meta.openCount,
                }
            })
        result.sort((a, b) => {
            const aTime = a.recentOpen ?? 0
            const bTime = b.recentOpen ?? 0
            return bTime - aTime
        })
        recentOpenedNodes.value = result
    }

    /** 刷新 currentNodes，重新合并元数据 */
    function refreshCurrentNodes(): void {
        currentNodes.value = mergeMetaToNodes(currentNodes.value)
    }

    /**
     * 记录书签打开事件（更新本地 metaMap 并刷新 UI）
     * 与 background 的 storage 持久化并行，本方法负责前端即时响应
     */
    function recordBookmarkOpen(id: string): void {
        if (!id) return
        const now = Date.now()
        const existing = bookmarkMetaMap.value[id]
        bookmarkMetaMap.value = {
            ...bookmarkMetaMap.value,
            [id]: {
                lastOpened: now,
                openCount: existing ? existing.openCount + 1 : 1,
            },
        }
        refreshCurrentNodes()
        refreshRecentOpened()
    }

    // 初始化时构建"最近打开"列表
    refreshRecentOpened()

    // 分页相关
    const pageSize: Ref<number> = ref(defaultSize)
    const currentPage: Ref<number> = ref(defaultPage)

    interface PageCache {
        [key: string]: number
    }

    const pageCache: PageCache = reactive({
        [defaultShowId]: defaultPage,
    })

    // 当前分页的书签列表
    const pageNodes = computed(() => {
        const startIndex = (currentPage.value - 1) * pageSize.value
        const endIndex = startIndex + pageSize.value
        return currentNodes.value.slice(startIndex, endIndex)
    })

    const total = allNodes.length

    const currentTotal = computed(() => {
        return currentNodes.value.length
    })

    const totalPage = computed(() => {
        return Math.ceil(currentTotal.value / pageSize.value)
    })

    function initNodes(nodes: BookmarkTreeNode[], id: string): void {
        allNodes = nodes
        currentNodes.value = mergeMetaToNodes(getFolder(id)?.children ?? [])
        // 书签数据变更后刷新"最近打开"列表
        refreshRecentOpened()
    }

    function getFolder(id: string): BookmarkTreeNode | undefined {
        if (!id) return undefined
        return allNodes.filter((item) => item.id === id)[0]
    }

    function getTreeNodes(key: string): TreeNode[] {
        return getTreeByKey(allNodes, defaultId, key)
    }

    function getNodeById(id: string): BookmarkTreeNode | undefined {
        if (!id) return undefined
        return allNodes.filter((item) => item.id === id)[0]
    }

    function getNodeByTitle(title: string): BookmarkTreeNode[] | undefined {
        if (!title) return undefined
        return allNodes.filter((item) => item.title.includes(title))
    }

    // 获取当前展示书签列表
    function getCurrentNodes(id: string, initPage?: boolean): void {
        if (!id) return

        const folder = getFolder(id)
        currentNodes.value = mergeMetaToNodes(folder?.children ?? [])
        currentTitle.value =
            !folder?.title && folder?.id === '0' ? defaultTitle : (folder?.title ?? defaultTitle)
        parentId.value = folder?.parentId ? folder.parentId : defaultShowId

        // 初始化分页参数
        if (initPage) {
            pageChange(defaultPage)
            sizeChange(defaultSize)
        } else {
            pageCache[id] ? pageChange(pageCache[id]) : (pageCache[id] = defaultPage)
        }
    }



    function getAllNodes(id: string, result: AllNodeItem[] = []): AllNodeItem[] {
        if (!id) return []
        const node = allNodes.filter((item) => item.id === id)[0]
        if (node && node.parentId) {
            result.push({
                title: node.title,
                id: node.id,
                type: node.children ? 'folder' : 'bookmark',
            })
            getAllNodes(node.parentId, result)
        }
        return result
    }

    function sizeChange(size: number): void {
        pageSize.value = size
    }

    function pageChange(page: number): void {
        currentPage.value =
            page < 1 ? 1 : page > totalPage.value ? totalPage.value : page
    }

    // 监听添加书签事件
    chrome.bookmarks.onCreated.addListener((id, node) => {
        console.log('onCreate', id)
        chrome.bookmarks.getTree().then((result) => {
            initNodes(expandTree(result), node.parentId ?? defaultId)
        })
    })

    // 监听删除书签事件
    chrome.bookmarks.onRemoved.addListener((id, removeNode) => {
        console.log('onRemove', id)
        chrome.bookmarks.getTree().then((result) => {
            initNodes(expandTree(result), removeNode.parentId ?? defaultId)
        })
    })

    return {
        currentTitle,
        currentNodes,
        currentTotal,
        currentPage,
        totalPage,
        pageSize,
        pageCache,
        parentId,
        pageNodes,
        total,
        allNodes,
        recentNodes,
        // 元数据相关
        bookmarkMetaMap,
        recentOpenedNodes,
        loadBookmarkMeta,
        recordBookmarkOpen,
        refreshRecentOpened,
        getNodeLastOpenedText,
        getNodeOpenCount,
        initNodes,
        getCurrentNodes,
        getNodeById,
        getNodeByTitle,
        getAllNodes,
        getTreeNodes,
        sizeChange,
        pageChange,
    }
})
