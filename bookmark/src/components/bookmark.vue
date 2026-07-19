<template>
    <div class="bookmark-card" :id="bookmark.id" @contextmenu="handleContextMenu">
        <div class="bookmark-header">
            <div v-if="isFolder" class="bookmark-icon">
                <img src="../assets/icon/folder.png" alt="bookmark-icon">
            </div>
            <div
                v-else
                ref="iconRef"
                class="bookmark-icon preview-trigger"
                @mouseenter="onIconEnter"
                @mouseleave="onIconLeave"
            >
                <img :src="iconUrl" alt="bookmark-icon">
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
        <el-button v-if="isFolder" type="primary" size="small" class="card-button" @click="handleClick">{{
            locale.bookmarkCard.openButtonText }}</el-button>
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
        <!-- 书签页面预览 -->
        <BookmarkPreview
            v-if="!isFolder"
            :url="bookmark.url ?? ''"
            :title="bookmark.title"
            :visible="previewVisible"
            :trigger-el="triggerEl"
            @close="closePreview"
            @open-in-tab="openPreviewInTab"
        />
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Promotion, HomeFilled, ChromeFilled } from '@element-plus/icons-vue'
import { setLocalCache, getLocalCache, getDate, faviconURL, openTabs } from '@/utils/index'
import { isSafePreviewUrl } from '@/utils/preview'
import BookmarkPreview from '@/components/BookmarkPreview.vue'
import type { BookmarkTreeNode, BookmarkNodeWithMeta, LocaleElData, DropdownItem, OpenUrlParam } from '@/types'

interface Props {
    bookmark: BookmarkNodeWithMeta
    locale: LocaleElData
}
const props = withDefaults(defineProps<Props>(), {
    bookmark: () => ({} as BookmarkNodeWithMeta),
    locale: () => ({} as LocaleElData),
})

const emit = defineEmits<{
    openUrl: [param: OpenUrlParam]
    openContextMenu: [e: MouseEvent, bookmark: BookmarkTreeNode]
}>()

const cacheKey = 'bookmark-open'
const noTip = ref<boolean>(true)
const tip = ref<HTMLElement | null>(null)
const openType = ref<0 | 1 | 2>(1)
const createDate = getDate(props.bookmark.dateAdded)
const modifyDate = getDate(props.bookmark.dateGroupModified)
const visitDate = computed(() => getDate(props.bookmark.recentOpen as number))
const iconUrl = faviconURL(props.bookmark.url ?? '')
const dropDownItems: DropdownItem[] = [
    {
        label: props.locale.bookmarkCard.currentPage,
        icon: HomeFilled,
        type: '_self',
        id: 0,
    },
    {
        label: props.locale.bookmarkCard.newPage,
        icon: ChromeFilled,
        type: '_blank',
        id: 1,
    },
    {
        label: props.locale.bookmarkCard.newWindow,
        icon: Promotion,
        type: '_window',
        id: 2,
    },
]
onMounted(() => {
    const result = getLocalCache(cacheKey, props.bookmark.id)
    const num = Number(result)
    openType.value = (num === 0 || num === 1 || num === 2) ? num : 1
})
const title = computed(() => {
    return props.bookmark.title ? props.bookmark.title.trim() : "bookmark";
});
const isFolder = computed(() => {
    return props.bookmark.children ? true : false;
});
const showTip = () => {
    const parentWidth = tip.value ? (tip.value.parentNode as HTMLElement).offsetWidth : 0
    const tipWidth = tip.value ? tip.value.offsetWidth : 0
    noTip.value = parentWidth < tipWidth ? false : parentWidth - tipWidth < 10 ? false : true
}

const onItemChange = (command: string | number | null | undefined) => {
    const num = Number(command)
    openType.value = (num === 0 || num === 1 || num === 2) ? num : 1
        // 手动释放焦点，避免 aria-hidden 与聚焦元素的冲突
        ; (document.activeElement as HTMLElement)?.blur()
}

const handleClick = () => {
    const dropdownItem = dropDownItems[openType.value]
    const param: OpenUrlParam = {
        id: props.bookmark.id,
        parentId: props.bookmark.parentId ?? null,
        url: props.bookmark.url ?? null,
        type: dropdownItem ? dropdownItem.type : '_self',
    }
    setLocalCache(cacheKey, { [props.bookmark.id]: openType.value })
    emit('openUrl', param)
}

// ==================== 书签预览 ====================

const iconRef = ref<HTMLElement | null>(null)
const previewVisible = ref(false)
const triggerEl = ref<HTMLElement | null>(null)

/** 鼠标进入图标：延迟显示预览（防误触） */
let previewTimer: ReturnType<typeof setTimeout> | null = null

function onIconEnter(): void {
  // 仅对非文件夹、安全的 URL 启用预览
  if (isFolder.value || !isSafePreviewUrl(props.bookmark.url ?? '')) return
  clearPreviewTimer()
  previewTimer = setTimeout(() => {
    triggerEl.value = iconRef.value
    previewVisible.value = true
  }, 400)
}

function onIconLeave(): void {
  clearPreviewTimer()
}

function closePreview(): void {
  clearPreviewTimer()
  previewVisible.value = false
  triggerEl.value = null
}

function openPreviewInTab(url: string): void {
  closePreview()
  openTabs({ type: '_blank', url, id: props.bookmark.id })
}

function clearPreviewTimer(): void {
  if (previewTimer !== null) {
    clearTimeout(previewTimer)
    previewTimer = null
  }
}

const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    emit('openContextMenu', e, props.bookmark)
}

onUnmounted(() => {
  clearPreviewTimer()
})
</script>
<style lang="scss" scoped>
.bookmark-card {
    background-color: var(--bg-card);
    color: var(--text-primary);
    border-radius: var(--border-radius);
    box-shadow: 0 2px 4px var(--shadow-color);
    padding: var(--padding-tertiary);
    width: calc(var(--rest-space) / var(--card-columns) - var(--extra-space));
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover,
    &.active {
        box-shadow: 0 0 6px 2px var(--shadow-active-color);
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: all 0.2s linear;
    }

    .fade-enter-from {
        opacity: 0;
        transform: translateX(-var(--card-icon-size));
    }

    .fade-leave-to {
        opacity: 0;
        transform: translateX(var(--card-icon-size));
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
            width: var(--card-icon-size);
            height: var(--card-icon-size);
            position: relative;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 0 8px 2px var(--shadow-active-color) inset;
            border-radius: var(--border-radius);

            img {
                width: calc(var(--card-icon-size) * 0.5);
                border-radius: var(--border-radius);
            }

            // 预览触发器：hover 时放大 + 边框高亮
            &.preview-trigger {
                cursor: zoom-in;
                transition: transform 0.2s ease, box-shadow 0.2s ease;

                &:hover {
                    transform: scale(1.15);
                    box-shadow: 0 0 0 2px var(--el-color-primary, #409eff), 0 0 8px 2px var(--shadow-active-color) inset;
                }
            }
        }

        .bookmark-title {
            width: calc(100% - var(--card-icon-size) - 10px);
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: inherit;
            white-space: nowrap;
            padding-left: var(--padding-tertiary);
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
            gap: var(--gap);
            color: var(--text-muted);
            font-size: 0.75rem;
        }
    }
}
</style>