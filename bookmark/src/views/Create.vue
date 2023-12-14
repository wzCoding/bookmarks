<template>
    <div class="bookmark-create">
        <el-form ref="CreateForm" :model="form" :rules="rules" status-icon label-position="top">
            <el-form-item v-for="item in forms" :key="item.name" :label="item.label" :prop="item.name">
                <el-input v-if="item.type == 'input'" v-model="form[item.name]" :placeholder="item.placeholder" clearable />
                <el-select v-if="item.type == 'select'" v-model="form[item.name]" :placeholder="item.placeholder">
                    <el-option v-for="option in item.options" :key="option.value" :label="option.label"
                        :value="option.value" />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="submit-edit">
            <el-button round type="primary" @click="submitForm(CreateForm)">添加</el-button>
            <el-button round @click="resetForm(CreateForm)">重置</el-button>
        </div>
    </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElSelect, ElOption } from 'element-plus';
import { usebookStore } from '@/store/usebookStore';
import { createBookMark } from '@/utils/index';
const props = defineProps({
    id: { type: String, default: "0", required: true }
});
const CreateForm = ref();
const bookStore = usebookStore();
bookStore.currentTitle = "添加书签"
const targetMark = bookStore.getMark(props.id) ? bookStore.getMark(props.id) : { title: "" };
const form = reactive({ title: "", url: "", level: "" });
const rules = reactive({
    title: [{ required: false,message: '请输入书签名称', trigger: 'blur' }],
    url: [{ required: false, message: '请输入有效的url地址', trigger: 'blur', validator: validateUrl }],
    level: [{ required: false, message: '请选择添加位置', trigger: 'blur', validator: validateLevel }]
});
const forms = [
    { label: "书签名称:", name: "title", placeholder: "请输入书签名称", type: "input" },
    { label: "书签地址:", name: "url", placeholder: "请输入书签链接地址", type: "input" },
    {
        label: "添加位置:",
        name: "level",
        placeholder: "请选择添加位置",
        type: "select",
        options: [
            { value: "0", label: "书签栏" },
            { value: "1", label: "书签栏(置顶)" }
        ]
    }
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
            reject(rule.message)
        }
    }).then(() => {
        callback && callback();
    }).catch(err => {
        callback && callback(new Error(err));
    })
}
async function validateLevel(rule, value, callback) {
    return new Promise((resolve, reject) => {
        if (value) {
            resolve()
        } else {
            reject(rule.message)
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
            // createBookMark(option, (res) => {
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
   //
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
        .el-select{
            width: 100%;
        }
    }
}
</style>