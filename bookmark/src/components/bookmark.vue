<template>
    <el-tooltip effect="dark" placement="top" :disabled="showTip" :content="title">
        <div class="bookmark-item" @click="handleClick" @mouseover="handleShowTip">
            <slot>
                <img class="bookmark-icon" :src="iconUrl" alt="bookmark-icon">
                <div class="bookmark-title">
                    <span ref="tip">{{ title }}</span>
                </div>
            </slot>
        </div>
    </el-tooltip>
</template>
<script setup>
import { computed, ref } from 'vue';
import { ElTooltip } from 'element-plus'
const defaultIcon = "./icons/folder.png";
const defaultTitle = "bookMark";
const props = defineProps({
    bookmark: {
        type: Object,
        default: () => { return {} }
    }
});
const emit = defineEmits(['open']);
const showTip = ref(true);
const tip = ref()
const handleShowTip = () => {
    showTip.value = tip.value.parentNode.offsetWidth >= tip.value.offsetWidth
}
const handleClick = () => {
    const openParam = props.bookmark.url ? props.bookmark.url : props.bookmark.children;
    emit("open", openParam);
}
const iconUrl = computed(() => {
    let url = defaultIcon;
    if (props.bookmark.url) {
        url = `https://www.google.com/s2/favicons?sz=64&domain_url=${props.bookmark.url}`
    }
    return url;
});
const title = computed(() => {
    return props.bookmark.title ? props.bookmark.title : defaultTitle
})
const createDate = computed(() => {
    const date = new Date(props.bookmark.dateAdded)
    return date.toLocaleDateString()
})
</script>
<style lang="scss" scoped>
.bookmark-item {
    cursor: pointer;
    font-size: .75rem;
    padding: 0.5rem;
    position: relative;
    z-index: 1;
    border-radius: 5px;
    transition: all .3s cubic-bezier(.33, -.16, .58, 1);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 3rem;
    .item-header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    .bookmark-icon {
        width: 2.5rem;
        border: 2px solid #1890ff;
        border-radius: 3px;
    }

    .bookmark-title {
        width: 100%;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: inherit;
        white-space: nowrap;
    }
}
</style>