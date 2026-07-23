<template>
  <Transition name="loading-fade">
    <div
      v-show="visible"
      class="m-loading-mask"
      :class="{ 'is-fullscreen': fullscreen }"
      :style="{ backgroundColor: background }"
    >
      <div class="m-loading-spinner">
        <svg class="circular" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" />
        </svg>
        <p v-if="text" class="m-loading-text">{{ text }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** 是否可见 */
  visible: boolean
  /** 是否全屏遮罩（全屏时固定定位，非全屏时绝对定位） */
  fullscreen?: boolean
  /** 加载提示文字 */
  text?: string
  /** 遮罩背景色 */
  background?: string
}>(), {
  fullscreen: false,
  background: 'var(--shadow-color)',
})
</script>

<style lang="scss" scoped>
.m-loading-mask {
  position: absolute;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;

  &.is-fullscreen {
    position: fixed;
    z-index: 9999;
  }
}

.m-loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap);
}

.circular {
  width: 42px;
  height: 42px;
  animation: m-loading-rotate 2s linear infinite;
}

.circular .path {
  animation: m-loading-dash 1.5s ease-in-out infinite;
  stroke: var(--el-color-primary, #409eff);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
}

.m-loading-text {
  margin: 0;
  font-size: 14px;
  color: var(--el-color-primary, #409eff);
}

// ========== 过渡动画 ==========
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

// ========== 旋转动画 ==========
@keyframes m-loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes m-loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}
</style>
