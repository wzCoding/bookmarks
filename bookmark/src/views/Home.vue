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
            <BookFooter :page-size="pageSize" :current-page="currentPage" :total="currentTotal" :locale="locale"
                @currentChange="pageChange" @sizeChange="sizeChange"></BookFooter>
        </div>
        <el-empty v-show="!currentNodes.length" class="book-empty" :description="locale.el.emptyText" />
    </div>
</template>

<script setup>
import { createVNode, ref, render } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usebookStore } from '@/store/usebookStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { VueDraggable } from 'vue-draggable-plus';
import { ElMessageBox, ElMessage, ElEmpty } from 'element-plus';
import { removeBookMark, moveBookMark, openTabs, expandTree } from '@/utils/index';
import BookMark from '@/components/bookmark.vue';
import BookFooter from '@/components/footer.vue';
import ContextMenuTemplate from '@/components/contextMenu.vue';

let contextMenu = null;
const bookStore = usebookStore();
const localeStore = useLocaleStore();
const router = useRouter();
const dynamicScroll = ref();
const drag = ref();
const {
    currentNodes,
    currentPage,
    currentTotal,
    pageSize,
    pageNodes,
} = storeToRefs(bookStore);
const { locale } = storeToRefs(localeStore);
const pageChange = (page) => {
    bookStore.pageChange(page);
}
const sizeChange = (size) => {
    bookStore.sizeChange(size);
}
//打开书签卡片
const openBookMark = (param) => {
    if (param.url) {
        openTabs(param);
    } else {
        bookStore.pageCache[param.parentId] = currentPage.value;
        bookStore.getCurrentNodes(param.id, true);
    }
}

//右键点击打开contextMenu
const openMenu = (e, bookmark) => {
    if (contextMenu) {
        contextMenu.closeMenu();
    }
    contextMenu = createContextMenu(e.clientX, e.clientY, bookmark);
    initContextMenu(e.currentTarget);
}
//创建右键contextMenu
const createContextMenu = (x, y, bookmark) => {
    const props = {
        xAxis: x,
        yAxis: y,
        target: bookmark,
        onContextMenuClick: onContextMenuClick,
        onDestroyContextMenu: () => {
            initContextMenu();
            render(null, container);
        },
    }
    const container = document.createElement("div");
    const vnode = createVNode(ContextMenuTemplate, props);

    render(vnode, container);
    document.body.appendChild(container.firstElementChild);

    const component = vnode.component;
    const { closeMenu } = component.exposed;
    component.exposed.showMenu.value = true;
    return {
        closeMenu
    }
}
//在这里初始化部分书签参数
const initContextMenu = (target) => {
    dynamicScroll.value = target ? "scroll" : null;
    target ? target.classList.toggle("active") : contextMenu.target.classList.toggle("active");
    contextMenu.target = target ? target : null;
}
//在这里处理contextMenu点击事件
const onContextMenuClick = (type, title, id) => {
    if (type !== "delete") {
        router.push({
            name: type,
            params: {
                id: id,
            }
        })
    } else {
        const deleteLocale = localeStore.locale.el.delete;
        const tip = deleteLocale.tip.replace("{bookmark}", title);
        const parentId = bookStore.getNodeById(id).parentId;
        ElMessageBox.confirm(tip, deleteLocale.pageTitle, {
            confirmButtonText: deleteLocale.confirmText,
            cancelButtonText: deleteLocale.cancelText,
            type: 'warning',
        }).then(() => {
            removeBookMark(id, (res) => {
                chrome.bookmarks.getTree().then(result => {
                    bookStore.initNodes(expandTree(result), parentId)
                })
                ElMessage({
                    type: 'success',
                    message: deleteLocale.successTip,
                })
            })
        }).catch(error => {
            console.log(error)
        })
    }
}

//拖拽结束调用chrome Api跟新书签
const onDragEnd = (e) => {
    const options = {
        index: e.newIndex,
        parentId: bookStore.getNodeById(e.item.id).parentId,
    };
    moveBookMark(e.item.id, options)
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
