<template>
    <div class="bookmark-page bookmark-create">
        <Title :title="targetNode.title" />
        <Forms :forms="forms" :locale-key="page" @submit="submitForm">
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
import { reactive } from 'vue';
import { ElMessage, ElIcon } from 'element-plus';
import { Folder } from '@element-plus/icons-vue';
import { usebookStore } from '@/store/usebookStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { createBookMark } from '@/utils/index';
import Forms from '@/components/forms.vue';
import Title from '@/components/title.vue';
const props = defineProps({
    id: { type: String, default: "0", required: true }
});
const page = "create"
const bookStore = usebookStore();
const localeStore = useLocaleStore();
const regExp = /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?/=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
const targetNode = bookStore.getNodeById(props.id);
const urlIndex = 2;
console.log(localeStore.locale.el[page]["bookmarkFolder"])
const forms = reactive([
    {
        label: "bookmarkType",
        name: "type",
        placeholder: "请选择书签类型",
        type: "select",
        options: [
            { label: "bookmarkFolder", value: "folder" },
            { label: "websiteLink", value: "url" }
        ],
        show: true,
        required: true,
        requireMessage: "请选择书签类型",
        onChange: typeChange
    },
    { label: "bookmarkName", name: "title", placeholder: "请输入书签名称", type: "input", show: true, required: true, requireMessage: "请输入书签名称" },
    { label: "websiteLink", name: "url", placeholder: "请输入书签链接地址", type: "input", show: true, required: true, requireMessage: "请输入有效的url地址", validator: validateUrl },
    {
        label: "bookmarkLocation",
        name: "id",
        placeholder: "请选择添加位置",
        type: "treeSelect",
        tree: bookStore.getTreeNodes("children"),
        defaultValue: targetNode.id,
        props: { label: "title" },
        show: true,
        required: true,
        requireMessage: "请选择添加位置"
    }
])
async function validateUrl(rule, value, callback) {
    return new Promise((resolve, reject) => {
        if (value) {
            !regExp.test(value) ? reject(rule.message) : resolve()
        } else {
            !forms[urlIndex].required ? resolve() : reject(rule.message)
        }
    }).then(() => {
        callback && callback();
    }).catch(err => {
        callback && callback(new Error(err));
    })
}
function typeChange(form) {
    forms[urlIndex].required = forms[urlIndex].show = form.type === "url";
}
function submitForm(param) {
    const options = {
        index: param.index ? param.index : 0,
        parentId: param.parentId ? param.parentId : "1",
        title: param.title ? param.title : "",
    }
    if (param.url) {
        options.url = param.url
    }
    console.log(options)
    // createBookMark(options, (res) => {
    //     if (res) {
    //         ElMessage({
    //             type: 'success',
    //             message: `更新书签 '${option.title}' 成功`,
    //         })
    //     }
    // })
}
</script>
