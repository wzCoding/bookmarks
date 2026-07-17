import { createVNode, render } from 'vue'
import MessageBoxComponent from './MessageBox.vue'
import type { MessageBoxType } from './MessageBox.vue'

// ==================== 类型定义 ====================

/** MessageBox 选项 */
export interface MessageBoxServiceOptions {
  /** 弹窗类型（影响图标和确认按钮颜色） */
  type?: MessageBoxType
  /** 确认按钮文字 */
  confirmButtonText?: string
  /** 取消按钮文字 */
  cancelButtonText?: string
  /** 输入框占位文字（prompt 模式） */
  inputPlaceholder?: string
  /** 默认输入值（prompt 模式） */
  inputDefaultValue?: string
}

/** Prompt 调用返回值 */
export interface MessageBoxPromptResult {
  /** 用户输入的值 */
  value: string
}

// ==================== 核心实现 ====================

/**
 * 创建并显示 MessageBox
 * @returns Promise — confirm 时 resolve，cancel 时 reject
 */
function createMessageBox(
  message: string,
  title: string,
  options: MessageBoxServiceOptions & { showCancel?: boolean; showInput?: boolean },
): Promise<unknown> {
  const {
    type = 'info',
    confirmButtonText = '确定',
    cancelButtonText = '取消',
    showCancel = true,
    showInput = false,
    inputPlaceholder = '请输入',
    inputDefaultValue = '',
  } = options

  const mountEl = document.createElement('div')

  return new Promise<unknown>((resolve, reject) => {
    const vnode = createVNode(MessageBoxComponent, {
      visible: true,
      title,
      message,
      type,
      confirmButtonText,
      cancelButtonText,
      showCancel,
      showInput,
      inputPlaceholder,
      inputDefaultValue,
      onConfirm: (value?: string) => {
        destroy()
        resolve(value)
      },
      onCancel: () => {
        destroy()
        reject(new Error('cancel'))
      },
    })

    render(vnode, mountEl)
    document.body.appendChild(mountEl)

    function destroy() {
      // 先触发 visible = false 等待动画
      if (vnode.component) {
        vnode.component.props.visible = false
      }
      setTimeout(() => {
        render(null, mountEl)
        mountEl.remove()
      }, 250)
    }
  })
}

// ==================== 公开 API ====================

/**
 * 确认框 — 含确定/取消按钮
 *
 * @example
 * ```ts
 * MessageBoxService.confirm('确定删除该书签？', '删除确认', { type: 'warning' })
 *   .then(() => { ... })
 *   .catch(() => { ... })
 * ```
 */
export function confirm(
  message: string,
  title = '提示',
  options: MessageBoxServiceOptions = {},
): Promise<void> {
  return createMessageBox(message, title, { ...options, showCancel: true, showInput: false }) as Promise<void>
}

/**
 * 提示框 — 仅含确定按钮
 *
 * @example
 * ```ts
 * MessageBoxService.alert('操作成功', '提示', { type: 'success' })
 * ```
 */
export function alert(
  message: string,
  title = '提示',
  options: MessageBoxServiceOptions = {},
): Promise<void> {
  return createMessageBox(message, title, { ...options, showCancel: false, showInput: false, confirmButtonText: options.confirmButtonText ?? '确定' }) as Promise<void>
}

/**
 * 输入框 — 含输入框+确定/取消按钮
 *
 * @example
 * ```ts
 * const { value } = await MessageBoxService.prompt('请输入书签名', '新建书签')
 * ```
 */
export function prompt(
  message: string,
  title = '提示',
  options: MessageBoxServiceOptions = {},
): Promise<MessageBoxPromptResult> {
  return createMessageBox(message, title, { ...options, showCancel: true, showInput: true }) as Promise<MessageBoxPromptResult>
}

/**
 * 导出为统一服务对象（与 ElMessageBox API 对齐）
 */
export const MessageBoxService = {
  confirm,
  alert,
  prompt,
}
