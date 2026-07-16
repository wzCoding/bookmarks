<template>
    <transition name="fade">
        <div ref="contextMenu" class="context-menu" :style="styles" v-show="showMenu" v-click-outside="onClickOutside"
            @mouseleave="startTimer" @mouseenter="clearTimer">
            <div class="menu-item" v-for="item in menuList" :key="item.label" :class="{ disable: item.disable }"
                :data-type="item.type" @click="onItemClick">
                <el-icon>
                    <component :is="item.icon" />
                </el-icon>
                <span class="menu-label">{{ item.label }}</span>
            </div>
        </div>
    </transition>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { ClickOutside as vClickOutside } from 'element-plus/es/directives/index.mjs'
import { InfoFilled, Management, DeleteFilled, CirclePlusFilled } from '@element-plus/icons-vue'
import { useLocaleStore } from '@/store/useLocaleStore'
import type { BookmarkTreeNode, ContextMenuItem, ContextMenuItemType, ContextMenuExposed } from '@/types'

const page = 'context'
const itemWidth = '112px'
const itemHeight = '36px'

interface Props {
  xAxis?: number
  yAxis?: number
  target?: BookmarkTreeNode
  disable?: string[]
}
const props = withDefaults(defineProps<Props>(), {
  xAxis: 0,
  yAxis: 0,
  target: () => ({} as BookmarkTreeNode),
  disable: () => [],
})

const emits = defineEmits<{
  openContextMenu: []
  destroyContextMenu: []
  contextMenuClick: [type: ContextMenuItemType, title: string, id: string]
}>()

const localeStore = useLocaleStore()
const showMenu = ref<boolean>(false)
const timer = ref<ReturnType<typeof setTimeout> | null>(null)
const infoItem: ContextMenuItem = { label: localeStore.locale.el[page].info, icon: InfoFilled, type: "info", disable: props.disable.includes("info") }
const createItem: ContextMenuItem = { label: localeStore.locale.el[page].create, icon: CirclePlusFilled, type: "create", disable: props.disable.includes("create") }
const editItem: ContextMenuItem = { label: localeStore.locale.el[page].edit, icon: Management, type: "edit", disable: props.disable.includes("edit") }
const deleteItem: ContextMenuItem = { label: localeStore.locale.el[page].delete, icon: DeleteFilled, type: "delete", disable: props.disable.includes("delete") }
const menuList: ContextMenuItem[] = [
    infoItem,
]
if (!['1', '2'].includes(props.target.id)) {
  menuList.push(editItem)
  if (props.target.children) {
    menuList.push(createItem)
    if (props.target.children.length === 0) {
      menuList.push(deleteItem)
    }
  } else {
    menuList.push(deleteItem)
  }
} else {
  menuList.push(createItem)
}
const width = Number(itemWidth.replace('px', ''))
const height = Number(itemHeight.replace('px', '')) * menuList.length
const styles = computed(() => {
    return {
        left: document.documentElement.clientWidth - props.xAxis < width ? `${props.xAxis - width}px` : `${props.xAxis}px`,
        top: document.documentElement.clientHeight - props.yAxis < height ? `${props.yAxis - height}px` : `${props.yAxis}px`
    }
});

const closeMenu = () => {
    showMenu.value = false;
    emits('destroyContextMenu');
}
const onItemClick = (e: MouseEvent) => {
  const type = (e.currentTarget as HTMLElement).dataset.type as ContextMenuItemType
  emits('contextMenuClick', type, props.target.title, props.target.id)
  closeMenu()
}
const onClickOutside = () => {
  closeMenu()
}
const startTimer = () => {
  clearTimer()
  timer.value = setTimeout(closeMenu, 2000)
}
const clearTimer = () => {
  if (timer.value) clearTimeout(timer.value)
}
defineExpose<ContextMenuExposed>({ showMenu, closeMenu })
</script>
<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s linear;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(-1rem);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-1rem);
}

.context-menu {
    position: absolute;
    z-index: 1000;
    background-color: var(--bg-card);
    color: var(--text-primary);
    box-shadow: 0 2px 12px 0 var(--shadow-active-color);
    border-radius: var(--border-radius);
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
    box-sizing: border-box;
    padding: var(--padding-tertiary);

    .menu-item {
        width: v-bind(itemWidth);
        height: v-bind(itemHeight);
        font-size: 0.85rem;
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.1s;
        width: 100%;
        padding: var(--padding-tertiary);
        box-sizing: border-box;
        border-radius: var(--border-radius);
        &.disable{
            pointer-events: none;
            color: var(--text-muted);
        }
        .menu-label {
            padding-left: var(--padding-tertiary);
        }

        &:hover:not(.disable) {
            color: var(--el-color-primary);
            background-color: var(--el-color-primary-hover);
        }
    }
}
</style>