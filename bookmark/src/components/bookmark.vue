<template>
    <div class="bookmark-card">
        <div class="bookmark-header">
            <div class="bookmark-icon">
                <transition name="fade">
                    <img v-if="hasIcon" :src="iconUrl" alt="bookmark-icon">
                    <div v-else class="text-icon">{{ textIcon.toUpperCase() }}</div>
                </transition>
            </div>
            <el-tooltip placement="top" :disabled="disableTip" :content="title">
                <div class="bookmark-title" @mouseover="showTitle">
                    <span ref="tip">{{ title }}</span>
                </div>
            </el-tooltip>
        </div>
        <div class="bookmark-content">
            <div v-if="createDate" class="bookmark-info">
                <span v-if="props.bookmark.children">创建日期：</span>
                <span v-else>添加日期：</span>
                <span>{{ createDate }}</span>
            </div>
            <div v-if="openDate" class="bookmark-info">
                <span>最近打开：</span>
                <span>{{ openDate }}</span>
            </div>
        </div>
        <el-button type="primary" size="small" class="card-button" @click="handleClick">打开</el-button>
    </div>
</template>
<script setup>
import { computed,ref } from 'vue';
import { ElTooltip, ElButton } from 'element-plus'
const props = defineProps({
    bookmark: {
        type: Object,
        default: () => { return {} }
    }
});
const emit = defineEmits(['open']);
const defaultIcon = "./icons/folder.png";
const defaultTitle = "bookMark";
const disableTip = ref(true);
const hasIcon = ref(false);
const tip = ref();
const title = computed(() => {
    return props.bookmark.title ? props.bookmark.title.trim() : defaultTitle
});
const textIcon = computed(() => {
    const regExp = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/gm;
    const result = title.value.replace(regExp, '');
    return result.slice(0, 1);
});

const showTitle = () => {
    const parentWidth = tip.value.parentNode.offsetWidth;
    const tipWidth = tip.value.offsetWidth;
    disableTip.value = parentWidth < tipWidth ? false : (parentWidth - tipWidth < 10) ? false : true;
}
const handleClick = () => {
    const openParam = props.bookmark.url ? props.bookmark.url : props.bookmark.children;
    emit("open", openParam);
}
const getDate = (timestamp) => {
    if (!timestamp) return;
    const date = new Date(timestamp);
    return date.toLocaleDateString();
}
const createDate = getDate(props.bookmark.dateAdded);
const openDate = getDate(props.bookmark.dateGroupModified);
const getIconUrl = (url) => {
    if (!url) return defaultIcon;
    url = `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`
    return url;
}
const iconUrl = getIconUrl(props.bookmark.url);

const loadIcon = () => {
    const img = new Image();
    img.src = iconUrl
    img.onload = () => {
        hasIcon.value = iconUrl == defaultIcon ? true : img.naturalWidth == 16 ? false : true;
    }
}
loadIcon();

</script>
<style lang="scss" scoped>
.bookmark-card {
    --icon-size: 2rem;
    background-color: #f0f0f0;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: .5rem;
    width: 130px;
    transform: all 0.3s ease;
    &:hover{
        box-shadow: 2px 4px 8px 2px rgba(0, 0, 0, 0.3);
    }
    .fade-enter-active,
    .fade-leave-active {
        transition: all 0.2s linear;
    }

    .fade-enter-from {
        opacity: 0;
        transform: translateX(-var(--icon-size));
    }

    .fade-leave-to {
        opacity: 0;
        transform: translateX(var(--icon-size));
    }

    .bookmark-header {
        width: 100%;
        font-size: .8rem;
        font-weight: bold;
        display: flex;
        justify-content: flex-start;
        align-items: flex-end;
        margin-bottom: 1rem;

        .bookmark-icon {
            width: var(--icon-size);
            height: var(--icon-size);
            position: relative;
            overflow: hidden;
            .text-icon {
                width: var(--icon-size);
                line-height: var(--icon-size);
                text-align: center;
                color: lightgray;
                font-size: 1.5rem;
                box-shadow: 0 0 10px 12px rgba(0,0,0,0.3) inset;
                border-radius: 3px;
            }

            img {
                width: var(--icon-size);
                border-radius: 3px;
            }
        }

        .bookmark-title {
            width: calc(100% - var(--icon-size) - 10px);
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: inherit;
            white-space: nowrap;
            padding-left: 5px;
            text-align: left;
        }
    }

    .bookmark-content {
        min-height: var(--icon-size);
        margin-bottom: 1rem;

        .bookmark-info {
            font-size: .75rem;
            color: #999;
        }
    }

    .card-button {
        &:hover {
            background-color: #1890ff;
        }
    }
}
</style>