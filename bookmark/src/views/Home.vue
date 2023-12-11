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
const router = useRouter();
const { currentMarks, currentTitle, currentPage, totalNum, pageSize, pageMarks } = storeToRefs(bookStore);
const drag = ref();
const dynamicScroll = ref();
let currentInstance = null;
let currentTarget = null;
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
            initCurrent();
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
const openMenu = (e, id) => {
    if (currentInstance) {
        currentInstance.closeMenu();
    }
    currentInstance = createMenu(e.clientX, e.clientY);
    initCurrent(e.currentTarget, id);
}
//在这里初始化部分书签参数
const initCurrent = (target, id) => {
    dynamicScroll.value = target ? "scroll" : null;
    currentInstance.id = target ? id : null;
    target ? target.classList.toggle("active") : currentInstance.target.classList.toggle("active");
    currentInstance.target = target ? target : null;
}
const onContextMenuClick = (type) => {
    if (type !== "delete") {
        router.push({
            name: type,
            params: {
                id: currentInstance.id,
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
        })
    }
}
const onDragStart = (e) => {

}
const onDragEnd = (e) => {

}
const onScroll = () => {
    if (currentInstance) {
        currentInstance.closeMenu();
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
