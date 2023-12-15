<template>
    <div class="bookmark-create">
        <el-form ref="CreateForm" :model="form" :rules="rules" status-icon label-position="top">
            <el-form-item v-for="item in forms" v-show="item.show" :label="item.label" :prop="item.name">
                <el-input v-if="item.type == 'input'" v-model="form[item.name]" :placeholder="item.placeholder" clearable />
                <el-select v-if="item.type == 'select'" v-model="form[item.name]" :placeholder="item.placeholder"
                    @change="item.onChange ? item.onChange(CreateForm) : ''">
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
import { computed, reactive, ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElSelect, ElOption } from 'element-plus';
import { usebookStore } from '@/store/usebookStore';
import { createBookMark } from '@/utils/index';
const props = defineProps({
    id: { type: String, default: "0", required: true }
});
const CreateForm = ref();
const bookStore = usebookStore();
bookStore.currentTitle = "添加书签";
const allNodes = bookStore.getAllNodes(props.id).reverse();
const targetMark = bookStore.getMark(props.id) ? bookStore.getMark(props.id) : { title: "" };
const form = reactive({ type: "", title: "", url: "", level: "" });
const rules = reactive({
    type: [{ required: true, message: '请选择书签类型', trigger: 'blur' }],
    title: [{ required: true, message: '请输入书签名称', trigger: 'blur' }],
    url: [{ required: true, message: '请输入有效的url地址', trigger: 'blur', validator: validateUrl }],
    level: [{ required: true, message: '请选择添加位置', trigger: 'blur' }]
});
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
        onChange: () => {
            forms[2].show = form.type == "url";
        }
    },
    { label: "书签名称:", name: "title", placeholder: "请输入书签名称", type: "input", show: true, required: true, requireMessage: "请输入书签名称" },
    { label: "书签地址:", name: "url", placeholder: "请输入书签链接地址", type: "input", show: true, required: true, requireMessage: "请输入有效的url地址",validate:validateUrl },
    {
        label: "添加位置:",
        name: "level",
        placeholder: "请选择添加位置",
        type: "select",
        options: [],
        show: true,
        required: true,
        requireMessage: "请选择添加位置"
    }
])
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