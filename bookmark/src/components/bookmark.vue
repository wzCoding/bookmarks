<template>
    <div class="bookmark-item" @click="handleClick">
        <slot>
            <img class="bookmark-icon" :src="iconUrl" alt="bookmark-icon">
            <div class="bookmark-title">{{ title }}</div>
        </slot>
    </div>
</template>
<script setup>
import { computed } from 'vue';
const defaultIcon = "./icons/folder.png";
const defaultTitle = "bookMark";
const props = defineProps({
    bookmark: {
        type: Object,
        default: () => { return {} }
    }
});
const emit = defineEmits(['open']);
const handleClick = () => {
    const openParam = props.bookmark.url ? props.bookmark.url : props.bookmark.children;
    emit("open", openParam);
}
const iconUrl = computed(() => {
    let url = defaultIcon;
    if(props.bookmark.url){
        url = `https://www.google.com/s2/favicons?sz=64&domain_url=${props.bookmark.url}`
    }
    return url;
});
const title = computed(() => {
    return props.bookmark.title ? props.bookmark.title : defaultTitle
})
</script>
<style lang="scss" scoped>
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
        // font-weight: 600;
        // font-size: .8rem;
    }

    .bookmark-icon {
        width: 2.5rem;
    }

    .bookmark-title {
        padding-top: .25rem;
    }
}
</style>