<template>
    <div class="bookmark-card">
        <div class="bookmark-header">
            <div class="bookmark-icon">
                <div v-if="!hasIcon" class="icon-sign">{{ iconSign.toUpperCase() }}</div>
                <img v-if="hasIcon" :src="iconUrl" @load="loadIcon" alt="bookmark-icon">
            </div>
            <el-tooltip placement="top" :disabled="hasTip" :content="title">
                <div class="bookmark-title" @mouseover="showTitle">
                    <span ref="tip">{{ title }}</span>
                </div>
            </el-tooltip>
        </div>
        <div class="bookmark-content">
            <div class="bookmark-info">
                <span>创建日期：</span>
                <span>{{ createDate }}</span>
            </div>
            <div class="bookmark-info">
                <span>最近打开：</span>
                <span>{{ createDate }}</span>
            </div>
        </div>
        <el-button type="primary" size="small" class="card-button" @click="handleClick">打开</el-button>
    </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue';
import { ElTooltip, ElButton } from 'element-plus'
const defaultIcon = "./icons/folder.png";
const defaultTitle = "bookMark";
const props = defineProps({
    bookmark: {
        type: Object,
        default: () => { return {} }
    }
});
const emit = defineEmits(['open']);
const hasTip = ref(true);
const hasIcon = ref(true);
const tip = ref();

const iconUrl = computed(() => {
    let url = defaultIcon;
    if (props.bookmark.url) {
        url = `https://www.google.com/s2/favicons?sz=64&domain_url=${props.bookmark.url}`
    }
    return url;
});
const title = computed(() => {
    return props.bookmark.title ? props.bookmark.title.trim() : defaultTitle
});
const iconSign = computed(() => {
    const regExp = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/gm;
    const result = title.value.replace(regExp, '');
    return result.slice(0, 1);
})
const loadIcon = (e) => {
    if (e.target.naturalWidth === 16) {
        hasIcon.value = false;
    }
}

const showTitle = () => {
    hasTip.value = tip.value.parentNode.offsetWidth >= tip.value.offsetWidth
}
const handleClick = () => {
    const openParam = props.bookmark.url ? props.bookmark.url : props.bookmark.children;
    emit("open", openParam);
}
const handleDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
}
const createDate = handleDate(props.bookmark.dateAdded)
</script>
<style lang="scss" scoped>
.bookmark-card {
    background-color: #f0f0f0;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: .5rem;
    width: 130px;
    margin: 2px;

    .bookmark-header {
        width: 100%;
        font-size: .8rem;
        font-weight: bold;
        display: flex;
        justify-content: flex-start;
        align-items: flex-end;
        margin-bottom: 1rem;

        .bookmark-icon {
            width: 2rem;
            height: 2rem;

            .icon-sign {
                width: 100%;
                height: 100%;
                text-align: center;
                line-height: 2rem;
                color: #ddd;
                font-size: 1.5rem;
                border: 2px solid #ccc;
                border-radius: 3px;
            }

            img {
                width: 100%;
                height: 100%;
                border-radius: 3px;
            }
        }

        .bookmark-title {
            width: calc(100% - 2rem);
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: inherit;
            white-space: nowrap;
            padding: .25rem;
            text-align: left;
        }
    }

    .bookmark-content {
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
}</style>