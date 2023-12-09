<template>
    <div class="book-home">
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
import { usebookStore } from '@/store/usebookStore';
import { usei18nStore } from '@/store/usei18nStore';
import { VueDraggable } from 'vue-draggable-plus';
import { storeToRefs } from 'pinia';
import BookMark from '@/components/bookmark.vue';
import BookFooter from '@/components/footer.vue';
import contextMenu from '@/components/contextMenu.vue';
const i18nStore = usei18nStore();
const bookStore = usebookStore();
const { currentMarks, currentPage, totalNum, pageSize, pageMarks } = storeToRefs(bookStore);
const drag = ref();
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
        bookStore.getCurrentMarks(param.id);
    }
}
let menuInstance = null;
const createMenu = (props) => {
    const container = document.createElement("div");
    const vnode = createVNode(contextMenu, props);
    render(vnode, container);
    document.body.appendChild(container.firstElementChild);

    const component = vnode.component;
    return component.exposed
}
const openMenu = (e) => {
    const props = {
        xAxis: e.clientX,
        yAxis: e.clientY,
    }
    console.log(e)
    console.log(props)
    if(menuInstance){
        menuInstance.top.value = e.clientX
        menuInstance.left.value = e.clientY
    }else{
        menuInstance = createMenu(props);
    } 
}
const onDragStart = (e) => {

}
const onDragEnd = (e) => {

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
