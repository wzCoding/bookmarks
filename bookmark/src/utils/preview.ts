/**
 * 书签预览工具函数
 * 负责 URL 安全校验、iframe 兼容性检测、预览容器定位计算
 */

// ==================== URL 安全校验 ====================

/** 高危协议黑名单 */
const BLOCKED_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'chrome-extension:',
  'chrome:',
  'edge:',
  'about:',
]

/**
 * 校验 URL 是否安全可用于 iframe 预览
 * - 阻止 javascript: / data: 等危险协议
 * - 阻止 chrome-extension:// 等内部协议
 * @param url - 原始书签 URL
 * @returns 是否允许预览
 */
export function isSafePreviewUrl(url: string): boolean {
  if (!url) return false
  const lower = url.trim().toLowerCase()
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    // 检查是否以危险协议开头
    for (const protocol of BLOCKED_PROTOCOLS) {
      if (lower.startsWith(protocol)) return false
    }
    return false
  }
  return true
}

/**
 * 对 URL 进行安全清洗，返回可直接用于 iframe src 的值
 * @param url - 原始书签 URL
 * @returns 安全的 URL 字符串，不安全则返回空字符串
 */
export function sanitizePreviewUrl(url: string): string {
  if (!isSafePreviewUrl(url)) return ''
  try {
    const parsed = new URL(url.trim())
    // 仅允许 http / https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return ''
    }
    return parsed.toString()
  } catch {
    return ''
  }
}

// ==================== 预览容器定位 ====================

/** 预览容器尺寸（px） */
export const PREVIEW_SIZE = {
  width: 440,
  height: 320,
} as const

/** 预览容器与触发元素之间的间距（px） */
const PREVIEW_GAP = 8

/**
 * 定位计算结果
 * left / top 均为相对于 viewport 的 px 值
 */
export interface PreviewPosition {
  left: number
  top: number
}

/**
 * 根据触发元素位置计算预览容器的最佳定位
 * 优先显示在触发元素下方，空间不足则调整到上方/左侧
 * @param triggerEl - 触发预览的 DOM 元素
 * @param size - 可选，预览容器的实际尺寸（用于边界检测），默认使用 PREVIEW_SIZE
 * @returns 预览容器应放置的 { left, top } 坐标
 */
export function calcPreviewPosition(
  triggerEl: HTMLElement,
  size?: { width: number; height: number },
): PreviewPosition {
  if (!triggerEl) {
    return { left: 0, top: 0 }
  }

  const rect = triggerEl.getBoundingClientRect()
  const { width: pw, height: ph } = size ?? PREVIEW_SIZE
  const vw = window.innerWidth
  const vh = window.innerHeight

  // 水平方向：优先居中对齐触发元素
  let left = rect.left + rect.width / 2 - pw / 2
  // 边界修正：不超出视口
  const minLeft = 12
  const maxLeft = vw - pw - 12
  left = Math.max(minLeft, Math.min(left, maxLeft))

  // 垂直方向：优先显示在触发元素下方
  let top = rect.bottom + PREVIEW_GAP
  // 如果下方空间不足，显示在上方
  if (top + ph > vh - 12) {
    top = rect.top - ph - PREVIEW_GAP
  }
  // 最终兜底：不超出视口顶部
  if (top < 8) {
    top = 8
  }

  return { left, top }
}
