<template>
    <div class="book-footer">
        <ElConfigProvider :locale="i18nStore.locale">
            <el-pagination :hide-on-single-page="true" v-model:current-page="bookStore.currentPage"
                v-model:page-size="bookStore.currentSize" :pager-count="pagerCount" :page-sizes="pageSizes" :small="true"
                :background="true" :layout="layout" :total="500" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </ElConfigProvider>
    </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { ElConfigProvider, ElPagination } from 'element-plus';
import { usebookStore } from '@/store/usebookStore';
import { usei18nStore } from '@/store/usei18nStore';
onMounted(() => {
    const app = document.querySelector('#app');
    const cardColumns = getComputedStyle(app).getPropertyValue('--card-columns');
    console.log(cardColumns)
});
const pagerCount = 5
const pageSizes = [8, 16, 24, 32]
const layout = "sizes,prev, pager, next"
const bookStore = usebookStore();
const i18nStore = usei18nStore();
const handleCurrentChange = (currentPage) => {
    bookStore.currentPage = currentPage;
}
const handleSizeChange = (size) => {
    bookStore.currentSize = size;
}
</script>
<style lang="scss" scoped>
.book-footer {
    padding: var(--content-padding);
    position: relative;
    top: 1.5rem;
    left: 0;
    width: calc(100% - var(--content-padding) * 2);
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>