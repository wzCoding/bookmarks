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
            <h4 class="title">所属层级</h4>
            <el-carousel height="180px" direction="vertical" type="card" :autoplay="false" indicator-position="none">
                <el-carousel-item v-for="(item, index) in allNodes" :key="item.id">
                    <div class="node-card" :class="item.id == info.id ? `current` : ''">
                        <span class="card-title">
                            <el-icon>
                                <component :is="item.type == 'folder' ? FolderOpened : Link" />
                            </el-icon>
                            {{ item.title }}
                        </span>
                        <span class="card-badge">{{ allNodes.length - index - 1 }}</span>
                    </div>
                    <div class="card-index">{{ allNodes.length - index - 1 }}</div>
                </el-carousel-item>
            </el-carousel>
        </div>
    </div>
</template>
<script setup>
import { ElCarousel, ElCarouselItem, ElIcon } from 'element-plus';
import { Link, FolderOpened } from '@element-plus/icons-vue';
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
    allNodes = bookStore.getAllNode(info.id);
    console.log(allNodes)
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
        }
    ]
    if (!info.children) {
        contents.push({
            label: "地址",
            value: info.url
        })
    }
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
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;

    .info-title {
        background: #ddd;
        padding: 1rem;
        cursor: pointer;
        border-radius: 4px;
        font-size: 1.25rem;
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

    .show-node {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .title {
            width: 100%;
            text-align: center;
        }

        :deep(.el-carousel__container) {
            width: 60vw;
            --card-padding: 0.25rem;

            .el-carousel__item {
                background-color: #E6E8EB;
                padding: var(--card-padding);
                width: calc(100% - var(--card-padding) * 2);
                --badge-size: 1.25rem;

                .node-card {
                    display: none;
                    width: 100%;
                    height: 100%;
                    justify-content: center;
                    align-items: center;
                    gap: 0.25rem;
                    border-radius: 4px;
                    font-size: 1.25rem;
                    color: #999;

                    .card-badge {
                        position: absolute;
                        top: calc(var(--badge-size) / 2);
                        right: calc(var(--badge-size) / 2);
                        width: var(--badge-size);
                        height: var(--badge-size);
                        background-color: #C0C4CC;
                        color: #fff;
                        text-align: center;
                        line-height: var(--badge-size);
                        font-size: 0.85rem;
                        border-radius: 100%;
                        display: none;
                    }

                    .card-title {
                        width: 75%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        text-align: center;

                        .el-icon {
                            top: 2px;
                        }
                    }
                }



                .card-index {
                    display: block;
                    width: 100%;
                    height: 100%;
                    font-size: 2.5rem;
                    font-weight: 600;
                    text-align: center;
                    line-height: 2;
                }

                &.is-active {
                    background-color: transparent;

                    .node-card {
                        display: flex;
                        border: 2px solid #CDD0D6;
                        background-color: #E6E8EB;

                        &.current {
                            color: #409eff;
                            border: 2px solid #409eff;
                            background-color: #f5f5f5;

                            .card-badge {
                                background-color: #409eff;
                            }
                        }
                        .card-badge{
                            display: block;
                        }
                    }
                    .card-index{
                        display: none;
                    }



                }
            }
        }

    }
}
</style>