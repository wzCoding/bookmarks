<template>
    <el-page-header ref="pageHeader" title="返回" class="book-header" :style="headerStyle" @back="goBack">
        <template #extra>
            <div class="header-extra" :class="{ active: searchActive }">
                <div class="header-search" :class="{ active: searchActive }">
                    <span class="header-title">{{ currentTitle }}</span>
                    <el-input v-model.lazy="inputVal" class="search-input" placeholder="搜索书签" :suffix-icon="Search"
                        clearable @input="searchBook" />
                </div>
                <div class="header-menu">
                    <el-button v-show="!searchActive" :icon="Search" circle class="header-button search-button"
                        @click="openSearch" />
                    <!-- <el-button :icon="Menu" circle class="header-button setting-button" @click="openSetting" /> -->
                </div>
            </div>
        </template>
    </el-page-header>
</template>
<script setup>
import { computed, watch, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElPageHeader, ElButton, ElInput } from 'element-plus';
import { Search, Menu } from '@element-plus/icons-vue';
import { usebookStore } from '@/store/usebookStore';
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
const inputVal = ref();
const searchActive = ref(false);
const router = useRouter();
const bookStore = usebookStore();
const { currentTitle, currentNodes, parentId } = storeToRefs(bookStore);
let oldTitle = currentTitle.value;
let oldMarks = currentNodes.value;
const openSearch = () => {
    searchActive.value = true;
    oldMarks = currentNodes.value;
}
const searchBook = debounce(() => {
    if (inputVal.value.trim()) {
        console.log(inputVal.value)
        currentNodes.value = bookStore.getNodeByTitle(inputVal.value);
    }
}, 500)
const openSetting = () => {
    console.log('openSetting')
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
        currentNodes.value = oldMarks;
        searchActive.value = false;
        inputVal.value = '';
    }
}
watch(currentTitle, (newVal, oldVal) => {
    oldTitle = oldVal;
})
</script>
<style lang="scss" scoped>
.book-header {
    --padding: 0.75rem;
    z-index: 3;
    position: fixed;
    background-color: #fff;
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
                transform: translateX(100%);
                transition: all 0.3s;
            }
        }

        .header-menu {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            overflow: hidden;
            padding-right: 0.5rem;

            .header-button {
                border: none !important;
                margin-left: 0.25rem !important;
            }
        }
    }
}
</style>