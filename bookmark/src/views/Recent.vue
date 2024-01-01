<template>
    <div class="book-recent" @[dynamicScroll]="onScroll">
        <div class="book-content">
            <BookMark v-for="bookmark in bookStore.recentNodes" :key="bookmark.id" :bookmark="bookmark" :locale="locale.el"
                @openUrl="openBookMark" @openContextMenu="openMenu">
            </BookMark>
        </div>
    </div>
</template>

<script setup>
import { createVNode, ref, render } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usebookStore } from '@/store/usebookStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { openTabs } from '@/utils/index';
import BookMark from '@/components/bookmark.vue';
import ContextMenuTemplate from '@/components/contextMenu.vue';

let contextMenu = null;
const bookStore = usebookStore();
const localeStore = useLocaleStore();
const router = useRouter();
const dynamicScroll = ref();
const { locale } = storeToRefs(localeStore);
//打开书签卡片
const openBookMark = (param) => {
    if (param.url) {
        openTabs(param);
    } else {
        router.push("/")
        bookStore.getCurrentNodes(param.id, true);
    }
}

//右键点击打开contextMenu
const openMenu = (e, bookmark) => {
    if (contextMenu) {
        contextMenu.closeMenu();
    }
    contextMenu = createContextMenu(e.clientX, e.clientY, bookmark, ["create", "edit", "delete"]);
    initContextMenu(e.currentTarget);
}
//创建右键contextMenu
const createContextMenu = (x, y, bookmark, disableList) => {
    const props = {
        xAxis: x,
        yAxis: y,
        target: bookmark,
        disable: disableList,
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
