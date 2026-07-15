<template>
  <svg
    v-if="svgContent"
    class="svg-icon"
    :width="size"
    :height="size"
    :fill="color"
    :style="{ color: color }"
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    v-html="svgContent"
  ></svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
    color?: string
  }>(),
  {
    size: 24,
    color: 'currentColor',
  }
)

// Vite: 构建时打包所有 SVG 为原始文本，按文件名索引
const svgModules = import.meta.glob('@/assets/icon/svg/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const svgContent = computed(() => {
  const filename = `${props.name}.svg`
  // 通过文件名后缀匹配，避免别名路径 vs 绝对路径格式不一致问题
  const [, raw] =
    Object.entries(svgModules).find(([key]) => key.endsWith(`/${filename}`)) ?? []
  if (!raw) {
    console.warn(`[SvgIcon] 图标 "${props.name}" 未找到`)
    return ''
  }
  // 提取 <svg>…</svg> 内部元素，外层标签由模板提供
  const match = raw.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
  return match ? match[1] : ''
})
</script>
