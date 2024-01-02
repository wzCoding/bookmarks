<template>
    <div class="bookmark-page bookmark-edit">
        <Title :title="title" @update:title="updateTitle" />
        <Forms :forms="forms" :locale-key="page" @submit="submitForm" @reset="resetForm">
            <template #default="{ node }">
                <div class="custom-tree-node">
                    <el-icon>
                        <Folder />
                    </el-icon>
                    <span class="tree-node-label">{{ node.label }}</span>
                </div>
            </template>
        </Forms>
        <el-alert class="page-info" type="info" :title="tipTitle" :description="tipDesc" show-icon />
    </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import { ElMessage, ElLoading, ElIcon, ElAlert } from 'element-plus';
import { Folder } from '@element-plus/icons-vue';
import { usebookStore } from '@/store/usebookStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { updateBookMark, moveBookMark, expandTree } from '@/utils/index';
import Forms from '@/components/forms.vue';
import Title from '@/components/title.vue';
const props = defineProps({
    id: { type: String, default: "0", required: true }
});
const page = "edit"
const title = ref("");
const bookStore = usebookStore();
const localeStore = useLocaleStore();
const targetNode = bookStore.getNodeById(props.id);
title.value = targetNode && targetNode.title ? targetNode.title : "--";
const regExp = /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?/=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
const forms = reactive([]);
const maxIndex = ref(0);
const tipTitle = localeStore.locale.el[page].tips[0].title
const tipDesc = localeStore.locale.el[page].tips[0].text
if (targetNode) {
    updateMaxIndex(targetNode.parentId);
    forms.push(
        { label: "bookmarkName", name: "title", placeholder: targetNode.title, defaultValue: "", onInput: updateTitle },
        {
            label: "bookmarkLocation",
            name: "parentId",
            placeholder: "请选择书签位置",
            type: "treeSelect",
            tree: bookStore.getTreeNodes("children"),
            defaultValue: targetNode.parentId,
            props: { label: "title" },
            nodeClick: updateMaxIndex
        },
        {
            label: "bookmarkOrder",
            name: "index",
            placeholder: "",
            type: "number",
            defaultValue: targetNode.index,
            min: 0,
            max: maxIndex,
            requireMessage: "请设置有效的顺序",
            validator: validateParam
        },
    )
    if (!targetNode.children) {
        forms.splice(
            1,
            0,
            {
                label: "websiteLink",
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
function updateMaxIndex(id) {
    const node = bookStore.getNodeById(id);
    maxIndex.value = node.children.length;
}
async function validateParam(rule, value, callback) {
    return new Promise((resolve, reject) => {
        if (rule.field == 'index') {
            value ? (value > 0 && value <= forms[forms.length - 1].max ? resolve() : reject(rule.message)) : resolve()
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
    const loading = ElLoading.service({ lock: true })
    const options = {};
    const moveOptions = {
        index: param.index,
        parentId: param.parentId,
    };
    param.title ? options.title = param.title : null;
    param.url ? options.url = param.url : null;
    Promise.all([
        updateBookMark(props.id, options),
        moveBookMark(props.id, moveOptions)
    ]).then(res => {
        chrome.bookmarks.getTree().then(result => {
            bookStore.initNodes(expandTree(result), targetNode.parentId)
        })
        setTimeout(() => {
            loading.close()
            ElMessage({
                type: 'success',
                message: localeStore.locale.el[page].successTip,
            })
        }, 1000)
    })
}
function resetForm() {
    title.value = targetNode && targetNode.title;
}
</script>
<style lang="scss" scoped>
.page-info {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--el-alert-bg-theme-color) !important;
}
</style>