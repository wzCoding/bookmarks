<template>
    <div class="book-home">
        <VueDraggable class="book-content" ref="dragEl" v-model="currentMarks" @start="onDragStart" @end="onDragEnd"
            @move="onDragMove">
            <BookMark v-for="bookmark in pageMarks" :key="bookmark.id" @open="openBookMark" :bookmark="bookmark">
            </BookMark>
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
    //console.log(e)
}
const onDragMove = (e) => {
    console.log(e)
}
</script>
<style lang="scss" scoped>
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
    }
}
</style>
