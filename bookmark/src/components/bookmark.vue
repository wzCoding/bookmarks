<template>
    <div class="bookmark-card" :class="`bookmark-${bookmark.index}`" @contextmenu="handleContextMenu">
        <div class="bookmark-header">
            <div class="bookmark-icon">
                <div v-if="isFolder">
                    <img src="../assets/icon//folder.png" alt="bookmark-icon">
                </div>
                <div v-else>
                    <transition name="fade">
                        <img v-if="hasIcon" :src="iconUrl" alt="bookmark-icon">
                        <div v-else class="text-icon">{{ textIcon.toUpperCase() }}</div>
                    </transition>
                </div>
            </div>
            <el-tooltip placement="top" :disabled="disableTip" :content="title">
                <div class="bookmark-title" @mouseover="showTitle">
                    <span ref="tip">{{ title }}</span>
                </div>
            </el-tooltip>
        </div>
        <div class="bookmark-content">
            <div v-if="isFolder" class="bookmark-info">
                <span>最近修改：{{ modifyDate }}</span>
            </div>
            <div v-else class="bookmark-info">
                <span>最近访问：{{ visitDate ? visitDate : createDate }}</span>
            </div>
        </div>
        <el-button v-if="isFolder" type="primary" size="small" class="card-button" @click="handleClick">打开</el-button>
        <el-dropdown v-else size="small" trigger="click" split-button type="primary" @command="onItemChange"
            @click="handleClick">
            <el-icon>
                <component :is="dropDownItems[openType].icon" />
            </el-icon>
            <span :open-type="openType">打开</span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item v-for="item in dropDownItems" :key="item.id" :command="item.id">
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                        <span>{{ item.label }}</span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue';
import { ElTooltip, ElButton, ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { Promotion, HomeFilled, ChromeFilled } from '@element-plus/icons-vue'
import { setLocalCache, getLocalCache, getDate, getIconUrl } from '@/utils/index';
const props = defineProps({
    bookmark: {
        type: Object,
        default: () => { return {} }
    }
});
const emit = defineEmits(['openUrl', 'openContextMenu']);

const cacheKey = "bookmark-open";
const disableTip = ref(true);
const hasIcon = ref(false);
const tip = ref();
const openType = ref(1);
const createDate = getDate(props.bookmark.dateAdded);
const modifyDate = getDate(props.bookmark.dateGroupModified);
const visitDate = getDate(props.bookmark.dateLastUsed);
const iconUrl = getIconUrl(props.bookmark.url, (res) => {
    hasIcon.value = res.naturalWidth == 16 ? false : true;
});
const dropDownItems = [
    {
        label: "当前页",
        icon: HomeFilled,
        type: "_self",
        id: 0
    },
    {
        label: "新页签",
        icon: ChromeFilled,
        type: "_blank",
        id: 1
    },
    {
        label: "新窗口",
        icon: Promotion,
        type: "_window",
        id: 2
    },
]
onMounted(() => {
    const result = getLocalCache(cacheKey, props.bookmark.id);
    openType.value = result ? result : 1;
})
const title = computed(() => {
    return props.bookmark.title ? props.bookmark.title.trim() : "bookmark";
});
const textIcon = computed(() => {
    const regExp = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/gm;
    const result = title.value.replace(regExp, '');
    return result.slice(0, 1);
});
const isFolder = computed(() => {
    return props.bookmark.children ? true : false;
});
const showTitle = () => {
    const parentWidth = tip.value ? tip.value.parentNode.offsetWidth : 'parentWidth';
    const tipWidth = tip.value ? tip.value.offsetWidth : 0;
    disableTip.value = parentWidth < tipWidth ? false : (parentWidth - tipWidth < 10) ? false : true;
}

const onItemChange = (command) => {
    openType.value = (command == null || command == undefined) ? 1 : command;
}

const handleClick = () => {
    const param = {
        id: props.bookmark.id,
        parentId: props.bookmark.parentId ? props.bookmark.parentId : null,
        url: props.bookmark.url ? props.bookmark.url : null,
        type: dropDownItems[openType.value].type
    }
    setLocalCache(cacheKey, { [props.bookmark.id]: openType.value });
    emit("openUrl", param);
}

const handleContextMenu = (e) => {
    e.preventDefault();
    emit("openContextMenu", e, props.bookmark.id);
}
</script>
<style lang="scss" scoped>
.bookmark-card {
    --icon-size: 2rem;
    background-color: #f9f9f9;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    padding: .5rem;
    width: calc(var(--rest-space) / var(--card-columns) - var(--extra-space));
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover,
    &.active {
        box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.3);
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
                color: #409eff;
                font-size: 1.5rem;
                box-shadow: 0 0 10px 12px rgba(0, 0, 0, 0.1) inset;
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
        margin-bottom: 1rem;

        .bookmark-info {
            display: flex;
            justify-content: flex-start;
            align-items: flex-start;
            flex-direction: column;
            gap: 0.25rem;
            color: #999;
            font-size: 0.75rem;
        }
    }
}
</style>