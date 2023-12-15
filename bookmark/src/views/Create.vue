<template>
    <div class="bookmark-create">
        <Forms :forms="forms" submit-text="添加" @submit="submitForm"></Forms>
    </div>
</template>
<script setup>
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { usebookStore } from '@/store/usebookStore';
import { createBookMark } from '@/utils/index';
import Forms from '@/components/forms.vue';
const props = defineProps({
    id: { type: String, default: "0", required: true }
});
const bookStore = usebookStore();
bookStore.currentTitle = "添加书签";
const regExp = /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?/=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
const allNodes = bookStore.getAllNodes(props.id).reverse();
const targetNode = bookStore.getMark(props.id) ? bookStore.getMark(props.id) : { title: "" };
const forms = reactive([
    {
        label: "书签类型:",
        name: "type",
        placeholder: "请选择书签类型",
        type: "select",
        options: [
            { label: "书签文件夹", value: "folder" },
            { label: "网址链接", value: "url" }
        ],
        show: true,
        required: true,
        requireMessage: "请选择书签类型",
        onChange: (form) => {
            const index = 2;
            const key = "type"
            forms[index].required = form[key] === "url";
            
            //forms[index].show = form[key] === "url";
        }
    },
    { label: "书签名称:", name: "title", placeholder: "请输入书签名称", type: "input", show: true, required: true, requireMessage: "请输入书签名称" },
    { label: "书签地址:", name: "url", placeholder: "请输入书签链接地址", type: "input", show: true, required: true, requireMessage: "请输入有效的url地址", validate: validateUrl },
    {
        label: "添加位置:",
        name: "id",
        placeholder: "请选择添加位置",
        type: "select",
        options: [],
        show: true,
        required: true,
        requireMessage: "请选择添加位置"
    }
])
async function validateUrl(rule, value, callback) {
    return new Promise((resolve, reject) => {
        if (value) {
            if (!regExp.test(value)) {
                reject(rule.message)
            } else {
                resolve()
            }
        } else {
            reject(rule.message)
        }
    }).then(() => {
        callback && callback();
    }).catch(err => {
        callback && callback(new Error(err));
    })
}
async function submitForm(param) {
    console.log(param)
    // createBookMark(option, (res) => {
    //     if (res) {
    //         ElMessage({
    //             type: 'success',
    //             message: `更新书签 '${option.title}' 成功`,
    //         })
    //     }
    // })
}
if (targetNode) {
    //
}
if (allNodes) {
    allNodes.forEach(item => {
        forms[forms.length - 1].options.push({
            label: item.title,
            value: item.id
        })
    })
}
</script>
<style lang="scss" scoped>
.bookmark-create {
    --padding: 1.25rem;
    padding: 1.25rem;
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    flex-direction: column;
    width: calc(100% - var(--padding) * 2);
    transition: all 0.3s;

    .create-title {
        background: #F0F2F5;
        padding: var(--padding);
        cursor: pointer;
        border-radius: 4px;
        font-size: 1rem;
        width: calc(100% - var(--padding) * 2);
    }

    :deep(.el-form.el-form--label-top) {
        width: 100%;
        padding: 0.5rem 0;

        .el-select {
            width: 100%;
        }
    }
}
</style>