<template>
    <div class="book-home" @[dynamicScroll]="onScroll">
        <VueDraggable ref="drag" v-model="currentMarks" @end="onDragEnd" target=".book-transition" class="book-content">
            <TransitionGroup tag="div" name="fade" class="book-transition">
                <BookMark v-for="bookmark in pageMarks" :key="bookmark.id" :bookmark="bookmark" @openUrl="openBookMark"
                    @openContextMenu="openMenu">
                </BookMark>
            </TransitionGroup>
        </VueDraggable>
        <BookFooter :page-size="pageSize" :current-page="currentPage" :total="totalNum" :locale="i18nStore.locale"
            @currentChange="pageChange" @sizeChange="sizeChange"></BookFooter>
    </div>
</template>

<script setup>
import { createVNode, ref, render } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usebookStore } from '@/store/usebookStore';
import { usei18nStore } from '@/store/usei18nStore';
import { VueDraggable } from 'vue-draggable-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { openTabs } from '@/utils/index';
import BookMark from '@/components/bookmark.vue';
import BookFooter from '@/components/footer.vue';
import contextMenuTemplate from '@/components/contextMenu.vue';

let contextMenu = null;
const i18nStore = usei18nStore();
const bookStore = usebookStore();
const router = useRouter();
const dynamicScroll = ref();
const drag = ref();
const {
    currentMarks,
    currentTitle,
    currentPage,
    totalNum,
    pageSize,
    pageMarks,
} = storeToRefs(bookStore);
//分页回调方法
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
        bookStore.getCurrentMarks(param.id, true);
    }
}

//右键点击打开contextMenu
const openMenu = (e, id) => {
    if (contextMenu) {
        contextMenu.closeMenu();
    }
    contextMenu = createContextMenu(e.clientX, e.clientY);
    initContextMenu(e.currentTarget, id);
}
//创建右键contextMenu
const createContextMenu = (x, y) => {
    const props = {
        xAxis: x,
        yAxis: y,
        onContextMenuClick: onContextMenuClick,
        onDestroyContextMenu: () => {
            initContextMenu();
            render(null, container);
        },
    }
    const container = document.createElement("div");
    const vnode = createVNode(contextMenuTemplate, props);

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
const initContextMenu = (target, id) => {
    dynamicScroll.value = target ? "scroll" : null;
    contextMenu.id = target ? id : null;
    target ? target.classList.toggle("active") : contextMenu.target.classList.toggle("active");
    contextMenu.target = target ? target : null;
}
//在这里处理contextMenu点击事件
const onContextMenuClick = (type) => {
    if (type !== "delete") {
        router.push({
            name: type,
            params: {
                id: contextMenu.id,
            }
        })
    } else {
        ElMessageBox.confirm(`确定删除书签 '${currentTitle.value}' 吗？`, "提示", {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            ElMessage({
                type: 'success',
                message: `删除书签 '${currentTitle.value}' 成功`,
            })
        }).catch(error=>{
            console.log(error)
        })
    }
}

//拖拽结束调用chrome Api跟新书签
const onDragEnd = (e) => {
    console.log(e)
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
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    overflow-y: auto;
    overflow-x: hidden;

    .book-content {
        position: inherit;
        width: 100%;
    }

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
</style>
