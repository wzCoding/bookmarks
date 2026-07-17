<template>
  <Transition name="message-fade" @after-leave="onDestroy">
    <div v-if="visible" class="m-message" :class="`m-message--${type}`">
      <!-- 图标 -->
      <svg class="m-message__icon" viewBox="0 0 24 24" v-html="iconPath"></svg>
      <!-- 文字 -->
      <span class="m-message__content">{{ message }}</span>
      <!-- 关闭按钮 -->
      <svg
        v-if="showClose"
        class="m-message__close"
        viewBox="0 0 24 24"
        @click.stop="close"
      >
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
      </svg>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

export type MessageType = 'success' | 'warning' | 'error' | 'info'

const props = withDefaults(defineProps<{
  /** 消息类型 */
  type: MessageType
  /** 消息文本 */
  message: string
  /** 自动关闭延时（毫秒），0 表示不自动关闭 */
  duration?: number
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 关闭回调 */
  onClose?: () => void
  /** 销毁回调（动画结束后触发） */
  onDestroy?: () => void
}>(), {
  duration: 3000,
  showClose: false,
})

const visible = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null

/** SVG 图标路径映射 */
const iconPath = computed(() => {
  const paths: Record<MessageType, string> = {
    success: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--el-color-primary)"/>',
    warning: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#e6a23c"/>',
    error: '<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="#f56c6c"/>',
    info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#909399"/>',
  }
  return paths[props.type] ?? paths.info
})

/** 关闭消息 */
function close() {
  visible.value = false
  props.onClose?.()
}

onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(close, props.duration)
  }
})

// 组件卸载时清理定时器
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

defineExpose({ close })
</script>

<style lang="scss" scoped>
.m-message {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  min-width: 200px;
  max-width: 300px;
  background: var(--bg-page);
  border-radius: 6px;
  box-shadow: 0 2px 12px var(--shadow-color);
  font-size: 14px;
  line-height: 1.5;
  pointer-events: all;
  margin: 4px 0;
}

.m-message__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.m-message__content {
  flex: 1;
  color: var(--text-primary);
  word-break: break-word;
}

.m-message__close {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  cursor: pointer;
  color: #c0c4cc;
  transition: color 0.2s;

  &:hover {
    color: #909399;
  }
}

// ========== 过渡动画 ==========
.message-fade-enter-active {
  transition: all 0.3s ease-out;
}

.message-fade-leave-active {
  transition: all 0.2s ease-in;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
