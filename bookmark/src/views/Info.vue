<template>
    <div class="bookmark-info">
        <h1 class="info-title">{{ info && info.title ? info.title : "--" }}</h1>
        <div class="info-content">
            <el-form label-position="top" label-width="auto">
                <el-form-item v-for="item in contents" :label="item.label" :key="item.label">
                    <el-input :value="item.value ? item.value : '--'" disabled/>
                </el-form-item>
            </el-form>
        </div>
        <div class="show-node">
            <el-timeline>
                <el-timeline-item size="large" v-for="item in allNodes" :key="item.id"
                    :type="item.id == info.id ? 'primary' : ''">
                    <el-link :type="item.id == info.id ? 'primary' : 'info'" @click="nodeClick(item.id)"
                        class="bookmark-node">{{ item.title }}</el-link>
                </el-timeline-item>
            </el-timeline>
        </div>
    </div>
</template>
<script setup>
import { ElForm, ElFormItem, ElInput,ElTimeline, ElTimelineItem, ElLink } from 'element-plus';
import { usebookStore } from '@/store/usebookStore';
import { getDate } from '@/utils/index';
import { useRouter } from 'vue-router';
const props = defineProps(({
    id: { type: String, default: "0", required: true }
}));
const bookStore = usebookStore();
const router = useRouter();
bookStore.currentTitle = "详细信息"
const info = bookStore.getMark(props.id);
const nodeClick = (id) => {
    if (id !== info.id) {
        bookStore.getCurrentMarks(id, true);
        router.push("/");
    } else {
        router.back();
    }
}
let contents = null;
let allNodes = null;
if (info) {
    allNodes = bookStore.getAllNodes(info.id).reverse();
    contents = [
        {
            label: "书签类型:",
            value: info.children ? "书签文件夹" : "网址链接"
        },
        {
            label: "添加日期:",
            value: getDate(info.dateAdded)
        },
        {
            label: info.children ? "修改日期:" : "最近访问:",
            value: info.children ? getDate(info.dateLastModified) : (getDate(info.dateLastUsed) ? getDate(info.dateLastUsed) : getDate(info.dateAdded))
        }
    ]
    if (!info.children) {
        contents.push({
            label: "链接地址:",
            value: info.url
        })
    }
}
</script>
<style lang="scss" scoped>
.bookmark-info {
    --padding: 1.25rem;
    width: calc(100% - 2 * var(--padding));
    height: calc(100% - 2 * var(--padding));
    background-color: #fff;
    padding: var(--padding);
    color: #666;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    
    .info-title {
        background: #F0F2F5;
        padding: var(--padding);
        cursor: pointer;
        border-radius: 4px;
        font-size: 1rem;
        width: calc(100% - var(--padding) * 2);
        color:#333;
    }

    .info-content {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        padding: calc(var(--padding) / 2) 0;
        gap: var(--padding);
        .el-form{
            width: 100%;
        }
    }

    .show-node {
        flex: 1;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        flex-direction: column;
        padding-bottom: 0;
        width: calc(100% - 2 * var(--padding));

        :deep(.el-timeline) {
            padding: 0;

            .bookmark-node {
                font-size: 0.85rem;
            }

        }

    }
}</style>