<template>
    <div class="home">
        <div class="bookmark-container">
            <div class="bookmark-header"></div>
            <div class="bookmark-content">
                <div class="bookmark-item" v-for="bookmark in bookmarks" :key="bookmark.id">
                    <img class="bookmark-icon" :src="bookmark.url" alt="bookmark-icon">
                    <div class="bookmark-title">{{ bookmark.title }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
const bookmarks = ref([]);
const handleTree = (tree) => {
    for (const treeNode of tree) {
        if (treeNode.children && !treeNode.url) {
            treeNode.url = "./icons/folder.png";
            handleTree(treeNode.children);
        }
    }
    return tree;
}
const getData = async (result) => {
    if (result) {
        bookmarks.value = handleTree(result[0].children);
    } else {
        const data = await import('../../public/utils/data.json');
        bookmarks.value = handleTree(data.default[0].children);
    }
    console.log(bookmarks.value)
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

        .bookmark-item {
            cursor: pointer;
            font-size: .75rem;
            padding: .5rem;
            position: relative;
            z-index: 1;
            border-radius: 5px;
            transition: all 0.3s cubic-bezier(0.33, -0.16, 0.58, 1);
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;

            &:hover {
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                transform: scale(1.2);
                background: rgba(255, 255, 255, 0.3);
                font-weight: 600;
                padding: .75rem;
            }

            .bookmark-icon {
                width: 2.5rem;
            }
            .bookmark-title {
                padding-top: .25rem;
            }
        }
    }
}
</style>
