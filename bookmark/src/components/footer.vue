<template>
    <div class="book-footer">
        <el-pagination v-model:current-page="bookStore.currentPage" v-model:page-size="bookStore.currentSize"
            :pager-count="5" :page-sizes="[8, 16, 24, 32]" :small="small" :background="background"
            layout="prev, pager, next" :total="bookStore.totalNum" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { ElPagination } from 'element-plus';
import { useBookStore } from '@/store/useBookStore';
onMounted(() => {
    const app = document.querySelector('#app');
    const cardColumns = getComputedStyle(app).getPropertyValue('--card-columns');
    console.log(cardColumns)
});
const small = true
const background = true
const bookStore = useBookStore();
const handleCurrentChange = (val) => {
    bookStore.currentPage = val;
}
const handleSizeChange = (val) => {
    bookStore.currentSize = val;
}
</script>
<style lang="scss" scoped>
.book-footer {
    padding: var(--content-padding);
    position: relative;
    left: 0;
    bottom: 0;
    width: calc(100% - var(--content-padding) * 2);
    height: 2rem;
    background-color: rgba(255, 255, 255, 0.7);
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.3);
}
</style>