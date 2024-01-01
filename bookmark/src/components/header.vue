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
                    <el-dropdown trigger="click" @command="onItemChange">
                        <el-button :icon="Menu" circle class="header-button setting-button" />
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="item in menus" :key="item.type" :command="item.type">
                                    <el-icon>
                                        <component :is="item.icon"></component>
                                    </el-icon>
                                    <span>{{ item.label }}</span>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
        </template>
    </el-page-header>
</template>
<script setup>
import { computed, watch, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElPageHeader, ElLoading, ElButton, ElInput, ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { Search, Menu, Link, Setting } from '@element-plus/icons-vue';
import { usebookStore } from '@/store/usebookStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { debounce } from '@/utils/index';
const props = defineProps({
    height: { type: String, default: '60' },
});
const headerStyle = computed(() => {
    return {
        height: props.height.includes('px') ? props.height : `${props.height}px`
    }
});
const pageHeader = ref(null);
const searchInput = ref();
const searchText = ref();
const searchActive = ref(false);
const router = useRouter();
const bookStore = usebookStore();
const localeStore = useLocaleStore();
const showMenu = computed(() => { return router.currentRoute.value.fullPath == "/" })
const { currentTitle, currentNodes, parentId } = storeToRefs(bookStore);
const { locale } = storeToRefs(localeStore);
const searchTip = computed(() => { return locale.value.el.bookmarkHeader.searchTip });
let oldTitle = currentTitle.value;
let oldNodes = currentNodes.value;
const menus = computed(() => [
    {
        label: locale.value.el.bookmarkHeader.recentlyUsed,
        icon: Link,
        type: "recent"
    },
    {
        label: locale.value.el.bookmarkHeader.settings,
        icon: Setting,
        type: "setting"
    }
])
const onItemChange = (command) => {
    searchActive.value = false;
    router.push(`/${command}`);
}
const openSearch = (el) => {
    searchActive.value = true;
    oldNodes = currentNodes.value;
    setTimeout(el.focus, 200);
}
const searchBook = debounce(() => {
    if (searchText.value.trim()) {
        currentNodes.value = bookStore.getNodeByTitle(searchText.value);
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
            currentTitle.value = oldTitle
            router.push('/');
        } else {
            bookStore.getCurrentNodes(parentId.value);
        }
    } else {
        searchActive.value = false;
        clearBook();
    }
}
const pageTitle = computed(() => {
    const path = router.currentRoute.value.fullPath;
    if (path == '/') {
        return currentTitle.value;
    }
    return locale.value.el[router.currentRoute.value.name].pageTitle
})

watch(currentTitle, (newVal, oldVal) => {
    oldTitle = oldVal
    searchActive.value = false;
})
</script>
<style lang="scss" scoped>
.book-header {
    --padding: 0.75rem;
    z-index: 3;
    position: fixed;
    background-color: var(--bg-color);
    color: var(--text-color);
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.3);
    padding: 0 var(--padding);
    width: calc(100% - var(--padding) * 2);
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
            background-color: var(--bg-color);
            color: var(--text-color);
        }

        .el-input__inner {
            color: var(--text-color);
        }
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
                margin-left: 0.25rem !important;
                background-color: var(--bg-color);
                color: var(--text-color);
            }
        }
    }
}
</style>