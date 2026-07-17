import { createVNode, render } from 'vue'
import MessageComponent from './Message.vue'
import type { MessageType } from './Message.vue'

// ==================== 类型定义 ====================

/** Message 服务调用选项 */
export interface MessageServiceOptions {
  /** 消息类型 */
  type?: MessageType
  /** 消息文本 */
  message: string
  /** 自动关闭延时（毫秒），默认 3000，设为 0 不自动关闭 */
  duration?: number
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 关闭回调 */
  onClose?: () => void
}

/** Message 实例 */
export interface MessageInstance {
  /** 手动关闭 */
  close: () => void
}

/** 内部使用的消息项 */
interface MessageItem {
  id: number
  mountEl: HTMLDivElement
  vnode: ReturnType<typeof createVNode>
  close: () => void
}

// ==================== 内部状态 ====================

/** 容器 DOM（所有消息挂载于此） */
let containerEl: HTMLDivElement | null = null
/** 当前消息列表 */
const messageList: MessageItem[] = []
/** 自增 ID */
let seed = 0

/** 获取或创建消息容器 */
function getContainer(): HTMLDivElement {
  if (!containerEl) {
    containerEl = document.createElement('div')
    containerEl.className = 'm-message-container'
    containerEl.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
    `
    document.body.appendChild(containerEl)
  }
  return containerEl
}

/** 从列表中移除消息 */
function removeMessage(id: number): void {
  const idx = messageList.findIndex((item) => item.id === id)
  if (idx === -1) return
  const item = messageList[idx]
  messageList.splice(idx, 1)

  // 延迟销毁 DOM（等过渡动画结束）
  setTimeout(() => {
    render(null, item.mountEl)
    item.mountEl.remove()
    // 如果没有任何消息了，移除容器
    if (messageList.length === 0 && containerEl) {
      containerEl.remove()
      containerEl = null
    }
  }, 250)
}

// ==================== 服务式调用 ====================

/**
 * 以服务方式调用 Message
 *
 * @example
 * ```ts
 * MessageService({ type: 'success', message: '操作成功' })
 * MessageService.success('操作成功')
 * ```
 */
export function MessageService(options: MessageServiceOptions): MessageInstance
export function MessageService(options: string): MessageInstance
export function MessageService(options: MessageServiceOptions | string): MessageInstance {
  const opts: MessageServiceOptions =
    typeof options === 'string' ? { message: options } : options

  const {
    type = 'info',
    message,
    duration = 3000,
    showClose = false,
    onClose,
  } = opts

  const id = ++seed
  const container = getContainer()
  const mountEl = document.createElement('div')

  // 创建 VNode
  const vnode = createVNode(MessageComponent, {
    type,
    message,
    duration,
    showClose,
    onClose,
    onDestroy: () => removeMessage(id),
  })

  // 挂载
  render(vnode, mountEl)
  container.appendChild(mountEl)

  const instance: MessageInstance = {
    close: () => {
      if (vnode.component) {
        vnode.component.props.duration = 0 // 阻止自动关闭
        // 调用组件暴露的 close 方法
        const exposed = vnode.component.exposed as { close?: () => void } | undefined
        exposed?.close?.()
      }
    },
  }

  messageList.push({ id, mountEl, vnode, close: instance.close })

  return instance
}

// ==================== 快捷方法 ====================

MessageService.success = (message: string, duration?: number): MessageInstance =>
  MessageService({ type: 'success', message, duration })

MessageService.warning = (message: string, duration?: number): MessageInstance =>
  MessageService({ type: 'warning', message, duration })

MessageService.error = (message: string, duration?: number): MessageInstance =>
  MessageService({ type: 'error', message, duration })

MessageService.info = (message: string, duration?: number): MessageInstance =>
  MessageService({ type: 'info', message, duration })

/** 关闭所有消息 */
MessageService.closeAll = (): void => {
  messageList.forEach((item) => item.close())
}
