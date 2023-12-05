<template>
    <div class="book-home">
        <div class="book-content">
            <BookMark v-for="bookmark in bookmarks" :key="bookmark.id" @open="openBookMark" :bookmark="bookmark">
            </BookMark>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useBookStore } from '../store/useBookStore';
import BookMark from '../components/bookmark.vue';
const bookStore = useBookStore();
const bookmarks = computed(() => {
    return bookStore.currentMarks
});
const openBookMark = (param) => {
    if (param.url) {
        window.open(param.url, "_blank");
    } else {
        console.log(param)
        bookStore.getTargetList(param.id);
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
