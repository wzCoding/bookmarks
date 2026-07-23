<template>
  <Teleport to="body">
    <Transition name="message-box-fade">
      <div v-if="visible" class="m-message-box-overlay" @click.self="handleCancel">
        <div class="m-message-box" :class="`m-message-box--${type}`">
          <!-- 头部 -->
          <div class="m-message-box__header">
            <!-- 图标 -->
            <svg class="m-message-box__icon" viewBox="0 0 24 24" v-html="iconSvg"></svg>
            <span class="m-message-box__title">{{ title }}</span>
          </div>

          <!-- 内容 -->
          <div class="m-message-box__content">
            <p class="m-message-box__message">{{ message }}</p>
            <!-- prompt 输入框 -->
            <input
              v-if="showInput"
              ref="inputRef"
              v-model="inputValue"
              class="m-message-box__input"
              :placeholder="inputPlaceholder"
              @keydown.enter="handleConfirm"
            />
          </div>

          <!-- 按钮 -->
          <div class="m-message-box__footer">
            <button class="m-button m-button--cancel" @click="handleCancel">
              {{ cancelButtonText }}
            </button>
            <button class="m-button m-button--confirm" :class="`m-button--${type}`" @click="handleConfirm">
              {{ confirmButtonText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

export type MessageBoxType = 'success' | 'warning' | 'error' | 'info'

const props = withDefaults(defineProps<{
  /** 是否可见 */
  visible: boolean
  /** 标题 */
  title?: string
  /** 消息文本 */
  message?: string
  /** 弹窗类型（影响图标） */
  type?: MessageBoxType
  /** 确认按钮文字 */
  confirmButtonText?: string
  /** 取消按钮文字 */
  cancelButtonText?: string
  /** 是否显示取消按钮（confirm 模式） */
  showCancel?: boolean
  /** 是否显示输入框（prompt 模式） */
  showInput?: boolean
  /** 输入框占位文字 */
  inputPlaceholder?: string
  /** 默认输入值 */
  inputDefaultValue?: string
}>(), {
  title: '提示',
  message: '',
  type: 'info',
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  showCancel: true,
  showInput: false,
  inputPlaceholder: '请输入',
  inputDefaultValue: '',
})

const emit = defineEmits<{
  confirm: [value?: string]
  cancel: []
}>()

const inputRef = ref<HTMLInputElement>()
const inputValue = ref(props.inputDefaultValue)

/** SVG 图标映射 */
const iconSvg = computed(() => {
  const paths: Record<MessageBoxType, string> = {
    success: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#67c23a"/>',
    warning: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#e6a23c"/>',
    error: '<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="#f56c6c"/>',
    info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#909399"/>',
  }
  return paths[props.type] ?? paths.info
})

function handleConfirm() {
  emit('confirm', props.showInput ? inputValue.value : undefined)
}

function handleCancel() {
  emit('cancel')
}

// prompt 模式下自动聚焦输入框
onMounted(() => {
  if (props.showInput) {
    nextTick(() => inputRef.value?.focus())
  }
})

defineExpose({ handleConfirm, handleCancel })
</script>

<style lang="scss" scoped>
// ========== 遮罩层 ==========
.m-message-box-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
}

// ========== 弹窗卡片 ==========
.m-message-box {
  width: 400px;
  max-width: calc(100vw - 40px);
  background: var(--bg-page-secondary);
  border-radius: 8px;
  box-shadow: 0 8px 32px var(--shadow-color);
  overflow: hidden;
}

// ========== 头部 ==========
.m-message-box__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 24px 12px;
}

.m-message-box__icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.m-message-box__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

// ========== 内容 ==========
.m-message-box__content {
  padding: 0 24px 20px;
}

.m-message-box__message {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
}

.m-message-box__input {
  width: 100%;
  margin-top: 12px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--el-color-primary);
  }
}

// ========== 按钮 ==========
.m-message-box__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 24px 20px;
}

.m-button {
  padding: 8px 20px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  background: var(--bg-page);
  color: var(--text-primary);

  &:hover {
    color: var(--el-color-primary);
    border-color: #c6e2ff;
    background: var(--el-color-primary-hover);
  }
}

.m-button--confirm {
  border: none;

  &.m-button--info,
  &.m-button--success {
    background: var(--el-color-primary);
    &:hover {color:var(--bg-card); background: var(--el-color-primary-hover); }
  }

  &.m-button--warning {
    background: #e6a23c;
    &:hover {color:var(--bg-card); background: #cf9236; }
  }

  &.m-button--error {
    background: #f56c6c;
    &:hover {color:var(--bg-card); background: #e06060; }
  }
}

// ========== 过渡动画 ==========
.message-box-fade-enter-active {
  transition: opacity 0.25s ease;

  .m-message-box {
    transition: transform 0.25s ease, opacity 0.25s ease;
  }
}

.message-box-fade-leave-active {
  transition: opacity 0.2s ease;

  .m-message-box {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
}

.message-box-fade-enter-from {
  opacity: 0;

  .m-message-box {
    transform: scale(0.9);
    opacity: 0;
  }
}

.message-box-fade-leave-to {
  opacity: 0;

  .m-message-box {
    transform: scale(0.9);
    opacity: 0;
  }
}
</style>
