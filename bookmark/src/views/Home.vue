<template>
    <div class="book-home" @[dynamicScroll]="onScroll">
        <VueDraggable ref="drag" v-model="currentMarks" @start="onDragStart" @end="onDragEnd" target=".book-transition"
            class="book-content">
            <TransitionGroup tag="div" name="fade" class="book-transition">
                <BookMark v-for="bookmark in pageMarks" :key="bookmark.id" :bookmark="bookmark" @openUrl="openBookMark"
                    @openContextMenu="openMenu">
                </BookMark>
            </TransitionGroup>
        </VueDraggable>
        <BookFooter :page-size="pageSize" :current-page="currentPage" :total="totalNum" :locale="i18nStore.locale"
            @currentChange="currentChange" @sizeChange="sizeChange"></BookFooter>
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
import BookMark from '@/components/bookmark.vue';
import BookFooter from '@/components/footer.vue';
import contextMenu from '@/components/contextMenu.vue';

const i18nStore = usei18nStore();
const bookStore = usebookStore();
const { currentMarks, currentPage, totalNum, pageSize, pageMarks } = storeToRefs(bookStore);
const drag = ref();
const dynamicScroll = ref();
let menuInstance = null;
let currentMark = null;
const currentChange = (page) => {
    bookStore.pageChange(page);
}
const sizeChange = (size) => {
    bookStore.sizeChange(size);
}
const openBookMark = (param) => {
    if (param.url) {
        if (param.openType !== "_newwindow") {
            window.open(param.url, param.openType, "noopener,noreferrer");
        } else {
            chrome.windows.create({
                focused: true,
                url: param.url,
                state: "maximized",
            })
        }
    } else {
        console.log(param)
        bookStore.getCurrentMarks(param.id, true);
    }
}
const createMenu = (x, y) => {
    const props = {
        xAxis: x,
        yAxis: y,
        onContextMenuClick: onContextMenuClick,
        onDestroyContextMenu: () => {
            dynamicScroll.value = null;
            currentMark.classList.remove("active")
            currentMark = null
            render(null, container);
        },
    }
    const container = document.createElement("div");
    const vnode = createVNode(contextMenu, props);

    render(vnode, container);
    document.body.appendChild(container.firstElementChild);

    const component = vnode.component;
    const { closeMenu } = component.exposed;
    component.exposed.showMenu.value = true;
    return {
        closeMenu
    }
}
const openMenu = (e) => {
    if (menuInstance) {
        menuInstance.closeMenu();
    }
    dynamicScroll.value = "scroll"
    currentMark = e.currentTarget;
    currentMark.classList.add("active")
    menuInstance = createMenu(e.clientX, e.clientY);
}
const router = useRouter()
const onContextMenuClick = (type) => {
    if (type !== "delete") {
        router.push(`/${type}`)
    } else {
        ElMessageBox.confirm("确定删除该书签吗？", "提示", {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
        })
            .catch(() => {
                ElMessage({
                    type: 'info',
                    message: '取消删除',
                })
            })
    }
}
const onDragStart = (e) => {

}
const onDragEnd = (e) => {

}
const onScroll = () => {
    if (menuInstance) {
        menuInstance.closeMenu();
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
