<template>
    <el-page-header class="book-header" :style="headerStyle" @back="goBack">
        <template #content>
            <span> {{ currentTitle }} </span>
        </template>
    </el-page-header>
</template>
<script setup>
import { computed, watch, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElPageHeader } from 'element-plus';
import { usebookStore } from '@/store/usebookStore';
const props = defineProps({
    height: { type: String, default: '60' },
});
const headerStyle = computed(() => {
    return {
        height: props.height.includes('px') ? props.height : `${props.height}px`
    }
});
const bookStore = usebookStore();
const { currentTitle, parentId } = storeToRefs(bookStore);
const router = useRouter();
let oldTitle = currentTitle.value;
const goBack = () => {
    if (router.currentRoute.value.fullPath !== "/") {
        currentTitle.value = oldTitle
        router.push('/');
    } else {
        bookStore.getCurrentMarks(parentId.value, true);
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
}
</style>