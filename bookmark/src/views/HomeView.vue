<template>
    <div class="book-home">
        <div class="book-content">
            <BookMark v-for="bookmark in bookStore.pageMarks" :key="bookmark.id" @open="openBookMark" :bookmark="bookmark">
            </BookMark>
        </div>
    </div>
</template>

<script setup>
import { usebookStore } from '../store/usebookStore';
import BookMark from '../components/bookmark.vue';
const bookStore = usebookStore();
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
