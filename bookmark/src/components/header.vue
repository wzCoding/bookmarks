<template>
    <el-page-header class="book-header" :style="headerStyle" @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> Title </span>
        </template>
    </el-page-header>
</template>
<script setup>
import { computed } from 'vue';
import { ElPageHeader } from 'element-plus';
const props = defineProps({
    height: { type: Number, default: 60 },
});
const headerStyle = computed(() => {
    return {
        height: props.height.includes('px') ? props.height : `${props.height}px`
    }
})
const goBack = () => {
    console.log("go back");
}
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
    }
}
</style>