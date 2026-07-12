// ==================== 书签相关核心类型 ====================

/** Chrome bookmarks API 原始书签节点 */
export interface BookmarkTreeNode {
  id: string
  parentId?: string
  index?: number
  url?: string
  title: string
  dateAdded?: number
  dateGroupModified?: number
  dateLastUsed?: number
  dateLastModified?: number
  children?: BookmarkTreeNode[]
}

/** 书签元数据（打开时间追踪） */
export interface BookmarkMeta {
  lastOpened: number
  openCount: number
}

/** 合并了元数据的书签节点（currentNodes 中使用的） */
export interface BookmarkNodeWithMeta extends BookmarkTreeNode {
  recentOpen: number | null
  openCount: number
}

/** 合并了元数据的书签节点（最近打开列表使用的，使用 lastOpened 字段） */
export interface RecentOpenedBookmark extends BookmarkTreeNode {
  lastOpened: number
  openCount: number
}

/** 合并元数据的书签节点映射表 */
export type BookmarkMetaMap = Record<string, BookmarkMeta>

// ==================== 打开链接相关 ====================

/** openTabs 参数 */
export interface OpenTabsOption {
  type: '_self' | '_blank' | '_window'
  url: string | null
  id?: string
}

// ==================== 树结构相关 ====================

/** getTreeByKey 返回的树节点 */
export interface TreeNode {
  title: string
  id: string
  parentId?: string
  children?: TreeNode[]
}

// ==================== 表单相关（forms.vue 使用） ====================

/** 表单选项（select/radio） */
export interface FormOption {
  label: string
  value: string
}

/** 表单项配置 */
export interface FormItem {
  label: string
  name: string
  type?: 'input' | 'select' | 'treeSelect' | 'number' | 'radio'
  placeholder?: string
  defaultValue?: string | number
  show?: boolean
  required?: boolean
  requireMessage?: string
  disable?: boolean
  options?: FormOption[]
  tree?: TreeNode[]
  min?: number
  max?: number
  props?: Record<string, unknown>
  validator?: (rule: unknown, value: unknown, callback: (error?: Error) => void) => void | Promise<void>
  onChange?: (form: Record<string, unknown>) => void
  onInput?: (param: unknown) => void
  nodeClick?: (id: string) => void
}

// ==================== 下拉菜单 / 右键菜单项类型 ====================

/** 下拉菜单项（bookmark.vue 中 openType 下拉） */
export interface DropdownItem {
  label: string
  icon: unknown // Vue 组件
  type: '_self' | '_blank' | '_window'
  id: number
}

/** 右键菜单项类型 */
export type ContextMenuItemType = 'info' | 'create' | 'edit' | 'delete'

/** 右键菜单项（contextMenu.vue） */
export interface ContextMenuItem {
  label: string
  icon: unknown // Vue 组件
  type: ContextMenuItemType
  disable: boolean
}

// ==================== 国际化相关类型 ====================

/** 国际化文本片段（edit.tips 数组项） */
export interface LocaleTipItem {
  title: string
  text: string
}

/** 国际化 el 子对象（传递给组件的 locale prop） */
export interface LocaleElData {
  emptyText: string
  pagination: Record<string, string>
  bookmarkHeader: Record<string, string>
  context: Record<string, string>
  bookmarkCard: Record<string, string>
  info: Record<string, string>
  edit: Record<string, string | LocaleTipItem[]>
  create: Record<string, string>
  delete: Record<string, string>
  setting: Record<string, string>
  recent: Record<string, string>
}

/** 国际化数据结构（locale.js 中的 locales 对象） */
export interface LocaleData {
  name: string
  el: LocaleElData
}

/** 国际化语言映射表 */
export type LocaleMap = Record<string, LocaleData>

// ==================== 路由参数类型 ====================

/** 路由 params */
export interface RouteParams {
  id: string
}

// ==================== 消息通信类型（background.js 相关） ====================

/** background 消息请求 */
export interface BgMessageRequest {
  action: 'getBookmarkMeta' | 'getAllBookmarksMeta' | 'recordBookmarkOpen'
  bookmarkId?: string
}

/** background 消息响应 */
export interface BgMessageResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// ==================== 右键菜单 Props ====================

/** contextMenu 组件 Props */
export interface ContextMenuProps {
  xAxis: number
  yAxis: number
  target: BookmarkTreeNode
  disable?: string[]
}

// ==================== 打开书签链接参数（bookmark.vue emit） ====================

/** 打开书签链接的参数 */
export interface OpenUrlParam {
  id: string
  parentId: string | null
  url: string | null
  type: '_self' | '_blank' | '_window'
}

// ==================== 右键菜单暴露方法类型 ====================

/** 上下文菜单暴露的方法 */
export interface ContextMenuExposed {
  showMenu: { value: boolean }
  closeMenu: () => void
}

// ==================== 设置相关 ====================

/** 设置变更任务 */
export interface SettingTask {
  name: 'toggleTheme' | 'toggleLanguage'
  value: string
}

// ==================== 表单辅助类型 ====================

/** 表单提交数据 */
export type FormData = Record<string, string | number>

/** 表单验证规则 */
export interface FormRule {
  required: boolean
  message?: string
  validator?: (rule: unknown, value: unknown, callback: (error?: Error) => void) => void
  trigger: string
}

/** Element Plus 表单实例类型 */
export interface ElFormInstance {
  validate: (callback: (valid: boolean) => void) => Promise<void>
  resetFields: () => void
  clearValidate: (fields?: string | string[]) => Promise<void>
}

// ==================== 搜索菜单相关（header.vue） ====================

/** 搜索菜单项 */
export interface SearchMenuItem {
  label: string
  icon: unknown
  type: string
}

