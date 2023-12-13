<template>
    <div class="book-footer">
        <ElConfigProvider :locale="locale">
            <el-pagination :hide-on-single-page="false" :small="true" :background="true" :current-page="currentPage"
                :page-size="pageSize" :pager-count="pagerCount" :page-sizes="pageSizes" :layout="layout" :total="total"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </ElConfigProvider>
    </div>
</template>
<script setup>
import { ElConfigProvider, ElPagination } from 'element-plus';
//footer分页组件属性
const props = defineProps({
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 8 },
    pageSizes: { type: Array, default: () => [8, 16, 24, 32] },
    pagerCount: { type: Number, default: 5 },
    layout: { type: String, default: 'sizes, prev, pager, next, jumper' },
    total: { type: Number, default: 0 },
    locale: { type: Object, default: () => ({}) },
});
//footer分页组件事件
const emits = defineEmits(['currentChange', 'sizeChange']);

const handleCurrentChange = (currentPage) => {
    emits('currentChange', currentPage);
}
const handleSizeChange = (size) => {
    emits('sizeChange', size);
}
</script>
<style lang="scss" scoped>
.book-footer {
    padding: var(--content-padding);
    position: relative;
    left: 0;
    bottom: 0;
    width: calc(100% - var(--content-padding) * 2);
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>