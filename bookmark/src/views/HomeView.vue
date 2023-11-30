<template>
    <div class="home">
        <div class="bookmark-container">
            <div class="bookmark-header"></div>
            <div class="bookmark-content">
                <bookmark v-for="bookmark in bookmarks" :key="bookmark.id" @open="openBookMark" :bookmark="bookmark">
                </bookmark>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import bookmark from '@/components/bookmark.vue';
const bookmarks = ref([]);
const openBookMark = (param) => {
    if (typeof param == 'string') {
        window.open(param.data, "_blank");
    }else{
        console.log(param)
    }
}
const getData = async (result) => {
    if (result) {
        bookmarks.value = result[0].children;
    } else {
        const data = await import('../../public/utils/data.json');
        bookmarks.value = data.default[0].children;
    }
}
getData();
//chrome.bookmarks.getTree(getData)
</script>
<style lang="scss" scoped>
.home {
    --background-color: linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%);
    width: 100%;
    height: 100%;
    position: relative;
    background-image: var(--background-color);

    &::after {
        content: "";
        position: absolute;
        inset: .5rem;
        border-radius: 5px;
        background-color: transparent;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);

    }

    .bookmark-container {
        position: absolute;
        inset: .5rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;

        .bookmark-header {
            width: 100%;
            height: 60px;
            border-bottom: 1px solid #ddd;
        }

        .bookmark-content {
            flex: 1;
            width: calc(100% - .5rem);
            display: flex;
            justify-content: flex-start;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: .5rem;
            position: relative;
            padding: .5rem;
        }
    }
}
</style>
