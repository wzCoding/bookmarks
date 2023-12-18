<template>
    <el-page-header ref="pageHeader" title="返回" class="book-header" :style="headerStyle" @back="goBack">
        <template #content>
            <div class="header-content">
                <span>{{ currentTitle }}</span>
            </div>
        </template>
    </el-page-header>
</template>
<script setup>
import { computed, watch, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElPageHeader, ElButton } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { usebookStore } from '@/store/usebookStore';
const props = defineProps({
    height: { type: String, default: '60' },
});
const headerStyle = computed(() => {
    return {
        height: props.height.includes('px') ? props.height : `${props.height}px`
    }
});
const pageHeader = ref(null);
onMounted(() => {
    const el = pageHeader.value.$el.firstElementChild;
    console.log(el)
})
const router = useRouter();
const bookStore = usebookStore();
const { currentTitle, parentId } = storeToRefs(bookStore);
let oldTitle = currentTitle.value;
const goBack = () => {
    if (router.currentRoute.value.fullPath !== "/") {
        currentTitle.value = oldTitle
        router.push('/');
    } else {
        bookStore.getCurrentMarks(parentId.value);
    }
}
watch(currentTitle, (newVal, oldVal) => {
    oldTitle = oldVal;
})
</script>
<style lang="scss" scoped>
.book-header {
    width: 100%;
    z-index: 3;
    position: fixed;
    background-color: #fff;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.3);

    :deep(.el-page-header__header) {
        width: 100%;
        height: 100%;

        .el-page-header__left {
            padding: 0.75rem;
        }
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
</style>