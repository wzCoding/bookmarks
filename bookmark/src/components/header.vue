<template>
    <el-page-header ref="pageHeader" :title="locale.el.bookmarkHeader.back" class="book-header" :style="headerStyle"
        @back="goBack">
        <template #extra>
            <div class="header-extra" :class="{ active: searchActive }">
                <div class="header-search" :class="{ active: searchActive }">
                    <span class="header-title">{{ pageTitle }}</span>
                    <el-input ref="searchInput" v-model.lazy="searchText" :placeholder="searchTip" class="search-input"
                        :suffix-icon="Search" clearable @input="searchBook" @clear="clearBook" />
                </div>
                <div class="header-menu" v-show="showMenu">
                    <el-button :icon="Search" circle v-show="!searchActive" class="header-button search-button"
                        @click="openSearch(searchInput)" />
                    <el-button :icon="Menu" circle class="header-button" @click="openSettingMenu" />
                </div>
            </div>
        </template>
        <book-mark-menu :menu-visible="showSettingMenu" @close-menu="closeSettingMenu" />
    </el-page-header>
</template>
<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Search, Menu } from '@element-plus/icons-vue'
import { usebookStore } from '@/store/usebookStore'
import { useLocaleStore } from '@/store/useLocaleStore'
import { debounce } from '@/utils/index'
import type { BookmarkNodeWithMeta } from '@/types'
import type { ElInput } from 'element-plus'
import BookMarkMenu from '@/components/menu.vue'
interface Props {
    height?: string
}
const props = withDefaults(defineProps<Props>(), {
    height: '60',
})

const headerStyle = computed(() => {
    return {
        height: props.height.includes('px') ? props.height : `${props.height}px`,
    }
})
const searchInput = ref<InstanceType<typeof ElInput> | null>(null)
const searchText = ref<string>('')
const searchActive = ref<boolean>(false)
const router = useRouter()
const bookStore = usebookStore()
const localeStore = useLocaleStore()
const showMenu = computed(() => {
    return router.currentRoute.value.fullPath == '/'
})
const { currentTitle, currentNodes, parentId } = storeToRefs(bookStore)
const { locale } = storeToRefs(localeStore)
const searchTip = computed(() => {
    return locale.value.el.bookmarkHeader.searchTip
})
let oldTitle: string = currentTitle.value
let oldNodes: BookmarkNodeWithMeta[] = currentNodes.value
const showSettingMenu = ref<boolean>(false)
const openSearch = (el: { focus: () => void } | null) => {
    if (!el) return
    searchActive.value = true
    oldNodes = currentNodes.value
    setTimeout(() => el.focus(), 200)
}
const searchBook = debounce(() => {
    if (searchText.value.trim()) {
        currentNodes.value = (bookStore.getNodeByTitle(searchText.value) ?? []) as BookmarkNodeWithMeta[]
    } else {
        clearBook()
    }
}, 300)

const clearBook = () => {
    currentNodes.value = oldNodes;
    searchText.value = '';
}
const goBack = () => {
    if (!searchActive.value) {
        if (router.currentRoute.value.fullPath !== "/") {
            currentTitle.value = oldTitle;
            router.back();
        } else {
            bookStore.getCurrentNodes(parentId.value);
        }
    } else {
        searchActive.value = false;
        clearBook();
    }
}

const openSettingMenu = () => {
    console.log('setting')
    searchActive.value = false;
    clearBook();

    showSettingMenu.value = true
}
const closeSettingMenu = () => {
    showSettingMenu.value = false
}
const pageTitle = computed(() => {
    const path = router.currentRoute.value.fullPath;
    const routeName = router.currentRoute.value.name
    if (!routeName || path === '/') {
        return currentTitle.value
    }
    return (locale.value.el as unknown as Record<string, Record<string, string>>)[String(routeName)].pageTitle
})

watch(currentTitle, (_: string, oldVal: string) => {
    oldTitle = oldVal
    searchActive.value = false
})
</script>
<style lang="scss" scoped>
.book-header {
    z-index: 3;
    position: fixed;
    background-color: var(--bg-sidebar);
    color: var(--text-sidebar);
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.3);
    padding: 0 var(--padding-secondary);
    width: calc(100% - var(--padding-secondary) * 2);
    --back-button-width: 5.5rem;

    :deep(.el-page-header__header) {
        width: 100%;
        height: 100%;

        .el-page-header__left {
            margin-right: 0;
            width: var(--back-button-width);
        }

        .el-page-header__extra {
            flex: 1;
            height: 100%
        }

        .el-input__wrapper {
            background-color: var(--bg-page);
            color: var(--text-primary);
        }

        .el-input__inner {
            color: var(--text-primary);
        }
    }

    :deep(.el-page-header__main) {
        display: none;
    }

    .header-extra {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .header-search {
            position: relative;
            overflow: hidden;
            flex: 1;
            height: 2rem;
            line-height: 2rem;

            &.active {
                .header-title {
                    transform: translateX(-100%);
                }

                .search-input {
                    transform: translateX(0);
                    opacity: 1;
                    pointer-events: auto;
                }
            }

            .header-title {
                display: block;
                font-size: 1rem;
                transition: all 0.3s;
            }

            .search-input {
                position: absolute;
                top: 0;
                right: 0;
                padding-right: 0.25rem;
                opacity: 0;
                transform: translateX(25%);
                transition: all 0.3s;
                pointer-events: none;
            }
        }

        .header-menu {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            overflow: hidden;

            .header-button {
                border: none !important;
                color: var(--text-primary);
                &:hover{
                    background-color: var(--el-color-primary-hover);
                }
            }
        }
    }
}
</style>