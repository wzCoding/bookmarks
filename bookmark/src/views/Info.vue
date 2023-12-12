<template>
    <div class="bookmark-info">
        <h1 class="info-title">{{ info && info.title ? info.title : "--" }}</h1>
        <div class="info-content">
            <div class="content-item" v-for="item in contents" :key="item.label">
                <span class="item-label">{{ item.label }}</span>
                <span class="item-value">
                    {{ item.value ? item.value : '--' }}
                </span>
            </div>
        </div>
        <div class="show-node">
            <el-steps simple :active="allNodes.length">
                <el-step v-for="step in allNodes" :key="step.id" :title="step.title"
                    :icon="step.type == 'folder' ? Management : ChromeFilled" />
            </el-steps>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { ElSteps, ElStep } from 'element-plus';
import { ChromeFilled, Management } from '@element-plus/icons-vue';
import { usebookStore } from '@/store/usebookStore';
import { getDate } from '@/utils/index';
const props = defineProps(({
    id: { type: String, default: "0", required: true }
}));
const defaultTitle = "详细信息"
const bookStore = usebookStore();
bookStore.currentTitle = defaultTitle;
const info = bookStore.getMark(props.id);
let contents = null;
let allNodes = null;
if (info) {
    allNodes = bookStore.getAllNode(info.id).reverse();
    contents = [
        {
            label: "书签类型",
            value: info.children ? "书签文件夹" : "网址链接"
        },
        {
            label: "添加日期",
            value: getDate(info.dateAdded)
        },
        {
            label: info.children ? "修改日期" : "最近访问",
            value: info.children ? getDate(info.dateLastModified) : (getDate(info.dateLastUsed) ? getDate(info.dateLastUsed) : getDate(info.dateAdded))
        },
        {
            label: "地址",
            value: info.children ? "" : info.url
        }
    ]
}
</script>
<style lang="scss" scoped>
.bookmark-info {
    --padding: 0.75rem;
    width: calc(100% - 2 * var(--padding));
    height: calc(100% - 2 * var(--padding));
    background-color: #fff;
    padding: var(--padding);
    color: #666;
    overflow-y: auto;

    .info-title {
        background: #ddd;
        padding: 1rem;
        cursor: pointer;
        border-radius: 4px;
        font-size: 1.5rem;
    }

    .info-content {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        padding: var(--padding);
        gap: var(--padding);

        .content-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            border-bottom: 2px solid #ddd;
            padding-bottom: var(--padding);
            color: #666;

            .item-value {
                font-size: 0.85rem;
                max-width: 80%;
                word-wrap: break-word;
                text-align: right;
            }
        }
    }
}
</style>