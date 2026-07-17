import { createVNode, render, Directive, App } from 'vue'
import LoadingComponent from './Loading.vue'

// ==================== 类型定义 ====================

/** Loading 服务调用选项 */
export interface LoadingServiceOptions {
  /** 挂载目标：CSS 选择器字符串 或 DOM 元素，默认挂载到 document.body */
  target?: string | HTMLElement
  /** 加载提示文字 */
  text?: string
  /** 遮罩背景色 */
  background?: string
  /** 是否全屏遮罩 */
  fullscreen?: boolean
  /** 是否锁定滚动（设置 body overflow: hidden） */
  lock?: boolean
}

/** Loading 实例 */
export interface LoadingInstance {
  /** 关闭 loading */
  close: () => void
  /** 动态更新提示文字 */
  setText: (text: string) => void
}

// ==================== 内部工具 ====================

/** 获取挂载容器 */
function resolveContainer(target?: string | HTMLElement): { container: HTMLElement; isBody: boolean } {
  if (!target) {
    return { container: document.body, isBody: true }
  }
  if (typeof target === 'string') {
    const el = document.querySelector<HTMLElement>(target)
    if (!el) {
      throw new Error(`[MLoading] 找不到目标元素: "${target}"`)
    }
    return { container: el, isBody: false }
  }
  return { container: target, isBody: false }
}

/** 确保父元素有定位上下文（loading 遮罩使用 absolute 定位） */
function ensureRelative(el: HTMLElement): void {
  const position = getComputedStyle(el).position
  if (position === 'static' || position === '') {
    el.style.position = 'relative'
  }
}

// ==================== 服务式调用 ====================

/**
 * 以服务方式调用 Loading
 *
 * @example
 * ```ts
 * const loading = LoadingService({ target: '.container', text: '加载中...', lock: true })
 * await someAsyncTask()
 * loading.close()
 * ```
 */
export function LoadingService(options: LoadingServiceOptions = {}): LoadingInstance {
  const { text, background, fullscreen = false, lock = false, target } = options
  const { container, isBody } = resolveContainer(target)

  // 锁定滚动
  if (lock && isBody) {
    document.body.style.overflow = 'hidden'
  }

  // 非 body 挂载时，确保父元素有定位上下文
  if (!isBody) {
    ensureRelative(container)
  }

  // 创建挂载容器
  const mountEl = document.createElement('div')
  mountEl.className = 'm-loading-container'

  // 创建 VNode
  const vnode = createVNode(LoadingComponent, {
    visible: true,
    fullscreen: fullscreen || isBody,
    text,
    background,
  })

  // 挂载
  render(vnode, mountEl)
  container.appendChild(mountEl)

  // 返回控制实例
  const instance: LoadingInstance = {
    close: () => {
      // 先设不可见触发过渡动画
      if (vnode.component) {
        vnode.component.props.visible = false
      }
      // 等过渡结束后移除 DOM
      setTimeout(() => {
        render(null, mountEl)
        mountEl.remove()
        // 恢复滚动
        if (lock && isBody) {
          document.body.style.overflow = ''
        }
      }, 350)
    },
    setText: (newText: string) => {
      if (vnode.component) {
        vnode.component.props.text = newText
      }
    },
  }

  return instance
}

// ==================== 指令式调用 ====================

/**
 * v-loading 指令
 *
 * @example
 * ```vue
 * <div v-loading="isLoading"></div>
 * <!-- 或带配置 -->
 * <div v-loading="{ loading: isLoading, text: '加载中...' }"></div>
 * ```
 */
export const vLoading: Directive<HTMLElement, boolean> = {
  mounted(el: HTMLElement, binding) {
    const isLoading = binding.value
    if (isLoading) {
      showLoading(el)
    }
  },

  updated(el: HTMLElement, binding) {
    const wasLoading = binding.oldValue ?? false
    const isLoading = binding.value

    if (isLoading && !wasLoading) {
      showLoading(el)
    } else if (!isLoading && wasLoading) {
      hideLoading(el)
    }
  },

  unmounted(el: HTMLElement) {
    hideLoading(el)
    delete (el as unknown as Record<string, unknown>)._mLoadingInstance
  },
}

/** 在元素上显示 loading */
function showLoading(el: HTMLElement): void {
  const elData = el as unknown as Record<string, unknown>

  if (elData._mLoadingInstance) return // 已经显示中

  ensureRelative(el)

  const mountEl = document.createElement('div')
  mountEl.className = 'm-loading-container'

  const vnode = createVNode(LoadingComponent, {
    visible: true,
    fullscreen: false,
  })

  render(vnode, mountEl)
  el.appendChild(mountEl)

  elData._mLoadingInstance = { mountEl, vnode }
}

/** 隐藏元素上的 loading */
function hideLoading(el: HTMLElement): void {
  const elData = el as unknown as Record<string, unknown>
  const instance = elData._mLoadingInstance as { mountEl: HTMLDivElement; vnode: ReturnType<typeof createVNode> } | undefined

  if (!instance) return

  // 触发过渡
  if (instance.vnode.component) {
    instance.vnode.component.props.visible = false
  }

  // 等过渡结束后移除
  setTimeout(() => {
    render(null, instance.mountEl)
    instance.mountEl.remove()
  }, 350)

  elData._mLoadingInstance = undefined
}

// ==================== 插件安装 ====================

/**
 * 作为 Vue 插件安装（注册 v-loading 全局指令 + 挂载 $loading 全局方法）
 */
export default {
  install(app: App) {
    app.directive('loading', vLoading)
    app.config.globalProperties.$loading = LoadingService
  },
}
