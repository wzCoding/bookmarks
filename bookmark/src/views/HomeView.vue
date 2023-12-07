<template>
    <div class="book-home">
        <VueDraggable ref="dragEl" v-model="currentMarks" @start="onDragStart" @end="onDragEnd"
            @move="onDragMove" @change="onDragChange" target=".book-content">
            <TransitionGroup tag="div" name="fade" class="book-content">
                <BookMark v-for="bookmark in pageMarks" :key="bookmark.id" @open="openBookMark" :bookmark="bookmark">
                </BookMark>
            </TransitionGroup>
        </VueDraggable>
        <BookFooter :page-size="pageSize" :current-page="currentPage" :total="totalNum" :locale="i18nStore.locale"
            @currentChange="currentChange" @sizeChange="sizeChange"></BookFooter>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { usebookStore } from '@/store/usebookStore';
import { usei18nStore } from '@/store/usei18nStore';
import { VueDraggable } from 'vue-draggable-plus';
import { storeToRefs } from 'pinia';
import BookMark from '@/components/bookmark.vue';
import BookFooter from '@/components/footer.vue';


const i18nStore = usei18nStore();
const bookStore = usebookStore();
const dragEl = ref();

const { currentMarks, currentPage, totalNum, pageSize, pageMarks } = storeToRefs(bookStore);
console.log(currentMarks.value)
const prevArea = {
    name: "prev",
    id: "prev"
}
const nextArea = {
    name: "next",
    id: "next"
}
const currentChange = (page) => {
    bookStore.pageChange(page);
}
const sizeChange = (size) => {
    bookStore.sizeChange(size);
}
const openBookMark = (param) => {
    if (param.url) {
        window.open(param.url, "_blank");
    } else {
        console.log(param)
        bookStore.getCurrentMarks(param.id);
    }
}
const onDragStart = (e) => {
    //console.log(e)
}
const onDragEnd = (e) => {
    console.log(e)
}
const onDragMove = (e) => {
    console.log(e)
    // if (e.related.className.includes("page-prev")) {
    //     bookStore.pageChange(currentPage.value - 1);
    // }
    // if (e.related.className.includes("page-next")) {
    //     bookStore.pageChange(currentPage.value + 1);
    // }
}
const onDragChange = (e) => {
    //console.log(e)
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
        width: calc(100% - 1rem);
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
        position: relative;
        padding: var(--content-padding);
        gap: var(--content-gap);
        --page-change-area-width: 3rem;

        .prev,
        .next {
            position: fixed;
            top: 0;
            width: var(--page-change-area-width);
            height: 100%;
            background-color: red;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
            z-index: 99;
        }

        .prev {
            left: -2rem;
        }

        .next {
            right: -2rem;
        }
    }
}
</style>
