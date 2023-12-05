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
const bookmarks = computed(()=>{
    return bookStore.bookList;
})

const openBookMark = (param) => {
    if (typeof param == 'string') {
        window.open(param, "_blank");
    } else {
        console.log(param)
        bookmarks.value = param
    }
}
// const getData = async (result) => {
//     if (result) {
//         bookmarks.value = result[0].children[0].children;
//     } else {
//         const data = await import('../../public/utils/data.json');
//         bookmarks.value = data.default[0].children[0].children;
//     }
// }
// getData();
//chrome.bookmarks.getTree(getData)
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
