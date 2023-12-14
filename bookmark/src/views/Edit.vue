<template>
    <div class="bookmark-edit">
        <h1 class="edit-title">
            {{ form.title ? form.title : targetMark.title ? targetMark.title : '--' }}
        </h1>
        <el-form ref="EditForm" :model="form" :rules="rules" status-icon label-position="top">
            <el-form-item v-for="item in forms" :key="item.name" :label="item.label" :prop="item.name">
                <el-input v-model="form[item.name]" :placeholder="item.placeholder" clearable />
            </el-form-item>
        </el-form>
        <div class="submit-edit">
            <el-button round type="primary" @click="submitForm(EditForm)">提交</el-button>
            <el-button round @click="resetForm(EditForm)">重置</el-button>
        </div>
    </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus';
import { usebookStore } from '@/store/usebookStore';
import { updateBookMark } from '@/utils/index';
const props = defineProps({
    id: { type: String, default: "0", required: true }
});
const EditForm = ref();
const bookStore = usebookStore();
const targetMark = bookStore.getMark(props.id) ? bookStore.getMark(props.id) : { title: "" };
const form = reactive({ title: "", url: "" });
const rules = reactive({
    title: [{ required: false, trigger: 'blur' }],
    url: [{ required: false, message: '请输入有效的url地址', trigger: 'blur', validator: validateUrl }]
});
const forms = [
    { label: "书签名称:", name: "title", placeholder: "" },
    { label: "书签地址:", name: "url", placeholder: "" }
]
const regExp = /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?/=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
async function validateUrl(rule, value, callback) {
    return new Promise((resolve, reject) => {
        if (value) {
            if (!regExp.test(value)) {
                reject(rule.message)
            } else {
                resolve()
            }
        } else {
            resolve()
        }
    }).then(() => {
        callback && callback();
    }).catch(err => {
        callback && callback(new Error(err));
    })
}
async function submitForm(el) {
    if (!form.title && !form.url) return;
    await el.validate(valid => {
        if (valid) {
            console.log("submit edit");
            const option = {
                id: targetMark.id,
                title: form.title ? form.title : targetMark.title,
                url: form.url ? form.url : targetMark.url
            }
            console.log(option)
            // updateBookMark(option, (res) => {
            //     if (res) {
            //         ElMessage({
            //             type: 'success',
            //             message: `更新书签 '${option.title}' 成功`,
            //         })
            //     }
            // })
        }
    })
}
function resetForm(el) {
    if (!el) return;
    el.resetFields();
}
if (targetMark) {
    forms[0].placeholder = targetMark.title,
        forms[1].placeholder = targetMark.url
}
</script>
<style lang="scss" scoped>
.bookmark-edit {
    --padding: 1.25rem;
    padding: 1.25rem;
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    flex-direction: column;
    width: calc(100% - var(--padding) * 2);
    transition: all 0.3s;

    .edit-title {
        background: #ddd;
        padding: var(--padding);
        cursor: pointer;
        border-radius: 4px;
        font-size: 1rem;
        width: calc(100% - var(--padding) * 2);
    }

    :deep(.el-form.el-form--label-top) {
        width: 100%;
        padding: 0.5rem 0;
    }
}
</style>