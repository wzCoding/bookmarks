<template>
    <div class="bookmark-card" :class="`bookmark-${bookmark.index}`" @contextmenu="handleContextMenu">
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
            <div v-if="modifyDate" class="bookmark-info">
                <span>修改日期：</span>
                <span>{{ modifyDate }}</span>
            </div>
        </div>
        <el-button v-if="buttonType" type="primary" size="small" class="card-button" @click="handleClick">打开</el-button>
        <el-dropdown v-else size="small" trigger="click" split-button type="primary" @click="handleClick">
            <el-icon>
                <component :is="dropDownItems[openType].icon" />
            </el-icon>
            <span :open-type="openType">打开</span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item v-for="item in dropDownItems" :key="item.id" @click="onItemChange">
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                        <span :open-type="item.id">{{ item.label }}</span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>
<script setup>
import { computed, ref} from 'vue';
import { ElTooltip, ElButton, ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { Promotion, HomeFilled, ChromeFilled } from '@element-plus/icons-vue'
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
const openType = ref(1);
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
        type: "_newwindow",
        id: 2
    },
]
const title = computed(() => {
    return props.bookmark.title ? props.bookmark.title.trim() : defaultTitle
});
const textIcon = computed(() => {
    const regExp = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/gm;
    const result = title.value.replace(regExp, '');
    return result.slice(0, 1);
});
const buttonType = computed(() => {
    return props.bookmark.children ? true : false;
})
const showTitle = () => {
    const parentWidth = tip.value.parentNode.offsetWidth;
    const tipWidth = tip.value.offsetWidth;
    disableTip.value = parentWidth < tipWidth ? false : (parentWidth - tipWidth < 10) ? false : true;
}
const getDate = (timestamp) => {
    if (!timestamp) return;
    const date = new Date(timestamp);
    return date.toLocaleDateString();
}
const getIconUrl = (url) => {
    const iconUrl = url ? `https://www.google.com/s2/favicons?sz=64&domain_url=${url}` : defaultIcon
    const img = new Image();
    img.src = iconUrl
    img.onload = async function () {
        return Promise.resolve(this).then(res => {
            hasIcon.value = iconUrl == defaultIcon ? true : res.naturalWidth == 16 ? false : true;
        });
    }
    return iconUrl;
}
const createDate = getDate(props.bookmark.dateAdded);
const modifyDate = getDate(props.bookmark.dateGroupModified);
const iconUrl = getIconUrl(props.bookmark.url);

const onItemChange = (e) => {
    const type = e.target.getAttribute("open-type");
    openType.value = type ? type : 1;
}
const handleClick = () => {
    const param = {
        id: props.bookmark.id,
        parentId: props.bookmark.parentId ? props.bookmark.parentId : null,
        url: props.bookmark.url ? props.bookmark.url : null,
        openType: dropDownItems[openType.value].type,
    }
    emit("open", param);
}

const handleContextMenu = (e) => {
    e.preventDefault();

    console.log(e)
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

    &:hover {
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
                color: lightgray;
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