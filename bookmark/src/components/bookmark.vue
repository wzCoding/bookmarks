<template>
    <div class="bookmark-card" :id="bookmark.id" @contextmenu="handleContextMenu">
        <div class="bookmark-header">
            <div class="bookmark-icon">
                <img v-if="isFolder" src="../assets/icon/folder.png" alt="bookmark-icon">
                <img v-else :src="iconUrl" alt="bookmark-icon">
            </div>
            <el-tooltip placement="top" :disabled="noTip" :content="title">
                <div class="bookmark-title" @mouseover="showTip">
                    <span ref="tip">{{ title }}</span>
                </div>
            </el-tooltip>
        </div>
        <div class="bookmark-content">
            <div v-if="isFolder" class="bookmark-info">
                <span>{{ locale.bookmarkCard.recentlyModified }}：{{ modifyDate }}</span>
            </div>
            <div v-else class="bookmark-info">
                <span>{{ locale.bookmarkCard.recentlyVisited }}：{{ visitDate ? visitDate : createDate }}</span>
            </div>
        </div>
        <el-button v-if="isFolder" type="primary" size="small" class="card-button" @click="handleClick">{{ locale.bookmarkCard.openButtonText }}</el-button>
        <el-dropdown v-else type="primary" size="small" trigger="click" split-button @command="onItemChange"
            @click="handleClick">
            <el-icon>
                <component :is="dropDownItems[openType].icon" />
            </el-icon>
            <span :open-type="openType">{{ locale.bookmarkCard.openButtonText }}</span>
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
import { setLocalCache, getLocalCache, getDate, faviconURL } from '@/utils/index';
const props = defineProps({
    bookmark: {
        type: Object,
        default: () => { return {} }
    },
    locale: {
        type: Object,
        default: () => { return {} }
    }
});

const emit = defineEmits(['openUrl', 'openContextMenu']);
const cacheKey = "bookmark-open";
const noTip = ref(true);
const tip = ref("");
const openType = ref(1);
const createDate = getDate(props.bookmark.dateAdded);
const modifyDate = getDate(props.bookmark.dateGroupModified);
const visitDate = getDate(props.bookmark.dateLastUsed);
const iconUrl = faviconURL(props.bookmark.url);
const dropDownItems = [
    {
        label: props.locale.bookmarkCard.currentPage,
        icon: HomeFilled,
        type: "_self",
        id: 0
    },
    {
        label: props.locale.bookmarkCard.newPage,
        icon: ChromeFilled,
        type: "_blank",
        id: 1
    },
    {
        label: props.locale.bookmarkCard.newWindow,
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
const isFolder = computed(() => {
    return props.bookmark.children ? true : false;
});
const showTip = () => {
    const parentWidth = tip.value ? tip.value.parentNode.offsetWidth : 'parentWidth';
    const tipWidth = tip.value ? tip.value.offsetWidth : 0;
    noTip.value = parentWidth < tipWidth ? false : (parentWidth - tipWidth < 10) ? false : true;
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
    emit("openContextMenu", e, props.bookmark);
}
</script>
<style lang="scss" scoped>
.bookmark-card {
    --icon-size: 2rem;
    background-color: var(--card-bg-color);
    color:var(--card-text-color);
    border-radius: 5px;
    box-shadow: 0 2px 4px var(--card-shadow-color);
    padding: .5rem;
    width: calc(var(--rest-space) / var(--card-columns) - var(--extra-space));
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover,
    &.active {
        box-shadow: 0 0 6px 2px var(--context-shadow-color);
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
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 0 8px 2px var(--context-shadow-color) inset;
            border-radius: 50%;

            img {
                width: calc(var(--icon-size) / 2);
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
            color:var(--card-info-color);
            font-size: 0.75rem;
        }
    }
}
</style>