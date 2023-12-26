<template>
    <div class="bookmark-info">
        <Title :title="info && info.title ? info.title : '--'" />
        <div class="info-content">
            <Forms :forms="contents" :locale-key="page" :submit="false"></Forms>
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
import { ElTimeline, ElTimelineItem, ElLink } from 'element-plus';
import { usebookStore } from '@/store/usebookStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { getDate } from '@/utils/index';
import { useRouter } from 'vue-router';
import Forms from '@/components/forms.vue';
import Title from '@/components/title.vue';
const props = defineProps(({
    id: { type: String, default: "0", required: true }
}));
const page = "info";
const bookStore = usebookStore();
const localeStore = useLocaleStore();
const router = useRouter();
const info = bookStore.getNodeById(props.id);
const nodeClick = (id) => {
    if (id !== info.id) {
        bookStore.getCurrentNodes(id, true);
        router.push("/");
    } else {
        router.back();
    }
}
let contents = [];
let allNodes = [];
if (info) {
    allNodes = bookStore.getAllNodes(info.id, [], true).reverse();
    contents = [
        {
            label: "bookmarkType",
            name: "type",
            defaultValue: info.children ? localeStore.locale[page]['bookmarkFolder'] : localeStore.locale[page]['websiteLink'],
            disable: true
        },
        {
            label: "bookmarkAddDate",
            name: "dateAdded",
            defaultValue: getDate(info.dateAdded),
            disable: true
        },
        {
            label: info.children ? "recentlyModified" : "recentlyVisited",
            name: "dateLastModified",
            defaultValue: info.children ? getDate(info.dateLastModified) : (getDate(info.dateLastUsed) ? getDate(info.dateLastUsed) : getDate(info.dateAdded)),
            disable: true
        }
    ]
    if (!info.children) {
        contents.push({
            label: "websiteLink",
            name: "url",
            defaultValue: info.url,
            disable: true
        })
    } else {
        contents.splice(1, 0, {
            label: "bookmarkNumber",
            name: "total",
            defaultValue: info.id == "1" ? bookStore.total : info.children.length,
            disable: true
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
        color: #333;
    }

    .info-content {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        padding: calc(var(--padding) / 2) 0;
        gap: var(--padding);

        :deep(.el-form) {
            .el-input.is-disabled {
                cursor: text;

                .el-input__inner {
                    cursor: text;
                }
            }
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
}
</style>