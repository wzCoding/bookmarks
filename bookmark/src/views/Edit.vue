<template>
    <div class="bookmark-edit">
        <Title :title="title" @update:title="updateTitle" />
        <Forms :forms="forms" submit-text="更新" @submit="submitForm" @reset="resetForm">
            <template #default="{ node }">
                <div class="custom-tree-node">
                    <el-icon>
                        <Folder />
                    </el-icon>
                    <span class="tree-node-label">{{ node.label }}</span>
                </div>
            </template>
        </Forms>
    </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import { ElMessage, ElIcon } from 'element-plus';
import { Folder } from '@element-plus/icons-vue';
import { usebookStore } from '@/store/usebookStore';
import { updateBookMark } from '@/utils/index';
import Forms from '@/components/forms.vue';
import Title from '@/components/title.vue';
const props = defineProps({
    id: { type: String, default: "0", required: true }
});
const title = ref("");
const bookStore = usebookStore();
const targetNode = bookStore.getNodeById(props.id);
const parentNode = bookStore.getNodeById(targetNode.parentId);
bookStore.currentTitle = "编辑书签";
title.value = targetNode && targetNode.title ? targetNode.title : "--";
const regExp = /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?/=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
const forms = reactive([]);
if (targetNode) {
    forms.push(
        { label: "书签名称:", name: "title", placeholder: targetNode.title, defaultValue: "", onInput: updateTitle },
        {
            label: "书签位置:",
            name: "id",
            placeholder: "请选择书签位置",
            type: "treeSelect",
            tree: bookStore.getTreeNodes("children"),
            defaultValue: parentNode.id,
            props: { label: "title" },
        },
        {
            label: "书签顺序:",
            name: "index",
            placeholder: "",
            type: "number",
            defaultValue: 0,
            min: 0,
            max: parentNode.children.length,
            requireMessage: "请设置有效的顺序",
            validator: validateParam
        },
    )
    if (!targetNode.children) {
        forms.splice(
            1,
            0,
            {
                label: "网址链接:",
                name: "url",
                placeholder: targetNode.url,
                defaultValue: "",
                requireMessage: "请输入有效的网址链接",
                validator: validateParam
            })
    }
}
function updateTitle(param) {
    title.value = param.title ? param.title : targetNode && targetNode.title;
}
async function validateParam(rule, value, callback) {
    return new Promise((resolve, reject) => {
        if (rule.field == 'index') {
            value ? (value > 0 && value <= parentNode.children.length ? resolve() : reject(rule.message)) : resolve()
        }
        if (rule.field == 'url') {
            value ? (regExp.test(value) ? resolve() : reject(rule.message)) : resolve()
        }
    }).then(() => {
        callback && callback();
    }).catch(err => {
        callback && callback(new Error(err));
    })
}
function submitForm(param) {
    console.log(param)
    // updateBookMark(option, (res) => {
    //     if (res) {
    //         ElMessage({
    //             type: 'success',
    //             message: `更新书签 '${option.title}' 成功`,
    //         })
    //     }
    // })
}
function resetForm() {
    title.value = targetNode && targetNode.title;
}
</script>
<style lang="scss" scoped>
.bookmark-edit {
    --padding: 1.25rem;
    padding: var(--padding);
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    flex-direction: column;
    width: calc(100% - var(--padding) * 2);
    height: calc(100% - var(--padding) * 2);

    .el-select {
        width: 100%;
    }
}
</style>