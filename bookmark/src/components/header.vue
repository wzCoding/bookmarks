<template>
    <el-page-header ref="pageHeader" title="返回" class="book-header" :style="headerStyle" @back="goBack">
        <template #extra>
            <div class="header-extra" :class="{ active: searchActive }">
                <span class="header-title">{{ currentTitle }}</span>
                <div class="header-menu">
                    <div class="search-box" :class="{ active: searchActive }">
                        <el-input v-model.lazy="inputVal" class="search-input" placeholder="搜索书签" :suffix-icon="Search"
                            clearable @input="searchBook" />
                        <el-button :icon="Search" class="header-button search-button" circle @click="openSearch" />
                    </div>
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
const { currentTitle, parentId } = storeToRefs(bookStore);
let oldTitle = currentTitle.value;
const openSearch = () => {
    searchActive.value = true;
}
const searchBook = debounce(() => {
    if(inputVal.value.trim()){
        console.log(inputVal.value)
        bookStore.currentMarks = bookStore.getMark(inputVal.value)
    }
}, 300)
const openSetting = () => {
    console.log('openSetting')
}
const goBack = () => {
    if (!searchActive.value) {
        if (router.currentRoute.value.fullPath !== "/") {
            currentTitle.value = oldTitle
            router.push('/');
        } else {
            bookStore.getCurrentMarks(parentId.value);
        }
    } else {
        searchActive.value = false;
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

        .header-title {
            display: block;
            font-size: 1rem;
        }

        .header-button {
            border: none !important;
        }

        &.active {
            .header-title {
                display: none;
            }
        }

        .header-menu {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            overflow: hidden;
            flex: 1;
            padding-right: 0.5rem;

            .search-box {
                position: relative;
                overflow: hidden;
                display: flex;

                .search-input {
                    transform: translateX(150%);
                    transition: all 0.3s;
                }

                &.active {
                    flex: 1;

                    .search-button {
                        display: none;
                    }

                    .search-input {
                        transform: translateX(0);
                    }
                }
            }

            .setting-button {
                margin-left: 0.25rem;
            }
        }
    }
}
</style>