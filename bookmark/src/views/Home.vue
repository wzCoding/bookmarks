<template>
    <div class="book-home" @[dynamicScroll]="onScroll">
        <div v-show="currentNodes.length" class="book-content">
            <VueDraggable ref="drag" v-model="currentNodes" @end="onDragEnd" target=".book-transition"
                class="book-draggable">
                <TransitionGroup tag="div" name="fade" class="book-transition">
                    <BookMark v-for="bookmark in pageNodes" :key="bookmark.id" :bookmark="bookmark" :locale="locale.el"
                        @openUrl="openBookMark" @openContextMenu="openMenu">
                    </BookMark>
                </TransitionGroup>
            </VueDraggable>
            <BookFooter :page-size="pageSize" :current-page="currentPage" :total="currentTotal" :locale="locale.el"
                @currentChange="pageChange" @sizeChange="sizeChange"></BookFooter>
        </div>
        <el-empty v-show="!currentNodes.length" class="book-empty" :description="locale.el.emptyText" />
    </div>
</template>

<script setup lang="ts">
import { createVNode, ref, render } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usebookStore } from '@/store/usebookStore'
import { useLocaleStore } from '@/store/useLocaleStore'
import { VueDraggable } from 'vue-draggable-plus'
import ElMessageBox from 'element-plus/es/components/message-box/index.mjs'
import ElMessage from 'element-plus/es/components/message/index.mjs'
import { removeBookMark, moveBookMark, openTabs, expandTree } from '@/utils/index'
import BookMark from '@/components/bookmark.vue'
import BookFooter from '@/components/footer.vue'
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
const drag = ref<InstanceType<typeof VueDraggable> | null>(null)
const { currentNodes, currentPage, currentTotal, pageSize, pageNodes } = storeToRefs(bookStore)
const { locale } = storeToRefs(localeStore)

const pageChange = (page: number) => {
  bookStore.pageChange(page)
}
const sizeChange = (size: number) => {
  bookStore.sizeChange(size)
}

//打开书签卡片
const openBookMark = (param: OpenUrlParam) => {
  if (param.url) {
    openTabs({ type: param.type, url: param.url!, id: param.id })
    bookStore.recordBookmarkOpen(param.id)
  } else {
    bookStore.pageCache[param.parentId!] = currentPage.value
    bookStore.getCurrentNodes(param.id, true)
  }
}

//右键点击打开contextMenu
const openMenu = (e: MouseEvent, bookmark: BookmarkTreeNode) => {
  if (contextMenu) {
    contextMenu.closeMenu()
  }
  contextMenu = createContextMenu(e.clientX, e.clientY, bookmark)
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
  } else {
    const deleteLocale = localeStore.locale.el.delete
    const tip = deleteLocale.tip.replace('{bookmark}', title)
    const node = bookStore.getNodeById(id)
    if (!node?.parentId) return
    const parentId = node.parentId
    ElMessageBox.confirm(tip, deleteLocale.pageTitle, {
      confirmButtonText: deleteLocale.confirmText,
      cancelButtonText: deleteLocale.cancelText,
      type: 'warning',
    })
      .then(() => {
        removeBookMark(id, () => {
          chrome.bookmarks.getTree().then((result) => {
            bookStore.initNodes(expandTree(result), parentId)
          })
          ElMessage({
            type: 'success',
            message: deleteLocale.successTip,
          })
        })
      })
      .catch((error: Error) => {
        console.log(error)
      })
  }
}

//拖拽结束调用chrome Api跟新书签
// eslint-disable-next-line
const onDragEnd = (e: any) => {
  const oldIdx = e.oldIndex as number | undefined
  const newIdx = e.newIndex as number | undefined
  if (oldIdx === undefined || newIdx === undefined) return
  const movedNode = currentNodes.value[oldIdx]
  if (!movedNode) return
  const node = bookStore.getNodeById(movedNode.id)
  if (!node?.parentId) return
  const options = {
    index: newIdx,
    parentId: node.parentId,
  }
  moveBookMark(movedNode.id, options)
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

.book-home {
    position: relative;
    height: 100%;
    background-color: var(--bg-color);
    .book-content {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        overflow-y: auto;
        overflow-x: hidden;

        .book-draggable {
            width: 100%;

            .book-transition {
                width: calc(100% - 1rem);
                display: flex;
                justify-content: flex-start;
                align-items: flex-start;
                flex-wrap: wrap;
                position: relative;
                padding: var(--content-padding);
                gap: var(--content-gap);
            }
        }
    }

    .book-empty {
        height: 100%;
    }
}
</style>
