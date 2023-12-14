<template>
    <div class="bookmark-edit">
        <h3>{{ form.title ? form.title : '--' }}</h3>
        <el-form :model="form" :rules="rules" status-icon label-position="top">
            <el-form-item v-for="item in forms" :key="item.name" :label="item.label" :prop="item.name">
                <el-input v-model="form[item.name]" :placeholder="item.placeholder" clearable />
            </el-form-item>
        </el-form>
        <div class="submit-edit">
            <el-button round type="primary" @click="submitForm">提交</el-button>
            <el-button round @click="resetForm">重置</el-button>
        </div>
    </div>
</template>
<script setup>
import { reactive } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import { usebookStore } from '@/store/usebookStore';
import { updateBookMark } from '@/utils/index';
const props = defineProps({
    id: { type: String, default: "0", required: true }
});
let forms = null;
const bookStore = usebookStore();
const targetMark = bookStore.getMark(props.id);
const form = reactive({ title: "", url: "" });
const rules = reactive({
    title: [{ required: false, trigger: 'blur' }],
    url: [{ required: false, message: '请输入有效的url地址', trigger: 'blur', validator: validateUrl }]
});
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
    }).then(res => {
        callback && callback();
    }).catch(err => {
        callback && callback(new Error(err));
    })
}
function submitForm() {

}
function resetForm() {

}
if (targetMark) {
    forms = [
        {
            label: "书签名称:",
            name: "title",
            placeholder: targetMark.title
        },
        {
            label: "书签地址:",
            name: "url",
            placeholder: targetMark.url
        }
    ]
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

    :deep(.el-form.el-form--label-top) {
       width: 100%;
       padding: 0.5rem 0;
    }
}
</style>