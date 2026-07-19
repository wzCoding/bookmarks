<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="containerRef"
      class="bookmark-preview"
      :style="containerStyle"
      @mouseleave="handleMouseLeave"
    >
      <!-- 指向上方的箭头 -->
      <div class="preview-arrow"></div>

      <!-- 头部：favicon + 标题 + 关闭按钮 -->
      <div class="preview-header">
        <img
          :src="safeFavicon"
          class="preview-favicon"
          alt="favicon"
          @error="onFaviconError"
        />
        <span class="preview-title">{{ displayTitle }}</span>
        <button class="preview-close" :title="previewLocale.closePreview" @click="handleClose">
          &times;
        </button>
      </div>

      <!-- 主体内容 -->
      <div class="preview-body">
        <!-- 加载状态 -->
        <div v-if="previewState === 'loading'" class="preview-status">
          <span class="loading-spinner"></span>
          <span class="status-text">{{ previewLocale.loading }}</span>
        </div>

        <!-- iframe -->
        <iframe
          v-show="previewState === 'loaded'"
          ref="iframeRef"
          :src="safeUrl"
          class="preview-iframe"
          referrerpolicy="no-referrer"
          loading="lazy"
          @load="onIframeLoad"
        ></iframe>

        <!-- 被拦截 / 加载失败降级 -->
        <div v-if="previewState === 'blocked'" class="preview-status preview-blocked">
          <div class="blocked-info">
            <img :src="safeFavicon" class="blocked-favicon" alt="favicon" />
            <p class="blocked-title">{{ displayTitle }}</p>
            <p class="blocked-url">{{ safeUrl }}</p>
            <p class="blocked-hint">{{ previewLocale.blocked }}</p>
          </div>
          <el-button type="primary" size="small" @click="handleOpenInTab">
            {{ previewLocale.openInTab }}
          </el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { sanitizePreviewUrl, calcPreviewPosition, PREVIEW_SIZE } from '@/utils/preview'
import { faviconURL } from '@/utils/index'
import { useLocaleStore } from '@/store/useLocaleStore'

// ==================== Props & Emits ====================

interface Props {
  url: string
  title: string
  visible: boolean
  triggerEl: HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  url: '',
  title: '',
  visible: false,
  triggerEl: null,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'openInTab', url: string): void
}>()

// ==================== 本地状态 ====================

type PreviewState = 'loading' | 'loaded' | 'blocked'

const containerRef = ref<HTMLElement | null>(null)
const iframeRef = ref<HTMLIFrameElement | null>(null)
const previewState = ref<PreviewState>('loading')
const faviconFailed = ref(false)

/** iframe 加载超时定时器（8 秒未完成则视为被拦截） */
let loadTimeout: ReturnType<typeof setTimeout> | null = null

// ==================== 国际化 ====================

const localeStore = useLocaleStore()
const previewLocale = computed(() => localeStore.locale.el.preview)

// ==================== 计算属性 ====================

const safeUrl = computed(() => sanitizePreviewUrl(props.url))
const safeFavicon = computed(() => {
  if (faviconFailed.value || !props.url) return ''
  return faviconURL(props.url)
})
const displayTitle = computed(() => props.title || safeUrl.value || 'Bookmark')

function getPreviewSize(): { width: number; height: number } {
  const styles = getComputedStyle(document.documentElement)
  const w = parseInt(styles.getPropertyValue('--preview-width').trim())
  const h = parseInt(styles.getPropertyValue('--preview-height').trim())
  return {
    width: Number.isNaN(w) ? PREVIEW_SIZE.width : w,
    height: Number.isNaN(h) ? PREVIEW_SIZE.height : h,
  }
}

const containerStyle = computed(() => {
  if (!props.triggerEl || !props.visible) {
    return { left: '0px', top: '0px', opacity: 0, pointerEvents: 'none' as const }
  }
  const size = getPreviewSize()
  const pos = calcPreviewPosition(props.triggerEl, size)
  return {
    left: `${pos.left}px`,
    top: `${pos.top}px`,
    width: `var(--preview-width, ${PREVIEW_SIZE.width}px)`,
    height: `var(--preview-height, ${PREVIEW_SIZE.height}px)`,
  }
})

// ==================== 监听 visible 变化 ====================

watch(
  () => props.visible,
  async (isVisible) => {
    if (isVisible) {
      // 重置状态
      previewState.value = 'loading'
      // 启动超时检测
      startLoadTimeout()
      await nextTick()
    } else {
      clearLoadTimeout()
      previewState.value = 'loading'
    }
  }
)

// ==================== 超时检测 ====================

function startLoadTimeout(): void {
  clearLoadTimeout()
  loadTimeout = setTimeout(() => {
    // 8 秒后如果仍在加载中，视为被拦截
    if (previewState.value === 'loading') {
      previewState.value = 'blocked'
    }
  }, 8000)
}

function clearLoadTimeout(): void {
  if (loadTimeout !== null) {
    clearTimeout(loadTimeout)
    loadTimeout = null
  }
}

// ==================== 事件处理 ====================

function onIframeLoad(): void {
  clearLoadTimeout()
  previewState.value = 'loaded'
}

function onFaviconError(): void {
  faviconFailed.value = true
}

function handleClose(): void {
  emit('close')
}

function handleMouseLeave(): void {
  emit('close')
}

function handleOpenInTab(): void {
  if (safeUrl.value) {
    emit('openInTab', safeUrl.value)
  }
}

// ==================== 生命周期 ====================

onUnmounted(() => {
  clearLoadTimeout()
})
</script>

<style lang="scss" scoped>
// ==================== 容器 ====================
.bookmark-preview {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow:
    0 4px 24px var(--shadow-color),
    0 0 0 1px var(--border-color);
  animation: previewFadeIn 0.2s ease-out;
  width: var(--preview-width, 440px);
  height: var(--preview-height, 320px);
  pointer-events: auto;
}

// ==================== 箭头 ====================
.preview-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  width: 12px;
  height: 12px;
  background: var(--bg-card);
  border-left: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
  transform: translateX(-50%) rotate(45deg);
  z-index: 1;
}

// ==================== 头部栏 ====================
.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  flex-shrink: 0;
  background: var(--bg-sidebar);
  border-bottom: 1px solid var(--border-color);
}

.preview-favicon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 3px;
  object-fit: contain;
}

.preview-title {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.preview-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}

// ==================== 主体区域 ====================
.preview-body {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: var(--bg-sidebar); 
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  background: var(--bg-page);
}

// ==================== 状态覆盖层 ====================
.preview-status {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--bg-card);
  color: var(--text-muted);
  z-index: 2;
}

.status-text {
  font-size: 13px;
  font-weight: 400;
}

// ==================== 加载旋转动画 ====================
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--el-color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

// ==================== 被拦截降级 ====================
.preview-blocked {
  gap: 16px;
}

.blocked-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  padding: 0 24px;
}

.blocked-favicon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  margin-bottom: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  object-fit: contain;
}

.blocked-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.blocked-url {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.7;
}

.blocked-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin: 8px 0 0;
  line-height: 1.5;
}

// ==================== 关键帧动画 ====================
@keyframes previewFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
