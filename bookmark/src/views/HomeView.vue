<template>
    <div class="book-home">
        <div class="book-content">
            <BookMark v-for="bookmark in bookStore.pageMarks" :key="bookmark.id" @open="openBookMark" :bookmark="bookmark">
            </BookMark>
        </div>
        <BookFooter :layout="layout" :pager-count="pagerCount" :page-sizes="pageSizes" :page-size="bookStore.currentSize"
            :current-page="bookStore.currentPage" :total="bookStore.totalNum" :locale="i18nStore.locale"
            @currentChange="currentChange" @sizeChange="sizeChange"></BookFooter>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { usebookStore } from '../store/usebookStore';
import { usei18nStore } from '@/store/usei18nStore';
import BookMark from '../components/bookmark.vue';
import BookFooter from '../components/footer.vue';
const pagerCount = 5;
const pageSizes = [8, 16, 24, 32];
const layout = ref("sizes, prev, pager, next, jumper");

const i18nStore = usei18nStore();
const bookStore = usebookStore();

const currentChange = (page) => {
    bookStore.currentPage = page;
}
const sizeChange = (size) => {
    bookStore.currentSize = size;
}
const openBookMark = (param) => {
    if (param.url) {
        window.open(param.url, "_blank");
    } else {
        console.log(param)
        bookStore.getCurrentMarks(param.id);
    }
}
</script>
<style lang="scss" scoped>
.book-home {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
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
