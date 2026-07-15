<template>
    <div class="book-footer">
        <ElConfigProvider :locale="locale">
            <el-pagination :hide-on-single-page="false" :small="true" :background="true" :current-page="currentPage"
                :page-size="pageSize" :pager-count="pagerCount" :page-sizes="pageSizes" :layout="layout" :total="total"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </ElConfigProvider>
    </div>
</template>
<script setup lang="ts">
interface Props {
  currentPage?: number
  pageSize?: number
  pageSizes?: number[]
  pagerCount?: number
  layout?: string
  total?: number
  // eslint-disable-next-line
  locale?: any
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  pageSize: 8,
  pageSizes: () => [8, 16, 24, 32],
  pagerCount: 5,
  layout: 'sizes, prev, pager, next, jumper',
  total: 0,
  locale: () => ({}),
})

const emits = defineEmits<{
  currentChange: [currentPage: number]
  sizeChange: [size: number]
}>()

const handleCurrentChange = (currentPage: number) => {
  emits('currentChange', currentPage)
}
const handleSizeChange = (size: number) => {
  emits('sizeChange', size)
}
</script>
<style lang="scss" scoped>
.book-footer {
    padding-bottom: var(--content-padding);
    position: relative;
    left: 0;
    bottom: 0;
    width: calc(100% - var(--content-padding) * 2);
    display: flex;
    justify-content: center;
    align-items: center;

    :deep(.el-pagination) {

        .el-pagination__sizes .el-input__wrapper,
        .el-pagination__jump .el-input__wrapper {
            background-color: var(--bg-color);
        }

        .el-input__inner {
            color: var(--text-color);
        }

        .btn-prev:disabled,
        .btn-next:disabled {
            background-color: var(--el-pagination-disabled-color) !important;
        }

        .el-pager li.number {
            background-color: var(--el-pagination-btn-bg-color);
        }

        .el-pager li.number.is-active {
            background-color: var(--el-color-primary);
        }
    }
}
</style>