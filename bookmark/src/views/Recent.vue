<template>
    <div class="book-recent" @[dynamicScroll]="onScroll">
        <div class="book-content">
            <BookMark v-for="bookmark in bookStore.recentOpenedNodes" :key="bookmark.id" :bookmark="bookmark" :locale="locale.el"
                @openUrl="openBookMark" @openContextMenu="openMenu">
            </BookMark>
        </div>
    </div>
</template>

<script setup lang="ts">
import { createVNode, ref, render } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usebookStore } from '@/store/usebookStore'
import { useLocaleStore } from '@/store/useLocaleStore'
import { openTabs } from '@/utils/index'
import BookMark from '@/components/bookmark.vue'
import ContextMenuTemplate from '@/components/contextMenu.vue'
import type { BookmarkTreeNode, OpenUrlParam, ContextMenuItemType } from '@/types'

interface ContextMenuHandle {
  closeMenu: () => void
  target?: HTMLElement | null
}

let contextMenu: ContextMenuHandle | null = null
const bookStore = usebookStore()
const localeStore = useLocaleStore()
const router = useRouter()
const dynamicScroll = ref<string | null>(null)
const { locale } = storeToRefs(localeStore)

//打开书签卡片
const openBookMark = (param: OpenUrlParam) => {
  if (param.url) {
    openTabs(param)
    bookStore.recordBookmarkOpen(param.id)
  } else {
    router.push('/')
    bookStore.getCurrentNodes(param.id, true)
  }
}

//右键点击打开contextMenu
const openMenu = (e: MouseEvent, bookmark: BookmarkTreeNode) => {
  if (contextMenu) {
    contextMenu.closeMenu()
  }
  contextMenu = createContextMenu(e.clientX, e.clientY, bookmark, ['create', 'edit', 'delete'])
  initContextMenu(e.currentTarget as HTMLElement)
}
//创建右键contextMenu
const createContextMenu = (x: number, y: number, bookmark: BookmarkTreeNode, disableList?: string[]) => {
  const props = {
    xAxis: x,
    yAxis: y,
    target: bookmark,
    disable: disableList,
    onContextMenuClick: onContextMenuClick,
    onDestroyContextMenu: () => {
      initContextMenu()
      render(null, container)
    },
  }
  const container = document.createElement('div')
  const vnode = createVNode(ContextMenuTemplate, props)

  render(vnode, container)
  document.body.appendChild(container.firstElementChild!)

  const component = vnode.component!
  const { closeMenu } = component.exposed as { closeMenu: () => void; showMenu: { value: boolean } }
  component.exposed!.showMenu.value = true
  return {
    closeMenu,
  }
}
//在这里初始化部分书签参数
const initContextMenu = (target?: HTMLElement | null) => {
  dynamicScroll.value = target ? 'scroll' : null
  if (target) {
    target.classList.toggle('active')
  } else if (contextMenu && contextMenu.target) {
    contextMenu.target.classList.toggle('active')
  }
  if (contextMenu) {
    contextMenu.target = target ? target : null
  }
}
//在这里处理contextMenu点击事件
const onContextMenuClick = (type: ContextMenuItemType, title: string, id: string) => {
  if (type !== 'delete') {
    router.push({
      name: type,
      params: {
        id: id,
      },
    })
  }
}
//监听页面滚动事件，关闭contextMenu
const onScroll = () => {
    if (contextMenu) {
        contextMenu.closeMenu();
    }
}
</script>
<style lang="scss" scoped>
.fade-move,
.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: scaleY(0.01) translate(30px, 0);
}

.fade-leave-active {
    position: absolute;
}

.book-recent {
    position: relative;
    height: 100%;
    background-color: var(--bg-color);
    overflow-y: auto;
    overflow-x: hidden;

    .book-content {
        position: relative;

        width: calc(100% - 1rem);
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
        position: relative;
        padding: var(--content-padding);
        gap: var(--content-gap);

        .bookmark-card {
            width: 100%;
        }
    }

    .book-empty {
        height: 100%;
    }
}
</style>
